/**
 * Markdown消息渲染组件
 * 支持在消息内容中嵌入参考资料引用
 */

import { memo, useMemo } from 'react'
import type React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownMessageProps {
  content: string
  className?: string
}

export const MarkdownMessage = memo(function MarkdownMessage({
  content,
  className,
}: MarkdownMessageProps) {
  const processedContent = useMemo(() => content, [content])

  return (
    <div
      className={cn(
        'prose prose-sm dark:prose-invert max-w-none',
        'prose-p:leading-relaxed prose-p:mb-3',
        'prose-headings:font-semibold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base',
        'prose-ul:my-2 prose-ol:my-2 prose-li:my-1',
        'prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
        'prose-pre:bg-muted prose-pre:p-3 prose-pre:rounded-lg',
        'prose-blockquote:border-l-4 prose-blockquote:border-muted-foreground/30 prose-blockquote:pl-4',
        'prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline',
        'prose-strong:font-semibold',
        'prose-img:rounded-lg prose-img:shadow-md',
        'prose-table:w-full prose-th:text-left prose-th:border-b prose-th:pb-2',
        'prose-td:border-b prose-td:py-2',
        // 上标样式
        'prose-sup:text-xs prose-sup:text-blue-600 dark:prose-sup:text-blue-400',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 自定义链接渲染，添加target="_blank"
          a: ({ node, children, href, ...props }) => {
            // 检查是否是上标引用链接
            const isSuperscript = children?.toString().includes('^')

            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'text-blue-600 dark:text-blue-400 hover:underline',
                  isSuperscript && 'text-xs align-super no-underline hover:underline'
                )}
                {...props}
              >
                {isSuperscript ? children?.toString().replace(/\^/g, '') : children}
              </a>
            )
          },
          // 自定义代码块渲染
          code: (rawProps) => {
            const { className, children, ...props } = rawProps as React.DetailedHTMLProps<
              React.HTMLAttributes<HTMLElement>,
              HTMLElement
            > & { inline?: boolean }
            const inline = (rawProps as { inline?: boolean }).inline === true
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <pre className="bg-muted p-3 rounded-lg overflow-x-auto">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            )
          },
          // 自定义引用块
          blockquote: ({ node, children, ...props }) => (
            <blockquote
              className="border-l-4 border-muted-foreground/30 pl-4 italic my-3"
              {...props}
            >
              {children}
            </blockquote>
          ),
          // 自定义表格
          table: ({ node, children, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse" {...props}>
                {children}
              </table>
            </div>
          ),
          // 自定义列表
          ul: ({ node, children, ...props }) => (
            <ul className="list-disc list-inside space-y-1 my-2" {...props}>
              {children}
            </ul>
          ),
          ol: ({ node, children, ...props }) => (
            <ol className="list-decimal list-inside space-y-1 my-2" {...props}>
              {children}
            </ol>
          ),
          // 处理段落中的换行
          p: ({ node, children, ...props }) => (
            <p className="mb-3 last:mb-0" {...props}>
              {children}
            </p>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
})
