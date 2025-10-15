import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react'
import { Button } from '@/components/ui/button'
// @ts-ignore - Temporary workaround for lucide-react type issues
import { ArrowUp, Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CHAT_CONFIG } from '@/lib/constants/chat'
import { useChatTranslation } from '@/lib/i18n-setup'
import { SimpleSearchToggle } from './simple-search-toggle'

interface ChatInputProps {
  onSend: (message: string) => Promise<void>
  onStop?: () => void
  isStreaming?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
  onHeightChange?: (height: number) => void
  searchEnabled?: boolean
  onSearchToggle?: (enabled: boolean) => void
  searchToggleDisabled?: boolean
}

export interface ChatInputRef {
  focus: () => void
}

export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(function ChatInput(
  {
    onSend,
    onStop,
    isStreaming = false,
    disabled = false,
    placeholder,
    className,
    onHeightChange,
    searchEnabled = false,
    onSearchToggle,
    searchToggleDisabled = false,
  },
  ref
) {
  const tChat = useChatTranslation()
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const defaultPlaceholder = placeholder || tChat('messagePlaceholder')

  // 暴露 focus 方法给父组件
  useImperativeHandle(
    ref,
    () => ({
      focus: () => {
        textareaRef.current?.focus()
      },
    }),
    []
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!message.trim() || disabled) return

      const currentMessage = message.trim()
      setMessage('')

      try {
        await onSend(currentMessage)
      } catch (error) {
        // 如果发送失败，恢复消息内容
        setMessage(currentMessage)
      }
    },
    [message, disabled, onSend]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (e.shiftKey) {
          // Shift + Enter = 换行
          return
        } else {
          // Enter = 发送
          e.preventDefault()
          handleSubmit(e)
        }
      }
    },
    [handleSubmit]
  )

  // 自动调整高度
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = `${CHAT_CONFIG.INPUT_MIN_HEIGHT}px`
      const scrollHeight = textarea.scrollHeight
      textarea.style.height = Math.min(scrollHeight, CHAT_CONFIG.INPUT_MAX_HEIGHT) + 'px'
    }
  }, [message])

  // 报告容器高度变化
  useEffect(() => {
    const container = containerRef.current
    if (container && onHeightChange) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          onHeightChange(entry.contentRect.height)
        }
      })

      resizeObserver.observe(container)

      // 初始高度
      onHeightChange(container.offsetHeight)

      return () => {
        resizeObserver.disconnect()
      }
    }
  }, [onHeightChange])

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-0 justify-center w-full relative items-center"
    >
      <form
        onSubmit={handleSubmit}
        className={cn(
          'group z-10 bg-card ring-border hover:ring-border focus-within:ring-foreground/20',
          'relative w-full overflow-hidden shadow shadow-black/5',
          'ring-1 ring-inset focus-within:ring-1 pb-12 px-2 sm:px-3 rounded-3xl',
          'transition-all duration-100 ease-in-out',
          className
        )}
      >
        <div className="relative z-10">
          {!message && (
            <span className="absolute px-2 sm:px-3 py-5 text-muted-foreground pointer-events-none select-none">
              {defaultPlaceholder}
            </span>
          )}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            aria-label={tChat('sendMessage')}
            className="w-full px-2 sm:px-3 pt-5 mb-5 bg-transparent focus:outline-none text-foreground align-bottom resize-none"
            rows={1}
          />
        </div>

        <div className="flex gap-1.5 absolute inset-x-0 bottom-0 border-2 border-transparent p-2 sm:p-2 max-w-full">
          {/* 左侧操作按钮组 - 可扩展容器 */}
          <div className="flex items-center gap-1.5">
            {/* 附件按钮 */}
            <Button
              type="button"
              variant="ghost"
              className={cn(
                'h-10 w-10 rounded-full p-0',
                'border border-border/50 hover:border-border',
                'hover:bg-accent/10 transition-all duration-100',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              size="icon"
              aria-label={tChat('attachFile')}
              disabled={disabled}
            >
              <Paperclip className="h-4 w-4 text-muted-foreground" />
            </Button>

            {/* 联网搜索开关 */}
            {onSearchToggle && (
              <SimpleSearchToggle
                enabled={searchEnabled}
                onToggle={onSearchToggle}
                disabled={disabled || searchToggleDisabled}
              />
            )}

            {/* 未来可以在这里添加更多操作按钮 */}
          </div>

          {/* 中间空白区域 */}
          <div className="flex grow gap-1.5 max-w-full">
            <div className="grow flex gap-1.5 max-w-full"></div>
          </div>

          {/* 右侧发送按钮 */}
          <div className="ml-auto flex flex-row items-end gap-1">
            {isStreaming && onStop ? (
              <Button
                type="button"
                onClick={onStop}
                className={cn(
                  'group flex items-center justify-center rounded-full focus:outline-none',
                  'h-10 px-3',
                  'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                )}
              >
                停止
              </Button>
            ) : null}
            <Button
              type="submit"
              disabled={!message.trim() || disabled}
              className={cn(
                'group flex items-center justify-center rounded-full focus:outline-none',
                'h-10 w-10 aspect-square',
                'transition-all duration-100',
                message.trim()
                  ? 'bg-foreground hover:bg-foreground/90 text-background'
                  : 'bg-muted-foreground/20 text-muted-foreground cursor-not-allowed',
                'disabled:bg-muted-foreground/20 disabled:text-muted-foreground disabled:cursor-not-allowed'
              )}
              size="icon"
            >
              <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
})
