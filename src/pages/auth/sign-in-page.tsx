import { Seo } from '@/app/seo/seo'
import { SignInForm } from '@/components/auth/sign-in-form'
import { useAuthTranslation } from '@/lib/i18n-setup'

export function SignInPage() {
  const tAuth = useAuthTranslation()
  return (
    <>
      <Seo title={tAuth('signIn')} />
      <SignInForm />
    </>
  )
}
