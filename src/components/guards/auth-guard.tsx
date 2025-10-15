import { useEffect } from 'react'
import { useAppRouter } from '@/router/use-app-router'
import { useAuth } from '@/lib/contexts/auth.context'

export interface AuthGuardProps {
  children: React.ReactNode
  /**
   * 未认证时重定向的路径
   */
  fallback?: string
  /**
   * 是否反向守卫（只允许未登录用户访问）
   */
  inverse?: boolean
  /**
   * 加载时显示的组件
   */
  loading?: React.ReactNode
}

/**
 * 认证守卫组件
 * 参考 Mobile 端的 Stack.Protected 设计
 */
export function AuthGuard({
  children,
  fallback = '/sign-in',
  inverse = false,
  loading = null,
}: AuthGuardProps) {
  const router = useAppRouter()
  const { isSignedIn, isLoaded } = useAuth()

  useEffect(() => {
    if (!isLoaded) return

    const shouldRedirect = inverse ? isSignedIn : !isSignedIn

    if (shouldRedirect) {
      const redirectTo = inverse ? '/' : fallback
      const query =
        !inverse && router.asPath !== fallback
          ? { redirect: encodeURIComponent(router.asPath) }
          : {}

      router.push({
        pathname: redirectTo,
        query,
      })
    }
  }, [isLoaded, isSignedIn, inverse, fallback, router])

  // 加载中
  if (!isLoaded) {
    return <>{loading}</>
  }

  // 检查是否应该显示内容
  const shouldShowContent = inverse ? !isSignedIn : isSignedIn

  if (!shouldShowContent) {
    // 不显示内容，等待重定向
    return <>{loading}</>
  }

  return <>{children}</>
}

/**
 * 受保护的路由组件（需要登录）
 */
export function ProtectedRoute({
  children,
  loading,
}: {
  children: React.ReactNode
  loading?: React.ReactNode
}) {
  return <AuthGuard loading={loading}>{children}</AuthGuard>
}

/**
 * 公开路由组件（只允许未登录用户）
 */
export function PublicRoute({
  children,
  loading,
}: {
  children: React.ReactNode
  loading?: React.ReactNode
}) {
  return (
    <AuthGuard inverse loading={loading}>
      {children}
    </AuthGuard>
  )
}
