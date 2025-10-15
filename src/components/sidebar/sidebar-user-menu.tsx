import React from 'react'
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import type { User } from '@/lib/types/api'
import { useCommonTranslation, useAuthTranslation } from '@/lib/i18n-setup'

interface SidebarUserMenuProps {
  user: User
  onLogout: () => void
}

export function SidebarUserMenu({ user, onLogout }: SidebarUserMenuProps) {
  const { state, toggleSidebar } = useSidebar()
  const effectiveState = state
  const tCommon = useCommonTranslation()
  const tAuth = useAuthTranslation()

  // 处理菜单项点击，控制菜单关闭时机
  const handleMenuItemClick = (action: () => void) => {
    return () => {
      // 如果需要延迟关闭菜单，可以在这里添加逻辑
      // 例如：setTimeout(() => action(), 100)
      action()
    }
  }

  return (
    <div
      className={
        effectiveState === 'expanded'
          ? 'flex items-center justify-between gap-2'
          : 'flex flex-col items-center gap-2'
      }
    >
      {/* 用户头像和菜单 */}
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          className="focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <button
            className={`relative rounded-full transition-all duration-200 group focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 ring-0 ring-offset-0 ${
              effectiveState === 'collapsed' ? 'mx-auto' : ''
            }`}
            style={{
              WebkitTapHighlightColor: 'transparent',
              outline: 'none',
              boxShadow: 'none',
            }}
          >
            {/* @ts-ignore - React 19 类型兼容性问题 */}
            <Avatar className="h-8 w-8 cursor-pointer">
              {/* 统一使用首字母占位 */}
              {/* @ts-ignore - React 19 类型兼容性问题 */}
              <AvatarFallback>{user.username?.[0] || user.email?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            {/* Hover 效果蒙层 */}
            <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align={effectiveState === 'expanded' ? 'start' : 'center'}
          side="top"
          className="w-56"
          // 可以添加更多控制选项
          // onCloseAutoFocus={(event) => event.preventDefault()} // 防止自动聚焦
          // modal={false} // 如果不想模态行为
        >
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{user.username || tCommon('unknownUser')}</p>
            {user.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleMenuItemClick(onLogout)} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            {tAuth('signOut')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 侧边栏切换按钮 */}
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 ${effectiveState === 'collapsed' ? 'mx-auto' : ''}`}
        onClick={toggleSidebar}
      >
        {effectiveState === 'expanded' ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        <span className="sr-only">{tCommon('toggleSidebar')}</span>
      </Button>
    </div>
  )
}
