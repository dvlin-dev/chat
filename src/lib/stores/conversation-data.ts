import { create } from 'zustand'
import type { Conversation, Message } from '@/lib/types/conversation'

interface ConversationDataState {
  // 用户信息
  currentUserId: string | null

  // 会话数据
  conversations: Record<string, Conversation>
  currentConversationId: string | null

  // 当前会话的消息 - 只存储当前会话
  currentMessages: Message[]
}

interface ConversationDataActions {
  // 会话操作
  addConversation: (conversation: Conversation) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  removeConversation: (id: string) => void
  deleteConversation: (id: string) => void // 删除的别名
  setConversations: (conversations: Conversation[]) => void
  setCurrentConversation: (conversationId: string | null) => void

  // 消息操作
  addMessage: (message: Message) => void
  updateMessage: (messageId: string, updates: Partial<Message>) => void
  removeMessage: (messageId: string) => void
  setMessages: (messages: Message[]) => void
  clearMessages: () => void

  // 用户操作
  setCurrentUserId: (userId: string | null) => void

  // 重置
  reset: () => void
}

export type ConversationDataStore = ConversationDataState & ConversationDataActions

/**
 * 纯数据存储 Store
 * - 只负责数据管理，不包含 API 调用
 * - 不包含加载状态和错误状态
 * - 专注于数据的增删改查操作
 */
export const useConversationDataStore = create<ConversationDataStore>()((set, get) => ({
  // State
  currentUserId: null,
  conversations: {},
  currentConversationId: null,
  currentMessages: [],

  // 会话操作
  addConversation: (conversation) =>
    set((state) => ({
      conversations: {
        ...state.conversations,
        [conversation.id]: conversation,
      },
    })),

  updateConversation: (id, updates) =>
    set((state) => {
      if (!state.conversations[id]) return state
      return {
        conversations: {
          ...state.conversations,
          [id]: { ...state.conversations[id], ...updates },
        },
      }
    }),

  removeConversation: (id) =>
    set((state) => {
      const { [id]: removed, ...restConversations } = state.conversations
      return {
        conversations: restConversations,
        currentConversationId:
          state.currentConversationId === id ? null : state.currentConversationId,
        // 如果删除的是当前会话，清空消息
        currentMessages: state.currentConversationId === id ? [] : state.currentMessages,
      }
    }),

  // 删除的别名，方便使用
  deleteConversation: (id) => get().removeConversation(id),

  setConversations: (conversationsList) => {
    const result = conversationsList.reduce(
      (acc, conv) => {
        acc[conv.id] = conv
        return acc
      },
      {} as Record<string, Conversation>
    )

    set({ conversations: result })
  },

  setCurrentConversation: (conversationId) =>
    set((state) => {
      // 若会话未变化，避免无意义更新导致的重复渲染
      if (state.currentConversationId === conversationId) return state
      return {
        currentConversationId: conversationId,
        // 切换会话时清空消息，等待新消息加载
        currentMessages: [],
      }
    }),
  // 消息操作
  addMessage: (message) =>
    set((state) => ({
      currentMessages: [...state.currentMessages, message],
    })),

  updateMessage: (messageId, updates) =>
    set((state) => {
      const messageIndex = state.currentMessages.findIndex((msg) => msg.id === messageId)
      if (messageIndex === -1) {
        console.warn('未找到消息:', messageId)
        return state
      }

      const updatedMessages = [
        ...state.currentMessages.slice(0, messageIndex),
        { ...state.currentMessages[messageIndex], ...updates },
        ...state.currentMessages.slice(messageIndex + 1),
      ]

      return { currentMessages: updatedMessages }
    }),

  removeMessage: (messageId) =>
    set((state) => ({
      currentMessages: state.currentMessages.filter((msg) => msg.id !== messageId),
    })),

  setMessages: (messages) => set({ currentMessages: messages }),

  clearMessages: () => set({ currentMessages: [] }),

  // 用户操作
  setCurrentUserId: (userId) => set({ currentUserId: userId }),

  // 重置
  reset: () =>
    set({
      currentUserId: null,
      conversations: {},
      currentConversationId: null,
      currentMessages: [],
    }),
}))
