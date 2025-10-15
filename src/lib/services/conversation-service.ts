import { ChatError } from '@/lib/errors/chat-error'
import type { Conversation, Message } from '@/lib/types/conversation'
import { ErrorCode } from '@/lib/types/api'

interface ConversationRecord extends Conversation {
  userId: string
}

const conversations = new Map<string, ConversationRecord>()
const messagesByConversation = new Map<string, Message[]>()

function nowIso(): string {
  return new Date().toISOString()
}

function ensureId(id?: string | null): string {
  if (id) return id
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `conv_${Math.random().toString(36).slice(2, 10)}`
}

function cloneMessage(message: Message): Message {
  return { ...message, searchEvents: message.searchEvents ? [...message.searchEvents] : undefined }
}

export class ConversationService {
  async ensureConversation(params: {
    userId: string
    conversationId?: string | null
    name?: string
  }): Promise<Conversation> {
    const id = ensureId(params.conversationId)
    const existing = conversations.get(id)
    if (existing) {
      return { ...existing }
    }

    const timestamp = nowIso()
    const conversation: ConversationRecord = {
      id,
      userId: params.userId,
      abstract: params.name ?? 'New Chat',
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    conversations.set(id, conversation)
    if (!messagesByConversation.has(id)) {
      messagesByConversation.set(id, [])
    }
    return { ...conversation }
  }

  async fetchConversations(userId: string): Promise<Conversation[]> {
    return Array.from(conversations.values())
      .filter((conv) => conv.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .map((conv) => ({ ...conv }))
  }

  async fetchMessages(conversationId: string): Promise<Message[]> {
    const list = messagesByConversation.get(conversationId) ?? []
    return list.map(cloneMessage)
  }

  async saveMessage(message: Message): Promise<void> {
    const list = messagesByConversation.get(message.conversationId)
    if (!list) {
      messagesByConversation.set(message.conversationId, [cloneMessage(message)])
      return
    }
    list.push(cloneMessage(message))

    const conv = conversations.get(message.conversationId)
    if (conv) {
      conv.updatedAt = nowIso()
    }
  }

  async updateMessage(messageId: string, patch: Partial<Message>): Promise<void> {
    for (const list of messagesByConversation.values()) {
      const index = list.findIndex((m) => m.id === messageId)
      if (index !== -1) {
        list[index] = { ...list[index], ...patch }
        return
      }
    }
  }

  async renameConversation(conversationId: string, name: string): Promise<void> {
    const conv = conversations.get(conversationId)
    if (!conv) {
      throw new ChatError(ErrorCode.CONVERSATION_NOT_FOUND, '会话不存在')
    }
    conv.abstract = name
    conv.updatedAt = nowIso()
  }

  async deleteConversation(conversationId: string): Promise<void> {
    conversations.delete(conversationId)
    messagesByConversation.delete(conversationId)
  }
}

export const conversationService = new ConversationService()
