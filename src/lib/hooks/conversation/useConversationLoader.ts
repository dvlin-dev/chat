/**
 * 会话加载 Hook
 * 负责加载会话和消息
 */

import { useEffect, useCallback, useRef } from 'react'
import { useConversationDataStore } from '@/lib/stores/conversation-data'
import { conversationService } from '@/lib/services/conversation-service'
import { useAsyncState } from '@/lib/hooks/useAsyncState'
import { useAuth } from '@/lib/contexts/auth.context'
import { loadConversationMessages } from '@/lib/api/conversation-web'
import { ChatError } from '@/lib/errors/chat-error'
import type { Conversation, Message } from '@/lib/types/conversation'

interface UseConversationLoaderProps {
  conversationId?: string | null
}

interface UseConversationLoaderReturn {
  conversation: Conversation | null
  messages: Message[]
  isLoadingConversations: boolean
  isLoadingMessages: boolean
  conversationsError: ChatError | null
  messagesError: ChatError | null
  loadConversations: () => Promise<void>
  loadMessages: (conversationId: string) => Promise<void>
  refreshConversations: () => Promise<void>
}

export function useConversationLoader({
  conversationId,
}: UseConversationLoaderProps = {}): UseConversationLoaderReturn {
  const { user } = useAuth()
  const dataStore = useConversationDataStore()
  const { conversations, currentMessages, setConversations, setMessages } = dataStore
  
  // 使用新的异步状态管理
  const conversationsAsync = useAsyncState<Conversation[]>()
  const messagesAsync = useAsyncState<Message[]>()
  
  const loadingRef = useRef<Set<string>>(new Set())

  /**
   * 获取当前会话
   */
  const conversation = conversationId ? conversations[conversationId] || null : null

  /**
   * 加载会话列表
   */
  const loadConversations = useCallback(async () => {
    if (!user?.id) {
      console.warn('用户未登录，无法加载会话列表')
      return
    }

    try {
      const result = await conversationsAsync.execute(
        conversationService.fetchConversations(user.id)
      )
      setConversations(result)
    } catch (error) {
      console.error('加载会话列表失败:', error)
      // 错误已在 conversationsAsync 中处理
    }
  }, [user, conversationsAsync, setConversations])

  /**
   * 加载指定会话的消息
   */
  const loadMessages = useCallback(
    async (targetConversationId: string) => {
      if (!targetConversationId) return

      // 防止重复加载
      if (loadingRef.current.has(targetConversationId)) {
        return
      }

      try {
        loadingRef.current.add(targetConversationId)
        
        // 使用新的 service 层
        const loadedMessages = await messagesAsync.execute(
          conversationService.fetchMessages(targetConversationId)
        )

        if (loadedMessages && loadedMessages.length > 0) {
          const latestMessages = useConversationDataStore.getState().currentMessages
          const currentById = new Map(latestMessages.map((msg) => [msg.id, msg]))
          const remoteById = new Map(loadedMessages.map((msg) => [msg.id, msg]))

          const merged = loadedMessages.map((remote) => {
            const local = currentById.get(remote.id)
            if (!local) return remote

            console.log('[conversation-loader] merge message', {
              id: remote.id,
              remoteContentLength: remote.content?.length ?? 0,
              localContentLength: local.content?.length ?? 0,
            })

            return {
              ...local,
              createdAt: remote.createdAt ?? local.createdAt,
              metadata: remote.metadata ?? local.metadata,
              tokenCount: remote.tokenCount ?? local.tokenCount,
              error: remote.error ?? local.error,
            }
          })

          for (const local of latestMessages) {
            if (!remoteById.has(local.id)) {
              merged.push(local)
            }
          }

          merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

          setMessages(merged)
        } else {
          setMessages(useConversationDataStore.getState().currentMessages)
        }
      } catch (error) {
        console.error('加载会话消息失败:', error)
        // 错误已在 messagesAsync 中处理
        setMessages(useConversationDataStore.getState().currentMessages)
      } finally {
        loadingRef.current.delete(targetConversationId)
      }
    },
    [setMessages, messagesAsync]
  )

  /**
   * 刷新会话列表
   */
  const refreshConversations = useCallback(async () => {
    await loadConversations()
  }, [loadConversations])

  /**
   * 初始化时加载会话列表
   */
  const convCount = Object.keys(conversations).length
  const didInitRef = useRef(false)
  useEffect(() => {
    if (!user?.id) return
    if (didInitRef.current) return
    if (convCount === 0) {
      didInitRef.current = true
      loadConversations()
    }
  }, [user?.id, convCount])

  /**
   * 加载指定会话的消息
   * 当conversationId改变时，重置加载状态并加载新消息
   */
  const prevConversationIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (!conversationId) {
      prevConversationIdRef.current = null
      return
    }
    
    // 如果会话 ID 改变了，重新加载消息
    if (prevConversationIdRef.current !== conversationId) {
      prevConversationIdRef.current = conversationId
      void loadMessages(conversationId)
    }
  }, [conversationId, loadMessages])

  /**
   * 清理函数
   */
  useEffect(() => {
    const currentLoadingRef = loadingRef.current
    return () => {
      currentLoadingRef.clear()
    }
  }, [])

  return {
    conversation,
    messages: currentMessages,
    isLoadingConversations: conversationsAsync.loading,
    isLoadingMessages: messagesAsync.loading,
    conversationsError: conversationsAsync.error,
    messagesError: messagesAsync.error,
    loadConversations,
    loadMessages,
    refreshConversations,
  }
}
