/**
 * 搜索状态组件
 * 显示实时搜索进度和状态
 */

import { memo } from 'react'
import { Loader2, Search } from 'lucide-react'
import {
  ExclamationTriangleIcon as AlertIcon,
  CheckCircledIcon as CheckIcon,
} from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'
import type { SSESearchStatus } from '@/lib/types/api'

interface SearchStatusProps {
  status: SSESearchStatus | null
  className?: string
}

export const SearchStatus = memo(function SearchStatus({ status, className }: SearchStatusProps) {
  if (!status) return null

  const getStatusIcon = () => {
    switch (status.phase) {
      case 'detected':
        return <Search className="h-4 w-4" />
      case 'started':
      case 'progress':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'complete':
        return <CheckIcon className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertIcon className="h-4 w-4 text-red-500" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const getStatusText = () => {
    switch (status.phase) {
      case 'detected':
        return `检测到搜索需求: "${status.query}"`
      case 'started':
        return `正在搜索: "${status.query}"`
      case 'progress':
        if (status.progress) {
          return `搜索中: ${status.progress.fetchedItems || 0}${
            status.progress.totalItems ? `/${status.progress.totalItems}` : ''
          } 条结果`
        }
        return `搜索中: "${status.query}"`
      case 'complete':
        return `搜索完成: "${status.query}"`
      case 'error':
        return status.error || `搜索失败: "${status.query}"`
      default:
        return `搜索: "${status.query}"`
    }
  }

  const getDomainBadge = () => {
    if (!status.domain) return null

    const domainLabels = {
      web: '网页',
      news: '新闻',
      images: '图片',
      videos: '视频',
      academic: '学术',
    }

    return (
      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
        {domainLabels[status.domain] || status.domain}
      </span>
    )
  }

  const shouldShow = status.phase !== 'complete' || status.error

  if (!shouldShow) return null

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm',
        status.phase === 'error' && 'border-red-500/50 bg-red-50 dark:bg-red-950/20',
        className
      )}
    >
      {getStatusIcon()}
      <span className="flex-1">{getStatusText()}</span>
      {getDomainBadge()}
      {status.timeRange && (
        <span className="text-xs text-muted-foreground">
          {status.timeRange === 'day' && '今天'}
          {status.timeRange === 'week' && '本周'}
          {status.timeRange === 'month' && '本月'}
          {status.timeRange === 'year' && '今年'}
        </span>
      )}
    </div>
  )
})
