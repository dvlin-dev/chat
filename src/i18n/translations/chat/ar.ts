import en from './en'

const ar = {
  newConversation: 'محادثة جديدة',
  deleteConversation: 'حذف المحادثة',
  clearHistory: 'مسح السجل',
  sendMessage: 'إرسال رسالة',
  regenerate: 'إعادة إنشاء',
  copy: 'نسخ',
  copySuccess: 'تم النسخ إلى الحافظة',
  typing: 'يكتب...',
  thinking: 'يفكر...',
  messagePlaceholder: 'اكتب رسالتك...',
  attachFile: 'إرفاق ملف',
  referenceNote: 'مرجع ملاحظة',
  history: 'السجل',
  noHistory: 'لا يوجد سجل محادثات',
  webSearch: 'البحث في الويب',
  // رسائل الخطأ
  sendFailed: 'فشل إرسال الرسالة',
  networkError: 'خطأ في الشبكة، يرجى التحقق من اتصالك',
  serverError: 'خطأ في الخادم، يرجى المحاولة مرة أخرى لاحقاً',
  quotaExceeded: 'تم تجاوز الحصة المسموحة',
  // رسائل النجاح
  conversationDeleted: 'تم حذف المحادثة',
  conversationRenamed: 'تم إعادة تسمية المحادثة',
  historyCleared: 'تم مسح السجل',
  messageDeleted: 'تم حذف الرسالة',
  renameFailed: 'فشلت إعادة التسمية، يرجى المحاولة مرة أخرى',
  deleteFailed: 'فشل الحذف، يرجى المحاولة مرة أخرى',
  // الواجهة والحوارات
  renameConversationTitle: 'إعادة تسمية المحادثة',
  deleteConfirmTitle: 'تأكيد الحذف',
  deleteConfirmDescription: 'هذا الإجراء لا يمكن التراجع عنه. هل أنت متأكد من أنك تريد حذف هذه المحادثة؟',
  deleteConfirmWithTitle: 'هل أنت متأكد من أنك تريد حذف المحادثة "{{title}}"؟ هذا الإجراء لا يمكن التراجع عنه.',
  titleLabel: 'العنوان',
  newTitlePlaceholder: 'أدخل عنوان المحادثة الجديد',
  // حدود الخطأ
  chatErrorTitle: 'واجهت المحادثة مشكلة',
  chatErrorDescription: 'عذراً، واجه مكون المحادثة خطأ. يمكنك تجربة الإجراءات التالية للاستعادة.',
  reloadChat: 'إعادة تحميل المحادثة',
  backToChatList: 'العودة إلى قائمة المحادثات',
  chatSeoDescription: 'محادثة مع المساعد الذكي',

  // المفاتيح المكملة المفقودة
  voiceTranscriptionFailed: 'فشل النقل الصوتي',
  voiceTranscriptionError: 'فشل النقل الصوتي، يرجى المحاولة مرة أخرى',
  conversation: 'محادثة',
  askAnything: 'اسأل أي شيء',
  speak: 'تحدث',
  search: 'بحث',
  tasks: 'المهام',
  companions: 'المساعدين',
  conversations: 'المحادثات',
  // متعلق بنتائج البحث
  searchResults: 'نتائج البحث',
  searchResultsCount: '{{count}} نتيجة',
  noSearchResults: 'لا توجد نتائج بحث',
  tryOtherKeywords: 'يرجى تجربة كلمات بحث أخرى',
  searchFailed: 'فشل البحث',
  searching: 'البحث',
  searched: 'تم البحث',
  networkConnectionError: 'خطأ في اتصال الشبكة',
  searchingDots: 'جاري البحث...',
  cannotOpenLink: 'لا يمكن فتح هذا الرابط',
  openLinkError: 'حدث خطأ أثناء فتح الرابط',
  // Empty states
  emptyNewConversation: 'بدء محادثة جديدة',
  noMessages: 'لا توجد رسائل بعد',
} as const satisfies Record<keyof typeof en, string>

export default ar