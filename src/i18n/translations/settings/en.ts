const en = {
  // 标题和菜单
  settings: 'Settings',
  general: 'General',
  appearance: 'Appearance',
  notifications: 'Notifications',
  privacy: 'Privacy',
  security: 'Security',
  advanced: 'Advanced',
  about: 'About',
  version: 'Version',
  checkUpdate: 'Check for Updates',
  reportBug: 'Report Bug',
  feedback: 'Feedback',
  profile: 'Profile',
  preferences: 'Preferences',

  // 页面标题和描述
  profileDescription: 'Manage your personal information',
  securityDescription: 'Change your password to secure your account',
  preferencesDescription: 'Customize your experience',
  verifyEmailTitle: 'Verify Email',
  verifyEmailDescription: 'Enter the verification code sent to {email}',

  // 个人资料
  username: 'Username',
  email: 'Email',
  // avatar related texts removed
  emailCannotModify: 'Email address cannot be modified',
  usernameSupports: 'Supports letters, numbers, underscores and hyphens',
  // avatar upload tip removed

  // 主题选项
  theme: 'Theme',
  themeDescription: 'Choose your preferred interface theme',
  light: 'Light',
  lightDescription: 'Bright interface, suitable for daytime use',
  dark: 'Dark',
  darkDescription: 'Eye-friendly dark interface, suitable for nighttime use',
  system: 'Follow System',
  systemDescription: 'Automatically switch, follow system settings',

  // 语言选项
  language: 'Language',
  languageDescription: 'Choose interface display language',
  english: 'English',
  simplifiedChinese: 'Simplified Chinese',
  languageFeatureInDevelopment: 'Note: Language switching feature is in development, coming soon',
  selectLanguage: 'Select Language',
  selectLanguageMessage: 'Choose your preferred language',
  languageChangeNote: 'Interface language will change immediately after selection',

  // 安全设置
  currentPassword: 'Current Password',
  newPassword: 'New Password',
  confirmPassword: 'Confirm New Password',
  verificationCode: 'Verification Code',
  sendVerificationCode: 'Send Verification Code',
  sendCode: 'Send Code',
  resendCode: 'Resend',
  resendTimer: 'Resend ({seconds}s)',
  backToModify: 'Back to modify',
  confirmModify: 'Confirm Modification',
  enterNewEmail: 'Enter new email',

  // 密码强度
  passwordStrengthWeak: 'Weak',
  passwordStrengthMedium: 'Medium',
  passwordStrengthStrong: 'Strong',
  passwordStrengthVeryStrong: 'Very Strong',

  // 操作按钮
  save: 'Save',
  saveChanges: 'Save Changes',
  saving: 'Saving...',
  applyChanges: 'Apply Changes',
  loading: 'Loading...',

  // 密码规则和提示
  passwordMinLength: 'Password must be at least {length} characters',
  passwordStrengthTips: '• Password length at least 6 characters\n• Recommended to include letters, numbers and special characters\n• Next step will send verification code to your email',
  verificationTips: '• Verification code is valid for 10 minutes\n• If you don\'t receive the code, please check spam folder\n• You need to log in again after changing password',

  // 用户名验证
  usernameMinLength: 'Username must be at least {min} characters (currently {current})',
  usernameOnlyAllowedChars: 'Username can only contain letters, numbers, underscores and hyphens',
  usernamePlaceholder: 'Please enter username ({min}-{max} characters)',

  // 密码输入提示
  enterCurrentPassword: 'Please enter current password',
  enterNewPassword: 'Please enter new password (at least 6 characters)',
  confirmNewPassword: 'Please enter new password again',
  enterVerificationCode: 'Please enter 6-digit verification code',

  // 成功和错误消息
  profileUpdateSuccess: 'Profile updated successfully',
  passwordChangeSuccess: 'Password changed successfully, please log in again',
  verificationCodeSent: 'Verification code sent to {email}',
  verificationCodeResent: 'Verification code resent',

  // 错误消息在 userTranslations 和 validationTranslations 中

  // 新增移动端设置项
  changePassword: 'Change Password',
  dataManagement: 'Data Management',

  // 补充缺失的keys
  selectThemeMode: 'Select Theme Mode',
  systemMode: 'System Mode',
  lightMode: 'Light Mode',
  darkMode: 'Dark Mode',
  databaseInfo: 'Database Info',
  storageType: 'Storage Type',
  databaseSize: 'Database Size',
  bufferZone: 'Buffer Zone',
  pendingWrites: '{{count}} pending writes',
  backToEdit: 'Back to Edit',
  confirmChanges: 'Confirm Changes',
  verificationCodeHints: '• Verification code is valid for 10 minutes\n• If you don\'t receive the code, please check spam folder\n• You need to log in again after changing password',
  passwordHints: '• Password length at least 6 characters\n• Recommended to include letters, numbers and special characters\n• Next step will send verification code to your email',
  status: 'Status',
} as const

export default en
