/**
 * 流式指示器组件
 * 显示 AI 正在生成回复的动画效果
 */

import { cn } from '@/lib/utils'

interface StreamingIndicatorProps {
  className?: string
}

export function StreamingIndicator({ className }: StreamingIndicatorProps) {
  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-current rounded-full animate-pulse opacity-60"></div>
        <div
          className="w-2 h-2 bg-current rounded-full animate-pulse opacity-60"
          style={{ animationDelay: '0.2s' }}
        ></div>
        <div
          className="w-2 h-2 bg-current rounded-full animate-pulse opacity-60"
          style={{ animationDelay: '0.4s' }}
        ></div>
      </div>
    </div>
  )
}
