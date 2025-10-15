/**
 * 国际化配置 - 基于 react-i18next
 * 简化版实现，从原 @moryflow/shared-i18n 迁移
 */

import i18n from 'i18next'
import { initReactI18next, useTranslation as useI18nextTranslation } from 'react-i18next'
import { useCallback } from 'react'
import translations from '@/i18n/translations'

// 支持的语言
export type SupportedLanguage = 'en' | 'zh-CN' | 'ja' | 'de' | 'ar'

// 翻译命名空间
export type TranslationNamespace =
  | 'common'
  | 'auth'
  | 'chat'
  | 'note'
  | 'user'
  | 'settings'
  | 'validation'
  | 'error'
  | 'date'
  | 'status'
  | 'audio'

// 插值参数
export interface InterpolationParams {
  [key: string]: string | number | boolean | Date
}

// 初始化 i18next
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: translations,
    lng: 'zh-CN', // 默认语言
    fallbackLng: 'zh-CN',
    defaultNS: 'common',
    ns: ['common', 'auth', 'chat', 'note', 'user', 'settings', 'validation', 'error', 'date', 'status', 'audio'],
    interpolation: {
      escapeValue: false, // React 已经转义
    },
    react: {
      useSuspense: false,
    },
  })
}

/**
 * 通用翻译 Hook
 * @param namespace - 翻译命名空间
 */
export function useTranslation(namespace: TranslationNamespace = 'common') {
  const { t: originalT, ready, i18n: i18nInstance } = useI18nextTranslation(namespace)

  const t = useCallback(
    (key: string, params?: InterpolationParams): string => {
      return params ? (originalT(key, params) as string) : (originalT(key) as string)
    },
    [originalT]
  )

  return {
    t,
    ready,
    language: i18nInstance.language as SupportedLanguage,
  }
}

/**
 * 各命名空间的快捷 Hook
 */
export const useCommonTranslation = () => {
  const { t } = useTranslation('common')
  return t
}

export const useAuthTranslation = () => {
  const { t } = useTranslation('auth')
  return t
}

export const useChatTranslation = () => {
  const { t } = useTranslation('chat')
  return t
}


export const useUserTranslation = () => {
  const { t } = useTranslation('user')
  return t
}

export const useSettingsTranslation = () => {
  const { t } = useTranslation('settings')
  return t
}

export const useStatusTranslation = () => {
  const { t } = useTranslation('status')
  return t
}

export const useValidationTranslation = () => {
  const { t } = useTranslation('validation')
  return t
}

export const useDateTranslation = () => {
  const { t } = useTranslation('date')
  return t
}

export const useErrorTranslation = () => {
  const { t } = useTranslation('error')
  return t
}

/**
 * 语言管理 Hook
 */
export const useLanguage = () => ({
  language: i18n.language as SupportedLanguage,
  setLanguage: async (lang: SupportedLanguage) => {
    await i18n.changeLanguage(lang)
  },
})

/**
 * 日期格式化 Hook
 */
export const useFormatter = () => ({
  formatDate: (value: Date | string) =>
    new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' }).format(
      value instanceof Date ? value : new Date(value)
    ),
})

/**
 * i18n 通用 Hook
 */
export const useI18n = () => ({
  language: i18n.language as SupportedLanguage,
  t: (key: string, params?: InterpolationParams) => i18n.t(key, params) as string,
})

/**
 * 占位函数：生成语言文件
 */
export function generateLocaleFiles() {
  return {}
}

/**
 * 占位函数：Next.js i18n 配置
 */
export function nextI18nConfig() {
  return {}
}
