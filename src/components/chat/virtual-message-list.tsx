/**
 * VirtualMessageList 组件
 * 使用虚拟滚动优化大量消息的渲染性能
 */

import React, { forwardRef, useImperativeHandle, useRef, useEffect, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { MessageBubble } from './message-bubble'
import { type Message } from '@/lib/types/conversation'
import { CHAT_CONFIG } from '@/lib/constants/chat'

// 简单的加载动画组件
function LoadingDots() {
  return (
    <div className="flex space-x-1">
      <div className="animate-pulse">●</div>
      <div className="animate-pulse" style={{ animationDelay: '0.2s' }}>
        ●
      </div>
      <div className="animate-pulse" style={{ animationDelay: '0.4s' }}>
        ●
      </div>
    </div>
  )
}

export interface VirtualMessageListRef {
  scrollToBottom: (smooth?: boolean) => void
  scrollTo: (index: number, options?: { align?: 'start' | 'center' | 'end' | 'auto' }) => void
}

interface VirtualMessageListProps {
  messages: Message[]
  isLoading?: boolean
  isSending?: boolean
  onRefreshMessage?: (messageId: string) => void
  onScroll?: () => void
  className?: string
  // 虚拟滚动配置
  estimateSize?: number
  overscan?: number
}

export const VirtualMessageList = forwardRef<VirtualMessageListRef, VirtualMessageListProps>(
  (
    {
      messages,
      isLoading = false,
      isSending = false,
      onRefreshMessage,
      onScroll,
      className = '',
      estimateSize = CHAT_CONFIG.VIRTUAL_LIST_ESTIMATE_SIZE, // 预估每个消息的高度
      overscan = CHAT_CONFIG.VIRTUAL_LIST_OVERSCAN, // 预渲染的项目数量
    },
    ref
  ) => {
    const parentRef = useRef<HTMLDivElement>(null)

    // 创建虚拟滚动器
    const virtualizer = useVirtualizer({
      count: messages.length + (isSending ? 1 : 0), // 如果正在发送，添加一个加载项
      getScrollElement: () => parentRef.current,
      estimateSize: () => estimateSize,
      overscan,
      // 启用动态尺寸测量
      measureElement:
        typeof ResizeObserver !== 'undefined'
          ? (element) => element?.getBoundingClientRect().height
          : undefined,
    })

    // 滚动到底部
    const scrollToBottom = useCallback(
      (smooth = true) => {
        if (parentRef.current) {
          const lastIndex = messages.length + (isSending ? 1 : 0) - 1
          if (lastIndex >= 0) {
            virtualizer.scrollToIndex(lastIndex, {
              align: 'end',
              behavior: smooth ? 'smooth' : 'auto',
            })
          }
        }
      },
      [messages.length, isSending, virtualizer]
    )

    // 滚动到指定索引
    const scrollTo = useCallback(
      (index: number, options?: { align?: 'start' | 'center' | 'end' | 'auto' }) => {
        virtualizer.scrollToIndex(index, options)
      },
      [virtualizer]
    )

    // 暴露方法给父组件
    useImperativeHandle(
      ref,
      () => ({
        scrollToBottom,
        scrollTo,
      }),
      [scrollToBottom, scrollTo]
    )

    // 监听消息变化自动滚动到底部
    useEffect(() => {
      if (messages.length > 0) {
        const timer = setTimeout(() => scrollToBottom(true), CHAT_CONFIG.SCROLL_DELAY)
        return () => clearTimeout(timer)
      }
    }, [messages.length, scrollToBottom])

    // 处理滚动事件
    useEffect(() => {
      const element = parentRef.current
      if (element && onScroll) {
        element.addEventListener('scroll', onScroll, { passive: true })
        return () => element.removeEventListener('scroll', onScroll)
      }
    }, [onScroll])

    const virtualItems = virtualizer.getVirtualItems()

    return (
      <div
        ref={parentRef}
        className={`h-full overflow-auto ${className}`}
        style={{
          contain: 'strict',
        }}
      >
        {/* 虚拟容器 */}
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualItem) => {
            const isLast = virtualItem.index === messages.length - 1
            const isLoadingItem = virtualItem.index === messages.length && isSending

            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <div className="max-w-[640px] mx-auto">
                  {isLoadingItem ? (
                    // 渲染加载状态
                    <div className="flex justify-start p-4">
                      <div className="max-w-xs lg:max-w-md xl:max-w-lg bg-muted rounded-lg p-3">
                        <LoadingDots />
                      </div>
                    </div>
                  ) : (
                    // 渲染消息
                    <MessageBubble
                      message={messages[virtualItem.index]}
                      onRefreshMessage={onRefreshMessage}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* 加载状态 */}
        {isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* 空状态 */}
        {!isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-semibold mb-2">开始对话</h3>
              <p className="text-sm">发送消息开始与 AI 助手的对话</p>
            </div>
          </div>
        )}
      </div>
    )
  }
)

VirtualMessageList.displayName = 'VirtualMessageList'
