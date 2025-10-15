import en from './en'

const ja = {
  // タイトルとメニュー
  settings: '設定',
  general: '一般',
  appearance: '外観',
  notifications: '通知',
  privacy: 'プライバシー',
  security: 'セキュリティ',
  advanced: '詳細設定',
  about: 'このアプリについて',
  version: 'バージョン',
  checkUpdate: 'アップデートを確認',
  reportBug: 'バグレポート',
  feedback: 'フィードバック',
  profile: 'プロフィール',
  preferences: '設定',

  // ページタイトルと説明
  profileDescription: '個人情報を管理',
  securityDescription: 'アカウントを保護するためにパスワードを変更',
  preferencesDescription: 'あなたの体験をカスタマイズ',
  verifyEmailTitle: 'メールを認証',
  verifyEmailDescription: '{email}に送信された認証コードを入力',

  // プロフィール
  username: 'ユーザー名',
  email: 'メールアドレス',
  emailCannotModify: 'メールアドレスは変更できません',
  usernameSupports: '文字、数字、アンダースコア、ハイフンが使用可能',

  // テーマオプション
  theme: 'テーマ',
  themeDescription: 'お好みのインターフェーステーマを選択',
  light: 'ライト',
  lightDescription: '明るいインターフェース、日中の使用に適しています',
  dark: 'ダーク',
  darkDescription: '目に優しいダークインターフェース、夜間の使用に適しています',
  system: 'システムに従う',
  systemDescription: '自動切り替え、システム設定に従います',

  // 言語オプション
  language: '言語',
  languageDescription: 'インターフェース表示言語を選択',
  english: '英語',
  simplifiedChinese: '簡体字中国語',
  languageFeatureInDevelopment: '注：言語切り替え機能は開発中です。近日公開予定',
  selectLanguage: '言語を選択',
  selectLanguageMessage: 'お好みの言語を選択してください',
  languageChangeNote: '選択後、インターフェース言語がすぐに変更されます',

  // セキュリティ設定
  currentPassword: '現在のパスワード',
  newPassword: '新しいパスワード',
  confirmPassword: '新しいパスワードの確認',
  verificationCode: '認証コード',
  sendVerificationCode: '認証コードを送信',
  sendCode: 'コードを送信',
  resendCode: '再送信',
  resendTimer: '再送信（{seconds}秒）',
  backToModify: '戻って修正',
  confirmModify: '変更を確認',
  enterNewEmail: '新しいメールアドレスを入力',

  // パスワード強度
  passwordStrengthWeak: '弱い',
  passwordStrengthMedium: '普通',
  passwordStrengthStrong: '強い',
  passwordStrengthVeryStrong: '非常に強い',

  // 操作ボタン
  save: '保存',
  saveChanges: '変更を保存',
  saving: '保存中...',
  applyChanges: '変更を適用',
  loading: '読み込み中...',

  // パスワードルールとヒント
  passwordMinLength: 'パスワードは最低{length}文字である必要があります',
  passwordStrengthTips: '• パスワードは最低6文字\n• 文字、数字、特殊文字を含むことを推奨\n• 次のステップでメールに認証コードを送信します',
  verificationTips: '• 認証コードは10分間有効です\n• コードが届かない場合は、スパムフォルダーをご確認ください\n• パスワード変更後は再ログインが必要です',

  // ユーザー名検証
  usernameMinLength: 'ユーザー名は最低{min}文字必要です（現在{current}文字）',
  usernameOnlyAllowedChars: 'ユーザー名は文字、数字、アンダースコア、ハイフンのみ使用可能',
  usernamePlaceholder: 'ユーザー名を入力（{min}-{max}文字）',

  // パスワード入力ヒント
  enterCurrentPassword: '現在のパスワードを入力してください',
  enterNewPassword: '新しいパスワードを入力してください（最低6文字）',
  confirmNewPassword: '新しいパスワードを再度入力してください',
  enterVerificationCode: '6桁の認証コードを入力してください',

  // 成功とエラーメッセージ
  profileUpdateSuccess: 'プロフィールを更新しました',
  passwordChangeSuccess: 'パスワードを変更しました。再ログインしてください',
  verificationCodeSent: '認証コードを{email}に送信しました',
  verificationCodeResent: '認証コードを再送信しました',

  // エラーメッセージはuserTranslationsとvalidationTranslationsに含まれています

  // 新規追加のモバイル設定項目
  changePassword: 'パスワードの変更',
  dataManagement: 'データ管理',

  // 補足の不足しているキー
  selectThemeMode: 'テーマモードを選択',
  systemMode: 'システムモード',
  lightMode: 'ライトモード',
  darkMode: 'ダークモード',
  databaseInfo: 'データベース情報',
  storageType: 'ストレージタイプ',
  databaseSize: 'データベースサイズ',
  bufferZone: 'バッファゾーン',
  pendingWrites: '{{count}}件の保留中の書き込み',
  backToEdit: '編集に戻る',
  confirmChanges: '変更を確認',
  verificationCodeHints: '• 認証コードは10分間有効です\n• コードが届かない場合は、スパムフォルダーをご確認ください\n• パスワード変更後は再ログインが必要です',
  passwordHints: '• パスワードは最低6文字\n• 文字、数字、特殊文字を含むことを推奨\n• 次のステップでメールに認証コードを送信します',
  status: 'ステータス',
} as const satisfies Record<keyof typeof en, string>

export default ja