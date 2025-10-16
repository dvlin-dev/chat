import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'text/event-stream; charset=utf-8',
  Connection: 'keep-alive',
  'Cache-Control': 'no-cache',
}

interface ChatStreamBody {
  conversationId?: string
  messages?: Array<{ role: string; content: string }>
  userId?: string
  model?: { id?: string; temperature?: number; maxOutputTokens?: number }
}

interface SupabaseConversationRow {
  id: string
  owner_id: string
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

function sse(event: string, data: unknown): Uint8Array {
  const payload = typeof data === 'string' ? data : JSON.stringify(data)
  return encoder.encode(`event: ${event}\ndata: ${payload}\n\n`)
}

async function streamFromOpenAI(params: {
  body: ChatStreamBody
  openaiKey: string
  controller: ReadableStreamDefaultController<Uint8Array>
}) {
  const { body, openaiKey, controller } = params
  const model = body.model?.id ?? 'gpt-4.1'
  const temperature = body.model?.temperature ?? 0.3
  const baseUrl = (Deno.env.get('OPEN_BASE_URL') ?? 'https://api.openai.com').replace(/\/+$/, '')
  const targetUrl = `${baseUrl}/v1/chat/completions`

  const response = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: body.messages ?? [],
      stream: true,
    }),
  })

  if (!response.ok || !response.body) {
    const errorText = await response.text()
    throw new Error(`OpenAI 请求失败: ${response.status} ${errorText}`)
  }

  const reader = response.body.getReader()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const segments = buffer.split('\n\n')
    buffer = segments.pop() ?? ''

    for (const segment of segments) {
      const line = segment.trim()
      if (!line || !line.startsWith('data:')) continue

      const payload = line.replace(/^data:\s*/, '')
      if (payload === '[DONE]') {
        controller.enqueue(sse('done', {}))
        return
      }

      try {
        const data = JSON.parse(payload) as {
          choices?: Array<{ delta?: { content?: string }; finish_reason?: string }>
        }
        const delta = data.choices?.[0]?.delta?.content
        if (delta) {
          controller.enqueue(sse('chunk', { content: delta }))
        }
        const finishReason = data.choices?.[0]?.finish_reason
        if (finishReason) {
          controller.enqueue(sse('metadata', { finishReason }))
        }
      } catch (error) {
        console.warn('[chat-stream] 解析 OpenAI 数据失败:', error)
      }
    }
  }

  controller.enqueue(sse('done', {}))
}

async function streamFallback(controller: ReadableStreamDefaultController<Uint8Array>, prompt: string) {
  const template = `这是一个占位响应，说明 Edge Function 尚未连接真实的 LLM。\n\n你发送的内容是：${prompt}`
  for (const token of template.split(/(?<=。|！|？|\n)/)) {
    await new Promise((resolve) => setTimeout(resolve, 120))
    controller.enqueue(sse('chunk', { content: token }))
  }
  controller.enqueue(sse('done', {}))
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey =
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ??
    Deno.env.get('SERVICE_ROLE_KEY') ??
    Deno.env.get('SUPABASE_SERVICE_KEY')
  if (!supabaseUrl || !serviceKey) {
    return new Response('Supabase 环境变量缺失', { status: 500, headers: corsHeaders })
  }

  let payload: ChatStreamBody
  try {
    payload = (await req.json()) as ChatStreamBody
  } catch (error) {
    console.error('[chat-stream] 请求体解析失败', error)
    return new Response('无效的 JSON 请求体', { status: 400, headers: corsHeaders })
  }

  if (!payload.conversationId || !Array.isArray(payload.messages)) {
    return new Response('缺少 conversationId 或 messages', { status: 400, headers: corsHeaders })
  }

  const supabaseClient = createClient(supabaseUrl, serviceKey, {
    global: {
      headers: {
        Authorization: req.headers.get('Authorization') ?? '',
      },
    },
  })

  const {
    data: { user },
    error: authError,
  } = await supabaseClient.auth.getUser()

  if (authError || !user) {
    console.warn('[chat-stream] 未授权访问', authError)
    return new Response('Unauthorized', { status: 401, headers: corsHeaders })
  }

  const { data: conversation, error: convoError } = await supabaseClient
    .from('conversations')
    .select('id, owner_id')
    .eq('id', payload.conversationId)
    .maybeSingle()

  if (convoError) {
    console.error('[chat-stream] 查询会话失败', convoError)
    return new Response('无法读取会话信息', { status: 500, headers: corsHeaders })
  }

  if (!conversation || (conversation as SupabaseConversationRow).owner_id !== user.id) {
    return new Response('Forbidden', { status: 403, headers: corsHeaders })
  }

  const stream = new ReadableStream<Uint8Array>({
    start: async (controller) => {
      try {
        const openaiKey = Deno.env.get('OPENAI_API_KEY')
        if (openaiKey) {
          await streamFromOpenAI({ body: payload, openaiKey, controller })
        } else {
          const latest = payload.messages[payload.messages.length - 1]?.content ?? ''
          await streamFallback(controller, latest)
        }
      } catch (error) {
        console.error('[chat-stream] 生成回复失败', error)
        controller.enqueue(sse('error', { message: error instanceof Error ? error.message : String(error) }))
      } finally {
        controller.close()
      }
    },
    cancel(reason) {
      console.warn('[chat-stream] 客户端取消流式连接', reason)
    },
  })

  return new Response(stream, {
    headers: {
      ...corsHeaders,
    },
  })
})
