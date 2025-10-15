import { useEffect } from 'react'
import { useAppRouter } from '@/router/use-app-router'
import { ComponentType } from 'react'

/**
 * withAuth - 认证高阶组件（临时占位符）
 *
 * TODO: 实现完整的认证逻辑
 */
export function withAuth<T extends Record<string, any>>(Component: ComponentType<T>) {
  const AuthComponent = (props: T) => {
    const router = useAppRouter()

    // TODO: 检查用户认证状态
    // 当前为占位符实现，实际应该检查用户登录状态
    const isAuthenticated = true // 临时设为 true

    useEffect(() => {
      if (!isAuthenticated) {
        router.push('/sign-in')
      }
    }, [isAuthenticated, router])

    if (!isAuthenticated) {
      return <div>Loading...</div>
    }

    return <Component {...props} />
  }

  AuthComponent.displayName = `withAuth(${Component.displayName || Component.name})`

  return AuthComponent
}
