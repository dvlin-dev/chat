/**
 * 搜索开关组件
 * 控制是否启用联网搜索功能
 */

import { memo, useState } from 'react'
import { Settings, ChevronDown } from 'lucide-react'
import { GlobeIcon } from '@radix-ui/react-icons'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { WebSearchConfig } from '@/lib/types/api'

interface SearchToggleProps {
  enabled: boolean
  config?: WebSearchConfig
  onToggle: (enabled: boolean) => void
  onConfigChange?: (config: WebSearchConfig) => void
  className?: string
}

export const SearchToggle = memo(function SearchToggle({
  enabled,
  config,
  onToggle,
  onConfigChange,
  className,
}: SearchToggleProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [localConfig, setLocalConfig] = useState<WebSearchConfig>(config || {})

  const handleConfigChange = (key: keyof WebSearchConfig, value: string) => {
    const newConfig = { ...localConfig, [key]: value }
    setLocalConfig(newConfig)
    onConfigChange?.(newConfig)
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <GlobeIcon className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="search-toggle" className="text-sm cursor-pointer">
            联网搜索
          </Label>
        </div>

        <Switch id="search-toggle" checked={enabled} onCheckedChange={onToggle} />

        {enabled && onConfigChange && (
          <Popover open={isConfigOpen} onOpenChange={setIsConfigOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2">
                <Settings className="h-3.5 w-3.5" />
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">搜索设置</h4>
                  <p className="text-xs text-muted-foreground">配置搜索参数以获得更精准的结果</p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="search-domain" className="text-xs">
                      搜索范围
                    </Label>
                    <Select
                      value={localConfig.domain || 'web'}
                      onValueChange={(value) => handleConfigChange('domain', value)}
                    >
                      <SelectTrigger id="search-domain" className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="web">网页</SelectItem>
                        <SelectItem value="news">新闻</SelectItem>
                        <SelectItem value="images">图片</SelectItem>
                        <SelectItem value="videos">视频</SelectItem>
                        <SelectItem value="academic">学术</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="search-time" className="text-xs">
                      时间范围
                    </Label>
                    <Select
                      value={localConfig.timeRange || ''}
                      onValueChange={(value) => handleConfigChange('timeRange', value)}
                    >
                      <SelectTrigger id="search-time" className="h-8">
                        <SelectValue placeholder="不限" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">不限</SelectItem>
                        <SelectItem value="day">今天</SelectItem>
                        <SelectItem value="week">本周</SelectItem>
                        <SelectItem value="month">本月</SelectItem>
                        <SelectItem value="year">今年</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="search-lang" className="text-xs">
                      搜索语言
                    </Label>
                    <Select
                      value={localConfig.language || 'zh-CN'}
                      onValueChange={(value) => handleConfigChange('language', value)}
                    >
                      <SelectTrigger id="search-lang" className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zh-CN">中文</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                        <SelectItem value="ko">한국어</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    启用后，AI 将根据需要自动搜索网络以提供最新信息
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  )
})

// 简化版开关，用于聊天输入框
export const SimpleSearchToggle = memo(function SimpleSearchToggle({
  enabled,
  onToggle,
  className,
}: Pick<SearchToggleProps, 'enabled' | 'onToggle' | 'className'>) {
  return (
    <button
      onClick={() => onToggle(!enabled)}
      className={`
        inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs
        transition-colors cursor-pointer select-none
        ${
          enabled
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        }
        ${className}
      `}
    >
      <GlobeIcon className="h-3.5 w-3.5" />
    </button>
  )
})
