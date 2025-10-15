import { useState, useCallback } from 'react'
import { useConversationDataStore } from '@/lib/stores/conversation-data'
import { conversationService } from '@/lib/services/conversation-service'
import { toast } from 'sonner'

/**
 * useConversationActions - 对话操作 Hook
 *
 * 提供对话的重命名、删除等操作功能
 */
export function useConversationActions() {
  const [isLoading, setIsLoading] = useState(false)
  const { conversations, setConversations } = useConversationDataStore()

  /**
   * 重命名对话
   */
  const renameConversation = useCallback(
    async (conversationId: string, newTitle: string): Promise<boolean> => {
      if (!newTitle.trim()) {
        toast.error('请输入新标题')
        return false
      }

      try {
        setIsLoading(true)

        // 调用服务更新对话标题
        await conversationService.renameConversation(conversationId, newTitle)

        // 更新本地状态
        const updated = {
          ...conversations,
          [conversationId]: {
            ...conversations[conversationId],
            title: newTitle,
            updatedAt: new Date().toISOString(),
          },
        }
        setConversations(updated)

        toast.success('重命名成功')
        return true
      } catch (error) {
        console.error('重命名对话失败:', error)
        toast.error('重命名失败，请稍后重试')
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [conversations, setConversations]
  )

  /**
   * 删除对话
   */
  const removeConversation = useCallback(
    async (conversationId: string): Promise<boolean> => {
      try {
        setIsLoading(true)

        // 调用服务删除对话
        await conversationService.deleteConversation(conversationId)

        // 更新本地状态
        const { [conversationId]: _, ...remaining } = conversations
        setConversations(remaining)

        toast.success('删除成功')
        return true
      } catch (error) {
        console.error('删除对话失败:', error)
        toast.error('删除失败，请稍后重试')
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [conversations, setConversations]
  )

  return {
    isLoading,
    renameConversation,
    removeConversation,
  }
}
