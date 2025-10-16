import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAppRouter } from '@/router/use-app-router'
import { Button } from '@/components/ui/button'
import { AuthCard } from './auth-card'
import { EmailPasswordForm, type EmailPasswordFormData } from './email-password-form'
import { VerificationForm } from './verification-form'
import { ForgotPasswordForm } from './forgot-password-form'
import { SocialAuth } from './social-auth'
import { useSignIn, useSignUp } from '@/lib/contexts/auth.context'
import { authService, AuthError } from '@/lib/services/auth.service'
import { useApiError } from '@/lib/hooks/useApiError'
import { ErrorCode } from '@/lib/types/api'
import { useAuthTranslation } from '@/lib/i18n-setup'
import { Mail } from 'lucide-react'

type AuthMode = 'signin' | 'signup' | 'verification' | 'forgot-password' | 'reset-password'

export function SignInForm() {
  const router = useAppRouter()
  const {
    signIn,
    isLoading: signInLoading,
    error: signInError,
    clearError: clearSignInError,
  } = useSignIn()
  const {
    signUp,
    sendVerificationCode,
    isLoading: signUpLoading,
    error: signUpError,
    clearError: clearSignUpError,
  } = useSignUp()
  const { handleError } = useApiError()
  const tAuth = useAuthTranslation()

  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)

  const isLoading = signInLoading || signUpLoading
  const error = signInError || signUpError
  const clearError = mode === 'signup' ? clearSignUpError : clearSignInError

  /**
   * 处理邮箱密码登录/注册
   */
  const handleEmailPasswordSubmit = useCallback(
    async (data: EmailPasswordFormData) => {
      setEmail(data.email)
      setPassword(data.password)
      clearError()

      try {
        // 尝试登录
        await signIn({
          strategy: 'password',
          email: data.email,
          password: data.password,
        })
      } catch (error) {
        // 如果是认证错误且用户不存在，切换到注册流程
        if (error instanceof AuthError && error.code === ErrorCode.AUTH_USER_NOT_FOUND) {
          setIsNewUser(true)
          setMode('verification')
          try {
            // 发送验证码
            await sendVerificationCode(data.email, 'signup')
          } catch (sendCodeError) {
            // 如果验证码发送失败，使用统一错误处理
            handleError(sendCodeError, tAuth('sendVerificationCode'))
          }
        } else {
          // 其他错误使用统一错误处理
          handleError(error, tAuth('signIn'))
        }
      }
    },
    [signIn, sendVerificationCode, clearError, handleError]
  )

  /**
   * 处理验证码验证
   */
  const handleVerification = useCallback(
    async (code: string) => {
      clearError()

      try {
        if (isNewUser) {
          // 新用户注册
          await signUp({
            email,
            password,
            code,
          })
        } else {
          // 验证码登录
          await signIn({
            strategy: 'code',
            email,
            code,
            purpose: 'login',
          })
        }
      } catch (error) {
        handleError(error, isNewUser ? tAuth('signUp') : tAuth('codeSignIn'))
      }
    },
    [email, password, isNewUser, signIn, signUp, clearError, handleError]
  )

  /**
   * 处理重新发送验证码
   */
  const handleResendCode = useCallback(async () => {
    clearError()
    try {
      await sendVerificationCode(email, 'signup')
    } catch (error) {
      handleError(error, tAuth('resendCode'))
    }
  }, [email, sendVerificationCode, clearError, handleError])

  /**
   * 处理忘记密码 - 从表单获取邮箱
   */
  const handleForgotPassword = useCallback(() => {
    // 获取当前输入的邮箱
    const emailInput = (document.getElementById('email') as HTMLInputElement)?.value || ''
    setEmail(emailInput)
    clearError()
    setMode('forgot-password')
  }, [clearError])

  /**
   * 处理忘记密码邮箱提交
   */
  const handleForgotPasswordSubmit = useCallback(
    async (submitEmail: string) => {
      setEmail(submitEmail)
      clearError()

      try {
        // 发送验证码
        await sendVerificationCode(submitEmail, 'reset')

        // 切换到重置密码验证页面
        setMode('reset-password')
      } catch (error) {
        handleError(error, tAuth('sendResetCode'))
      }
    },
    [sendVerificationCode, clearError, handleError]
  )

  /**
   * 处理重置密码验证
   */
  const handleResetPasswordVerification = useCallback(
    async (code: string) => {
      clearError()

      try {
        // 使用验证码登录
        await signIn({
          strategy: 'code',
          email,
          code,
          purpose: 'reset',
        })

        // TODO: 登录成功后可以引导用户修改密码
      } catch (error) {
        handleError(error, tAuth('passwordResetVerification'))
      }
    },
    [email, signIn, clearError, handleError]
  )

  /**
   * 处理验证码登录
   */
  const handleCodeLogin = useCallback(async () => {
    const emailInput = (document.getElementById('email') as HTMLInputElement)?.value
    if (!emailInput) {
      return
    }

    if (!authService.validateEmail(emailInput)) {
      handleError(
        new AuthError(ErrorCode.VALIDATION_FAILED, tAuth('emailInvalid')),
        tAuth('emailValidation')
      )
      return
    }

    setEmail(emailInput)
    setIsNewUser(false)
    setMode('verification')
    clearError()

    try {
      await sendVerificationCode(emailInput, 'login')
    } catch (error) {
      handleError(error, tAuth('sendVerificationCode'))
    }
  }, [sendVerificationCode, clearError, handleError])

  /**
   * 处理社交登录
   */
  const handleGoogleSignIn = useCallback(async () => {
    // TODO: 实现 Google 登录
  }, [])

  const handleGithubSignIn = useCallback(async () => {
    // TODO: 实现 Github 登录
  }, [])

  /**
   * 返回登录页
   */
  const handleBack = useCallback(() => {
    setMode('signin')
    setIsNewUser(false)
    clearError()
  }, [clearError])

  // 根据模式渲染不同的内容
  if (mode === 'verification') {
    return (
      <AuthCard
        title={isNewUser ? tAuth('verifyYourEmail') : tAuth('enterVerificationCode')}
        description={
          isNewUser ? tAuth('verificationDescription') : tAuth('verificationSignInDescription')
        }
      >
        <VerificationForm
          email={email}
          onVerify={handleVerification}
          onResend={handleResendCode}
          onBack={handleBack}
          isLoading={isLoading}
          error={error?.message}
        />
      </AuthCard>
    )
  }

  if (mode === 'forgot-password') {
    return (
      <AuthCard title={tAuth('forgotPassword')} description={tAuth('forgotPasswordDescription')}>
        <ForgotPasswordForm
          initialEmail={email}
          onSubmit={handleForgotPasswordSubmit}
          onBack={handleBack}
          isLoading={isLoading}
          error={error?.message}
        />
      </AuthCard>
    )
  }

  if (mode === 'reset-password') {
    return (
      <AuthCard title={tAuth('resetYourPassword')} description={tAuth('resetPasswordDescription')}>
        <VerificationForm
          email={email}
          onVerify={handleResetPasswordVerification}
          onResend={handleResendCode}
          onBack={() => setMode('forgot-password')}
          isLoading={isLoading}
          error={error?.message}
        />
      </AuthCard>
    )
  }

  return (
    <AuthCard title={tAuth('welcomeToChat')} description={tAuth('signInDescription')}>
      <div className="space-y-6">
        <EmailPasswordForm
          mode={mode}
          onSubmit={handleEmailPasswordSubmit}
          onForgotPassword={handleForgotPassword}
          isLoading={isLoading}
          error={error?.message}
        />

        <div className="space-y-3">
          <SocialAuth
            onGoogleSignIn={handleGoogleSignIn}
            onGithubSignIn={handleGithubSignIn}
          />

          <Button type="button" variant="outline" className="w-full" onClick={handleCodeLogin}>
            <Mail className="mr-2 h-4 w-4" />
            {tAuth('signInWithCode')}
          </Button>
        </div>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">
            {mode === 'signin' ? tAuth('noAccount') : tAuth('haveAccount')}
          </span>
          <Link
            to={mode === 'signin' ? '/sign-up' : '/sign-in'}
            className="font-medium text-primary hover:underline"
          >
            {mode === 'signin' ? tAuth('signUp') : tAuth('signIn')}
          </Link>
        </div>
      </div>
    </AuthCard>
  )
}
