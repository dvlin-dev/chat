/**
 * 简化版搜索开关组件
 * 仅用于开关搜索功能，无详细配置
 */

import { memo } from 'react'
import { GlobeIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SimpleSearchToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  disabled?: boolean
  className?: string
}

export const SimpleSearchToggle = memo(function SimpleSearchToggle({
  enabled,
  onToggle,
  disabled = false,
  className,
}: SimpleSearchToggleProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      className={cn(
        'h-10 w-10 rounded-full p-0',
        'border hover:border-border transition-all duration-100',
        enabled
          ? 'border-blue-500 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-950'
          : 'border-border/50 hover:bg-accent/10',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      size="icon"
      aria-label={enabled ? '关闭联网搜索' : '开启联网搜索'}
      disabled={disabled}
      onClick={() => onToggle(!enabled)}
    >
      <GlobeIcon
        className={cn(
          'h-4 w-4',
          enabled ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'
        )}
      />
    </Button>
  )
})
