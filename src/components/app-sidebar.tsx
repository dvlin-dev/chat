import * as React from 'react'
import { useAppRouter } from '@/router/use-app-router'
import { useAuth } from '@/lib/contexts/auth.context'
import { useConversationDataStore } from '@/lib/stores/conversation-data'
import { conversationService } from '@/lib/services/conversation-service'
import { useConversationActions } from '@/hooks/use-conversation-actions'
import { getConversationTitle } from '@/lib/utils/conversation'
import type { Conversation } from '@/lib/types/conversation'
import { useSidebar } from '@/components/ui/sidebar'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'

// 子组件导入
import { SidebarLogo } from '@/components/sidebar/sidebar-logo'
import { SidebarUserMenu } from '@/components/sidebar/sidebar-user-menu'
import { NavigationSection } from '@/components/sidebar/navigation-section'
import { ConversationHistory } from '@/components/sidebar/conversation-history'
import { RenameDialog } from '@/components/sidebar/rename-dialog'
import { DeleteConfirmationDialog } from '@/components/conversation/delete-confirmation-dialog'
import { useChatTranslation } from '@/lib/i18n-setup'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useAppRouter()
  const { user, signOut } = useAuth()
  const { conversations, setConversations } = useConversationDataStore()

  // 对话操作 hooks
  const { isLoading, renameConversation, removeConversation } = useConversationActions()

  // 对话框状态
  const [renameDialogOpen, setRenameDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [selectedConversation, setSelectedConversation] = React.useState<Conversation | null>(null)
  const [newTitle, setNewTitle] = React.useState('')
  const tChat = useChatTranslation()

  // 获取历史对话
  React.useEffect(() => {
    if (user?.id) {
      conversationService
        .fetchConversations(user.id)
        .then(setConversations)
        .catch((error) => console.error('获取会话列表失败:', error))
    }
  }, [user?.id, setConversations])

  // 将 conversations Record 转换为数组
  const conversationsList = React.useMemo(() => {
    return Object.values(conversations).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }, [conversations])

  // 事件处理函数
  const handleLogout = async () => {
    try {
      await signOut()
      // signOut 已经处理了导航，不需要再手动跳转
    } catch (error) {
      console.error('退出登录失败:', error)
    }
  }

  const handleConversationSelect = (conversationId: string) => {
    router.push(`/chat/${conversationId}`)
  }

  const handleRenameConversation = async () => {
    if (!selectedConversation || !newTitle.trim()) return

    const success = await renameConversation(selectedConversation.id, newTitle)
    if (success) {
      setRenameDialogOpen(false)
      setSelectedConversation(null)
      setNewTitle('')
    }
  }

  const handleDeleteClick = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConversation = async () => {
    if (!selectedConversation) return

    const success = await removeConversation(selectedConversation.id)
    if (success) {
      setDeleteDialogOpen(false)
      setSelectedConversation(null)
    }
  }

  const openRenameDialog = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setNewTitle(getConversationTitle(conversation))
    setRenameDialogOpen(true)
  }

  return (
    <>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <SidebarLogo />
        </SidebarHeader>

        <SidebarContent>
          <NavigationSection />

          <ConversationHistory
            conversations={conversationsList}
            onSelect={handleConversationSelect}
            onRename={openRenameDialog}
            onDelete={handleDeleteClick}
            getTitle={getConversationTitle}
          />
        </SidebarContent>

        <SidebarFooter>
          {user && <SidebarUserMenu user={user} onLogout={handleLogout} />}
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      {/* 对话框组件 */}
      <RenameDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        title={tChat('renameConversationTitle')}
        value={newTitle}
        onChange={setNewTitle}
        onConfirm={handleRenameConversation}
        isLoading={isLoading}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConversation}
        title={tChat('deleteConfirmTitle')}
        description={selectedConversation
          ? tChat('deleteConfirmWithTitle', { title: getConversationTitle(selectedConversation) })
          : tChat('deleteConfirmDescription')}
        isLoading={isLoading}
      />
    </>
  )
}
