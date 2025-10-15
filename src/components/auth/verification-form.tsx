import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft } from 'lucide-react'
import { useAuthTranslation } from '@/lib/i18n-setup'
import { cn } from '@/lib/utils'

interface VerificationFormProps {
  email: string
  onVerify: (code: string) => Promise<void>
  onResend: () => Promise<void>
  onBack?: () => void
  isLoading?: boolean
  error?: string | null
  className?: string
}

export function VerificationForm({
  email,
  onVerify,
  onResend,
  onBack,
  isLoading = false,
  error,
  className,
}: VerificationFormProps) {
  const [code, setCode] = useState('')
  const tAuth = useAuthTranslation()
  const [isResending, setIsResending] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // 倒计时逻辑
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleCodeChange = (value: string, index: number) => {
    const newCode = code.split('')
    newCode[index] = value
    const updatedCode = newCode.join('')
    setCode(updatedCode)

    // 自动聚焦到下一个输入框
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // 如果输入完整，自动提交
    if (updatedCode.length === 6 && !updatedCode.includes('')) {
      handleSubmit(updatedCode)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    setCode(pastedData)

    // 自动填充所有输入框
    pastedData.split('').forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index]!.value = char
      }
    })

    // 如果粘贴的是完整验证码，自动提交
    if (pastedData.length === 6) {
      handleSubmit(pastedData)
    }
  }

  const handleSubmit = async (codeToSubmit?: string) => {
    const finalCode = codeToSubmit || code
    if (finalCode.length !== 6) {
      return
    }

    try {
      await onVerify(finalCode)
    } catch (error) {
      // 错误由父组件处理
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      await onResend()
      setResendTimer(60) // 60秒倒计时
      setCode('')
      // 清空所有输入框
      inputRefs.current.forEach((ref) => {
        if (ref) ref.value = ''
      })
      // 聚焦到第一个输入框
      inputRefs.current[0]?.focus()
    } catch (error) {
      // 错误由父组件处理
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {onBack && (
        <Button type="button" variant="ghost" size="sm" onClick={onBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {tAuth('back')}
        </Button>
      )}

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">{tAuth('codeSentTo')}</p>
        <p className="font-medium">{email}</p>
      </div>

      <div className="space-y-2">
        <Label>{tAuth('verificationCode')}</Label>
        <div className="flex gap-2 justify-center">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <Input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]"
              maxLength={1}
              className="w-12 h-12 text-center text-lg font-semibold"
              value={code[index] || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '')
                handleCodeChange(value, index)
              }}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={index === 0 ? handlePaste : undefined}
              disabled={isLoading}
              autoComplete="off"
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        <Button
          type="button"
          className="w-full"
          onClick={() => handleSubmit()}
          disabled={isLoading || code.length !== 6}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {tAuth('verify')}
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {tAuth('noCodeReceived')}{' '}
            {resendTimer > 0 ? (
              <span>{tAuth('resendTimer', { seconds: resendTimer })}</span>
            ) : (
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={handleResend}
                disabled={isResending}
                className="p-0 h-auto"
              >
                {isResending ? tAuth('sending') : tAuth('resendCode')}
              </Button>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
