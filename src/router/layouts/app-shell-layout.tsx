import { Outlet } from 'react-router-dom'
import { RequireAuth } from '@/router/components/require-auth'
import { SidebarLayout } from '@/components/layouts/sidebar-layout'

/**
 * AppShellLayout - 应用主壳层布局
 *
 * 功能：
 * - 通过 RequireAuth 提供登录态保护
 * - 使用 SidebarLayout 提供侧边栏框架
 * - 包裹所有需要认证的聊天相关页面
 */
export function AppShellLayout() {
  return (
    <RequireAuth>
      <SidebarLayout>
        <Outlet />
      </SidebarLayout>
    </RequireAuth>
  )
}
