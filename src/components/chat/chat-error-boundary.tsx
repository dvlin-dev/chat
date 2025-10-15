import React, { Component, ErrorInfo, ReactNode } from 'react'
import { RefreshCw, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { errorReporter } from '@/lib/utils/error-reporter'
import { useChatTranslation, useCommonTranslation } from '@/lib/i18n-setup'

interface Props {
  children: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * 聊天区域专用错误边界
 * 提供更具体的聊天功能错误处理和恢复选项
 */
export class ChatErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 更新 state
    this.setState({ error })

    // 使用错误上报器记录聊天相关错误
    errorReporter.reportReactError(error, errorInfo)

    // 调用外部错误处理器
    this.props.onError?.(error, errorInfo)
  }

  /**
   * 重置聊天错误状态
   */
  private handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  /**
   * 刷新聊天页面
   */
  private handleRefreshChat = () => {
    // 清理聊天相关的本地状态
    if (typeof window !== 'undefined') {
      // 可以在这里清理聊天相关的 localStorage 或 sessionStorage
      sessionStorage.removeItem('currentChatMessages')
    }
    window.location.reload()
  }

  /**
   * 回到聊天列表
   */
  private handleBackToList = () => {
    window.location.href = '/chat'
  }

  render() {
    if (this.state.hasError) {
      const { error } = this.state
      const isDevelopment = process.env.NODE_ENV === 'development'

      const Fallback = () => {
        const tChat = useChatTranslation()
        const tCommon = useCommonTranslation()
        return (
          <div className="flex items-center justify-center min-h-[400px] p-4">
            <Card className="max-w-lg w-full">
              <CardHeader className="text-center">
                <CardTitle className="text-lg">{tChat('chatErrorTitle')}</CardTitle>
                <CardDescription>{tChat('chatErrorDescription')}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {isDevelopment && error && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-mono text-destructive">
                      {error.name}: {error.message}
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Button onClick={this.handleReset} className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    {tChat('reloadChat')}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={this.handleBackToList}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {tChat('backToChatList')}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={this.handleRefreshChat}
                    className="text-muted-foreground"
                  >
                    {tCommon('refreshPage')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }
      return <Fallback />
    }

    return this.props.children
  }
}

export default ChatErrorBoundary
