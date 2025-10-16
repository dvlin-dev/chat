import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Seo } from '@/app/seo/seo'
import { useCommonTranslation } from '@/lib/i18n-setup'
import { LoadingScreen } from '@/components/ui/loading-screen'

export default function HomePage() {
  const navigate = useNavigate()
  const tCommon = useCommonTranslation()

  useEffect(() => {
    navigate('/chat', { replace: true })
  }, [navigate])

  return (
    <>
      <Seo title={tCommon('home')} />
      <LoadingScreen message={tCommon('loading')} />
    </>
  )
}
