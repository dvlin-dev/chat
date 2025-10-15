import { ReactNode } from 'react'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Menu } from 'lucide-react'
import { useCommonTranslation } from '@/lib/i18n-setup'

interface SidebarLayoutProps {
  children: ReactNode
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const tCommon = useCommonTranslation()
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset>
        <div className="flex h-screen flex-col">
          {/* 移动端顶部菜单按钮 */}
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
            <SidebarTrigger className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">{tCommon('toggleMenu')}</span>
            </SidebarTrigger>
          </header>
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
