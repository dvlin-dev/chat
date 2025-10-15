import { forwardRef, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from './message-bubble'
import { LoadingIndicator } from './loading-indicator'
import { StreamingIndicator } from './streaming-indicator'
import type { Message } from '@/lib/types/conversation'
import type { SSESearchSources, SSESearchStatus } from '@/lib/types/api'

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  isSending?: boolean
  onScroll?: () => void
  onRefreshMessage?: (messageId: string) => void
  searchSources?: SSESearchSources | null
  searchStatus?: SSESearchStatus | null
}

const MessageListComponent = forwardRef<HTMLDivElement, MessageListProps>(
  (
    { messages, isLoading, isSending, onScroll, onRefreshMessage, searchSources, searchStatus },
    ref
  ) => {
    // 设置滚动事件监听
    useEffect(() => {
      if (!ref || typeof ref === 'function' || !ref.current || !onScroll) return

      const viewport = ref.current.querySelector('[data-radix-scroll-area-viewport]')
      if (!viewport) return

      viewport.addEventListener('scroll', onScroll)
      return () => viewport.removeEventListener('scroll', onScroll)
    }, [ref, onScroll])

    if (messages.length === 0 && !isLoading && !isSending) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center space-y-2">
            <div className="text-4xl">💬</div>
            <p>开始一段新的对话</p>
            <p className="text-sm">输入消息开始与 AI 助手聊天</p>
          </div>
        </div>
      )
    }

    return (
      <ScrollArea ref={ref} className="h-full">
        <div className="max-w-[640px] mx-auto">
          <div className="space-y-4 p-4 pb-4">
            {messages.map((message, index) => {
              // 找到最后一个AI助手消息
              const lastAssistantMessageIndex = [...messages]
                .reverse()
                .findIndex((m) => m.role === 'assistant')
              const isLastAssistantMessage =
                lastAssistantMessageIndex !== -1 &&
                index === messages.length - 1 - lastAssistantMessageIndex

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onRefreshMessage={onRefreshMessage}
                  showStreaming={
                    // 显示流式指示器：AI 消息 + 内容为空 + 是最后一条消息 + 正在发送中
                    message.role === 'assistant' &&
                    !message.content &&
                    index === messages.length - 1 &&
                    isSending
                  }
                  searchSources={isLastAssistantMessage ? searchSources : null}
                  searchStatus={isLastAssistantMessage ? searchStatus : null}
                />
              )
            })}

            {isLoading && !isSending && (
              <div className="flex justify-start">
                <LoadingIndicator />
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    )
  }
)

MessageListComponent.displayName = 'MessageList'

export const MessageList = MessageListComponent
