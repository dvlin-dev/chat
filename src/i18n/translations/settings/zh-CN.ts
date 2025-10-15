import en from './en'

const zhCN = {
  // 标题和菜单
  settings: '设置',
  general: '通用',
  appearance: '外观',
  notifications: '通知',
  privacy: '隐私',
  security: '安全',
  advanced: '高级',
  about: '关于',
  version: '版本',
  checkUpdate: '检查更新',
  reportBug: '报告问题',
  feedback: '反馈',
  profile: '个人资料',
  preferences: '偏好设置',

  // 页面标题和描述
  profileDescription: '管理您的个人信息',
  securityDescription: '修改密码以保护您的账户安全',
  preferencesDescription: '自定义您的使用体验',
  verifyEmailTitle: '验证邮箱',
  verifyEmailDescription: '输入发送到 {email} 的验证码',

  // 个人资料
  username: '用户名',
  email: '邮箱',
  // 头像相关文案已移除
  emailCannotModify: '邮箱地址暂不支持修改',
  usernameSupports: '支持字母、数字、下划线和连字符',
  // 头像上传提示已移除

  // 主题选项
  theme: '主题',
  themeDescription: '选择您喜欢的界面主题',
  light: '浅色',
  lightDescription: '明亮的界面，适合日间使用',
  dark: '深色',
  darkDescription: '护眼的深色界面，适合夜间使用',
  system: '跟随系统',
  systemDescription: '自动切换，跟随系统设置',

  // 语言选项
  language: '语言',
  languageDescription: '选择界面显示语言',
  english: 'English',
  simplifiedChinese: '简体中文',
  languageFeatureInDevelopment: '注意：语言切换功能正在开发中，即将推出',
  selectLanguage: '选择语言',
  selectLanguageMessage: '请选择您偏好的语言',
  languageChangeNote: '选择后界面语言将立即更改',

  // 安全设置
  currentPassword: '当前密码',
  newPassword: '新密码',
  confirmPassword: '确认新密码',
  verificationCode: '验证码',
  sendVerificationCode: '发送验证码',
  sendCode: '发送验证码',
  resendCode: '重新发送',
  resendTimer: '重新发送 ({seconds}s)',
  backToModify: '返回修改',
  confirmModify: '确认修改',
  enterNewEmail: '请输入新的邮箱地址',

  // 密码强度
  passwordStrengthWeak: '弱',
  passwordStrengthMedium: '中等',
  passwordStrengthStrong: '强',
  passwordStrengthVeryStrong: '非常强',

  // 操作按钮
  save: '保存',
  saveChanges: '保存修改',
  saving: '保存中...',
  applyChanges: '应用更改',
  loading: '加载中...',

  // 密码规则和提示
  passwordMinLength: '密码至少需要 {length} 个字符',
  passwordStrengthTips: '• 密码长度至少6位\n• 建议包含字母、数字和特殊字符\n• 下一步将发送验证码到您的邮箱',
  verificationTips: '• 验证码有效期为10分钟\n• 如未收到验证码，请检查垃圾邮件\n• 修改密码后需要重新登录',

  // 用户名验证
  usernameMinLength: '用户名至少需要{min}个字符（当前{current}个）',
  usernameOnlyAllowedChars: '用户名只能包含字母、数字、下划线和连字符',
  usernamePlaceholder: '请输入用户名（{min}-{max}个字符）',

  // 密码输入提示
  enterCurrentPassword: '请输入当前密码',
  enterNewPassword: '请输入新密码（至少6位）',
  confirmNewPassword: '请再次输入新密码',
  enterVerificationCode: '请输入6位验证码',

  // 成功和错误消息
  profileUpdateSuccess: '个人资料更新成功',
  passwordChangeSuccess: '密码修改成功，请重新登录',
  verificationCodeSent: '验证码已发送至 {email}',
  verificationCodeResent: '验证码已重新发送',

  // 错误消息在 userTranslations 和 validationTranslations 中

  // 新增移动端设置项
  changePassword: '修改密码',
  dataManagement: '数据管理',

  // 补充缺失的keys
  selectThemeMode: '选择主题模式',
  systemMode: '系统模式',
  lightMode: '日间模式',
  darkMode: '夜间模式',
  databaseInfo: '数据库信息',
  storageType: '存储类型',
  databaseSize: '数据库大小',
  bufferZone: '缓冲区',
  pendingWrites: '{{count}} 个待写入',
  backToEdit: '返回修改',
  confirmChanges: '确认修改',
  verificationCodeHints: '• 验证码有效期为10分钟\n• 如未收到验证码，请检查垃圾邮件\n• 修改密码后需要重新登录',
  passwordHints: '• 密码长度至少6位\n• 建议包含字母、数字和特殊字符\n• 下一步将发送验证码到您的邮箱',
  status: '状态',
} as const satisfies Record<keyof typeof en, string>

export default zhCN
