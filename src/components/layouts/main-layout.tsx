import { ReactNode } from 'react'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="h-screen flex flex-col">
      <header className="border-b bg-background">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold">chat</h1>
          <div className="flex items-center gap-2">
            {/* TODO: 添加用户菜单等导航 */}
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}