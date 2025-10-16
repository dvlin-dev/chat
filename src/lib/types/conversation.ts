import { ErrorCode } from '@/lib/types/api'
import { ChatError } from '@/lib/errors/chat-error'

// 消息角色枚举
export enum MessageRole {
  user = 'user',
  assistant = 'assistant',
  system = 'system',
}

export interface Message {
  id: string
  conversationId: string
  content: string
  role: MessageRole
  createdAt: string
  userId?: string
  metadata?: Record<string, unknown>
  tokenCount?: number
  error?: string
}

// 会话类型
export interface Conversation {
  id: string
  userId?: string
  abstract?: string
  createdAt: string
  updatedAt: string
}

// 消息状态枚举
export enum MessageStatus {
  PENDING = 'pending',
  SENDING = 'sending', 
  SENT = 'sent',
  FAILED = 'failed'
}

// 重新导出统一的错误系统，保持兼容性
export { ChatError as ConversationError, ChatError, ErrorCode }

// 加载状态类型
export enum LoadingType {
  CONVERSATIONS = 'conversations',
  MESSAGES = 'messages',
  SENDING = 'sending'
}

// 对话状态接口
export interface ConversationState {
  // 用户信息
  currentUserId: string | null
  
  // 会话数据
  conversations: Record<string, Conversation>
  currentConversationId: string | null
  
  // 消息数据 - 按会话ID分组
  messages: Record<string, Message[]>
  
  // 加载状态
  loading: {
    conversations: boolean
    messages: Record<string, boolean>
    sending: boolean
  }
  
  // 错误状态
  errors: {
    lastError: ChatError | null
    messageErrors: Record<string, ChatError>
  }
}

// 对话管理器 API 接口
export interface ConversationManagerAPI {
  // 状态
  currentConversation: Conversation | null
  messages: Message[]
  isLoading: boolean
  isSending: boolean
  error: ChatError | null
  
  // 基础操作
  createNewConversation: () => Promise<Conversation | null>
  loadConversation: (id: string) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  
  // 消息操作
  sendMessage: (content: string) => Promise<void>
  refreshMessage: (messageId: string) => Promise<void>
  retryFailedMessages: () => Promise<void>
  
  // 状态管理
  setCurrentConversation: (id: string | null) => void
  clearErrors: () => void
}
