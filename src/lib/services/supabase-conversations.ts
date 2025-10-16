import { getSupabaseClient } from '@/lib/supabase/client'
import { ChatError } from '@/lib/errors/chat-error'
import { ErrorCode } from '@/lib/types/api'
import type { Conversation, Message, MessageRole } from '@/lib/types/conversation'

function isUuid(value: string | undefined): boolean {
  if (!value) return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

interface ConversationRecord {
  id: string
  owner_id: string
  abstract: string | null
  model_id: string | null
  temperature: number | null
  created_at: string
  updated_at: string
}

interface MessageRecord {
  id: string
  conversation_id: string
  owner_id: string | null
  role: MessageRole
  content: string
  metadata: Record<string, unknown> | null
  token_count: number | null
  error: string | null
  created_at: string
}

export interface MessageInsert {
  id?: string
  conversationId: string
  role: MessageRole
  content: string
  userId?: string
  metadata?: Record<string, unknown>
  tokenCount?: number
  error?: string
  createdAt?: string
}

function mapConversation(record: ConversationRecord): Conversation {
  return {
    id: record.id,
    userId: record.owner_id,
    abstract: record.abstract ?? undefined,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

function mapMessage(record: MessageRecord): Message {
  return {
    id: record.id,
    conversationId: record.conversation_id,
    content: record.content,
    role: record.role,
    createdAt: record.created_at,
    userId: record.owner_id ?? undefined,
    metadata: record.metadata ?? undefined,
    tokenCount: record.token_count ?? undefined,
    error: record.error ?? undefined,
  }
}

function handleError(error: unknown, fallbackCode: ErrorCode, message: string): never {
  if (error instanceof ChatError) {
    throw error
  }
  if (error instanceof Error) {
    throw new ChatError(fallbackCode, message, { originalError: error })
  }
  throw new ChatError(fallbackCode, message)
}

export async function ensureConversation(params: {
  userId: string
  conversationId?: string | null
  name?: string
}): Promise<Conversation> {
  const client = getSupabaseClient()

  try {
    if (params.conversationId) {
      const { data, error } = await client
        .from('conversations')
        .select('*')
        .eq('id', params.conversationId)
        .eq('owner_id', params.userId)
        .limit(1)
        .maybeSingle()

      if (error) {
        throw error
      }

      if (data) {
        return mapConversation(data as ConversationRecord)
      }
    }

    const { data, error } = await client
      .from('conversations')
      .insert({
        owner_id: params.userId,
        abstract: params.name ?? 'New Chat',
      })
      .select('*')
      .single()

    if (error) {
      throw error
    }

    return mapConversation(data as ConversationRecord)
  } catch (error) {
    handleError(error, ErrorCode.CONVERSATION_CREATE_FAILED, '创建会话失败')
  }
}

export async function fetchConversations(userId: string): Promise<Conversation[]> {
  const client = getSupabaseClient()

  try {
    const { data, error } = await client
      .from('conversations')
      .select('*')
      .eq('owner_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      throw error
    }

    return (data as ConversationRecord[]).map(mapConversation)
  } catch (error) {
    handleError(error, ErrorCode.CONVERSATION_NOT_FOUND, '加载会话列表失败')
  }
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const client = getSupabaseClient()

  try {
    const { data, error } = await client
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    return (data as MessageRecord[]).map(mapMessage)
  } catch (error) {
    handleError(error, ErrorCode.MESSAGE_SEND_FAILED, '加载会话消息失败')
  }
}

export async function insertMessage(message: MessageInsert): Promise<Message> {
  const client = getSupabaseClient()

  try {
    const payload: Record<string, unknown> = {
      conversation_id: message.conversationId,
      owner_id: message.userId ?? null,
      role: message.role,
      content: message.content,
      metadata: message.metadata ?? null,
      token_count: message.tokenCount ?? null,
      error: message.error ?? null,
      created_at: message.createdAt ?? new Date().toISOString(),
    }

    if (message.id && isUuid(message.id)) {
      payload.id = message.id
    }

    const { data, error } = await client.from('messages').insert(payload).select('*').single()

    if (error) {
      throw error
    }

    const mapped = mapMessage(data as MessageRecord)

    // 更新会话更新时间，保证列表排序
    const { error: updateError } = await client
      .from('conversations')
      .update({ updated_at: mapped.createdAt })
      .eq('id', mapped.conversationId)

    if (updateError) {
      console.warn('更新会话更新时间失败:', updateError)
    }

    return mapped
  } catch (error) {
    handleError(error, ErrorCode.MESSAGE_SEND_FAILED, '保存消息失败')
  }
}

export async function updateMessage(messageId: string, updates: Partial<MessageInsert>): Promise<void> {
  const client = getSupabaseClient()

  try {
    const payload: Record<string, unknown> = {}
    if (updates.content !== undefined) payload.content = updates.content
    if (updates.metadata !== undefined) payload.metadata = updates.metadata
    if (updates.tokenCount !== undefined) payload.token_count = updates.tokenCount
    if (updates.error !== undefined) payload.error = updates.error

    if (Object.keys(payload).length === 0) return

    const { error } = await client.from('messages').update(payload).eq('id', messageId)
    if (error) {
      throw error
    }
  } catch (error) {
    handleError(error, ErrorCode.MESSAGE_SEND_FAILED, '更新消息失败')
  }
}

export async function renameConversation(conversationId: string, name: string): Promise<void> {
  const client = getSupabaseClient()

  try {
    const { error } = await client
      .from('conversations')
      .update({ abstract: name, updated_at: new Date().toISOString() })
      .eq('id', conversationId)

    if (error) {
      throw error
    }
  } catch (error) {
    handleError(error, ErrorCode.CONVERSATION_CREATE_FAILED, '重命名会话失败')
  }
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const client = getSupabaseClient()

  try {
    const { error } = await client.from('conversations').delete().eq('id', conversationId)
    if (error) {
      throw error
    }
  } catch (error) {
    handleError(error, ErrorCode.CONVERSATION_NOT_FOUND, '删除会话失败')
  }
}
