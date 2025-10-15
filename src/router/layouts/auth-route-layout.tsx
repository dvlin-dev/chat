import { Outlet } from 'react-router-dom'
import { PublicOnlyRoute } from '@/router/components/public-only-route'
import { AuthLayout } from '@/components/layouts/auth-layout'

/**
 * AuthRouteLayout - 认证页面布局
 *
 * 功能：
 * - 通过 PublicOnlyRoute 确保仅未登录用户可访问
 * - 使用 AuthLayout 提供统一的认证页面样式
 * - 包裹所有认证相关页面（登录、注册等）
 */
export function AuthRouteLayout() {
  return (
    <PublicOnlyRoute>
      <AuthLayout>
        <Outlet />
      </AuthLayout>
    </PublicOnlyRoute>
  )
}
