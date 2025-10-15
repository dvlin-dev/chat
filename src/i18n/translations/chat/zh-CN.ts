import en from './en'

const zhCN = {
  newConversation: '新会话',
  deleteConversation: '删除会话',
  clearHistory: '清空历史',
  sendMessage: '发送消息',
  regenerate: '重新生成',
  copy: '复制',
  copySuccess: '已复制到剪贴板',
  typing: '正在输入...',
  thinking: '思考中...',
  messagePlaceholder: '输入您的消息...',
  attachFile: '附加文件',
  referenceNote: '引用笔记',
  history: '历史记录',
  noHistory: '暂无历史记录',
  webSearch: '联网搜索',
  // 错误信息
  sendFailed: '发送消息失败',
  networkError: '网络错误，请检查您的连接',
  serverError: '服务器错误，请稍后重试',
  quotaExceeded: '已超出配额',
  // 成功消息
  conversationDeleted: '会话已删除',
  conversationRenamed: '会话已重命名',
  historyCleared: '历史已清空',
  messageDeleted: '消息已删除',
  renameFailed: '重命名失败，请重试',
  deleteFailed: '删除失败，请重试',
  // 界面与对话框
  renameConversationTitle: '重命名对话',
  deleteConfirmTitle: '确认删除',
  deleteConfirmDescription: '此操作无法撤销。确定要删除这个对话吗？',
  deleteConfirmWithTitle: '确定要删除对话“{{title}}”吗？此操作无法撤销。',
  titleLabel: '标题',
  newTitlePlaceholder: '请输入新的对话标题',
  // 错误边界
  chatErrorTitle: '聊天功能遇到问题',
  chatErrorDescription: '抱歉，聊天组件出现了错误。您可以尝试以下操作来恢复。',
  reloadChat: '重新加载聊天',
  backToChatList: '返回聊天列表',
  chatSeoDescription: '与 AI 助手进行智能对话',

  // 补充缺失的keys
  voiceTranscriptionFailed: '语音转写失败',
  voiceTranscriptionError: '语音转写失败，请重试',
  conversation: '对话',
  askAnything: '请问何事...',
  speak: '语音',
  search: '搜索',
  tasks: '任务',
  companions: '助手',
  conversations: '对话列表',
  // 搜索结果相关
  searchResults: '搜索结果',
  searchResultsCount: '{{count}} 个结果',
  noSearchResults: '暂无搜索结果',
  tryOtherKeywords: '请尝试其他搜索关键词',
  searchFailed: '搜索失败',
  searching: '正在搜索',
  searched: '已搜索',
  networkConnectionError: '网络连接异常',
  searchingDots: '搜索中...',
  cannotOpenLink: '无法打开此链接',
  openLinkError: '打开链接时出现错误',
  // Empty states
  emptyNewConversation: '开始新的对话',
  noMessages: '暂无消息',
} as const satisfies Record<keyof typeof en, string>

export default zhCN
