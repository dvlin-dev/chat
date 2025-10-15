/**
 * ChatErrorDisplay 组件
 * 专门处理错误消息的显示
 */

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { ChatError } from '@/lib/errors/chat-error'
import { useCommonTranslation } from '@/lib/i18n-setup'

interface ChatErrorDisplayProps {
  error: ChatError | Error | null
  onDismiss: () => void
  onRetry?: () => void
  onLogin?: () => void
  retryCountdownSec?: number // 可选的重试倒计时（用于 429 提示）
  autoHideDelay?: number // 自动隐藏延迟（毫秒），0 表示不自动隐藏
}

export function ChatErrorDisplay({
  error,
  onDismiss,
  onRetry,
  onLogin,
  retryCountdownSec,
  autoHideDelay = 0,
}: ChatErrorDisplayProps) {
  const tCommon = useCommonTranslation()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (error) {
      setIsVisible(true)

      // 自动隐藏
      if (autoHideDelay > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false)
          setTimeout(onDismiss, 300) // 等待动画完成后清除错误
        }, autoHideDelay)

        return () => clearTimeout(timer)
      }
    } else {
      setIsVisible(false)
    }
  }, [error, autoHideDelay, onDismiss])

  if (!error || !isVisible) return null

  // 获取错误消息
  const isChatError = error instanceof ChatError
  const errorMessage = isChatError ? error.getUserMessage() : error.message

  return (
    <div
      className={`
        absolute top-4 right-4 
        bg-destructive text-destructive-foreground 
        p-3 rounded-lg max-w-sm
        shadow-lg
        transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm flex-1">{errorMessage}</span>
        {/* 可选：重试按钮（可重试场景）*/}
        {isChatError && onRetry && (error as ChatError).retryable && (
          <button
            onClick={onRetry}
            disabled={typeof retryCountdownSec === 'number' && retryCountdownSec > 0}
            className="px-2 py-1 text-xs bg-white/20 hover:bg-white/30 disabled:opacity-60 disabled:cursor-not-allowed rounded transition-colors"
          >
            {typeof retryCountdownSec === 'number' && retryCountdownSec > 0
              ? `重试(${retryCountdownSec}s)`
              : '重试'}
          </button>
        )}
        {/* 可选：登录按钮（认证失败）*/}
        {onLogin && (
          <button
            onClick={onLogin}
            className="px-2 py-1 text-xs bg-white/20 hover:bg-white/30 rounded transition-colors"
          >
            去登录
          </button>
        )}
        <button
          onClick={onDismiss}
          className="
            flex-shrink-0
            text-destructive-foreground/80 
            hover:text-destructive-foreground 
            transition-colors
            p-0.5
            rounded
            hover:bg-destructive-foreground/10
          "
          aria-label={tCommon('close')}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
