import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StreamingIndicator } from './streaming-indicator'
import { ThinkingDots } from './thinking-dots'
import { MarkdownMessage } from './markdown-message'
import type { Message } from '@/lib/types/conversation'
import { useChatTranslation } from '@/lib/i18n-setup'

interface MessageBubbleProps {
  message: Message
  onRefreshMessage?: (messageId: string) => void
  showStreaming?: boolean
}

const MessageBubbleComponent = ({
  message,
  onRefreshMessage,
  showStreaming,
}: MessageBubbleProps) => {
  const tChat = useChatTranslation()
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      // TODO: 显示复制成功的提示
    } catch (error) {
      console.error('Failed to copy message:', error)
    }
  }

  const handleRefresh = () => {
    if (onRefreshMessage && isAssistant) {
      onRefreshMessage(message.id)
    }
  }

  return (
    <div className={cn('flex gap-3 max-w-[640px]', isUser && 'justify-end')}>
      <div
        className={cn(
          'flex flex-col max-w-[100%] sm:max-w-[90%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <Card
          className={cn(
            'relative group',
            isUser
              ? 'text-foreground border border-border rounded-3xl rounded-br-lg px-4 py-2.5 min-h-7 prose dark:prose-invert break-words prose-p:opacity-100 prose-strong:opacity-100 prose-li:opacity-100 prose-ul:opacity-100 prose-ol:opacity-100 prose-ul:my-1 prose-ol:my-1 prose-li:my-2 last:prose-li:mb-3 prose-li:ps-1 prose-li:ms-1'
              : 'bg-opacity-0 p-2 pl-0',
            isAssistant && 'p-2 pl-0'
          )}
        >
          <div className={cn(isUser ? '' : '')}>
            {/* 渲染消息内容 */}
            {isAssistant && message.content ? (
              <MarkdownMessage content={message.content} />
            ) : isUser && message.content ? (
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
            ) : showStreaming ? (
              ''
            ) : (
              <ThinkingDots />
            )}

            {showStreaming && <StreamingIndicator />}
          </div>
        </Card>

        {isAssistant && (
          <div
            className={cn(
              'text-xs text-muted-foreground mt-1 flex items-center gap-1',
              isUser && 'flex-row-reverse'
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-6 w-6"
              title={tChat('copy')}
            >
              <Copy className="h-3 w-3" />
            </Button>

            {onRefreshMessage && message.content && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                className="h-6 w-6"
                title={tChat('regenerate')}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// 优化渲染性能：仅当消息内容、流式状态或回调函数变化时重新渲染
export const MessageBubble = React.memo(MessageBubbleComponent, (prevProps, nextProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.role === nextProps.message.role &&
    prevProps.showStreaming === nextProps.showStreaming &&
    prevProps.onRefreshMessage === nextProps.onRefreshMessage
  )
})
