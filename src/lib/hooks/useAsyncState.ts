import { useState, useCallback, useRef } from 'react'
import { ChatError } from '@/lib/errors/chat-error'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: ChatError | null
}

export interface AsyncActions<T> {
  execute: (promise: Promise<T>) => Promise<T>
  setData: (data: T | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: ChatError | Error | string | null) => void
  reset: () => void
}

export type UseAsyncStateReturn<T> = AsyncState<T> & AsyncActions<T>

export function useAsyncState<T>(initialData: T | null = null): UseAsyncStateReturn<T> {
  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ChatError | null>(null)

  // 用于跟踪最后一次执行，避免竞态条件
  const executionIdRef = useRef(0)

  const execute = useCallback(async (promise: Promise<T>): Promise<T> => {
    const executionId = ++executionIdRef.current

    setLoading(true)
    setError(null)

    try {
      const result = await promise

      // 只有当这是最后一次执行时才更新状态
      if (executionId === executionIdRef.current) {
        setData(result)
      }

      return result
    } catch (err) {
      // 只有当这是最后一次执行时才更新错误状态
      if (executionId === executionIdRef.current) {
        const chatError = ChatError.fromError(err)
        setError(chatError)
      }
      throw err
    } finally {
      // 只有当这是最后一次执行时才更新加载状态
      if (executionId === executionIdRef.current) {
        setLoading(false)
      }
    }
  }, [])

  const setErrorNormalized = useCallback((error: ChatError | Error | string | null) => {
    if (error === null) {
      setError(null)
    } else if (error instanceof ChatError) {
      setError(error)
    } else {
      setError(ChatError.fromError(error))
    }
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setLoading(false)
    setError(null)
    executionIdRef.current = 0
  }, [])

  return {
    // State
    data,
    loading,
    error,

    // Actions
    execute,
    setData,
    setLoading,
    setError: setErrorNormalized,
    reset,
  }
}

/**
 * 批量异步状态管理 Hook
 * 用于同时管理多个异步操作
 *
 * @example
 * ```typescript
 * const { conversations, messages } = useMultipleAsyncState({
 *   conversations: null,
 *   messages: []
 * })
 *
 * // 并行执行多个异步操作
 * await Promise.all([
 *   conversations.execute(fetchConversations()),
 *   messages.execute(fetchMessages())
 * ])
 * ```
 */
export function useMultipleAsyncState<T extends Record<string, unknown>>(
  initialData: T
): { [K in keyof T]: UseAsyncStateReturn<T[K]> } {
  const states = {} as { [K in keyof T]: UseAsyncStateReturn<T[K]> }

  for (const key in initialData) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    states[key] = useAsyncState(initialData[key])
  }

  return states
}
