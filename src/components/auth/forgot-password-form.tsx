import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft } from 'lucide-react'
import { authService } from '@/lib/services/auth.service'
import { useAuthTranslation } from '@/lib/i18n-setup'

interface ForgotPasswordFormProps {
  initialEmail?: string
  onSubmit: (email: string) => Promise<void>
  onBack?: () => void
  isLoading?: boolean
  error?: string | null
}

export function ForgotPasswordForm({
  initialEmail = '',
  onSubmit,
  onBack,
  isLoading = false,
  error,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState(initialEmail)
  const [emailError, setEmailError] = useState('')
  const tAuth = useAuthTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError('')

    // 验证邮箱
    if (!email) {
      setEmailError(tAuth('emailRequired'))
      return
    }

    if (!authService.validateEmail(email)) {
      setEmailError(tAuth('emailInvalid'))
      return
    }

    try {
      await onSubmit(email)
    } catch (error) {
      // 错误由父组件处理
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {onBack && (
        <Button type="button" variant="ghost" size="sm" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {tAuth('backToSignIn')}
        </Button>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">{tAuth('email')}</Label>
        <Input
          id="email"
          type="email"
          placeholder={tAuth('enterYourEmail')}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setEmailError('')
          }}
          disabled={isLoading}
          autoComplete="email"
          required
        />
        {emailError && <p className="text-sm text-destructive">{emailError}</p>}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading || !email}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {tAuth('sendVerificationCode')}
      </Button>

      <p className="text-center text-sm text-muted-foreground">{tAuth('forgotPasswordNote')}</p>
    </form>
  )
}
