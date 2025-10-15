import { ReactElement } from 'react'
import { useParams } from 'react-router-dom'
import { Seo } from '@/app/seo/seo'
import { ChatContainer } from '@/components/chat/chat-container'
import { useChatTranslation } from '@/lib/i18n-setup'

export function ChatPage(): ReactElement {
  const { conversationId } = useParams<{ conversationId?: string }>()
  const tChat = useChatTranslation()
  const title = conversationId ? tChat('history') : tChat('newConversation')

  return (
    <>
      <Seo title={title} description={tChat('chatSeoDescription')} />
      <ChatContainer conversationId={conversationId ?? null} />
    </>
  )
}
