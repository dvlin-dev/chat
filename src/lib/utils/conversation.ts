import type { Conversation } from '@/lib/types/conversation'

const DEFAULT_TITLE = '新对话'

/**
 * 获取对话的显示标题
 * @param conversation 对话对象
 * @returns 对话标题
 */
export function getConversationTitle(conversation: Conversation): string {
  // 使用摘要或默认标题
  return conversation.abstract || DEFAULT_TITLE
}

/**
 * 验证对话标题是否有效
 * @param title 标题
 * @returns 是否有效
 */
export function isValidTitle(title: string): boolean {
  return title.trim().length > 0 && title.trim().length <= 50
}