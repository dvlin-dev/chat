import { useCallback, useEffect, useState } from 'react'
import { useAppRouter } from '@/router/use-app-router'
import { useConversationDataStore } from '@/lib/stores/conversation-data'
import { useAuth } from '@/lib/contexts/auth.context'
import { useMessageSender } from './conversation/useMessageSender'
import { useStreamHandler } from './conversation/useStreamHandler'
import { useConversationLoader } from './conversation/useConversationLoader'
import { useSearchState } from './conversation/useSearchState'
import { conversationService } from '@/lib/services/conversation-service'
import { useAsyncState } from './useAsyncState'
import { completionsStream } from '@/lib/api/conversation-web'
import { ChatError } from '@/lib/errors/chat-error'
import { ErrorCode } from '@/lib/types/api'
import { MessageRole, type Message } from '@/lib/types/conversation'
import { globalStreamManager } from '@/lib/utils/global-stream-manager'
import { recordStreamStopped } from '@/lib/metrics/chat-metrics'

interface UseConversationManagerProps {
  conversationId?: string | null
}

export interface ConversationManagerAPI {
  // 会话和消息数据
  conversation: ReturnType<typeof useConversationLoader>['conversation']
  messages: Message[]

  // 加载状态
  isLoading: boolean
  isSending: boolean
  isDeleting: boolean
  isRefreshing: boolean

  // 错误状态
  error: ChatError | null

  // 搜索相关
  searchState: ReturnType<typeof useSearchState>['searchState']
  setSearchEnabled: (enabled: boolean) => void

  // 核心操作
  sendMessage: (content: string, options?: { enableWebSearch?: boolean }) => Promise<void>
  refreshMessage: (messageId: string) => Promise<void>
  deleteConversation: (conversationId: string) => Promise<void>
  stopGenerating: () => void

  // 辅助操作
  clearError: () => void
  loadMoreMessages: () => Promise<void>
}

export function useConversationManager({
  conversationId,
}: UseConversationManagerProps = {}): ConversationManagerAPI {
  const router = useAppRouter()
  const { user } = useAuth()
  const dataStore = useConversationDataStore()
  const { setCurrentConversation, removeConversation, updateMessage, removeMessage, addMessage } = dataStore
  
  // 使用新的异步状态管理
  const deleteAsync = useAsyncState<void>()
  const refreshAsync = useAsyncState<void>()
  
  // 使用拆分的 Hooks
  const messageSender = useMessageSender()
  const streamHandler = useStreamHandler()
  const conversationLoader = useConversationLoader({ conversationId })
  const searchStateManager = useSearchState()

  // 本地状态
  const [isRefreshing, setIsRefreshing] = useState(false)

  /**
   * 设置当前会话
   */
  useEffect(() => {
    if (conversationId) {
      setCurrentConversation(conversationId)
    } else {
      // conversationId 为 null 表示返回了首页，清空当前会话和消息
      setCurrentConversation(null)
    }
  }, [conversationId, setCurrentConversation])

  /**
   * 发送消息
   */
  const sendMessage = useCallback(
    async (content: string, options?: { enableWebSearch?: boolean }) => {
      if (!user?.id) {
        throw new ChatError(ErrorCode.AUTH_TOKEN_EXPIRED, '请先登录')
      }

      if (!content.trim()) {
        return
      }

      try {
        // 清理之前的流连接
        streamHandler.cleanupActiveStream()

        // 检查是否真的需要创建新会话
        // 如果URL已经更新到新会话ID，则使用现有会话
        const currentConvId = conversationId || dataStore.currentConversationId
        
        if (!currentConvId) {
          // 开始新对话
          const { aiMessageId, conversationId: newConversationId } = await messageSender.prepareNewConversation(
            content
          )

          // 使用一个唯一的流ID
          const streamId = `stream_${newConversationId}_${aiMessageId}`

          // 创建流处理器，仅处理内容/完成/错误（不再解析自定义 type 事件）
          const handlers = {
            ...streamHandler.createStreamHandlers(aiMessageId),
          }

          // 获取搜索参数 - 优先使用传入的参数，否则使用全局状态
          const searchParams = options?.enableWebSearch !== undefined 
            ? { enableWebSearch: options.enableWebSearch }
            : searchStateManager.getSearchParams()

          console.log('🔍 Final search params for new conversation:', searchParams)

          // 开始流式连接 - 使用全局资源管理器
          const cleanup = await completionsStream(
            {
              conversationId: newConversationId,
              messages: [{ content, role: MessageRole.user }],
              ...searchParams,
            },
            handlers,
            globalStreamManager.getResourceManager()
          )

          // 注册到全局流管理器
          globalStreamManager.registerStream(streamId, cleanup)

          // 更新地址栏到新会话 - 使用 Next.js router
          router.push(`/chat/${newConversationId}`)
        } else {
          // 确保使用正确的会话ID
          const targetConversationId = currentConvId
          // 在现有对话中发送
          const { aiMessageId } = await messageSender.prepareCompletions(targetConversationId, content)

          // 使用一个唯一的流ID
          const streamId = `stream_${targetConversationId}_${aiMessageId}`

          // 创建流处理器，仅处理内容/完成/错误
          const handlers = {
            ...streamHandler.createStreamHandlers(aiMessageId),
          }

          // 获取搜索参数 - 优先使用传入的参数，否则使用全局状态
          const searchParams = options?.enableWebSearch !== undefined 
            ? { enableWebSearch: options.enableWebSearch }
            : searchStateManager.getSearchParams()

          console.log('🔍 Final search params for existing conversation:', searchParams)

          // 开始流式连接 - 使用全局资源管理器
          const cleanup = await completionsStream(
            {
              conversationId: targetConversationId,
              messages: [{ content, role: MessageRole.user }],
              ...searchParams, // 添加搜索配置
            },
            handlers,
            globalStreamManager.getResourceManager()
          )

          // 注册到全局流管理器
          globalStreamManager.registerStream(streamId, cleanup)
        }
      } catch (error) {
        console.error('发送消息失败:', error)
        throw error
      }
    },
    [user, conversationId, messageSender, streamHandler, searchStateManager, dataStore, router]
  )

  /**
   * 刷新消息（重新生成）
   * 找到点击的AI消息上方最近的用户消息，删除该用户消息之后的所有消息，然后重新发送
   */
  const refreshMessage = useCallback(
    async (messageId: string) => {
      if (!messageId || !conversationId) return

      try {
        setIsRefreshing(true)
        
        // 找到要刷新的AI消息的索引
        const messageIndex = conversationLoader.messages.findIndex((m) => m.id === messageId)
        if (messageIndex === -1) {
          throw new ChatError(ErrorCode.RESOURCE_NOT_FOUND, '消息不存在')
        }

        // 向上查找最近的用户消息
        let lastUserMessageIndex = -1
        let lastUserMessage: Message | null = null
        
        for (let i = messageIndex - 1; i >= 0; i--) {
          if (conversationLoader.messages[i].role === MessageRole.user) {
            lastUserMessageIndex = i
            lastUserMessage = conversationLoader.messages[i]
            break
          }
        }

        if (!lastUserMessage || lastUserMessageIndex === -1) {
          throw new ChatError(ErrorCode.RESOURCE_NOT_FOUND, '没有找到用户消息')
        }

        // 收集需要删除的消息ID（包括最后的用户消息及其之后的所有消息）
        const messagesToDelete = conversationLoader.messages
          .slice(lastUserMessageIndex) // 从用户消息开始（包含）
          .filter(m => !m.id.startsWith('msg_')) // 只删除有真实ID的消息（非临时消息）
          .map(m => m.id)

        // 清理现有流
        streamHandler.cleanupActiveStream()

        // 从前端状态中删除这些消息（包括用户消息本身）
        for (let i = conversationLoader.messages.length - 1; i >= lastUserMessageIndex; i--) {
          removeMessage(conversationLoader.messages[i].id)
        }

        // 重新发送最后的用户消息
        await sendMessage(lastUserMessage.content)
      } catch (error) {
        console.error('刷新消息失败:', error)
        throw error
      } finally {
        setIsRefreshing(false)
      }
    },
    [conversationId, conversationLoader.messages, streamHandler, removeMessage, sendMessage]
  )

  /**
   * 删除会话
   */
  const deleteConversation = useCallback(
    async (targetConversationId: string) => {
      try {
        // 使用新的 service 层
        await deleteAsync.execute(
          conversationService.deleteConversation(targetConversationId)
        )
        
        // 从 store 中删除
        removeConversation(targetConversationId)
        
        // 如果删除的是当前会话，跳转到首页
        if (targetConversationId === conversationId) {
          router.push('/chat')
        }
      } catch (error) {
        console.error('删除会话失败:', error)
        throw error
      }
    },
    [conversationId, router, removeConversation, deleteAsync]
  )

  // 停止当前生成（取消活动流；并兜底清理全局注册的流）
  const stopGenerating = useCallback(() => {
    try {
      streamHandler.cleanupActiveStream()
    } catch (e) {
      // ignore
    }
    try {
      // 兜底：如存在全局流，统一清理
      globalStreamManager.cleanupAll()
    } catch {
      // ignore
    }
    try { recordStreamStopped() } catch {}
  }, [streamHandler])

  /**
   * 清除错误
   */
  const clearError = useCallback(() => {
    messageSender.sendError && refreshAsync.setError(null)
    streamHandler.streamError && refreshAsync.setError(null)
    conversationLoader.conversationsError && refreshAsync.setError(null)
    conversationLoader.messagesError && refreshAsync.setError(null)
    deleteAsync.setError(null)
  }, [messageSender, streamHandler, conversationLoader, refreshAsync, deleteAsync])

  /**
   * 加载更多消息（预留功能）
   */
  const loadMoreMessages = useCallback(async () => {
    // TODO: 实现分页加载
    if (process.env.NODE_ENV === 'development') {
      console.log('加载更多消息功能待实现')
    }
  }, [])

  // 合并所有错误状态
  const error = 
    messageSender.sendError ||
    streamHandler.streamError ||
    conversationLoader.conversationsError ||
    conversationLoader.messagesError ||
    deleteAsync.error ||
    refreshAsync.error ||
    null

  // 合并加载状态
  const isLoading = 
    conversationLoader.isLoadingConversations ||
    conversationLoader.isLoadingMessages

  return {
    // 会话和消息数据
    conversation: conversationLoader.conversation,
    messages: conversationLoader.messages,

    // 加载状态
    isLoading,
    isSending: messageSender.isSending || streamHandler.isStreaming,
    isDeleting: deleteAsync.loading,
    isRefreshing,

    // 错误状态
    error,

    // 搜索相关
    searchState: searchStateManager.searchState,
    setSearchEnabled: searchStateManager.setSearchEnabled,

    // 核心操作
    sendMessage,
    refreshMessage,
    deleteConversation,
    stopGenerating,

    // 辅助操作
    clearError,
    loadMoreMessages,
  }
}
