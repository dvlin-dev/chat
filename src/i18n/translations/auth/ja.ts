const ja = {
  signIn: 'サインイン',
  signUp: 'サインアップ',
  signOut: 'サインアウト',
  email: 'メールアドレス',
  password: 'パスワード',
  confirmPassword: 'パスワードを確認',
  forgotPassword: 'パスワードをお忘れですか？',
  resetPassword: 'パスワードをリセット',
  verificationCode: '認証コード',
  sendCode: 'コードを送信',
  resendCode: 'コードを再送',
  rememberMe: '次回から自動でサインイン',
  orContinueWith: 'または次の方法で続行',
  signInWithApple: 'Appleで続行',
  signInWithGoogle: 'Googleで続行',
  signInWithGithub: 'GitHubで続行',
  signInWithEmail: 'メールでサインイン',
  signInWithCode: 'コードでサインイン',
  codeSignIn: 'コードサインイン',

  // 页面标题和描述
  welcomeToChat: 'Chatへようこそ',
  signInDescription: 'アカウントにサインインするか、新しく作成してください',
  verifyYourEmail: 'メールアドレスを確認',
  enterVerificationCode: '認証コードを入力',
  resetYourPassword: 'パスワードをリセット',
  verificationDescription: '登録を完了するため、メールに送信されたコードを入力してください',
  verificationSignInDescription: 'サインインするため認証コードを入力してください',
  forgotPasswordDescription: 'メールアドレスを入力すると、認証コードを送信します',
  resetPasswordDescription: 'メールに送信された認証コードを入力してください',

  // 操作提示
  noAccount: 'アカウントをお持ちでない方は ',
  haveAccount: 'すでにアカウントをお持ちの方は ',
  emailValidation: 'メール認証',
  sendVerificationCode: '認証コードを送信',
  sendResetCode: 'リセットコードを送信',
  passwordResetVerification: 'パスワードリセット認証',
  createPassword: 'パスワードを作成',
  enterPassword: 'パスワードを入力',
  createAccount: 'アカウントを作成',

  // 其他操作
  back: '戻る',
  verify: '認証',
  sending: '送信中...',
  codeSentTo: '認証コードを送信しました：',
  noCodeReceived: 'コードが届きませんか？',
  resendTimer: '{{seconds}}秒後に再送可能',
  backToSignIn: 'サインインに戻る',
  enterYourEmail: 'メールアドレスを入力',
  forgotPasswordNote: 'メールアドレスに認証コードを送信します',

  // 错误信息
  emailRequired: 'メールアドレスが必要です',
  emailInvalid: '有効なメールアドレスを入力してください',
  passwordRequired: 'パスワードが必要です',
  passwordTooShort: 'パスワードは6文字以上である必要があります',
  passwordMismatch: 'パスワードが一致しません',
  codeRequired: '認証コードが必要です',
  codeInvalid: '認証コードが無効です',
  userNotFound: 'ユーザーが見つかりません',
  incorrectPassword: 'パスワードが間違っています',
  accountLocked: 'アカウントがロックされています',
  tooManyAttempts: '試行回数が多すぎます。しばらく待ってから再試行してください',
  sessionExpired: 'セッションが期限切れです。再度サインインしてください',

  // 成功消息
  signInSuccess: 'サインインしました',
  signOutSuccess: 'サインアウトしました',
  verificationCodeSent: 'メールに認証コードを送信しました',
  passwordResetSuccess: 'パスワードがリセットされました',
  accountCreated: 'アカウントが作成されました',

  // 新增移动端特定文本
  signInToChat: 'Chatにサインイン',
  welcomeBack: 'おかえりなさい！続行するにはサインインしてください',
  signInWithVerificationCode: '認証コードでサインイン',
  userNotFoundPrompt: 'このメールアドレスは登録されていません。サインアップしますか？',
  invalidCredentials: 'パスワードが無効です',
  signInFailed: 'サインインに失敗しました',
  failedToSendCode: 'コードの送信に失敗しました',

  // 新增缺失的keys
  emailPlaceholder: 'm@example.com',
  createAccountButton: 'アカウントを作成',
  alreadyHaveAccount: 'すでにアカウントをお持ちですか？',
  enterSixDigitCode: '6桁のコードを入力してください',
  verificationFailed: '認証に失敗しました',
  failedToResendCode: 'コードの再送に失敗しました',

  // 密码强度
  passwordStrength: 'パスワード強度',
  weak: '弱い',
  medium: '普通',
  strong: '強い',
  veryStrong: '非常に強い',
  didntReceiveCode: 'コードが届きませんか？再送する',
  backTo: '{{mode}}に戻る',
  pleaseLogin: 'まずログインしてください',

  // 标题相关
  signUpTitle: 'サインアップ',
  forgotPasswordTitle: 'パスワードを忘れた場合',
  verifyEmailTitle: 'メールを確認',
  signUpWelcome: 'Chatを開始するためにサインアップ',
  forgotPasswordPageDescription: 'メールアドレスを入力すると、認証コードを送信します',
  verificationCodeSentTo: '{{email}}に送信された認証コードを入力してください',

  // ソーシャルログイン関連
  appleSignInUnavailable: 'このデバイスではAppleサインインを利用できません',
  userCancelledLogin: 'ユーザーがログインをキャンセルしました',
  socialLoginFailed: 'ソーシャルログインに失敗しました',
  socialSignInComingSoon: '{{provider}}サインインは近日提供予定です',
  socialLoginError: 'サインインに失敗しました。もう一度お試しください。',
} as const

export default ja
