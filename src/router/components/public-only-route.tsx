import { ReactNode, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/contexts/auth.context'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { useCommonTranslation } from '@/lib/i18n-setup'

interface PublicOnlyRouteProps {
  children: ReactNode
  loadingFallback?: ReactNode
}

export function PublicOnlyRoute({ children, loadingFallback }: PublicOnlyRouteProps) {
  const { isLoaded, isSignedIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const tCommon = useCommonTranslation()

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return
    }

    const redirectTo = (location.state as { redirect?: string } | null)?.redirect || '/'
    navigate(redirectTo, { replace: true })
  }, [isLoaded, isSignedIn, navigate, location.state])

  const fallback = loadingFallback ?? <LoadingScreen message={tCommon('loading')} fullScreen={false} />

  if (!isLoaded) {
    return <>{fallback}</>
  }

  if (isSignedIn) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
