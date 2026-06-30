import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Calendar, Tag, Pencil, Trash2, AlertTriangle,
  Clock, User, ChevronDown, ChevronUp,
} from 'lucide-react'
import { getPostById, deletePost, type BlogPost } from '@/lib/blog-service'
import { useAuth } from '@/hooks/useAuth'
import { getHighlighter, type Highlighter } from '@/lib/shiki'
import { useScrollSpy } from '@/hooks/useScrollSpy'
import { slugify } from '@/lib/extract-headings'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

/* ================================================================
   React 沙盒渲染
   ================================================================ */
function ReactSandbox({ code }: { code: string }) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"><\/script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"><\/script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js"><\/script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${code}
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(App || (() => React.createElement('div', null, 'No App component exported'))));
  <\/script>
</body>
</html>`
  return (
    <iframe
      srcDoc={html}
      style={{ width: '100%', height: '500px', border: 'none', borderRadius: '8px' }}
      sandbox="allow-scripts"
      title="React 组件预览"
    />
  )
}

/* ================================================================
   删除确认弹窗
   ================================================================ */
function DeleteConfirm({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold">确认删除</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          删除后不可恢复，确定要删除这篇文章吗？
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            取消
          </Button>
          <Button variant="destructive" size="sm" onClick={onConfirm}>
            删除
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   从 HTML 中提取 h2/h3 标题
   ================================================================ */
type TocItem = { id: string; text: string; level: 2 | 3 }

function extractToc(html: string): TocItem[] {
  const items: TocItem[] = []
  const regex = /<h([23])[^>]*>(.*?)<\/h[23]>/gi
  let match: RegExpExecArray | null
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1]) as 2 | 3
    const text = match[2].replace(/<[^>]+>/g, '').trim()
    const id = slugify(text)
    items.push({ id, text, level })
  }
  return items
}

/* ================================================================
   给 HTML 内容中的 h2/h3 添加 id 属性
   ================================================================ */
function addHeadingIds(html: string): string {
  // 用单次正则扫描所有 h2/h3 标签，提取纯文本后生成 id 并注入
  return html.replace(/<h([23])(\s[^>]*)?>([\s\S]*?)<\/h[23]>/gi, (match, level, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, '').trim()
    const id = slugify(text)
    // 如果已有 id 则不覆盖
    if (attrs && /id\s*=/.test(attrs)) return match
    return `<h${level}${attrs || ''} id="${id}">${inner}</h${level}>`
  })
}

/* ================================================================
   阅读时间估算
   ================================================================ */
function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, '')
  // 中文按每分钟 300 字计算
  const chars = text.replace(/\s/g, '').length
  return Math.max(1, Math.ceil(chars / 300))
}

/* ================================================================
   目录侧栏组件
   ================================================================ */
function TocSidebar({
  items,
  activeId,
  onNavigate,
}: {
  items: TocItem[]
  activeId: string
  onNavigate: (id: string) => void
}) {
  if (items.length === 0) return null

  // 构建层级
  type TreeNode = TocItem & { children: TocItem[] }
  const tree: TreeNode[] = []
  let parent: TreeNode | null = null
  for (const item of items) {
    if (item.level === 2) {
      parent = { ...item, children: [] }
      tree.push(parent)
    } else if (item.level === 3 && parent) {
      parent.children.push(item)
    }
  }

  const renderItem = (item: TocItem, isChild: boolean) => {
    const isActive = activeId === item.id
    return (
      <a
        key={item.id}
        href={`#${item.id}`}
        onClick={(e) => {
          e.preventDefault()
          onNavigate(item.id)
        }}
        className={`block truncate rounded py-1 text-sm transition-colors ${
          isChild ? 'pl-6 pr-2' : 'pl-3 pr-2'
        } ${
          isActive
            ? 'font-medium text-primary bg-primary/10'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        }`}
      >
        {item.text}
      </a>
    )
  }

  return (
    <nav className="space-y-0.5" aria-label="文章目录">
      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        目录
      </p>
      {tree.map((node) => (
        <div key={node.id}>
          {renderItem(node, false)}
          {node.children.map((child) => renderItem(child, true))}
        </div>
      ))}
    </nav>
  )
}

/* ================================================================
   移动端折叠目录
   ================================================================ */
function TocMobile({
  items,
  activeId,
  onNavigate,
}: {
  items: TocItem[]
  activeId: string
  onNavigate: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  if (items.length === 0) return null

  const activeItem = items.find((i) => i.id === activeId)

  return (
    <div className="mb-6 rounded-lg border border-border bg-card">
      <button
        className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium"
        onClick={() => setOpen(!open)}
      >
        <span>目录 {activeItem && <span className="ml-1 font-normal text-muted-foreground">- {activeItem.text}</span>}</span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && (
        <div className="border-t border-border px-2 py-2">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault()
                onNavigate(item.id)
                setOpen(false)
              }}
              className={`block truncate rounded py-1.5 text-sm transition-colors ${
                item.level === 3 ? 'pl-6' : 'pl-3'
              } ${
                activeId === item.id
                  ? 'font-medium text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.text}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

/* ================================================================
   Shiki 代码高亮处理
   ================================================================ */
function useShikiHighlight(containerRef: React.RefObject<HTMLDivElement | null>, html: string) {
  useEffect(() => {
    if (!containerRef.current) return
    const codeBlocks = containerRef.current.querySelectorAll('pre > code')
    if (codeBlocks.length === 0) return

    let cancelled = false

    getHighlighter().then((h: Highlighter) => {
      if (cancelled) return
      const isDark = document.documentElement.classList.contains('dark')

      codeBlocks.forEach((codeEl) => {
        const pre = codeEl.parentElement
        if (!pre || pre.dataset.shikiApplied) return

        // 检测语言：class="language-xxx" 或 class="xxx"
        const langClass = Array.from(codeEl.classList).find((c) => c.startsWith('language-'))
        const lang = langClass ? langClass.replace('language-', '') : ''

        // 只高亮 Shiki 支持的语言，否则保留原始样式
        const supportedLangs = ['cpp', 'c', 'javascript', 'typescript', 'python', 'java', 'rust', 'go', 'html', 'css', 'json', 'bash', 'shell', 'sql', 'markdown', 'xml', 'yaml', 'toml', 'jsx', 'tsx']
        if (lang && !supportedLangs.includes(lang)) return

        const code = codeEl.textContent || ''

        try {
          const out = h.codeToHtml(code, {
            lang: lang || 'text',
            theme: isDark ? 'github-dark' : 'github-light',
          })
          // 包裹在容器中，替换原有 pre
          pre.dataset.shikiApplied = 'true'
          pre.outerHTML = `<div class="shiki-block overflow-x-auto text-[13.5px] leading-relaxed [&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:p-4">${out}</div>`
        } catch {
          // 语言不支持时忽略
        }
      })
    })

    return () => { cancelled = true }
  }, [containerRef, html])
}

/* ================================================================
   主组件
   ================================================================ */
export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)

  // 加载文章
  useEffect(() => {
    if (!slug) return
    setLoading(true)
    getPostById(slug)
      .then(setPost)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [slug])

  // 处理内容：添加标题 id
  const processedHtml = useMemo(() => {
    if (!post?.content) return ''
    return addHeadingIds(post.content)
  }, [post?.content])

  // 提取目录
  const toc = useMemo(() => extractToc(processedHtml), [processedHtml])
  const tocIds = useMemo(() => toc.map((i) => i.id), [toc])

  // Scroll spy
  const activeTocId = useScrollSpy(tocIds)

  // 目录导航
  const handleTocNavigate = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const offset = 72 // topbar 56 + spacing
    const y = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top: y, behavior: 'smooth' })
    history.replaceState(null, '', `#${id}`)
  }, [])

  // Shiki 代码高亮
  useShikiHighlight(contentRef, processedHtml)

  // 监听暗色模式切换，重新高亮
  useEffect(() => {
    if (!contentRef.current) return
    const observer = new MutationObserver(() => {
      // 移除 shikiApplied 标记，触发重新高亮
      contentRef.current?.querySelectorAll('[data-shiki-applied]').forEach((el) => {
        delete (el as HTMLElement).dataset.shikiApplied
      })
      // 重新运行高亮（useShikiHighlight 会响应 html 变化，但我们需要一个触发）
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // 删除文章
  const handleDelete = async () => {
    if (!post) return
    setDeleting(true)
    try {
      await deletePost(post.id)
      navigate('/blog')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '删除失败')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  // 判断当前用户是否为作者
  const isAuthor = user && post && user.id === post.author_id

  // 格式化日期
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  // 阅读时间
  const readTime = post ? estimateReadingTime(post.content) : 0

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-32 text-center md:px-6">
        <p className="font-mono text-6xl font-bold text-primary">404</p>
        <h1 className="mt-4 text-2xl font-bold">文章不存在</h1>
        <p className="mt-2 text-muted-foreground">{error || '请检查链接是否正确。'}</p>
        <Button className="mt-6" nativeButton={false} render={<Link to="/blog" />}>
          返回博客列表
        </Button>
      </div>
    )
  }

  return (
    <div className="pt-14">
      {/* ---- 返回按钮 ---- */}
      <div className="mx-auto max-w-6xl px-4 pt-4 md:px-6">
        <Button variant="ghost" className="-ml-2" nativeButton={false} render={<Link to="/blog" />}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          返回列表
        </Button>
      </div>

      {/* ---- 主体布局 ---- */}
      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-6 md:px-6">
        {/* 左栏：文章内容 */}
        <div className="min-w-0 flex-1">
          {/* 移动端目录 */}
          <TocMobile
            items={toc}
            activeId={activeTocId}
            onNavigate={handleTocNavigate}
          />

          {/* 文章头部 */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{post.title}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {post.author_name && (
                <span className="inline-flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {post.author_name}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(post.created_at)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                约 {readTime} 分钟阅读
              </span>
              {post.category && (
                <Badge variant="secondary">{post.category}</Badge>
              )}
              {post.tags.length > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </span>
              )}
            </div>

            {/* 作者操作按钮 */}
            {isAuthor && (
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<Link to={`/blog/edit/${post.id}`} />}
                >
                  <Pencil className="mr-1.5 h-4 w-4" />
                  编辑
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  删除
                </Button>
              </div>
            )}
          </header>

          {/* 正文 */}
          <article
            ref={contentRef}
            className="prose-tutorial"
            dangerouslySetInnerHTML={{ __html: processedHtml }}
          />

          {/* React 组件渲染（管理员可见） */}
          {post.react_code && user && (
            <section className="mt-12">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <Badge variant="outline">交互演示</Badge>
                React 组件
              </h2>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <ReactSandbox code={post.react_code} />
              </div>
            </section>
          )}

          {/* 底部作者卡片 */}
          {post.author_name && (
            <div className="mt-12 rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  {post.author_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-semibold">{post.author_name}</p>
                  <p className="text-sm text-muted-foreground">
                    发布于 {formatDate(post.created_at)}
                    {post.updated_at !== post.created_at && (
                      <span> · 更新于 {formatDate(post.updated_at)}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 右栏：TOC 侧边栏（桌面端） */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-20">
            <TocSidebar
              items={toc}
              activeId={activeTocId}
              onNavigate={handleTocNavigate}
            />

            {/* 文章信息卡片 */}
            <div className="mt-8 rounded-lg border border-border bg-card p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                文章信息
              </p>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">作者</dt>
                  <dd className="font-medium">{post.author_name || '未知'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">发布日期</dt>
                  <dd className="font-medium">{formatDate(post.created_at)}</dd>
                </div>
                {post.updated_at !== post.created_at && (
                  <div>
                    <dt className="text-muted-foreground">更新日期</dt>
                    <dd className="font-medium">{formatDate(post.updated_at)}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted-foreground">分类</dt>
                  <dd className="font-medium">{post.category || '未分类'}</dd>
                </div>
                {post.tags.length > 0 && (
                  <div>
                    <dt className="text-muted-foreground">标签</dt>
                    <dd className="flex flex-wrap gap-1 pt-0.5">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </aside>
      </div>

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <DeleteConfirm
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}
