/**
 * Chat 模块统一错误处理系统
 * 基于新的统一错误格式标准
 */

import {
  type HttpError,
  ErrorCode,
  isAuthError,
  isSystemError,
  getHttpStatusFromErrorCode,
} from '@/lib/types/api'

/**
 * 聊天错误类
 * 符合新的错误格式标准
 */
export class ChatError extends Error implements HttpError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp?: string
  path?: string
  
  // 聊天特有的属性
  public readonly recoverable: boolean
  public readonly retryable: boolean
  public readonly retryAfter?: number
  public readonly originalError?: Error

  constructor(
    code: string,
    message: string,
    options?: {
      details?: Record<string, unknown>
      path?: string
      recoverable?: boolean
      retryable?: boolean
      retryAfter?: number
      originalError?: Error
    }
  ) {
    super(message)
    this.name = 'ChatError'
    this.code = code
    this.message = message
    this.details = options?.details
    this.timestamp = new Date().toISOString()
    this.path = options?.path
    
    // 聊天特有的属性
    this.recoverable = options?.recoverable ?? this.isRecoverableByDefault(code)
    this.retryable = options?.retryable ?? this.isRetryableByDefault(code)
    this.retryAfter = options?.retryAfter
    this.originalError = options?.originalError
  }

  /**
   * 从 HttpError 创建 ChatError
   */
  static fromHttpError(httpError: HttpError, options?: {
    recoverable?: boolean
    retryable?: boolean
    retryAfter?: number
  }): ChatError {
    return new ChatError(
      httpError.code,
      httpError.message,
      {
        details: httpError.details,
        path: httpError.path,
        recoverable: options?.recoverable,
        retryable: options?.retryable,
        retryAfter: options?.retryAfter
      }
    )
  }

  /**
   * 从通用错误创建 ChatError
   */
  static fromError(error: unknown, context?: string): ChatError {
    if (error instanceof ChatError) {
      return error
    }

    // 如果是 HttpError，直接转换
    if (this.isHttpError(error)) {
      return ChatError.fromHttpError(error)
    }

    // 如果是标准 Error
    if (error instanceof Error) {
      const code = this.inferErrorCode(error, context)
      return new ChatError(code, error.message, { originalError: error })
    }

    // 其他类型的错误
    const message = typeof error === 'string' ? error : '发生未知错误'
    return new ChatError(ErrorCode.UNKNOWN_ERROR, message)
  }

  /**
   * 类型守卫：判断是否为 HttpError
   */
  private static isHttpError(error: unknown): error is HttpError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error &&
      typeof (error as HttpError).code === 'string' &&
      typeof (error as HttpError).message === 'string'
    )
  }

  /**
   * 推断错误码
   */
  private static inferErrorCode(error: Error, context?: string): string {
    const message = error.message.toLowerCase()
    const name = error.name.toLowerCase()

    // 网络错误
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return ErrorCode.SERVICE_UNAVAILABLE
    }

    // 超时错误
    if (message.includes('timeout')) {
      return ErrorCode.SERVICE_UNAVAILABLE
    }

    // 认证错误
    if (message.includes('unauthorized') || message.includes('401')) {
      return ErrorCode.AUTH_TOKEN_EXPIRED
    }

    // 权限错误
    if (message.includes('forbidden') || message.includes('403')) {
      return ErrorCode.PERMISSION_DENIED
    }

    // 频率限制
    if (message.includes('rate limit') || message.includes('429')) {
      return ErrorCode.RATE_LIMIT_EXCEEDED
    }

    // 对话相关错误
    if (context === 'conversation' || message.includes('conversation')) {
      return ErrorCode.CONVERSATION_NOT_FOUND
    }

    if (context === 'message' || message.includes('message')) {
      return ErrorCode.MESSAGE_SEND_FAILED
    }

    // 默认为操作失败
    return ErrorCode.OPERATION_FAILED
  }

  /**
   * 判断错误是否默认可恢复
   */
  private isRecoverableByDefault(code: string): boolean {
    const recoverableCodes = [
      ErrorCode.SERVICE_UNAVAILABLE,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      ErrorCode.OPERATION_FAILED,
      ErrorCode.MESSAGE_SEND_FAILED,
      // HTTP 相关错误
      ErrorCode.HTTP_500,
      ErrorCode.HTTP_502,
      ErrorCode.HTTP_503,
    ]
    return recoverableCodes.includes(code as ErrorCode)
  }

  /**
   * 判断错误是否默认可重试
   */
  private isRetryableByDefault(code: string): boolean {
    const retryableCodes = [
      ErrorCode.SERVICE_UNAVAILABLE,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      ErrorCode.OPERATION_FAILED,
      ErrorCode.MESSAGE_SEND_FAILED,
      // HTTP 相关错误
      ErrorCode.HTTP_500,
      ErrorCode.HTTP_502,
      ErrorCode.HTTP_503,
    ]
    return retryableCodes.includes(code as ErrorCode)
  }

  /**
   * 获取用户友好的错误消息
   */
  getUserMessage(): string {
    // 如果后端返回了用户友好的消息，直接使用
    if (this.message && !this.isSystemMessage()) {
      return this.message
    }

    // 否则根据错误码生成用户友好的消息
    return this.getDefaultUserMessage()
  }

  /**
   * 判断是否为系统消息
   */
  private isSystemMessage(): boolean {
    const systemMessages = [
      'internal server error',
      'bad gateway',
      'service unavailable',
      'gateway timeout',
    ]
    const lowerMessage = this.message.toLowerCase()
    return systemMessages.some(msg => lowerMessage.includes(msg))
  }

  /**
   * 获取默认的用户友好消息
   */
  private getDefaultUserMessage(): string {
    // 认证相关错误
    if (isAuthError(this.code)) {
      switch (this.code) {
        case ErrorCode.AUTH_TOKEN_EXPIRED:
        case ErrorCode.AUTH_TOKEN_INVALID:
          return '登录已过期，请重新登录'
        default:
          return '身份验证失败，请重新登录'
      }
    }

    // 系统错误
    if (isSystemError(this.code)) {
      return '系统繁忙，请稍后重试'
    }

    // 业务错误
    switch (this.code) {
      case ErrorCode.PERMISSION_DENIED:
        return '权限不足，无法执行此操作'
      
      case ErrorCode.RATE_LIMIT_EXCEEDED:
        return '操作过于频繁，请稍后重试'
      
      case ErrorCode.SERVICE_UNAVAILABLE:
        return '服务暂时不可用，请稍后重试'
      
      case ErrorCode.VALIDATION_FAILED:
        return '输入内容有误，请检查后重试'
      
      case ErrorCode.CONVERSATION_NOT_FOUND:
        return '对话不存在或已被删除'
      
      case ErrorCode.CONVERSATION_CREATE_FAILED:
        return '创建对话失败，请重试'
      
      case ErrorCode.MESSAGE_SEND_FAILED:
        return '消息发送失败，请重试'
      
      case ErrorCode.OPERATION_FAILED:
        return '操作失败，请重试'
      
      default:
        return '发生错误，请重试'
    }
  }

  /**
   * 获取默认重试延迟
   */
  getDefaultRetryDelay(): number {
    const delays: Record<string, number> = {
      [ErrorCode.SERVICE_UNAVAILABLE]: 2000,
      [ErrorCode.RATE_LIMIT_EXCEEDED]: 5000,
      [ErrorCode.OPERATION_FAILED]: 1000,
      [ErrorCode.MESSAGE_SEND_FAILED]: 1000,
      [ErrorCode.HTTP_500]: 2000,
      [ErrorCode.HTTP_502]: 3000,
      [ErrorCode.HTTP_503]: 5000,
    }
    return delays[this.code] || 1000
  }
}

/**
 * 错误恢复策略接口
 */
export interface RecoveryStrategy {
  canRecover(error: ChatError): boolean
  recover(error: ChatError): Promise<void>
}

/**
 * 默认恢复策略
 */
export class DefaultRecoveryStrategy implements RecoveryStrategy {
  canRecover(error: ChatError): boolean {
    return error.recoverable
  }

  async recover(error: ChatError): Promise<void> {
    // 对于认证错误，不进行恢复
    if (isAuthError(error.code)) {
      throw error
    }

    // 基础恢复策略：等待一段时间
    const delay = error.retryAfter || error.getDefaultRetryDelay()
    await new Promise((resolve) => setTimeout(resolve, delay))
  }
}

/**
 * 错误管理器
 */
export class ChatErrorManager {
  private recoveryStrategy: RecoveryStrategy
  private maxRetries: number
  private retryHistory: Map<string, number> = new Map()

  constructor(
    recoveryStrategy: RecoveryStrategy = new DefaultRecoveryStrategy(),
    maxRetries: number = 3
  ) {
    this.recoveryStrategy = recoveryStrategy
    this.maxRetries = maxRetries
  }

  /**
   * 处理错误，返回是否应该重试
   */
  async handleError(error: ChatError, operationId?: string): Promise<boolean> {
    // 开发环境记录详细错误信息
    if (process.env.NODE_ENV === 'development') {
      console.error(`ChatError [${error.code}]:`, {
        message: error.message,
        details: error.details,
        timestamp: error.timestamp,
        path: error.path,
        originalError: error.originalError
      })
    }

    // 检查是否可以重试
    if (!error.retryable || !operationId) {
      return false
    }

    const retryCount = this.retryHistory.get(operationId) || 0
    if (retryCount >= this.maxRetries) {
      // 清除重试历史
      this.retryHistory.delete(operationId)
      return false
    }

    // 尝试恢复
    if (this.recoveryStrategy.canRecover(error)) {
      try {
        await this.recoveryStrategy.recover(error)
        // 更新重试计数
        this.retryHistory.set(operationId, retryCount + 1)
        return true
      } catch (recoveryError) {
        console.error('错误恢复失败:', recoveryError)
        return false
      }
    }

    return false
  }

  /**
   * 清除操作的重试历史
   */
  clearRetryHistory(operationId: string): void {
    this.retryHistory.delete(operationId)
  }

  /**
   * 清除所有重试历史
   */
  clearAllRetryHistory(): void {
    this.retryHistory.clear()
  }

  /**
   * 获取重试次数
   */
  getRetryCount(operationId: string): number {
    return this.retryHistory.get(operationId) || 0
  }
}
