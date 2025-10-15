import { useCallback } from 'react'
import { toast } from 'sonner'

/**
 * 简化版 API 错误处理 Hook
 * 后续接入 Supabase 后可扩展为更完整的错误映射。
 */
export function useApiError() {
  const handleError = useCallback((error: unknown, context?: string) => {
    const message =
      (error instanceof Error && error.message) ||
      (typeof error === 'string' ? error : '发生未知错误，请稍后再试')

    if (process.env.NODE_ENV === 'development') {
      console.error('[API ERROR]', context, error)
    }

    toast.error(message)
  }, [])

  return { handleError }
}
