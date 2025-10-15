/**
 * 搜索结果源组件
 * 展示搜索到的参考资料
 */

import { memo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { ExternalLinkIcon as LinkIcon, GlobeIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { SSESearchSources, SSESearchSource } from '@/lib/types/api'

interface SearchSourcesProps {
  sources: SSESearchSources | null
  className?: string
}

export const SearchSources = memo(function SearchSources({
  sources,
  className,
}: SearchSourcesProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (!sources || !sources.sources || sources.sources.length === 0) {
    return null
  }

  const displaySources = isExpanded ? sources.sources : sources.sources.slice(0, 3)

  return (
    <Card className={cn('border-blue-200 dark:border-blue-900', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GlobeIcon className="h-4 w-4 text-blue-500" />
            <h3 className="font-medium text-sm">参考资料 ({sources.sources.length} 条)</h3>
          </div>
          {sources.sources.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 px-2"
            >
              {isExpanded ? (
                <>
                  收起 <ChevronUp className="ml-1 h-3 w-3" />
                </>
              ) : (
                <>
                  展开 <ChevronDown className="ml-1 h-3 w-3" />
                </>
              )}
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {displaySources.map((source, index) => (
            <SourceCard key={index} source={source} index={index + 1} />
          ))}
        </div>

        {!isExpanded && sources.sources.length > 3 && (
          <div className="mt-2 text-xs text-muted-foreground text-center">
            还有 {sources.sources.length - 3} 条结果
          </div>
        )}
      </CardContent>
    </Card>
  )
})

interface SourceCardProps {
  source: SSESearchSource
  index: number
}

const SourceCard = memo(function SourceCard({ source, index }: SourceCardProps) {
  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`
    } catch {
      return null
    }
  }

  const faviconUrl = source.favicon || getFaviconUrl(source.url)

  return (
    <div className="group flex gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-700 dark:text-blue-300">
        {index}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          {faviconUrl && (
            <img src={faviconUrl} alt="" className="w-4 h-4 mt-0.5 flex-shrink-0" loading="lazy" />
          )}
          <div className="flex-1">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {source.title}
              <LinkIcon className="h-3 w-3 opacity-50" />
            </a>
            {source.snippet && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{source.snippet}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

// 导出一个精简版本，用于消息内嵌入显示
export const InlineSearchSources = memo(function InlineSearchSources({
  sources,
  className,
}: SearchSourcesProps) {
  if (!sources || !sources.sources || sources.sources.length === 0) {
    return null
  }

  const displaySources = sources.sources.slice(0, 3)

  return (
    <div className={cn('mt-3 pt-3 border-t border-border/50', className)}>
      <div className="flex items-center gap-1 mb-2">
        <GlobeIcon className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">参考资料</span>
      </div>
      <div className="space-y-1">
        {displaySources.map((source, index) => (
          <a
            key={index}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span className="text-muted-foreground">[{index + 1}]</span>
            <span className="truncate">{source.title}</span>
            <LinkIcon className="h-2.5 w-2.5 flex-shrink-0 opacity-50" />
          </a>
        ))}
      </div>
    </div>
  )
})
