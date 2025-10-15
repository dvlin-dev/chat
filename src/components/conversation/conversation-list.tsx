import React from 'react'
import { MoreHorizontal, Edit3, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Conversation } from '@/lib/types/conversation'
import { formatDate } from '@/lib/utils/date'
import { useChatTranslation, useCommonTranslation } from '@/lib/i18n-setup'

interface ConversationListProps {
  conversations: Conversation[]
  onSelect: (id: string) => void
  onRename: (conversation: Conversation) => void
  onDelete: (conversation: Conversation) => void
  getTitle: (conversation: Conversation) => string
}

export function ConversationList({
  conversations,
  onSelect,
  onRename,
  onDelete,
  getTitle,
}: ConversationListProps) {
  const tChat = useChatTranslation()
  
  if (conversations.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-muted-foreground">
        {tChat('noHistory')}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          onSelect={onSelect}
          onRename={onRename}
          onDelete={onDelete}
          getTitle={getTitle}
        />
      ))}
    </div>
  )
}

interface ConversationItemProps {
  conversation: Conversation
  onSelect: (id: string) => void
  onRename: (conversation: Conversation) => void
  onDelete: (conversation: Conversation) => void
  getTitle: (conversation: Conversation) => string
}

function ConversationItem({
  conversation,
  onSelect,
  onRename,
  onDelete,
  getTitle,
}: ConversationItemProps) {
  const tCommon = useCommonTranslation()
  
  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRename(conversation)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(conversation)
  }

  return (
    <div className="relative group/item rounded-md">
      <div className="flex items-center group-hover/item:bg-accent/50 rounded-md transition-colors">
        <Button
          variant="ghost"
          className="w-full justify-start h-auto py-2 px-2 flex-1 hover:bg-transparent"
          onClick={() => onSelect(conversation.id)}
        >
          <div className="flex flex-col items-start w-full">
            <span className="text-sm truncate w-full text-left">
              {getTitle(conversation)}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(conversation.updatedAt)}
            </span>
          </div>
        </Button>

        {/* 悬停时显示的操作菜单 */}
        <div className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 mr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-accent"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleRename}>
                <Edit3 className="mr-2 h-4 w-4" />
                {tCommon('edit')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {tCommon('delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}