import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { getHighlighter, type Highlighter } from '@/lib/shiki'
import { cn } from '@/lib/utils'

type Props = {
  className?: string
  children: string
}

function isDark() {
  return document.documentElement.classList.contains('dark')
}

export function CodeBlock({ className, children }: Props) {
  const lang = (className || '').replace('language-', '') || 'text'
  const code = String(children).replace(/\n$/, '')
  const [html, setHtml] = useState<string>('')
  const [copied, setCopied] = useState(false)
  // 把暗色状态作为依赖：当主题切换导致 <html> 的 dark class 变化时，
  // 通过 MutationObserver 触发 state 变化，重新高亮。
  const [darkTick, setDarkTick] = useState(0)

  useEffect(() => {
    const el = document.documentElement
    const observer = new MutationObserver(() => {
      setDarkTick((t) => t + 1)
    })
    observer.observe(el, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let cancelled = false
    getHighlighter().then((h: Highlighter) => {
      if (cancelled) return
      try {
        const out = h.codeToHtml(code, {
          lang,
          theme: isDark() ? 'github-dark' : 'github-light',
        })
        if (!cancelled) setHtml(out)
      } catch {
        if (!cancelled) setHtml(`<pre><code>${escapeHtml(code)}</code></pre>`)
      }
    })
    return () => { cancelled = true }
    // darkTick 会在 dark class 变化时变化，触发重新高亮
  }, [code, lang, darkTick])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* ignore */ }
  }

  return (
    <div className="group relative my-4 overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-1.5">
        <span className="font-mono text-xs text-muted-foreground">{lang}</span>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="复制代码"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      {html ? (
        <div
          className={cn('shiki-block overflow-x-auto text-[13.5px] leading-relaxed [&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:p-4')}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="overflow-x-auto bg-muted p-4 text-[13.5px] leading-relaxed text-foreground">
          <code>{code}</code>
        </pre>
      )}
    </div>
  )
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}