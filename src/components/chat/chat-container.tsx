/**
 * ChatContainer 组件 - 重构版本
 * 基于 conversation.md 架构设计，实现乐观更新和流式响应
 */

import { useRef, useCallback, useEffect, useState } from 'react'
import { useAppRouter } from '@/router/use-app-router'
import { useAuth } from '@/lib/contexts/auth.context'
import { useConversationManager } from '@/lib/hooks/useConversationManager'
import { ChatInput, type ChatInputRef } from './chat-input'
import { MessageList } from './message-list'
import { ChatErrorBoundary } from './chat-error-boundary'
import { ChatScrollManager, type ChatScrollManagerRef } from './chat-scroll-manager'
import { ChatErrorDisplay } from './chat-error-display'
import { CHAT_CONFIG } from '@/lib/constants/chat'
import { isAuthError } from '@/lib/types/api'
import { ChatError } from '@/lib/errors/chat-error'

interface ChatContainerProps {
  conversationId?: string | null
}

export function ChatContainer({ conversationId }: ChatContainerProps) {
  const router = useAppRouter()
  const chatInputRef = useRef<ChatInputRef>(null)
  const scrollManagerRef = useRef<ChatScrollManagerRef>(null)

  const { user } = useAuth()
  const conversationManager = useConversationManager({
    conversationId,
  })

  // 429 退避倒计时（秒）
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null)
  useEffect(() => {
    const err = conversationManager.error
    if (err instanceof ChatError) {
      const code = err.code
      const is429 = code === 'RATE_LIMIT_EXCEEDED' || code === 'HTTP_429'
      if (is429) {
        const ms = err.retryAfter ?? err.getDefaultRetryDelay()
        let sec = Math.max(1, Math.ceil(ms / 1000))
        setRetryCountdown(sec)
        const timer = setInterval(() => {
          sec -= 1
          if (sec <= 0) {
            setRetryCountdown(0)
            clearInterval(timer)
          } else {
            setRetryCountdown(sec)
          }
        }, 1000)
        return () => clearInterval(timer)
      }
    }
    // 非 429 错误时清空倒计时
    setRetryCountdown(null)
  }, [conversationManager.error])

  // 处理消息发送
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      try {
        // 发送消息前立即滚动（用户消息会立即显示）
        scrollManagerRef.current?.scrollToBottom(false)

        await conversationManager.sendMessage(content.trim())

        // 发送后再次滚动确保显示用户消息
        setTimeout(() => scrollManagerRef.current?.scrollToBottom(true), 100)
      } catch (error) {
        console.error('发送消息失败:', error)
        // 错误处理已在 useConversationManager 中完成
      }
    },
    [conversationManager]
  )

  // 处理消息刷新
  const handleRefreshMessage = useCallback(
    async (messageId: string) => {
      try {
        await conversationManager.refreshMessage(messageId)
        setTimeout(() => scrollManagerRef.current?.scrollToBottom(), CHAT_CONFIG.SCROLL_DELAY)
      } catch (error) {
        console.error('刷新消息失败:', error)
      }
    },
    [conversationManager]
  )

  // 错误弹窗的重试：对最后一条助手消息执行刷新
  const handleRetryLast = useCallback(() => {
    const msgs = conversationManager.messages
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'assistant') {
        void conversationManager.refreshMessage(msgs[i].id)
        break
      }
    }
  }, [conversationManager])

  // AI 回复完成后自动聚焦输入框
  const prevIsSending = useRef(conversationManager.isSending)
  useEffect(() => {
    // 监听 isSending 从 true 变为 false，表示 AI 回复完成
    if (prevIsSending.current && !conversationManager.isSending) {
      // AI 回复完成，聚焦输入框
      const timer = setTimeout(() => {
        chatInputRef.current?.focus()
      }, 200) // 延迟一点确保 UI 更新完成

      return () => clearTimeout(timer)
    }

    prevIsSending.current = conversationManager.isSending
  }, [conversationManager.isSending])

  // 消息列表加载完成后自动滚动到底部
  const prevMessagesLength = useRef(conversationManager.messages.length)
  const hasInitialScrolled = useRef(false)

  useEffect(() => {
    const currentLength = conversationManager.messages.length

    // 情况1: 第一次加载现有会话的消息（从后端获取）
    if (
      !hasInitialScrolled.current &&
      currentLength > 0 &&
      conversationId &&
      !conversationManager.isLoading
    ) {
      hasInitialScrolled.current = true
      setTimeout(() => scrollManagerRef.current?.scrollToBottom(false), 100)
      return
    }

    // 情况2: 消息数量发生变化（新消息），且不是正在发送状态
    if (currentLength > prevMessagesLength.current && !conversationManager.isSending) {
      setTimeout(() => scrollManagerRef.current?.scrollToBottom(true), 50)
    }

    prevMessagesLength.current = currentLength
  }, [
    conversationManager.messages.length,
    conversationManager.isSending,
    conversationManager.isLoading,
    conversationId,
  ])

  // 重置初始滚动标记当会话ID改变时
  useEffect(() => {
    hasInitialScrolled.current = false
  }, [conversationId])

  // 处理来自首页的初始消息和搜索状态
  useEffect(() => {
    if (!conversationId && conversationManager.messages.length === 0 && user?.id) {
      const initialMessage = sessionStorage.getItem('initialMessage')

      if (initialMessage?.trim()) {
        // 清理 sessionStorage
        sessionStorage.removeItem('initialMessage')

        handleSendMessage(initialMessage.trim()).catch(console.error)
      }
    }
  }, [
    conversationId,
    conversationManager.messages.length,
    user?.id,
    handleSendMessage,
    conversationManager,
  ])

  // 用户未登录时的处理
  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">正在加载...</p>
        </div>
      </div>
    )
  }

  return (
    <ChatErrorBoundary>
      <div className="flex flex-col h-full relative">
        <ChatScrollManager
          ref={scrollManagerRef}
          messages={conversationManager.messages}
          isLoading={conversationManager.isLoading}
          isSending={conversationManager.isSending}
          onRefreshMessage={handleRefreshMessage}
          virtualScrollOptions={{
            threshold: CHAT_CONFIG.VIRTUAL_LIST_THRESHOLD, // 启用虚拟滚动的消息数量阈值
            forceEnable: false, // 可通过环境变量控制
            forceDisable: false,
          }}
        />

        {/* 输入区域 - 固定在底部 */}
        <div className="flex-shrink-0 bg-opacity-0 pb-4">
          <div className="max-w-[640px] mx-auto px-4">
            <ChatInput
              ref={chatInputRef}
              onSend={handleSendMessage}
              onStop={conversationManager.stopGenerating}
              isStreaming={conversationManager.isSending}
              disabled={conversationManager.isSending}
              placeholder={!conversationId ? '开始新的对话...' : '输入消息...'}
              onHeightChange={() => {}} // 暂时不需要处理高度变化
            />
          </div>
        </div>

        {/* 错误提示 - 使用专门的错误显示组件 */}
        <ChatErrorDisplay
          error={conversationManager.error}
          onDismiss={conversationManager.clearError}
          onRetry={retryCountdown != null && retryCountdown > 0 ? undefined : handleRetryLast}
          onLogin={(() => {
            const err = conversationManager.error
            if (err instanceof ChatError && isAuthError(err.code)) {
              return () => router.push('/sign-in')
            }
            return undefined
          })()}
          retryCountdownSec={retryCountdown ?? undefined}
        />
      </div>
    </ChatErrorBoundary>
  )
}
