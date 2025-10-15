import { Helmet } from 'react-helmet-async'

interface SeoProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
}

/**
 * Seo - SEO 元数据组件
 *
 * 使用 react-helmet-async 管理页面的 meta 标签
 * 用于设置页面标题、描述、关键词等 SEO 信息
 */
export function Seo({ title, description, keywords, image, url }: SeoProps) {
  const defaultTitle = 'AI Chatbot'
  const defaultDescription = 'AI-powered chatbot with Supabase integration'
  const siteName = 'AI Chatbot'

  const pageTitle = title ? `${title} - ${siteName}` : defaultTitle
  const pageDescription = description || defaultDescription
  const pageUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      {pageUrl && <meta property="og:url" content={pageUrl} />}
      {image && <meta property="og:image" content={image} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  )
}
