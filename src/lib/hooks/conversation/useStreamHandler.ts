/**
 * 流式响应处理 Hook
 * 只负责处理 SSE 流式响应
 */

import { useCallback, useRef, useEffect } from 'react'
import { useConversationDataStore } from '@/lib/stores/conversation-data'
import { useAsyncState } from '@/lib/hooks/useAsyncState'
import { HookResourceManager } from '@/lib/utils/resource-manager'
import type { SSEEventHandlers, StreamCleanup } from '@/lib/api/conversation-web'
import { ChatError } from '@/lib/errors/chat-error'
import { recordStreamDuration, recordStreamError, recordStreamStart } from '@/lib/metrics/chat-metrics'
import { conversationService } from '@/lib/services/conversation-service'

interface UseStreamHandlerReturn {
  isStreaming: boolean
  streamError: ChatError | null
  createStreamHandlers: (aiMessageId: string) => SSEEventHandlers
  activeStreamCleanup: StreamCleanup | null
  cleanupActiveStream: () => void
  resourceManager: HookResourceManager
}

// 将 Map 存储在模块级别，而不是组件内部
// 这样可以确保它在组件重新渲染时不会被重置
const globalAccumulatedContent = new Map<string, string>()

export function useStreamHandler(): UseStreamHandlerReturn {
  const { updateMessage } = useConversationDataStore()
  const streamAsync = useAsyncState<void>()
  const startedAtRef = useRef<number | null>(null)
  
  const activeStreamCleanupRef = useRef<StreamCleanup | null>(null)
  const resourceManagerRef = useRef<HookResourceManager | null>(null)
  
  // 使用全局的 Map，而不是在组件内创建
  const accumulatedContentRef = useRef<Map<string, string>>(globalAccumulatedContent)

  // 初始化资源管理器
  if (!resourceManagerRef.current) {
    resourceManagerRef.current = new HookResourceManager()
  }

  /**
   * 清理活跃的流连接
   */
  const cleanupActiveStream = useCallback(() => {
    if (activeStreamCleanupRef.current) {
      try {
        activeStreamCleanupRef.current.cleanup()
      } catch (error) {
        console.warn('清理流连接时出错:', error)
      }
      activeStreamCleanupRef.current = null
    }
    streamAsync.setLoading(false)
  }, [streamAsync])

  /**
   * 创建流式响应处理器
   */
  const createStreamHandlers = useCallback(
    (aiMessageId: string): SSEEventHandlers => {
      // 每次开始新的流时，都重置累积内容
      // 这是必要的，因为一个新的流应该从空内容开始
      accumulatedContentRef.current.set(aiMessageId, '')
      startedAtRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now()
      try { recordStreamStart() } catch {}
      streamAsync.setLoading(true)
      streamAsync.setError(null)

      // 为了确保闭包能访问到正确的 Map，我们在这里保存一个引用
      const contentMap = accumulatedContentRef.current

      const handlers: SSEEventHandlers = {
        onContent: async (content: string) => {
          // 累积内容 - 每次收到新内容片段时累加
          const currentContent = contentMap.get(aiMessageId) || ''
          const newContent = currentContent + content
          contentMap.set(aiMessageId, newContent)

          // 更新消息内容为累积的完整内容
          updateMessage(aiMessageId, {
            content: newContent,
          })
        },

        onDone: async () => {
          // 流式响应完成，清理累积内容
          const finalContent = contentMap.get(aiMessageId) || ''
          const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now()
          if (startedAtRef.current != null) recordStreamDuration(t1 - startedAtRef.current, true)

          // 确保最终内容被保存
          if (finalContent) {
            updateMessage(aiMessageId, {
              content: finalContent,
            })
            await conversationService.updateMessage(aiMessageId, { content: finalContent })
          }

          // 清理状态
          streamAsync.setLoading(false)

          // 清理资源
          contentMap.delete(aiMessageId)
          cleanupActiveStream()
        },

        onError: (error: Error) => {
          console.error('流式响应错误:', error)
          const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now()
          if (startedAtRef.current != null) recordStreamDuration(t1 - startedAtRef.current, false)

          // 处理错误
          const chatError = error instanceof ChatError ? error : ChatError.fromError(error)
          recordStreamError(chatError.code)
          streamAsync.setError(chatError)
          streamAsync.setLoading(false)

          // 更新消息为错误状态
          const partialContent = contentMap.get(aiMessageId) || ''
          updateMessage(aiMessageId, {
            content: partialContent || '抱歉，生成回复时出现错误。请重试。',
          })

          // 清理资源
          contentMap.delete(aiMessageId)
          cleanupActiveStream()
        },

        // 不再处理会话ID事件（本地会话即时创建）
      }

      // 注意：onSetup 已经在 StreamConnection 内部处理，不需要在这里定义
      // 当调用 startConversationStream 或 completionsStream 时，
      // 它们会返回 cleanup 函数，我们在外部保存这个 cleanup 函数即可

      return handlers
    },
    [updateMessage, cleanupActiveStream, streamAsync]
  )

  /**
   * 保存流清理函数
   */
  const setActiveStreamCleanup = useCallback((cleanup: StreamCleanup) => {
    activeStreamCleanupRef.current = cleanup
  }, [])

  /**
   * 组件卸载时清理资源
   */
  useEffect(() => {
    const resourceManager = resourceManagerRef.current
    return () => {
      cleanupActiveStream()
      // 使用 disposeAll 方法代替 cleanup
      resourceManager?.disposeAll()
      // 不要清空全局的 Map，只在需要时清理特定的 key
    }
  }, [cleanupActiveStream])

  return {
    isStreaming: streamAsync.loading,
    streamError: streamAsync.error,
    createStreamHandlers,
    activeStreamCleanup: activeStreamCleanupRef.current,
    cleanupActiveStream,
    resourceManager: resourceManagerRef.current!,
  }
}
