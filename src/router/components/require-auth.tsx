import { ReactNode, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/contexts/auth.context'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { useCommonTranslation } from '@/lib/i18n-setup'

interface RequireAuthProps {
  children: ReactNode
  loadingFallback?: ReactNode
}

export function RequireAuth({ children, loadingFallback }: RequireAuthProps) {
  const { isLoaded, isSignedIn } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const tCommon = useCommonTranslation()

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    if (!isSignedIn) {
      const redirect = encodeURIComponent(`${location.pathname}${location.search}`)
      navigate(`/sign-in?redirect=${redirect}`, { replace: true })
    }
  }, [isLoaded, isSignedIn, location.pathname, location.search, navigate])

  if (!isLoaded || !isSignedIn) {
    if (loadingFallback) {
      return <>{loadingFallback}</>
    }
    return <LoadingScreen message={tCommon('loading')} />
  }

  return <>{children}</>
}
