import en from './en'

const ar = {
  // العناوين والقوائم
  settings: 'الإعدادات',
  general: 'عام',
  appearance: 'المظهر',
  notifications: 'الإشعارات',
  privacy: 'الخصوصية',
  security: 'الأمان',
  advanced: 'متقدم',
  about: 'حول',
  version: 'الإصدار',
  checkUpdate: 'التحقق من التحديثات',
  reportBug: 'الإبلاغ عن خطأ',
  feedback: 'الملاحظات',
  profile: 'الملف الشخصي',
  preferences: 'التفضيلات',

  // عناوين الصفحات والأوصاف
  profileDescription: 'إدارة معلوماتك الشخصية',
  securityDescription: 'تغيير كلمة المرور لتأمين حسابك',
  preferencesDescription: 'تخصيص تجربتك',
  verifyEmailTitle: 'تحقق من البريد الإلكتروني',
  verifyEmailDescription: 'أدخل رمز التحقق المرسل إلى {email}',

  // الملف الشخصي
  username: 'اسم المستخدم',
  email: 'البريد الإلكتروني',
  emailCannotModify: 'لا يمكن تعديل عنوان البريد الإلكتروني',
  usernameSupports: 'يدعم الأحرف والأرقام وعلامة الشرطة السفلية والواصلة',

  // خيارات المظهر
  theme: 'المظهر',
  themeDescription: 'اختر مظهر الواجهة المفضل لديك',
  light: 'فاتح',
  lightDescription: 'واجهة مشرقة، مناسبة للاستخدام النهاري',
  dark: 'داكن',
  darkDescription: 'واجهة داكنة مريحة للعين، مناسبة للاستخدام الليلي',
  system: 'اتبع النظام',
  systemDescription: 'تبديل تلقائي، يتبع إعدادات النظام',

  // خيارات اللغة
  language: 'اللغة',
  languageDescription: 'اختر لغة عرض الواجهة',
  english: 'الإنجليزية',
  simplifiedChinese: 'الصينية المبسطة',
  languageFeatureInDevelopment: 'ملاحظة: ميزة تبديل اللغة قيد التطوير، قادمة قريباً',
  selectLanguage: 'اختيار اللغة',
  selectLanguageMessage: 'اختر اللغة المفضلة لديك',
  languageChangeNote: 'ستتغير لغة الواجهة فوراً بعد الاختيار',

  // إعدادات الأمان
  currentPassword: 'كلمة المرور الحالية',
  newPassword: 'كلمة المرور الجديدة',
  confirmPassword: 'تأكيد كلمة المرور الجديدة',
  verificationCode: 'رمز التحقق',
  sendVerificationCode: 'إرسال رمز التحقق',
  sendCode: 'إرسال الرمز',
  resendCode: 'إعادة الإرسال',
  resendTimer: 'إعادة الإرسال ({seconds}ث)',
  backToModify: 'العودة للتعديل',
  confirmModify: 'تأكيد التعديل',
  enterNewEmail: 'أدخل البريد الإلكتروني الجديد',

  // قوة كلمة المرور
  passwordStrengthWeak: 'ضعيفة',
  passwordStrengthMedium: 'متوسطة',
  passwordStrengthStrong: 'قوية',
  passwordStrengthVeryStrong: 'قوية جداً',

  // أزرار العمليات
  save: 'حفظ',
  saveChanges: 'حفظ التغييرات',
  saving: 'جاري الحفظ...',
  applyChanges: 'تطبيق التغييرات',
  loading: 'جاري التحميل...',

  // قواعد وإرشادات كلمة المرور
  passwordMinLength: 'كلمة المرور يجب أن تكون على الأقل {length} أحرف',
  passwordStrengthTips: '• طول كلمة المرور على الأقل 6 أحرف\n• يُنصح بتضمين أحرف وأرقام ورموز خاصة\n• الخطوة التالية ستُرسل رمز التحقق إلى بريدك الإلكتروني',
  verificationTips: '• رمز التحقق صالح لمدة 10 دقائق\n• إذا لم تستلم الرمز، تحقق من مجلد الرسائل غير المرغوب فيها\n• ستحتاج لتسجيل الدخول مجدداً بعد تغيير كلمة المرور',

  // التحقق من اسم المستخدم
  usernameMinLength: 'اسم المستخدم يجب أن يكون على الأقل {min} أحرف (حالياً {current})',
  usernameOnlyAllowedChars: 'اسم المستخدم يمكن أن يحتوي فقط على أحرف وأرقام وعلامة الشرطة السفلية والواصلة',
  usernamePlaceholder: 'أدخل اسم المستخدم ({min}-{max} أحرف)',

  // إرشادات إدخال كلمة المرور
  enterCurrentPassword: 'يرجى إدخال كلمة المرور الحالية',
  enterNewPassword: 'يرجى إدخال كلمة مرور جديدة (على الأقل 6 أحرف)',
  confirmNewPassword: 'يرجى إدخال كلمة المرور الجديدة مرة أخرى',
  enterVerificationCode: 'يرجى إدخال رمز التحقق المكون من 6 أرقام',

  // رسائل النجاح والخطأ
  profileUpdateSuccess: 'تم تحديث الملف الشخصي بنجاح',
  passwordChangeSuccess: 'تم تغيير كلمة المرور بنجاح، يرجى تسجيل الدخول مرة أخرى',
  verificationCodeSent: 'تم إرسال رمز التحقق إلى {email}',
  verificationCodeResent: 'تم إعادة إرسال رمز التحقق',

  // رسائل الخطأ موجودة في userTranslations و validationTranslations

  // عناصر الإعدادات الجديدة للجوال
  changePassword: 'تغيير كلمة المرور',
  dataManagement: 'إدارة البيانات',

  // المفاتيح المكملة المفقودة
  selectThemeMode: 'اختر وضع المظهر',
  systemMode: 'وضع النظام',
  lightMode: 'الوضع الفاتح',
  darkMode: 'الوضع الداكن',
  databaseInfo: 'معلومات قاعدة البيانات',
  storageType: 'نوع التخزين',
  databaseSize: 'حجم قاعدة البيانات',
  bufferZone: 'المنطقة الاحتياطية',
  pendingWrites: '{{count}} عمليات كتابة معلقة',
  backToEdit: 'العودة للتحرير',
  confirmChanges: 'تأكيد التغييرات',
  verificationCodeHints: '• رمز التحقق صالح لمدة 10 دقائق\n• إذا لم تستلم الرمز، تحقق من مجلد الرسائل غير المرغوب فيها\n• ستحتاج لتسجيل الدخول مجدداً بعد تغيير كلمة المرور',
  passwordHints: '• طول كلمة المرور على الأقل 6 أحرف\n• يُنصح بتضمين أحرف وأرقام ورموز خاصة\n• الخطوة التالية ستُرسل رمز التحقق إلى بريدك الإلكتروني',
  status: 'الحالة',
} as const satisfies Record<keyof typeof en, string>

export default ar