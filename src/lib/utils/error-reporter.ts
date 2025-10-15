import { ErrorInfo } from 'react'

/**
 * 错误类型枚举
 */
export enum ErrorType {
  REACT_ERROR = 'react_error',
  API_ERROR = 'api_error',
  ASYNC_ERROR = 'async_error',
  NETWORK_ERROR = 'network_error',
  VALIDATION_ERROR = 'validation_error',
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * 错误级别
 */
export enum ErrorLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * 错误报告接口
 */
export interface ErrorReport {
  id: string
  type: ErrorType
  level: ErrorLevel
  message: string
  stack?: string
  componentStack?: string
  url: string
  userAgent: string
  timestamp: string
  userId?: string
  sessionId?: string
  additional?: Record<string, unknown>
}

/**
 * 错误上报配置
 */
interface ErrorReporterConfig {
  enabled: boolean
  apiEndpoint?: string
  apiKey?: string
  maxRetries: number
  retryDelay: number
  enableConsoleLog: boolean
  enableLocalStorage: boolean
}

/**
 * 错误上报器类
 */
export class ErrorReporter {
  private config: ErrorReporterConfig
  private queue: ErrorReport[] = []
  private isProcessing = false

  constructor(config: Partial<ErrorReporterConfig> = {}) {
    this.config = {
      enabled: process.env.NODE_ENV === 'production',
      maxRetries: 3,
      retryDelay: 1000,
      enableConsoleLog: true,
      enableLocalStorage: true,
      ...config
    }
  }

  /**
   * 生成唯一错误ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取会话ID
   */
  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server'
    
    let sessionId = sessionStorage.getItem('sessionId')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('sessionId', sessionId)
    }
    return sessionId
  }

  /**
   * 获取当前用户ID（如果已登录）
   */
  private getCurrentUserId(): string | undefined {
    if (typeof window === 'undefined') return undefined
    
    try {
      // 从 localStorage 或其他地方获取用户ID
      const authData = localStorage.getItem('accessToken')
      // 这里可以解析 JWT token 获取用户ID，简单示例就返回 undefined
      return undefined
    } catch {
      return undefined
    }
  }

  /**
   * 创建错误报告
   */
  private createErrorReport(
    error: Error,
    type: ErrorType = ErrorType.UNKNOWN_ERROR,
    level: ErrorLevel = ErrorLevel.ERROR,
    additional?: Record<string, unknown>
  ): ErrorReport {
    return {
      id: this.generateErrorId(),
      type,
      level,
      message: error.message,
      stack: error.stack,
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      additional
    }
  }

  /**
   * 上报 React 错误边界捕获的错误
   */
  public reportReactError(error: Error, errorInfo: ErrorInfo): void {
    const report = this.createErrorReport(error, ErrorType.REACT_ERROR, ErrorLevel.ERROR, {
      componentStack: errorInfo.componentStack
    })
    report.componentStack = errorInfo.componentStack || undefined
    this.report(report)
  }

  /**
   * 上报 API 错误
   */
  public reportApiError(error: Error, endpoint?: string, statusCode?: number): void {
    const report = this.createErrorReport(error, ErrorType.API_ERROR, ErrorLevel.ERROR, {
      endpoint,
      statusCode
    })
    this.report(report)
  }

  /**
   * 上报网络错误
   */
  public reportNetworkError(error: Error, url?: string): void {
    const report = this.createErrorReport(error, ErrorType.NETWORK_ERROR, ErrorLevel.WARNING, {
      failedUrl: url
    })
    this.report(report)
  }

  /**
   * 上报异步错误
   */
  public reportAsyncError(error: Error, context?: string): void {
    const report = this.createErrorReport(error, ErrorType.ASYNC_ERROR, ErrorLevel.ERROR, {
      context
    })
    this.report(report)
  }

  /**
   * 上报验证错误
   */
  public reportValidationError(error: Error, field?: string, value?: unknown): void {
    const report = this.createErrorReport(error, ErrorType.VALIDATION_ERROR, ErrorLevel.WARNING, {
      field,
      value: typeof value === 'string' ? value : JSON.stringify(value)
    })
    this.report(report)
  }

  /**
   * 通用错误上报方法
   */
  public report(report: ErrorReport): void {
    if (!this.config.enabled) return

    // 控制台日志
    if (this.config.enableConsoleLog) {
      this.logToConsole(report)
    }

    // 本地存储（用于离线场景）
    if (this.config.enableLocalStorage) {
      this.saveToLocalStorage(report)
    }

    // 添加到上报队列
    this.queue.push(report)

    // 处理队列
    this.processQueue()
  }

  /**
   * 控制台日志
   */
  private logToConsole(report: ErrorReport): void {
    const logMethod = report.level === ErrorLevel.CRITICAL ? 'error' :
                     report.level === ErrorLevel.ERROR ? 'error' :
                     report.level === ErrorLevel.WARNING ? 'warn' : 'info'

    // eslint-disable-next-line no-console
    console.group(`🚨 ${report.type.toUpperCase()} [${report.level.toUpperCase()}]`)
    // eslint-disable-next-line no-console
    console[logMethod](`ID: ${report.id}`)
    // eslint-disable-next-line no-console
    console[logMethod](`Message: ${report.message}`)
    // eslint-disable-next-line no-console
    console[logMethod](`Timestamp: ${report.timestamp}`)
    
    if (report.stack) {
      // eslint-disable-next-line no-console
      console[logMethod](`Stack: ${report.stack}`)
    }
    
    if (report.componentStack) {
      // eslint-disable-next-line no-console
      console[logMethod](`Component Stack: ${report.componentStack}`)
    }
    
    if (report.additional) {
      // eslint-disable-next-line no-console
      console[logMethod]('Additional Info:', report.additional)
    }
    
    // eslint-disable-next-line no-console
    console.groupEnd()
  }

  /**
   * 保存到本地存储
   */
  private saveToLocalStorage(report: ErrorReport): void {
    try {
      if (typeof window === 'undefined') return
      
      const key = `error_reports`
      const existing = localStorage.getItem(key)
      const reports = existing ? JSON.parse(existing) : []
      
      reports.push({
        ...report,
        // 不保存敏感信息到本地存储
        stack: undefined,
        componentStack: undefined
      })

      // 只保留最近的 50 个错误报告
      if (reports.length > 50) {
        reports.splice(0, reports.length - 50)
      }

      localStorage.setItem(key, JSON.stringify(reports))
    } catch (error) {
      console.warn('Failed to save error report to localStorage:', error)
    }
  }

  /**
   * 处理上报队列
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return
    
    this.isProcessing = true

    while (this.queue.length > 0) {
      const report = this.queue.shift()!
      await this.sendReport(report)
    }

    this.isProcessing = false
  }

  /**
   * 发送错误报告到服务器
   */
  private async sendReport(report: ErrorReport, retryCount = 0): Promise<void> {
    try {
      // 如果没有配置API端点，只做本地记录
      if (!this.config.apiEndpoint) {
        return
      }

      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify(report)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // 成功上报后从本地存储中移除
      this.removeFromLocalStorage(report.id)
      
    } catch (error) {
      console.warn(`Failed to send error report (attempt ${retryCount + 1}):`, error)

      // 重试逻辑
      if (retryCount < this.config.maxRetries) {
        setTimeout(() => {
          this.sendReport(report, retryCount + 1)
        }, this.config.retryDelay * Math.pow(2, retryCount)) // 指数退避
      }
    }
  }

  /**
   * 从本地存储中移除已上报的错误
   */
  private removeFromLocalStorage(reportId: string): void {
    try {
      if (typeof window === 'undefined') return
      
      const key = `error_reports`
      const existing = localStorage.getItem(key)
      if (!existing) return

      const reports: ErrorReport[] = JSON.parse(existing) as ErrorReport[]
      const filtered = reports.filter((r: ErrorReport) => r.id !== reportId)
      localStorage.setItem(key, JSON.stringify(filtered))
    } catch (error) {
      console.warn('Failed to remove error report from localStorage:', error)
    }
  }

  /**
   * 获取本地存储的错误报告
   */
  public getStoredReports(): ErrorReport[] {
    try {
      if (typeof window === 'undefined') return []
      
      const key = `error_reports`
      const existing = localStorage.getItem(key)
      return existing ? JSON.parse(existing) : []
    } catch {
      return []
    }
  }

  /**
   * 清除本地存储的错误报告
   */
  public clearStoredReports(): void {
    try {
      if (typeof window === 'undefined') return
      localStorage.removeItem(`error_reports`)
    } catch (error) {
      console.warn('Failed to clear stored error reports:', error)
    }
  }
}

// 全局错误上报器实例
export const errorReporter = new ErrorReporter({
  // 可以在这里配置具体的错误上报服务
  // apiEndpoint: 'https://api.your-service.com/errors',
  // apiKey: process.env.NEXT_PUBLIC_ERROR_REPORTING_KEY,
})

// 全局未捕获错误处理
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorReporter.reportAsyncError(
      new Error(event.message),
      `${event.filename}:${event.lineno}:${event.colno}`
    )
  })

  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
    errorReporter.reportAsyncError(error, 'Unhandled Promise Rejection')
  })
}

export default ErrorReporter
