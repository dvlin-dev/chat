/**
 * 可折叠搜索结果组件
 * 实时显示搜索状态和结果
 */

import { memo, useState, useEffect } from 'react'
import { ChevronDown, Loader2 } from 'lucide-react'
import { GlobeIcon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { SSESearchSources, SSESearchSource, SSESearchStatus } from '@/lib/types/api'

interface CollapsibleSearchResultsProps {
  sources?: SSESearchSources | null
  searchStatus?: SSESearchStatus | null
  className?: string
}

export const CollapsibleSearchResults = memo(function CollapsibleSearchResults({
  sources,
  searchStatus,
  className,
}: CollapsibleSearchResultsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // 当有搜索源结果时自动展开
  useEffect(() => {
    if (sources?.sources && sources.sources.length > 0) {
      // 可以选择是否自动展开，这里暂时不自动展开
      // setIsExpanded(true)
    }
  }, [sources])

  // 如果没有搜索状态且没有搜索结果，不显示
  if (!searchStatus && (!sources || !sources.sources || sources.sources.length === 0)) {
    return null
  }

  // 获取显示的查询文本
  const query = searchStatus?.query || ''

  // 获取结果数量
  const resultCount = sources?.sources?.length || searchStatus?.progress?.fetchedItems || 0

  // 判断是否正在搜索
  const isSearching = searchStatus?.phase === 'started' || searchStatus?.phase === 'detected'

  // 判断是否已完成
  const isComplete =
    searchStatus?.phase === 'complete' || (sources && sources.sources && sources.sources.length > 0)

  // 获取域名（去除协议）
  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  return (
    <div className={cn('mb-4 relative w-full min-w-0', className)} style={{ maxWidth: '100%' }}>
      {/* 搜索结果header bar */}
      <button
        className={cn(
          'w-full h-10 px-3 flex items-center justify-between rounded-lg box-border',
          'border border-border/50 bg-background',
          'hover:bg-muted/50 hover:border-border transition-all duration-200',
          'focus:outline-none',
          isExpanded && 'rounded-b-none border-b-0'
        )}
        onClick={() => setIsExpanded(!isExpanded)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 左侧内容 */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* 动态图标 */}
          {isSearching ? (
            <Loader2 className="h-4 w-4 text-blue-500 animate-spin flex-shrink-0" />
          ) : isHovered || isExpanded ? (
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0',
                isExpanded && 'rotate-180'
              )}
            />
          ) : (
            <GlobeIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
          )}

          {/* 搜索文本 */}
          <span className="text-sm font-medium text-foreground truncate">
            {isSearching ? '正在搜索' : '已搜索'}&ldquo;{query}&rdquo;
          </span>
        </div>

        {/* 右侧内容 - 只显示结果数量，不显示额外icon */}
        {resultCount > 0 && (
          <span className="text-sm text-muted-foreground flex-shrink-0 ml-2">
            {resultCount} 个结果
          </span>
        )}
      </button>

      {/* 展开的搜索结果列表 */}
      {isExpanded && sources?.sources && sources.sources.length > 0 && (
        <div className="border border-border/50 border-t-0 rounded-b-lg bg-card box-border w-full max-w-full overflow-hidden">
          <ScrollArea className="h-[188px] w-full max-w-full" style={{ width: '100%' }}>
            <div className="py-1 min-w-0" style={{ minWidth: 0 }}>
              {sources.sources.map((source, index) => (
                <a
                  key={`${source.url}-${index}`}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-sm w-full box-border',
                    'hover:bg-muted/50 transition-colors duration-150',
                    'min-w-0'
                  )}
                  style={{ display: 'flex', minWidth: 0 }}
                >
                  {/* 网站图标 */}
                  {source.favicon ? (
                    <img
                      src={source.favicon}
                      alt=""
                      className="w-4 h-4 flex-shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${getDomain(source.url)}&sz=16`}
                      alt=""
                      className="w-4 h-4 flex-shrink-0"
                      loading="lazy"
                    />
                  )}

                  {/* 标题 - 使用min-w-0确保truncate工作 */}
                  <span className="flex-1 min-w-0 truncate text-blue-600 dark:text-blue-400 hover:underline">
                    {source.title}
                  </span>

                  {/* 域名 */}
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {getDomain(source.url)}
                  </span>
                </a>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
})
