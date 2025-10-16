import { getSupabaseClient } from '@/lib/supabase/client'

export interface ChatStreamPayload {
  conversationId: string
  messages: Array<{ role: string; content: string }>
}

export interface ChatStreamConnection {
  stream: ReadableStream<Uint8Array>
  abort: () => void
}

export async function startChatStream(payload: ChatStreamPayload): Promise<ChatStreamConnection> {
  const client = getSupabaseClient()
  const controller = new AbortController()

  const { data, error } = await client.functions.invoke('chat-stream', {
    body: payload,
    signal: controller.signal,
    responseType: 'stream',
  })

  if (error) {
    controller.abort()
    // 尝试打印更多上下文，便于排查
    // @ts-ignore Supabase 错误对象可能包含 context/message
    console.error('[supabase-stream] invoke error:', error?.message ?? error)
    // @ts-ignore context 仅在 FunctionsHttpError 存在
    if (error?.context) {
      // eslint-disable-next-line no-console
      console.error('[supabase-stream] error context:', error.context)
    }
    throw error
  }

  let stream: ReadableStream<Uint8Array> | null = null

  if (data instanceof ReadableStream) {
    stream = data
  } else if (data && typeof data === 'object' && 'body' in data) {
    const maybeResponse = data as Response
    if (maybeResponse.body instanceof ReadableStream) {
      stream = maybeResponse.body as ReadableStream<Uint8Array>
    }
  }

  if (!stream) {
    controller.abort()
    throw new Error('Supabase Edge Function 未返回有效的流式响应')
  }

  return {
    stream,
    abort: () => controller.abort(),
  }
}
