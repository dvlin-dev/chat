import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, Lock } from 'lucide-react'
import { authService } from '@/lib/services/auth.service'
import { useAuthTranslation } from '@/lib/i18n-setup'
import { cn } from '@/lib/utils'

export interface EmailPasswordFormData {
  email: string
  password: string
}

interface EmailPasswordFormProps {
  mode?: 'signin' | 'signup'
  onSubmit: (data: EmailPasswordFormData) => Promise<void>
  onForgotPassword?: () => void
  isLoading?: boolean
  error?: string | null
  className?: string
}

export function EmailPasswordForm({
  mode = 'signin',
  onSubmit,
  onForgotPassword,
  isLoading = false,
  error,
  className,
}: EmailPasswordFormProps) {
  const [localError, setLocalError] = useState<string | null>(null)
  const tAuth = useAuthTranslation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<EmailPasswordFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const displayError = error || localError

  const handleFormSubmit = async (data: EmailPasswordFormData) => {
    setLocalError(null)

    // 验证邮箱格式
    if (!authService.validateEmail(data.email)) {
      setLocalError(tAuth('emailInvalid'))
      return
    }

    // 验证密码强度
    const passwordValidation = authService.validatePassword(data.password)
    if (!passwordValidation.valid) {
      setLocalError(passwordValidation.message!)
      return
    }

    try {
      await onSubmit(data)
    } catch (_error: unknown) {
      // 错误已经在父组件处理
    }
  }

  const handleEmailKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setFocus('password')
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={cn('space-y-4', className)}>
      <div className="space-y-2">
        <Label htmlFor="email">{tAuth('email')}</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            {...register('email', {
              required: tAuth('emailRequired'),
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: tAuth('emailInvalid'),
              },
            })}
            id="email"
            type="email"
            placeholder="email@example.com"
            className="pl-10"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            disabled={isLoading}
            onKeyDown={handleEmailKeyDown}
          />
        </div>
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{tAuth('password')}</Label>
          {mode === 'signin' && onForgotPassword && (
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={onForgotPassword}
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            >
              {tAuth('forgotPassword')}
            </Button>
          )}
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            {...register('password', {
              required: tAuth('passwordRequired'),
              minLength: {
                value: 6,
                message: tAuth('passwordTooShort'),
              },
            })}
            id="password"
            type="password"
            placeholder={mode === 'signup' ? tAuth('createPassword') : tAuth('enterPassword')}
            className="pl-10"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            disabled={isLoading}
          />
        </div>
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>

      {displayError && (
        <div className="rounded-md bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{displayError}</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {mode === 'signup' ? tAuth('createAccount') : tAuth('signIn')}
      </Button>
    </form>
  )
}
