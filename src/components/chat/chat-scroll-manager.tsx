/**
 * ChatScrollManager 组件
 * 专门处理聊天界面的滚动逻辑，支持虚拟滚动
 */

import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { ScrollToBottomButton } from './scroll-to-bottom-button'
import { MessageList } from './message-list'
import { VirtualMessageList, type VirtualMessageListRef } from './virtual-message-list'
import { useVirtualScrolling } from '@/lib/hooks/useVirtualScrolling'
import { type Message } from '@/lib/types/conversation'

export interface ChatScrollManagerRef {
  scrollToBottom: (smooth?: boolean) => void
}

interface ChatScrollManagerProps {
  messages: Message[]
  isLoading?: boolean
  isSending?: boolean
  onRefreshMessage?: (messageId: string) => void
  className?: string
  // 虚拟滚动选项
  virtualScrollOptions?: {
    threshold?: number
    forceEnable?: boolean
    forceDisable?: boolean
  }
}

export const ChatScrollManager = forwardRef<ChatScrollManagerRef, ChatScrollManagerProps>(
  (
    {
      messages,
      isLoading = false,
      isSending = false,
      onRefreshMessage,
      className = '',
      virtualScrollOptions,
    },
    ref
  ) => {
    const [showScrollButton, setShowScrollButton] = useState(false)
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const virtualListRef = useRef<VirtualMessageListRef>(null)

    // 检查是否应该使用虚拟滚动
    const { shouldUseVirtualScrolling, virtualScrollConfig } = useVirtualScrolling(
      messages.length,
      virtualScrollOptions
    )

    // 自动滚动到底部
    const scrollToBottom = useCallback(
      (smooth: boolean = true) => {
        if (shouldUseVirtualScrolling) {
          // 使用虚拟滚动的滚动方法
          virtualListRef.current?.scrollToBottom(smooth)
        } else {
          // 使用传统滚动方法
          if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector(
              '[data-radix-scroll-area-viewport]'
            )
            if (viewport) {
              viewport.scrollTo({
                top: viewport.scrollHeight,
                behavior: smooth ? 'smooth' : 'auto',
              })
            }
          }
        }
      },
      [shouldUseVirtualScrolling]
    )

    // 处理滚动事件
    const handleScroll = useCallback(() => {
      if (!shouldUseVirtualScrolling && scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
        if (!viewport) return

        const { scrollTop, scrollHeight, clientHeight } = viewport
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
        setShowScrollButton(!isNearBottom)
      }
    }, [shouldUseVirtualScrolling])

    // 处理虚拟滚动的滚动事件
    const handleVirtualScroll = useCallback(() => {
      if (shouldUseVirtualScrolling) {
        // 对于虚拟滚动，我们需要不同的逻辑来检测是否接近底部
        // 这里暂时简化处理，可以根据需要优化
        setShowScrollButton(messages.length > 10) // 简单逻辑：超过10条消息就显示按钮
      }
    }, [shouldUseVirtualScrolling, messages.length])

    // 暴露方法给父组件
    useImperativeHandle(
      ref,
      () => ({
        scrollToBottom,
      }),
      [scrollToBottom]
    )

    return (
      <div className={`flex-1 overflow-hidden relative ${className}`}>
        {shouldUseVirtualScrolling ? (
          // 使用虚拟滚动
          <VirtualMessageList
            ref={virtualListRef}
            messages={messages}
            isLoading={isLoading}
            isSending={isSending}
            onRefreshMessage={onRefreshMessage}
            onScroll={handleVirtualScroll}
            estimateSize={virtualScrollConfig.estimateSize}
            overscan={virtualScrollConfig.overscan}
            className="h-full"
          />
        ) : (
          // 使用传统滚动
          <MessageList
            ref={scrollAreaRef}
            messages={messages}
            isLoading={isLoading}
            isSending={isSending}
            onRefreshMessage={onRefreshMessage}
            onScroll={handleScroll}
          />
        )}

        {/* 滚动到底部按钮 */}
        <ScrollToBottomButton
          visible={showScrollButton}
          onClick={() => scrollToBottom()}
          className="absolute bottom-4 right-4 z-10 mr-4"
        />
      </div>
    )
  }
)

ChatScrollManager.displayName = 'ChatScrollManager'
