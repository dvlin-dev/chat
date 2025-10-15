import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StreamingIndicator } from './streaming-indicator'
import { ThinkingDots } from './thinking-dots'
import { CollapsibleSearchResults } from './collapsible-search-results'
import { MarkdownMessage } from './markdown-message'
import type { Message } from '@/lib/types/conversation'
import type { SSESearchSources, SSESearchStatus } from '@/lib/types/api'
import { useChatTranslation } from '@/lib/i18n-setup'

interface MessageBubbleProps {
  message: Message
  onRefreshMessage?: (messageId: string) => void
  showStreaming?: boolean
  searchSources?: SSESearchSources | null
  searchStatus?: SSESearchStatus | null
}

const MessageBubbleComponent = ({
  message,
  onRefreshMessage,
  showStreaming,
  searchSources,
  searchStatus,
}: MessageBubbleProps) => {
  const tChat = useChatTranslation()
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'
  const persistedEvents = message.searchEvents || []

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
            {/* 在AI消息开头显示搜索结果栏（实时 SSE 优先）*/}
            {isAssistant && (searchSources || searchStatus) && (
              <CollapsibleSearchResults
                sources={searchSources}
                searchStatus={searchStatus}
                className="mb-3"
              />
            )}
            {/* 若无实时 SSE，则显示持久化搜索历史，位置与实时一致 */}
            {isAssistant && !searchSources && !searchStatus && persistedEvents.length > 0 && (
              <div className="mb-3">
                {persistedEvents.map((ev) => {
                  const persistedSources: SSESearchSources = {
                    type: 'search_sources',
                    sources: ev.topSources,
                  }
                  const persistedStatus: SSESearchStatus = {
                    type: 'search_status',
                    phase: 'complete',
                    query: ev.query,
                    domain:
                      (ev.domain as 'web' | 'news' | 'images' | 'videos' | 'academic') || 'web',
                    language: ev.language,
                    timeRange: ev.timeRange as 'day' | 'week' | 'month' | 'year' | undefined,
                    progress: {
                      fetchedItems: ev.resultsCount,
                      totalItems: ev.resultsCount,
                    },
                  }
                  return (
                    <CollapsibleSearchResults
                      key={ev.id}
                      sources={persistedSources}
                      searchStatus={persistedStatus}
                    />
                  )
                })}
              </div>
            )}

            {/* 渲染消息内容 */}
            {isAssistant && message.content ? (
              <MarkdownMessage content={message.content} searchSources={searchSources} />
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
    prevProps.onRefreshMessage === nextProps.onRefreshMessage &&
    prevProps.searchSources === nextProps.searchSources &&
    prevProps.searchStatus === nextProps.searchStatus
  )
})
