import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAppRouter } from '@/router/use-app-router'
import { Button } from '@/components/ui/button'
import { AuthCard } from './auth-card'
import { EmailPasswordForm, type EmailPasswordFormData } from './email-password-form'
import { VerificationForm } from './verification-form'
import { SocialAuth } from './social-auth'
import { useSignUp } from '@/lib/contexts/auth.context'
import { authService } from '@/lib/services/auth.service'
import { useApiError } from '@/lib/hooks/useApiError'
import { useAuthTranslation } from '@/lib/i18n-setup'

export function SignUpForm() {
  const router = useAppRouter()
  const { signUp, sendVerificationCode, isLoading, error, clearError } = useSignUp()
  const { handleError } = useApiError()
  const tAuth = useAuthTranslation()

  const [step, setStep] = useState<'credentials' | 'verification'>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  /**
   * 处理注册表单提交
   */
  const handleSignUpSubmit = useCallback(
    async (data: EmailPasswordFormData) => {
      setEmail(data.email)
      setPassword(data.password)
      clearError()

      try {
        // 发送验证码
        await sendVerificationCode(data.email, 'signup')
        setStep('verification')
      } catch (error) {
        // 使用统一错误处理
        handleError(error, tAuth('sendVerificationCode'))
      }
    },
    [sendVerificationCode, clearError, handleError]
  )

  /**
   * 处理验证码验证
   */
  const handleVerification = useCallback(
    async (code: string) => {
      clearError()

      try {
        await signUp({
          email,
          password,
          code,
        })
        // signUp 成功后会自动跳转到首页
      } catch (error) {
        // 使用统一错误处理
        handleError(error, tAuth('signUp'))
      }
    },
    [email, password, signUp, clearError, handleError]
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
   * 处理社交登录
   */
  const handleGoogleSignIn = useCallback(async () => {
    // TODO: 实现 Google 登录
  }, [])

  const handleGithubSignIn = useCallback(async () => {
    // TODO: 实现 Github 登录
  }, [])

  /**
   * 返回上一步
   */
  const handleBack = useCallback(() => {
    setStep('credentials')
    clearError()
  }, [clearError])

  // 根据步骤渲染不同的内容
  if (step === 'verification') {
    return (
      <AuthCard
        title={tAuth('verifyYourEmail')}
        description={tAuth('verificationDescription')}
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

  return (
    <AuthCard title={tAuth('createAccount')} description={tAuth('signUpDescription')}>
      <div className="space-y-6">
        <EmailPasswordForm
          mode="signup"
          onSubmit={handleSignUpSubmit}
          isLoading={isLoading}
          error={error?.message}
        />

        <div className="space-y-3">
          <SocialAuth
            onGoogleSignIn={handleGoogleSignIn}
            onGithubSignIn={handleGithubSignIn}
          />
        </div>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">{tAuth('haveAccount')} </span>
          <Link to="/sign-in" className="font-medium text-primary hover:underline">
            {tAuth('signIn')}
          </Link>
        </div>
      </div>
    </AuthCard>
  )
}
