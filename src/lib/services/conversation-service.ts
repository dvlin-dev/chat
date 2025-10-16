import { ChatError } from '@/lib/errors/chat-error'
import type { Conversation, Message } from '@/lib/types/conversation'
import {
  ensureConversation as supabaseEnsureConversation,
  fetchConversations as supabaseFetchConversations,
  fetchMessages as supabaseFetchMessages,
  insertMessage as supabaseInsertMessage,
  updateMessage as supabaseUpdateMessage,
  renameConversation as supabaseRenameConversation,
  deleteConversation as supabaseDeleteConversation,
} from '@/lib/services/supabase-conversations'

function mapMessageToInsert(message: Message) {
  return {
    id: message.id,
    conversationId: message.conversationId,
    role: message.role,
    content: message.content,
    userId: message.userId,
    metadata: message.metadata,
    tokenCount: message.tokenCount,
    error: message.error,
    createdAt: message.createdAt,
  }
}

class ConversationService {
  private static instance: ConversationService

  private constructor() {}

  static getInstance(): ConversationService {
    if (!ConversationService.instance) {
      ConversationService.instance = new ConversationService()
    }
    return ConversationService.instance
  }

  async ensureConversation(params: {
    userId: string
    conversationId?: string | null
    name?: string
  }): Promise<Conversation> {
    try {
      return await supabaseEnsureConversation(params)
    } catch (error) {
      throw ChatError.fromError(error, 'conversation')
    }
  }

  async fetchConversations(userId: string): Promise<Conversation[]> {
    try {
      return await supabaseFetchConversations(userId)
    } catch (error) {
      throw ChatError.fromError(error, 'conversation')
    }
  }

  async fetchMessages(conversationId: string): Promise<Message[]> {
    try {
      return await supabaseFetchMessages(conversationId)
    } catch (error) {
      throw ChatError.fromError(error, 'message')
    }
  }

  async saveMessage(message: Message): Promise<Message> {
    try {
      const saved = await supabaseInsertMessage(mapMessageToInsert(message))
      return saved
    } catch (error) {
      throw ChatError.fromError(error, 'message')
    }
  }

  async updateMessage(messageId: string, patch: Partial<Message>): Promise<void> {
    try {
      if (patch.content) {
        console.log('[conversation-service] updateMessage content length', patch.content.length)
      }
      await supabaseUpdateMessage(messageId, {
        content: patch.content,
        metadata: patch.metadata,
        tokenCount: patch.tokenCount,
        error: patch.error,
      })
    } catch (error) {
      throw ChatError.fromError(error, 'message')
    }
  }

  async renameConversation(conversationId: string, name: string): Promise<void> {
    try {
      await supabaseRenameConversation(conversationId, name)
    } catch (error) {
      throw ChatError.fromError(error, 'conversation')
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      await supabaseDeleteConversation(conversationId)
    } catch (error) {
      throw ChatError.fromError(error, 'conversation')
    }
  }
}

export const conversationService = ConversationService.getInstance()
