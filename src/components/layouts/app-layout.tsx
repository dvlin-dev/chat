import React from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { ProtectedRoute } from '@/components/guards/auth-guard'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { useCommonTranslation } from '@/lib/i18n-setup'
import { Seo } from '@/app/seo/seo'

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
}

/**
 * AppLayout - 应用主布局组件
 *
 * 提供统一的应用外壳，包含：
 * - 主导航侧边栏 (AppSidebar)
 * - 身份认证保护
 * - SEO 元数据
 *
 * 所有需要主导航的页面都应该使用这个布局
 */
export function AppLayout({ children, title, description, className = '' }: AppLayoutProps) {
  const tCommon = useCommonTranslation()

  const pageTitle = title ? `${title} - chat` : tCommon('appSeoTitle')

  const pageDescription = description || tCommon('appSeoDescription')

  return (
    <ProtectedRoute loading={<LoadingScreen />}>
      <SidebarProvider>
        <Seo title={pageTitle} description={pageDescription} />

        <div className="flex min-h-screen w-full">
          {/* 主导航侧边栏 */}
          <AppSidebar />

          {/* 内容区域 */}
          <main className={`flex-1 bg-background ${className}`}>{children}</main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}

/**
 * withAppLayout - 高阶组件，用于包装页面组件
 *
 * @example
 * ```tsx
 * const NotesPage = () => <div>Notes Content</div>
 * export default withAppLayout(NotesPage, {
 *   title: '笔记',
 *   description: '管理您的笔记'
 * })
 * ```
 */
export function withAppLayout<P extends object>(
  Component: React.ComponentType<P>,
  layoutProps?: Omit<AppLayoutProps, 'children'>
) {
  const WrappedComponent = (props: P) => {
    return (
      <AppLayout {...layoutProps}>
        <Component {...props} />
      </AppLayout>
    )
  }

  // 保留原组件的显示名称
  WrappedComponent.displayName = `withAppLayout(${Component.displayName || Component.name || 'Component'})`

  return WrappedComponent
}
