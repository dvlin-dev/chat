/**
 * 全局流管理器
 * 管理流式连接，使其独立于组件生命周期
 * 避免路由切换时流连接被中断
 */

import { HookResourceManager } from './resource-manager'
import type { StreamCleanup } from '@/lib/api/conversation-web'

class GlobalStreamManager {
  private static instance: GlobalStreamManager | null = null
  private activeStreams: Map<string, StreamCleanup> = new Map()
  private globalResourceManager: HookResourceManager

  private constructor() {
    this.globalResourceManager = new HookResourceManager()
  }

  static getInstance(): GlobalStreamManager {
    if (!GlobalStreamManager.instance) {
      GlobalStreamManager.instance = new GlobalStreamManager()
    }
    return GlobalStreamManager.instance
  }

  /**
   * 注册一个流连接
   */
  registerStream(streamId: string, cleanup: StreamCleanup): void {
    // 如果已存在同ID的流，先清理
    this.cleanupStream(streamId)
    // 注册新流
    this.activeStreams.set(streamId, cleanup)
  }

  /**
   * 清理指定的流
   */
  cleanupStream(streamId: string): void {
    const cleanup = this.activeStreams.get(streamId)
    if (cleanup) {
      try {
        cleanup.cleanup()
      } catch (error) {
        console.warn(`清理流 ${streamId} 时出错:`, error)
      }
      this.activeStreams.delete(streamId)
    }
  }

  /**
   * 检查流是否活跃
   */
  isStreamActive(streamId: string): boolean {
    const cleanup = this.activeStreams.get(streamId)
    return cleanup ? cleanup.isActive() : false
  }

  /**
   * 获取全局资源管理器
   */
  getResourceManager(): HookResourceManager {
    return this.globalResourceManager
  }

  /**
   * 清理所有流
   */
  cleanupAll(): void {
    for (const [streamId, cleanup] of this.activeStreams.entries()) {
      try {
        cleanup.cleanup()
      } catch (error) {
        console.warn(`清理流 ${streamId} 时出错:`, error)
      }
    }
    this.activeStreams.clear()
  }

  /**
   * 获取活跃流的数量
   */
  getActiveStreamCount(): number {
    return this.activeStreams.size
  }
}

// 导出单例实例
export const globalStreamManager = GlobalStreamManager.getInstance()

// 页面卸载时清理所有流
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    globalStreamManager.cleanupAll()
  })
}