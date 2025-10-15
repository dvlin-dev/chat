/**
 * 资源管理器 - 防止内存泄漏
 * 统一管理 EventSource、定时器、事件监听器等资源
 */

export interface DisposableResource {
  dispose(): void
}

export interface StreamResource extends DisposableResource {
  readonly id: string
  readonly isActive: boolean
}

class EventSourceResource implements StreamResource {
  public readonly id: string
  private eventSource: EventSource | null
  private _isActive: boolean = true
  private _isDisposing: boolean = false

  constructor(eventSource: EventSource) {
    this.id = `eventsource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.eventSource = eventSource
    
    // 监听连接关闭事件
    this.eventSource.addEventListener('close', () => {
      this._isActive = false
    })
    
    this.eventSource.addEventListener('error', () => {
      this._isActive = false
    })
  }

  get isActive(): boolean {
    return this._isActive && this.eventSource !== null && this.eventSource.readyState !== EventSource.CLOSED && !this._isDisposing
  }

  dispose(): void {
    if (this._isDisposing || !this.eventSource) return
    
    this._isDisposing = true
    this._isActive = false
    
    try {
      // 只有在连接未正常关闭时才强制关闭
      if (this.eventSource.readyState !== EventSource.CLOSED) {
        this.eventSource.close()
      }
    } catch (error) {
      // 忽略已经关闭的连接的错误
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (!errorMessage.includes('aborted')) {
        console.warn('EventSource 关闭时出错:', error)
      }
    } finally {
      this.eventSource = null
    }
  }
}

class CloseableStreamResource implements StreamResource {
  public readonly id: string
  private closeFn: () => void
  private _isActive: boolean = true

  constructor(closeFn: () => void) {
    this.id = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.closeFn = closeFn
  }

  get isActive(): boolean {
    return this._isActive
  }

  dispose(): void {
    if (!this._isActive) return
    this._isActive = false
    try {
      this.closeFn()
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      if (!msg.includes('aborted')) {
        console.warn('关闭流资源时出错:', error)
      }
    }
  }
}

class TimerResource implements DisposableResource {
  public readonly id: string
  private timerId: number | null

  constructor(timerId: number) {
    this.id = `timer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.timerId = timerId
  }

  dispose(): void {
    if (this.timerId !== null) {
      clearTimeout(this.timerId)
      this.timerId = null
    }
  }
}

class IntervalResource implements DisposableResource {
  public readonly id: string
  private intervalId: number | null

  constructor(intervalId: number) {
    this.id = `interval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.intervalId = intervalId
  }

  dispose(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}

class EventListenerResource implements DisposableResource {
  public readonly id: string
  private target: EventTarget | null
  private event: string
  private listener: EventListener
  private options?: boolean | AddEventListenerOptions

  constructor(
    target: EventTarget,
    event: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
  ) {
    this.id = `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.target = target
    this.event = event
    this.listener = listener
    this.options = options
  }

  dispose(): void {
    if (this.target) {
      try {
        this.target.removeEventListener(this.event, this.listener, this.options)
      } catch (error) {
        console.warn('移除事件监听器时出错:', error)
      }
      this.target = null
    }
  }
}

/**
 * 资源管理器主类
 */
export class ResourceManager {
  private resources: Map<string, DisposableResource> = new Map()
  private disposed: boolean = false

  /**
   * 注册 EventSource 资源
   */
  registerEventSource(eventSource: EventSource): StreamResource {
    this.checkDisposed()
    const resource = new EventSourceResource(eventSource)
    this.resources.set(resource.id, resource)
    return resource
  }

  /**
   * 注册通用可关闭的流资源
   */
  registerCloseableStream(close: () => void): StreamResource {
    this.checkDisposed()
    const resource = new CloseableStreamResource(close)
    this.resources.set(resource.id, resource)
    return resource
  }

  /**
   * 注册定时器资源
   */
  registerTimer(callback: () => void, delay: number): DisposableResource {
    this.checkDisposed()
    const timerId = setTimeout(callback, delay) as unknown as number
    const resource = new TimerResource(timerId)
    this.resources.set(resource.id, resource)
    return resource
  }

  /**
   * 注册间隔定时器资源
   */
  registerInterval(callback: () => void, interval: number): DisposableResource {
    this.checkDisposed()
    const intervalId = setInterval(callback, interval) as unknown as number
    const resource = new IntervalResource(intervalId)
    this.resources.set(resource.id, resource)
    return resource
  }

  /**
   * 注册事件监听器资源
   */
  registerEventListener(
    target: EventTarget,
    event: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
  ): DisposableResource {
    this.checkDisposed()
    target.addEventListener(event, listener, options)
    const resource = new EventListenerResource(target, event, listener, options)
    this.resources.set(resource.id, resource)
    return resource
  }

  /**
   * 释放特定资源
   */
  disposeResource(resource: DisposableResource): void {
    const id = (resource as { id?: string }).id
    if (id && this.resources.has(id)) {
      resource.dispose()
      this.resources.delete(id)
    }
  }

  /**
   * 释放所有资源
   */
  disposeAll(): void {
    for (const resource of this.resources.values()) {
      try {
        resource.dispose()
      } catch (error) {
        console.warn('释放资源时出错:', error)
      }
    }
    this.resources.clear()
    this.disposed = true
  }

  /**
   * 获取活跃的流资源数量
   */
  getActiveStreamCount(): number {
    let count = 0
    for (const resource of this.resources.values()) {
      if ((resource as any as StreamResource).isActive) {
        count++
      }
    }
    return count
  }

  /**
   * 获取总资源数量
   */
  getResourceCount(): number {
    return this.resources.size
  }

  /**
   * 清理不活跃的资源
   */
  cleanupInactiveResources(): void {
    const inactiveIds: string[] = []
    for (const [id, resource] of this.resources.entries()) {
      const r = resource as any as StreamResource
      if (typeof r.isActive === 'boolean' && !r.isActive) {
        inactiveIds.push(id)
      }
    }
    for (const id of inactiveIds) {
      const resource = this.resources.get(id)
      if (resource) {
        resource.dispose()
        this.resources.delete(id)
      }
    }
  }

  private checkDisposed(): void {
    if (this.disposed) {
      throw new Error('ResourceManager 已被释放，不能继续使用')
    }
  }
}

/**
 * Hook 专用的资源管理器
 */
export class HookResourceManager extends ResourceManager {
  private cleanupTimer: number | null = null
  private hookDisposed: boolean = false
  
  constructor() {
    super()
    
    // 定期清理不活跃的资源
    this.cleanupTimer = setInterval(() => {
      if (!this.hookDisposed) {
        this.cleanupInactiveResources()
      }
    }, 30000) as unknown as number // 每30秒清理一次
  }

  disposeAll(): void {
    if (this.hookDisposed) return
    
    this.hookDisposed = true
    
    if (this.cleanupTimer !== null) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    
    // 延迟执行清理，避免中断正在进行的操作
    setTimeout(() => {
      super.disposeAll()
    }, 100)
  }

  /**
   * 优雅关闭 - 等待活跃资源完成
   */
  async gracefulShutdown(timeout: number = 5000): Promise<void> {
    if (this.hookDisposed) return
    
    const startTime = Date.now()
    
    // 等待活跃的流资源完成
    while (this.getActiveStreamCount() > 0 && Date.now() - startTime < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    // 强制清理剩余资源
    this.disposeAll()
  }
}
