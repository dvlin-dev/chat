/**
 * 虚拟滚动控制 Hook
 * 根据消息数量智能启用/禁用虚拟滚动
 */

import { useMemo } from 'react'

interface UseVirtualScrollingOptions {
  // 启用虚拟滚动的最小消息数量
  threshold?: number
  // 强制启用虚拟滚动
  forceEnable?: boolean
  // 强制禁用虚拟滚动
  forceDisable?: boolean
}

interface UseVirtualScrollingReturn {
  // 是否应该使用虚拟滚动
  shouldUseVirtualScrolling: boolean
  // 虚拟滚动配置
  virtualScrollConfig: {
    estimateSize: number
    overscan: number
  }
}

export function useVirtualScrolling(
  messageCount: number, 
  options: UseVirtualScrollingOptions = {}
): UseVirtualScrollingReturn {
  const {
    threshold = 100, // 默认100条消息后启用虚拟滚动
    forceEnable = false,
    forceDisable = false
  } = options

  return useMemo(() => {
    // 强制禁用
    if (forceDisable) {
      return {
        shouldUseVirtualScrolling: false,
        virtualScrollConfig: {
          estimateSize: 120,
          overscan: 5
        }
      }
    }

    // 强制启用或消息数量达到阈值
    const shouldUseVirtualScrolling = forceEnable || messageCount >= threshold

    // 根据消息数量调整虚拟滚动配置
    let estimateSize = 120 // 默认预估高度
    let overscan = 5       // 默认预渲染数量

    if (messageCount > 1000) {
      // 大量消息时优化性能
      estimateSize = 100
      overscan = 3
    } else if (messageCount > 500) {
      // 中等数量消息
      estimateSize = 110
      overscan = 4
    }

    return {
      shouldUseVirtualScrolling,
      virtualScrollConfig: {
        estimateSize,
        overscan
      }
    }
  }, [messageCount, threshold, forceEnable, forceDisable])
}