import { MessageRole, type Message } from '@/lib/types/conversation'
import type { WebSearchConfig } from '@/lib/types/api'
import { conversationService } from '@/lib/services/conversation-service'

export interface CompletionsDto {
  conversationId: string
  messages: { role: MessageRole; content: string }[]
  enableWebSearch?: boolean
  webSearchConfig?: WebSearchConfig
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
  _data: CompletionsDto,
  handlers: SSEEventHandlers
): Promise<StreamCleanup> {
  let active = true

  queueMicrotask(() => {
    if (!active) return
    handlers.onContent?.('（AI 回复待集成）')
    handlers.onDone?.()
  })

  return {
    cleanup: () => {
      active = false
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
