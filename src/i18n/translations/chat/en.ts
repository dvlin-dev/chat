const en = {
  newConversation: 'New Conversation',
  deleteConversation: 'Delete Conversation',
  clearHistory: 'Clear History',
  sendMessage: 'Send Message',
  regenerate: 'Regenerate',
  copy: 'Copy',
  copySuccess: 'Copied to clipboard',
  typing: 'Typing...',
  thinking: 'Thinking...',
  messagePlaceholder: 'Type your message...',
  attachFile: 'Attach File',
  referenceNote: 'Reference Note',
  history: 'History',
  noHistory: 'No conversation history',
  // 错误信息
  sendFailed: 'Failed to send message',
  networkError: 'Network error, please check your connection',
  serverError: 'Server error, please try again later',
  quotaExceeded: 'Quota exceeded',
  // 成功消息
  conversationDeleted: 'Conversation deleted',
  conversationRenamed: 'Conversation renamed',
  historyCleared: 'History cleared',
  messageDeleted: 'Message deleted',
  renameFailed: 'Rename failed, please try again',
  deleteFailed: 'Delete failed, please try again',
  // 界面与对话框
  renameConversationTitle: 'Rename Conversation',
  deleteConfirmTitle: 'Delete Confirmation',
  deleteConfirmDescription: 'This action cannot be undone. Are you sure you want to delete this conversation?',
  deleteConfirmWithTitle: 'Are you sure you want to delete conversation "{{title}}"? This action cannot be undone.',
  titleLabel: 'Title',
  newTitlePlaceholder: 'Enter new conversation title',
  // 错误边界
  chatErrorTitle: 'Chat encountered a problem',
  chatErrorDescription: 'Sorry, the chat component has encountered an error. You can try the following actions to recover.',
  reloadChat: 'Reload Chat',
  backToChatList: 'Back to chat list',
  chatSeoDescription: 'Chat with the AI assistant',

  // 补充缺失的keys
  voiceTranscriptionFailed: 'Voice transcription failed',
  voiceTranscriptionError: 'Voice transcription failed, please try again',
  conversation: 'Conversation',
  askAnything: 'Ask Anything',
  speak: 'Speak',
  tasks: 'Tasks',
  companions: 'Companions',
  conversations: 'Conversations',
  networkConnectionError: 'Network connection error',
  // Empty states
  emptyNewConversation: 'Start a new conversation',
  noMessages: 'No messages yet',
} as const

export default en
