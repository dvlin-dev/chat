import { ErrorCode, type User } from '@/lib/types/api'

export type SignInStrategy = 'password' | 'code'

export interface SignInCredentials {
  strategy: SignInStrategy
  email?: string
  password?: string
  code?: string
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

const STORAGE_KEY = 'app_auth_user'

function readStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch (error) {
    console.warn('Failed to parse stored user', error)
    return null
  }
}

function writeStoredUser(user: User | null) {
  if (typeof window === 'undefined') return
  if (user) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } else {
    window.localStorage.removeItem(STORAGE_KEY)
  }
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

class AuthService {
  private static instance: AuthService

  private constructor() {}

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
    if (!password || password.length < 6) {
      return { valid: false, message: '密码至少需要6个字符' }
    }
    if (password.length > 72) {
      return { valid: false, message: '密码不能超过72个字符' }
    }
    return { valid: true }
  }

  async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
    const email = credentials.email?.trim()
    if (!email || !this.validateEmail(email)) {
      throw new AuthError(ErrorCode.VALIDATION_FAILED, '无效的邮箱地址')
    }

    if (credentials.strategy === 'password' && !credentials.password) {
      throw new AuthError(ErrorCode.VALIDATION_FAILED, '请输入密码')
    }

    if (credentials.strategy === 'code' && !credentials.code) {
      throw new AuthError(ErrorCode.VALIDATION_FAILED, '请输入验证码')
    }

    const user: User = {
      id: `user_${email}`,
      email,
      username: email.split('@')[0],
      createdAt: new Date().toISOString(),
    }

    writeStoredUser(user)

    return {
      user,
      accessToken: 'local-token',
      refreshToken: 'local-refresh-token',
    }
  }

  async signUp(data: SignUpData): Promise<AuthResponse> {
    if (!this.validateEmail(data.email)) {
      throw new AuthError(ErrorCode.VALIDATION_FAILED, '无效的邮箱地址')
    }

    return this.signIn({ strategy: 'password', email: data.email, password: data.password })
  }

  async signOut(): Promise<void> {
    writeStoredUser(null)
  }

  async sendVerificationCode(_email: string, _purpose: 'signup' | 'login' | 'reset' | 'verify'): Promise<void> {
    // 占位实现：后续接入 Supabase 邮件 / OTP 功能
    return Promise.resolve()
  }

  async getCurrentUser(): Promise<User | null> {
    return readStoredUser()
  }

  async isAuthenticated(): Promise<boolean> {
    return readStoredUser() !== null
  }

  clearTokens(): void {
    writeStoredUser(null)
  }
}

export const authService = AuthService.getInstance()
