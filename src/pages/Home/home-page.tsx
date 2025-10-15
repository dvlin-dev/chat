import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Seo } from '@/app/seo/seo'
import { useCommonTranslation } from '@/lib/i18n-setup'
import { LoadingScreen } from '@/components/ui/loading-screen'

/**
 * HomePage - 首页组件
 *
 * 功能：自动重定向到聊天页面
 * 用户访问根路径 "/" 时会被重定向到 "/chat"
 */
export function HomePage() {
  const navigate = useNavigate()
  const tCommon = useCommonTranslation()

  useEffect(() => {
    // 自动重定向到聊天页面
    navigate('/chat', { replace: true })
  }, [navigate])

  return (
    <>
      <Seo title={tCommon('home')} />
      <LoadingScreen message={tCommon('loading')} />
    </>
  )
}
