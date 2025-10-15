import React from 'react'
import { useAppRouter } from '@/router/use-app-router'
import { MessageCircle } from 'lucide-react'
import type { ComponentType } from 'react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'

export interface NavigationItem {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
  href: string
  active?: boolean
  disabled?: boolean
}

interface NavigationSectionProps {
  items?: NavigationItem[]
}

export function NavigationSection({ items }: NavigationSectionProps) {
  const router = useAppRouter()
  const { state } = useSidebar()
  const effectiveState = state

  // 默认导航项
  const defaultItems: NavigationItem[] = [
    {
      id: 'chat',
      label: '聊天',
      icon: MessageCircle,
      href: '/',
      active: router.pathname === '/',
    },
  ]

  const navigationItems = items || defaultItems

  return (
    <div className="space-y-2 px-2">
      {navigationItems.map((item) => {
        const IconComponent = item.icon
        return (
          <Button
            key={item.id}
            variant={item.active ? 'secondary' : 'ghost'}
            className={effectiveState === 'expanded' 
              ? "w-full justify-start h-10 px-3" 
              : "w-full justify-center h-10 px-0"
            }
            disabled={item.disabled}
            onClick={() => !item.disabled && router.push(item.href)}
          >
            <IconComponent className={effectiveState === 'expanded' ? "mr-2 h-4 w-4" : "h-4 w-4"} />
            {effectiveState === 'expanded' && (
              <>
                {item.label}
                {item.disabled && (
                  <span className="ml-auto text-xs text-muted-foreground">即将推出</span>
                )}
              </>
            )}
          </Button>
        )
      })}
    </div>
  )
}
