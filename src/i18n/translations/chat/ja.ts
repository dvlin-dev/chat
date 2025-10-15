import en from './en'

const ja = {
  newConversation: '新しい会話',
  deleteConversation: '会話を削除',
  clearHistory: '履歴をクリア',
  sendMessage: 'メッセージを送信',
  regenerate: '再生成',
  copy: 'コピー',
  copySuccess: 'クリップボードにコピーしました',
  typing: '入力中...',
  thinking: '考えています...',
  messagePlaceholder: 'メッセージを入力...',
  attachFile: 'ファイルを添付',
  referenceNote: 'ノートを参照',
  history: '履歴',
  noHistory: '会話履歴がありません',
  webSearch: 'ウェブ検索',
  // エラーメッセージ
  sendFailed: 'メッセージの送信に失敗しました',
  networkError: 'ネットワークエラーです。接続を確認してください',
  serverError: 'サーバーエラーです。しばらくしてから再試行してください',
  quotaExceeded: 'クォータを超過しました',
  // 成功メッセージ
  conversationDeleted: '会話を削除しました',
  conversationRenamed: '会話名を変更しました',
  historyCleared: '履歴をクリアしました',
  messageDeleted: 'メッセージを削除しました',
  renameFailed: '名前の変更に失敗しました。もう一度試してください',
  deleteFailed: '削除に失敗しました。もう一度試してください',
  // インターフェースと対話框
  renameConversationTitle: '会話名を変更',
  deleteConfirmTitle: '削除の確認',
  deleteConfirmDescription: 'この操作は取り消せません。この会話を削除してもよろしいですか？',
  deleteConfirmWithTitle: '会話「{{title}}」を削除してもよろしいですか？この操作は取り消せません。',
  titleLabel: 'タイトル',
  newTitlePlaceholder: '新しい会話タイトルを入力',
  // エラー境界
  chatErrorTitle: 'チャットに問題が発生しました',
  chatErrorDescription: 'チャットコンポーネントでエラーが発生しました。以下の操作で回復を試してください。',
  reloadChat: 'チャットを再読み込み',
  backToChatList: 'チャットリストに戻る',
  chatSeoDescription: 'AIアシスタントとチャット',

  // 補足の不足しているキー
  voiceTranscriptionFailed: '音声文字起こしに失敗しました',
  voiceTranscriptionError: '音声文字起こしに失敗しました。もう一度試してください',
  conversation: '会話',
  askAnything: '何でも質問してください',
  speak: '話す',
  search: '検索',
  tasks: 'タスク',
  companions: 'アシスタント',
  conversations: '会話',
  // 検索結果関連
  searchResults: '検索結果',
  searchResultsCount: '{{count}}件の結果',
  noSearchResults: '検索結果がありません',
  tryOtherKeywords: '他のキーワードで検索してください',
  searchFailed: '検索に失敗しました',
  searching: '検索中',
  searched: '検索完了',
  networkConnectionError: 'ネットワーク接続エラー',
  searchingDots: '検索中...',
  cannotOpenLink: 'このリンクを開けません',
  openLinkError: 'リンクを開く際にエラーが発生しました',
  // Empty states
  emptyNewConversation: '新しい会話を開始',
  noMessages: 'メッセージはまだありません',
} as const satisfies Record<keyof typeof en, string>

export default ja