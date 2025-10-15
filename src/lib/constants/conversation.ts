/**
 * 会话相关常量定义
 */

export const CONVERSATION_CONSTANTS = {
  /** 临时会话ID前缀 */
  TEMP_CONVERSATION_PREFIX: 'temp_',
  
  /** 临时消息ID前缀 */
  TEMP_MESSAGE_PREFIX: 'msg_',
  
  /** AI消息ID前缀 */
  AI_MESSAGE_PREFIX: 'ai_',
  
  /** 用户消息ID前缀 */
  USER_MESSAGE_PREFIX: 'user_',
} as const

/**
 * 生成临时会话ID
 */
export function generateTempConversationId(): string {
  return `${CONVERSATION_CONSTANTS.TEMP_CONVERSATION_PREFIX}${Date.now()}`
}

/**
 * 检查是否为临时会话ID
 */
export function isTempConversationId(id: string): boolean {
  return id.startsWith(CONVERSATION_CONSTANTS.TEMP_CONVERSATION_PREFIX)
}