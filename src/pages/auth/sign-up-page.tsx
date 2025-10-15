import { Seo } from '@/app/seo/seo'
import { SignUpForm } from '@/components/auth/sign-up-form'
import { useAuthTranslation } from '@/lib/i18n-setup'

export function SignUpPage() {
  const tAuth = useAuthTranslation()
  return (
    <>
      <Seo title={tAuth('signUp')} />
      <SignUpForm />
    </>
  )
}
