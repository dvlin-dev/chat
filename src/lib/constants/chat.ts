/**
 * 聊天模块配置常量
 */

export const CHAT_CONFIG = {
  // 滚动相关
  SCROLL_DELAY: 100, // 滚动到底部的延迟时间（毫秒）
  SCROLL_THRESHOLD: 50, // 触发自动滚动的阈值（像素）
  
  // 虚拟列表相关
  VIRTUAL_LIST_OVERSCAN: 3, // 虚拟列表预渲染数量
  VIRTUAL_LIST_THRESHOLD: 100, // 启用虚拟滚动的消息数量阈值
  VIRTUAL_LIST_ESTIMATE_SIZE: 120, // 虚拟列表项的预估高度
  
  // 消息相关
  MESSAGE_BATCH_SIZE: 20, // 每批加载的消息数量
  MESSAGE_MAX_LENGTH: 4000, // 消息最大长度
  
  // 重试相关
  RETRY_ATTEMPTS: 3, // 最大重试次数
  RETRY_DELAY: 1000, // 重试延迟时间（毫秒）
  
  // 输入框相关
  INPUT_MIN_HEIGHT: 44, // 输入框最小高度（像素）
  INPUT_MAX_HEIGHT: 200, // 输入框最大高度（像素）
  
  // 流式响应相关
  STREAM_TIMEOUT: 30000, // 流式响应超时时间（毫秒）
  STREAM_RECONNECT_DELAY: 1000, // 流式响应重连延迟（毫秒）
  
  // 临时会话
  TEMP_CONVERSATION_PREFIX: 'temp_', // 临时会话ID前缀
} as const

export type ChatConfig = typeof CHAT_CONFIG