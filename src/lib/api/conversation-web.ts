import { MessageRole, type Message } from '@/lib/types/conversation'
import { conversationService } from '@/lib/services/conversation-service'
import { startChatStream } from '@/lib/services/supabase-stream'
import type { HookResourceManager } from '@/lib/utils/resource-manager'

export interface CompletionsDto {
  conversationId: string
  messages: { role: MessageRole; content: string }[]
}

export interface SSEEventHandlers {
  onContent?: (content: string) => void
  onDone?: () => void
  onError?: (error: Error) => void
}

export interface StreamCleanup {
  cleanup: () => void
  isActive: () => boolean
}

function createTempId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}${crypto.randomUUID()}`
  }
  return `${prefix}${Math.random().toString(36).slice(2, 11)}`
}

export function generateTempMessageId(): string {
  return createTempId('msg_')
}

export function createUserMessage(conversationId: string, content: string, userId: string): Message {
  return {
    id: generateTempMessageId(),
    conversationId,
    content: content.trim(),
    role: MessageRole.user,
    createdAt: new Date().toISOString(),
    userId,
  }
}

export function createAIMessagePlaceholder(conversationId: string): Message {
  return {
    id: createTempId('ai_'),
    conversationId,
    content: '',
    role: MessageRole.assistant,
    createdAt: new Date().toISOString(),
  }
}

/**
 * 临时的流式响应占位实现。后续会接入 Supabase Edge Function。
 */
export async function completionsStream(
  data: CompletionsDto,
  handlers: SSEEventHandlers,
  resourceManager?: HookResourceManager
): Promise<StreamCleanup> {
  const connection = await startChatStream(data)
  const reader = connection.stream.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let active = true

  const close = async () => {
    if (!active) return
    active = false
    try {
      connection.abort()
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      if (!msg.includes('aborted')) {
        console.warn('终止 Supabase 流时出错:', error)
      }
    }
    try {
      await reader.cancel()
    } catch {
      // ignore
    }
  }

  const cleanupResource = resourceManager?.registerCloseableStream(() => {
    void close()
  })

  const handleEvent = (rawEvent: string) => {
    let eventType = 'message'
    const dataLines: string[] = []

    rawEvent.split('\n').forEach((line) => {
      if (line.startsWith('event:')) {
        eventType = line.slice(6).trim()
      } else if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trim())
      }
    })

    if (dataLines.length === 0) return

    const dataString = dataLines.join('\n')
    let payload: unknown = dataString
    try {
      payload = JSON.parse(dataString)
    } catch {
      // ignore JSON parse error, use raw string
    }

    switch (eventType) {
      case 'chunk': {
        if (typeof payload === 'string') {
          handlers.onContent?.(payload)
        } else if (payload && typeof payload === 'object' && 'content' in payload) {
          const content = (payload as { content?: string }).content
          if (typeof content === 'string') {
            handlers.onContent?.(content)
          }
        }
        break
      }
      case 'done': {
        handlers.onDone?.()
        void close()
        break
      }
      case 'error': {
        const message =
          typeof payload === 'string'
            ? payload
            : (payload as { message?: string }).message ?? '流式响应发生错误'
        handlers.onError?.(new Error(message))
        void close()
        break
      }
      default: {
        // 未知事件，尝试按文本块处理
        if (typeof payload === 'string') {
          handlers.onContent?.(payload)
        }
        break
      }
    }
  }

  const processStream = async () => {
    try {
      while (active) {
        const { value, done } = await reader.read()
        if (done) {
          active = false
          handlers.onDone?.()
          break
        }
        buffer += decoder.decode(value, { stream: true })

        let eventSeparatorIndex: number
        while ((eventSeparatorIndex = buffer.indexOf('\n\n')) !== -1) {
          const rawEvent = buffer.slice(0, eventSeparatorIndex).trim()
          buffer = buffer.slice(eventSeparatorIndex + 2)
          if (rawEvent) {
            handleEvent(rawEvent)
          }
        }
      }
    } catch (error) {
      if (active) {
        handlers.onError?.(
          error instanceof Error ? error : new Error('读取流式响应时发生错误')
        )
      }
    } finally {
      cleanupResource && resourceManager?.disposeResource?.(cleanupResource)
    }
  }

  void processStream()

  return {
    cleanup: () => {
      void close()
    },
    isActive: () => active,
  }
}

export async function loadConversationMessages(conversationId: string) {
  return conversationService.fetchMessages(conversationId)
}

export function cleanupAllResources(): void {
  // placeholder: 后续接入真实资源清理
}
