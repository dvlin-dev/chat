import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Seo } from '@/app/seo/seo'
import { useCommonTranslation } from '@/lib/i18n-setup'

/**
 * NotFoundPage - 404 页面
 *
 * 当用户访问不存在的路由时显示此页面
 */
export function NotFoundPage() {
  const tCommon = useCommonTranslation()

  return (
    <>
      <Seo title={tCommon('notFound')} />
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="space-y-6 text-center">
          <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
          <p className="text-xl text-muted-foreground">{tCommon('pageNotFound')}</p>
          <p className="max-w-md text-sm text-muted-foreground">
            {tCommon('pageNotFoundDescription')}
          </p>
          <Button asChild size="lg">
            <Link to="/">{tCommon('backToHome')}</Link>
          </Button>
        </div>
      </div>
    </>
  )
}
