import React, { Component, ErrorInfo, ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { errorReporter } from '@/lib/utils/error-reporter'
import { useCommonTranslation, useErrorTranslation } from '@/lib/i18n-setup'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

/**
 * 全局错误边界组件
 * 捕获 React 组件树中的 JavaScript 错误，并显示友好的错误界面
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 更新 state 包含错误详细信息
    this.setState({
      error,
      errorInfo,
    })

    // 使用错误上报器记录错误
    errorReporter.reportReactError(error, errorInfo)

    // 调用外部错误处理器
    this.props.onError?.(error, errorInfo)
  }

  /**
   * 重置错误状态，尝试恢复
   */
  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  /**
   * 刷新页面
   */
  private handleRefresh = () => {
    window.location.reload()
  }

  /**
   * 返回首页
   */
  private handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // 使用自定义的 fallback UI，如果没有提供则使用默认的
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, errorInfo } = this.state
      const isDevelopment = process.env.NODE_ENV === 'development'
      // Hooks 不能在 class 中使用，这里通过函数组件包装一层渲染文案
      const FallbackContent = () => {
        const tCommon = useCommonTranslation()
        const tError = useErrorTranslation()
        return (
          <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <Card className="max-w-2xl w-full">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{tError('generic')}</CardTitle>
                <CardDescription className="text-base">
                  {tError('appErrorDescription')}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {isDevelopment && error && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground">
                      {tError('devErrorDetails')}
                    </h4>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-mono text-destructive mb-2">
                        {error.name}: {error.message}
                      </p>
                      {error.stack && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            {tError('viewStackTrace')}
                          </summary>
                          <pre className="mt-2 p-2 bg-background rounded text-xs overflow-x-auto whitespace-pre-wrap">
                            {error.stack}
                          </pre>
                        </details>
                      )}
                    </div>

                    {errorInfo?.componentStack && (
                      <div className="p-4 bg-muted rounded-lg">
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground mb-2">
                            {tError('viewComponentStack')}
                          </summary>
                          <pre className="p-2 bg-background rounded text-xs overflow-x-auto whitespace-pre-wrap">
                            {errorInfo.componentStack}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  <p>{tError('resolutionIntro')}</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>{tError('resolutionActionRetry')}</li>
                    <li>{tError('resolutionActionRefresh')}</li>
                    <li>{tError('resolutionActionGoHome')}</li>
                    <li>{tError('resolutionActionContact')}</li>
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col sm:flex-row gap-2">
                <Button onClick={this.handleReset} className="flex items-center gap-2 flex-1">
                  <RefreshCw className="h-4 w-4" />
                  {tCommon('retry')}
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleRefresh}
                  className="flex items-center gap-2 flex-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  {tCommon('refreshPage')}
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2 flex-1"
                >
                  {tCommon('goHome')}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )
      }

      return <FallbackContent />
    }

    return this.props.children
  }
}

/**
 * 简化的错误边界 Hook（用于函数组件）
 * 注意：这个 Hook 只能捕获异步错误，不能捕获渲染时的同步错误
 */
export function useErrorHandler() {
  const handleError = React.useCallback((error: Error, context?: string) => {
    // 使用错误上报器处理异步错误
    errorReporter.reportAsyncError(error, context)
  }, [])

  return handleError
}

export default ErrorBoundary
