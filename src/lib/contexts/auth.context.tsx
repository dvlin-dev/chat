import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { useAppRouter } from '@/router/use-app-router'
import type { User } from '@/lib/types/api'
import {
  authService,
  type SignInCredentials,
  type SignUpData,
  type AuthError,
} from '@/lib/services/auth.service'

export interface AuthContextValue {
  // 状态
  user: User | null
  isLoaded: boolean
  isSignedIn: boolean

  // UI 状态
  error: AuthError | null
  isLoading: boolean

  // 核心方法
  signIn: (credentials: SignInCredentials) => Promise<void>
  signUp: (data: SignUpData) => Promise<void>
  signOut: () => Promise<void>

  // 工具方法
  sendVerificationCode: (
    email: string,
    purpose: 'signup' | 'login' | 'reset' | 'verify'
  ) => Promise<void>
  clearError: () => void
  reload: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export interface AuthProviderProps {
  children: React.ReactNode
  /**
   * 初始加载时显示的组件
   */
  fallback?: React.ReactNode
  /**
   * 是否在初始化时自动检查认证状态
   */
  autoCheck?: boolean
}

/**
 * 认证提供者组件
 * 参考 Clerk 的设计，提供统一的认证状态管理
 */
export function AuthProvider({ children, fallback = null, autoCheck = true }: AuthProviderProps) {
  const router = useAppRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)

  /**
   * 派生状态：用户是否已登录
   */
  const isSignedIn = useMemo(() => !!user, [user])

  /**
   * 初始化认证状态
   */
  const initialize = useCallback(async () => {
    if (!autoCheck) {
      setIsLoaded(true)
      return
    }

    try {
      setIsLoading(true)

      // 检查本地 token 并获取用户信息
      const isAuthenticated = await authService.isAuthenticated()

      if (isAuthenticated) {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      // 初始化失败不阻塞应用加载
    } finally {
      setIsLoading(false)
      setIsLoaded(true)
    }
  }, [autoCheck])

  /**
   * 登录
   */
  const signIn = useCallback(
    async (credentials: SignInCredentials) => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await authService.signIn(credentials)

        setUser(response.user)

        // 导航到首页或之前的页面
        const redirectRaw = router.query.redirect
        const redirectParam = Array.isArray(redirectRaw) ? redirectRaw[0] : redirectRaw
        const redirectTo = redirectParam ? decodeURIComponent(redirectParam) : '/'
        await router.push(redirectTo)
      } catch (error) {
        setError(error as AuthError)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [router]
  )

  /**
   * 注册
   */
  const signUp = useCallback(
    async (data: SignUpData) => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await authService.signUp(data)

        setUser(response.user)

        // 注册成功后导航到首页
        await router.push('/')
      } catch (error) {
        setError(error as AuthError)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [router]
  )

  /**
   * 登出
   */
  const signOut = useCallback(async () => {
    try {
      setIsLoading(true)

      await authService.signOut()

      setUser(null)
      setError(null)

      // 清空其他相关状态
      if (typeof window !== 'undefined') {
        // 触发自定义事件，让其他组件知道用户已登出
        window.dispatchEvent(new CustomEvent('auth:signout'))
      }

      // 导航到登录页，保留当前路径作为重定向参数
      const currentPath = router.asPath
      if (currentPath !== '/sign-in' && currentPath !== '/sign-up') {
        await router.push(`/sign-in?redirect=${encodeURIComponent(currentPath)}`)
      } else {
        await router.push('/sign-in')
      }
    } catch (error) {
      console.error('Sign out error:', error)
      // 即使失败也要清理本地状态
      setUser(null)
      await router.push('/sign-in')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  /**
   * 发送验证码
   */
  const sendVerificationCode = useCallback(
    async (email: string, purpose: 'signup' | 'login' | 'reset' | 'verify') => {
      try {
        setIsLoading(true)
        setError(null)

        await authService.sendVerificationCode(email, purpose)
      } catch (error) {
        setError(error as AuthError)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  /**
   * 清除错误
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * 重新加载用户信息
   */
  const reload = useCallback(async () => {
    try {
      setIsLoading(true)
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Failed to reload user:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * 更新用户信息（仅本地更新）
   */
  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null
      return { ...prevUser, ...updates }
    })
  }, [])

  /**
   * 监听 storage 事件，实现多标签页同步
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app_auth_user') {
        if (!e.newValue) {
          setUser(null)
        } else if (e.newValue !== e.oldValue) {
          reload()
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [reload])

  /**
   * 监听认证相关的自定义事件
   */
  useEffect(() => {
    const handleAuthEvent = (e: Event) => {
      if (e.type === 'auth:signout') {
        setUser(null)
      }
    }

    window.addEventListener('auth:signout', handleAuthEvent)
    return () => window.removeEventListener('auth:signout', handleAuthEvent)
  }, [])

  /**
   * 初始化
   */
  useEffect(() => {
    initialize()
  }, [initialize])

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoaded,
      isSignedIn,
      error,
      isLoading,
      signIn,
      signUp,
      signOut,
      sendVerificationCode,
      clearError,
      reload,
      updateUser,
    }),
    [
      user,
      isLoaded,
      isSignedIn,
      error,
      isLoading,
      signIn,
      signUp,
      signOut,
      sendVerificationCode,
      clearError,
      reload,
      updateUser,
    ]
  )

  // 初始加载时显示 fallback
  if (!isLoaded && fallback) {
    return <>{fallback}</>
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

/**
 * 使用认证上下文的 Hook
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

/**
 * 使用登录功能的 Hook
 * 参考 Clerk 的 useSignIn
 */
export function useSignIn() {
  const { signIn, isLoading, error, clearError } = useAuth()

  return {
    signIn,
    isLoaded: true,
    isLoading,
    error,
    clearError,
  }
}

/**
 * 使用注册功能的 Hook
 * 参考 Clerk 的 useSignUp
 */
export function useSignUp() {
  const { signUp, sendVerificationCode, isLoading, error, clearError } = useAuth()

  return {
    signUp,
    sendVerificationCode,
    isLoaded: true,
    isLoading,
    error,
    clearError,
  }
}

/**
 * 使用用户信息的 Hook
 * 参考 Clerk 的 useUser
 */
export function useUser() {
  const { user, isLoaded, isSignedIn, reload } = useAuth()

  return {
    user,
    isLoaded,
    isSignedIn,
    reload,
  }
}
