import {
  sendOtp,
  signInWithPassword,
  verifyOtpCode,
  updateUserProfile,
  getCurrentUser as fetchCurrentUser,
  subscribeAuthState,
  type VerificationPurpose,
} from '@/lib/services/supabase-auth'
import { clearAuthSession, getSupabaseClient } from '@/lib/supabase/client'
import { ErrorCode, type User } from '@/lib/types/api'

export type SignInStrategy = 'password' | 'code'

export interface SignInCredentials {
  strategy: SignInStrategy
  email?: string
  password?: string
  code?: string
  purpose?: VerificationPurpose
}

export interface SignUpData {
  email: string
  password: string
  username?: string
  code: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export class AuthError extends Error {
  code: string
  details?: Record<string, unknown>

  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message)
    this.name = 'AuthError'
    this.code = code
    this.details = details
  }
}

function mapSupabaseError(error: unknown): AuthError {
  if (error instanceof AuthError) {
    return error
  }

  if (error && typeof error === 'object') {
    const err = error as { status?: number; code?: string; message?: string }
    const message = err.message ?? '身份验证失败，请稍后再试'
    const code = (() => {
      switch (err.code) {
        case 'invalid_credentials':
        case 'invalid_grant':
          return ErrorCode.AUTH_INVALID_CREDENTIALS
        case 'user_not_found':
        case 'invalid_email':
          return ErrorCode.AUTH_USER_NOT_FOUND
        case 'email_not_confirmed':
          return ErrorCode.AUTH_VERIFICATION_CODE_INVALID
        case 'otp_expired':
          return ErrorCode.AUTH_VERIFICATION_CODE_EXPIRED
        case 'user_already_exists':
          return ErrorCode.AUTH_USER_EXISTS
        default:
          if (err.status === 429) return ErrorCode.RATE_LIMIT_EXCEEDED
          return ErrorCode.UNKNOWN_ERROR
      }
    })()

    return new AuthError(code, message, {
      status: err.status,
      code: err.code,
    })
  }

  return new AuthError(ErrorCode.UNKNOWN_ERROR, '身份验证失败，请稍后重试')
}

function ensureEmail(email?: string): string {
  const value = email?.trim()
  if (!value) {
    throw new AuthError(ErrorCode.VALIDATION_FAILED, '邮箱不能为空')
  }
  return value
}

function ensurePassword(password?: string): string {
  const value = password?.trim()
  if (!value) {
    throw new AuthError(ErrorCode.VALIDATION_FAILED, '密码不能为空')
  }
  if (value.length < 6) {
    throw new AuthError(ErrorCode.VALIDATION_FAILED, '密码至少需要 6 个字符')
  }
  if (value.length > 72) {
    throw new AuthError(ErrorCode.VALIDATION_FAILED, '密码不能超过 72 个字符')
  }
  return value
}

function ensureCode(code?: string): string {
  const value = code?.trim()
  if (!value) {
    throw new AuthError(ErrorCode.VALIDATION_FAILED, '验证码不能为空')
  }
  return value
}

export class AuthService {
  private static instance: AuthService
  private currentUser: User | null = null

  private constructor() {
    if (typeof window !== 'undefined') {
      subscribeAuthState((_session, user) => {
        this.currentUser = user
      })
    }
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  validateEmail(email: string): boolean {
    return /\S+@\S+\.\S+/.test(email)
  }

  validatePassword(password: string): { valid: boolean; message?: string } {
    if (!password || password.trim().length === 0) {
      return { valid: false, message: '密码不能为空' }
    }
    if (password.length < 6) {
      return { valid: false, message: '密码至少需要 6 个字符' }
    }
    if (password.length > 72) {
      return { valid: false, message: '密码不能超过 72 个字符' }
    }
    return { valid: true }
  }

  async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
    const email = ensureEmail(credentials.email)

    try {
      if (credentials.strategy === 'password') {
        const password = ensurePassword(credentials.password)
        const result = await signInWithPassword(email, password)

        this.currentUser = result.user
        return {
          user: result.user,
          accessToken: result.session.access_token,
          refreshToken: result.session.refresh_token ?? '',
        }
      }

      if (credentials.strategy === 'code') {
        const code = ensureCode(credentials.code)
        const purpose = credentials.purpose ?? 'login'
        const result = await verifyOtpCode({ email, token: code, purpose })

        this.currentUser = result.user
        return {
          user: result.user,
          accessToken: result.session.access_token,
          refreshToken: result.session.refresh_token ?? '',
        }
      }

      throw new AuthError(ErrorCode.VALIDATION_FAILED, '不支持的登录方式')
    } catch (error) {
      throw mapSupabaseError(error)
    }
  }

  async signUp(data: SignUpData): Promise<AuthResponse> {
    const email = ensureEmail(data.email)
    const password = ensurePassword(data.password)
    const code = ensureCode(data.code)

    try {
      const result = await verifyOtpCode({
        email,
        token: code,
        purpose: 'signup',
      })

      await updateUserProfile({
        password,
        displayName: data.username ?? email.split('@')[0],
      })

      // 更新后的用户信息
      const { user: updatedUser } = await fetchCurrentUser()
      const mappedUser = updatedUser ?? result.user

      if (!mappedUser) {
        throw new AuthError(ErrorCode.UNKNOWN_ERROR, '获取用户信息失败，请重试')
      }

      this.currentUser = mappedUser

      const session = await getSupabaseClient().auth.getSession()
      const activeSession = session.data.session ?? result.session
      if (!activeSession) {
        throw new AuthError(ErrorCode.UNKNOWN_ERROR, '注册成功但缺少会话信息')
      }

      return {
        user: mappedUser,
        accessToken: activeSession.access_token,
        refreshToken: activeSession.refresh_token ?? '',
      }
    } catch (error) {
      throw mapSupabaseError(error)
    }
  }

  async signOut(): Promise<void> {
    try {
      await clearAuthSession()
      this.currentUser = null
    } catch (error) {
      throw mapSupabaseError(error)
    }
  }

  async sendVerificationCode(email: string, purpose: VerificationPurpose): Promise<void> {
    const normalizedEmail = ensureEmail(email)

    if (!this.validateEmail(normalizedEmail)) {
      throw new AuthError(ErrorCode.VALIDATION_FAILED, '请输入有效的邮箱地址')
    }

    try {
      await sendOtp(normalizedEmail, purpose)
    } catch (error) {
      throw mapSupabaseError(error)
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser
    }

    try {
      const { user } = await fetchCurrentUser()
      this.currentUser = user
      return user
    } catch (error) {
      throw mapSupabaseError(error)
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const { session } = await fetchCurrentUser()
      return session !== null
    } catch (error) {
      throw mapSupabaseError(error)
    }
  }

  clearTokens(): void {
    void this.signOut()
  }
}

export const authService = AuthService.getInstance()
