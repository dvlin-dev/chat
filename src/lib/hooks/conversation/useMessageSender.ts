/**
 * 消息发送 Hook
 * 只负责消息发送的逻辑
 */

import { useCallback } from 'react'
import { useConversationDataStore } from '@/lib/stores/conversation-data'
import { useAuth } from '@/lib/contexts/auth.context'
import { useAsyncState } from '@/lib/hooks/useAsyncState'
import { createUserMessage, createAIMessagePlaceholder } from '@/lib/api/conversation-web'
import { ChatError } from '@/lib/errors/chat-error'
import { ErrorCode } from '@/lib/types/api'
import { conversationService } from '@/lib/services/conversation-service'

interface UseMessageSenderReturn {
  isSending: boolean
  sendError: ChatError | null
  prepareNewConversation: (
    content: string
  ) => Promise<{ userMessageId: string; aiMessageId: string; conversationId: string }>
  prepareCompletions: (
    conversationId: string,
    content: string
  ) => Promise<{ userMessageId: string; aiMessageId: string }>
}

export function useMessageSender(): UseMessageSenderReturn {
  const { user } = useAuth()
  const dataStore = useConversationDataStore()
  const { addMessage, addConversation, setCurrentConversation } = dataStore
  
  // 使用新的异步状态管理
  const sendAsync = useAsyncState<unknown>()

  /**
   * 准备新对话的消息（不处理流）
   */
  const prepareNewConversation = useCallback(
    async (content: string) => {
      if (!user?.id) {
        throw new ChatError(ErrorCode.AUTH_TOKEN_EXPIRED, '用户未登录')
      }

      if (!content.trim()) {
        throw new ChatError(ErrorCode.VALIDATION_FAILED, '消息内容不能为空')
      }

      try {
        sendAsync.setLoading(true)
        
        // 检查是否已经有当前会话（避免重复创建）
        const currentConvId = dataStore.currentConversationId
        let conv
        
        if (currentConvId && dataStore.conversations[currentConvId]) {
          // 使用已存在的会话
          conv = dataStore.conversations[currentConvId]
        } else {
          // 创建新会话
          conv = await conversationService.ensureConversation({
            userId: user.id,
            name: content.slice(0, 50),
          })
        }
        addConversation({
          id: conv.id,
          abstract: conv.abstract,
          userId: conv.userId!,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        })
        setCurrentConversation(conv.id)

        // 先创建用户消息
        const userMessage = createUserMessage(conv.id, content, user.id)
        addMessage(userMessage)
        await conversationService.saveMessage(userMessage)

        // 然后创建 AI 消息占位符（时间戳会稍晚）
        const aiMessage = createAIMessagePlaceholder(conv.id)
        addMessage(aiMessage)
        await conversationService.saveMessage(aiMessage)

        return {
          userMessageId: userMessage.id,
          aiMessageId: aiMessage.id,
          conversationId: conv.id,
        }
      } catch (error) {
        const chatError = ChatError.fromError(error)
        sendAsync.setError(chatError)
        throw chatError
      } finally {
        sendAsync.setLoading(false)
      }
    },
    [user, addMessage, addConversation, setCurrentConversation, sendAsync, dataStore]
  )

  /**
   * 准备会话内的新消息（用于已有会话）
   */
  const prepareCompletions = useCallback(
    async (conversationId: string, content: string) => {
      if (!user?.id) {
        throw new ChatError(ErrorCode.AUTH_TOKEN_EXPIRED, '用户未登录')
      }

      if (!content.trim()) {
        throw new ChatError(ErrorCode.VALIDATION_FAILED, '消息内容不能为空')
      }

      try {
        sendAsync.setLoading(true)
        
        // 先创建用户消息
        const userMessage = createUserMessage(conversationId, content, user.id)
        addMessage(userMessage)
        await conversationService.saveMessage(userMessage)

        // 然后创建 AI 占位消息（时间戳会稍晚）
        const aiMessage = createAIMessagePlaceholder(conversationId)
        addMessage(aiMessage)
        await conversationService.saveMessage(aiMessage)

        return {
          userMessageId: userMessage.id,
          aiMessageId: aiMessage.id,
        }
      } catch (error) {
        const chatError = ChatError.fromError(error)
        sendAsync.setError(chatError)
        throw chatError
      } finally {
        sendAsync.setLoading(false)
      }
    },
    [user, addMessage, sendAsync]
  )

  /**
   * 处理会话 ID 更新（从临时到真实）
   */
  return {
    isSending: sendAsync.loading,
    sendError: sendAsync.error,
    prepareNewConversation,
    prepareCompletions,
  }
}
