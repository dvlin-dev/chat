import React from 'react'
import { History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useSidebar } from '@/components/ui/sidebar'
import { ConversationList } from '@/components/conversation/conversation-list'
import type { Conversation } from '@/lib/types/conversation'
import { useChatTranslation } from '@/lib/i18n-setup'

interface ConversationHistoryProps {
  conversations: Conversation[]
  onSelect: (conversationId: string) => void
  onRename: (conversation: Conversation) => void
  onDelete: (conversation: Conversation) => void
  getTitle: (conversation: Conversation) => string
}

export function ConversationHistory({
  conversations,
  onSelect,
  onRename,
  onDelete,
  getTitle,
}: ConversationHistoryProps) {
  const tChat = useChatTranslation()
  const { state } = useSidebar()
  const effectiveState = state

  if (effectiveState === 'expanded') {
    return (
      <div className="mt-2 px-2">
        <Button
          variant="ghost"
          className="w-full justify-start h-10 px-3 mb-2"
          onClick={() => {}} // 可以添加展开/收起功能
        >
          <History className="mr-2 h-4 w-4" />
          {tChat('history')}
        </Button>

        <ScrollArea className="h-[400px]">
          <ConversationList
            conversations={conversations}
            onSelect={onSelect}
            onRename={onRename}
            onDelete={onDelete}
            getTitle={getTitle}
          />
        </ScrollArea>
      </div>
    )
  }

  // 小面板时的历史记录 icon
  return (
    <div className="mt-2 px-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-center h-10 px-0 hover:bg-accent"
          >
            <History className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="right" align="start" className="w-80 p-0">
          <div className="p-3 border-b">
            <h4 className="text-sm font-medium">{tChat('history')}</h4>
          </div>
          <ScrollArea className="h-80">
            <div className="p-2">
              <ConversationList
                conversations={conversations}
                onSelect={onSelect}
                onRename={onRename}
                onDelete={onDelete}
                getTitle={getTitle}
              />
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  )
}