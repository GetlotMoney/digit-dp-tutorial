import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { remarkDemo } from './remark-demo'
import { CodeBlock } from './CodeBlock'
import { renderDemo } from '@/lib/demo-registry'
import { cn } from '@/lib/utils'

const components: Components & Record<string, (props: any) => any> = {
  code(props) {
    const { className, children, node, ...rest } = props as any
    // 行内代码（无 className 且无换行）走默认 <code>
    if (!className && typeof children === 'string' && !children.includes('\n')) {
      return (
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground" {...rest}>
          {children}
        </code>
      )
    }
    return <CodeBlock className={className}>{String(children)}</CodeBlock>
  },
  demo(props: any) {
    return renderDemo(props.name)
  },
  blockquote(props) {
    const { children, ...rest } = props as any
    const text = extractText(children)
    // 约定：> **TIP ...** / > **WARN ...** / > **TODO ...**
    const m = text.match(/^\s*\*\*(TIP|WARN|TODO)\b\*\*:??\s*([\s\S]*)/)
    if (m) {
      const kind = m[1].toLowerCase()
      const body = m[2] || text
      return (
        <blockquote
          className={cn(
            'my-4 rounded-r-lg border-l-4 px-4 py-3',
            kind === 'tip' && 'border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-50',
            kind === 'warn' && 'border-amber-500 bg-amber-500/10 text-amber-950 dark:text-amber-50',
            kind === 'todo' && 'border-slate-400 bg-slate-400/10 text-muted-foreground italic',
          )}
          {...rest}
        >
          {kind === 'todo' ? <span>{body}</span> : renderBlockquoteBody(children, kind)}
        </blockquote>
      )
    }
    return <blockquote className="my-4 border-l-4 border-border pl-4 italic text-muted-foreground" {...rest}>{children}</blockquote>
  },
  table(props) {
    return (
      <div className="my-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm" {...(props as any)} />
      </div>
    )
  },
  th(props) {
    return <th className="border border-border bg-muted/60 px-3 py-1.5 text-left font-semibold" {...(props as any)} />
  },
  td(props) {
    return <td className="border border-border px-3 py-1.5" {...(props as any)} />
  },
}

function extractText(node: any): string {
  if (node == null) return ''
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (typeof node === 'object' && node.props) return extractText(node.props.children)
  if (typeof node === 'object' && node.children) return extractText(node.children)
  return ''
}

// 提示框正文：把首行的 **TIP** 去掉，保留其余内容（已是 React 节点）
function renderBlockquoteBody(children: any, kind: string) {
  const arr = Array.isArray(children) ? children : [children]
  // 第一个子节点通常是 <p>，里面含 **TIP/WARN** + 正文
  return arr.map((child, i) => {
    if (i === 0 && child?.props?.children) {
      const inner = child.props.children
      const flat = extractText(inner)
      const stripped = flat.replace(/^\s*\*\*(TIP|WARN)\b\*\*:??\s*/, '')
      if (stripped !== flat) {
        // 保留强调样式：用 <strong> 包住关键词
        const keyword = kind === 'tip' ? '提示' : kind === 'warn' ? '注意' : ''
        return (
          <p key={i} className="mb-0">
            {keyword && <strong className="mr-1">{keyword}：</strong>}
            {stripped}
          </p>
        )
      }
    }
    return child
  })
}

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose-tutorial">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkDemo]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
