import { useMemo, useState, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { getTopicById } from '@/content/topics-registry'
import type { TopicMeta } from '@/content/topics-registry'
import { TopicSidebarNav } from '@/components/layout/TopicSidebarNav'
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer'
import { extractHeadings } from '@/lib/extract-headings'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/* ── 分类 → Badge variant 映射 ──────────────────────────── */
const DIFFICULTY_VARIANT: Record<TopicMeta['difficulty'], 'default' | 'secondary' | 'destructive'> = {
  '入门': 'default',
  '进阶': 'secondary',
  '综合': 'destructive',
}

/* ── 动态加载各专题的 markdown 文件 ────────────────────── */
// 实际结构：src/content/topics/{id}/00-overview.md（单文件含全部内容）
const mdModules = import.meta.glob('../content/topics/*/00-overview.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** 根据 topicId 获取 markdown 内容 */
function getMd(topicId: string): string {
  const key = `../content/topics/${topicId}/00-overview.md`
  return mdModules[key] ?? ''
}

/* ── TopicPage ──────────────────────────────────────────── */
export default function TopicPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const topic = topicId ? getTopicById(topicId) : undefined
  const reduce = useReducedMotion()

  // 侧栏可拖拽宽度
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('sidebar-width')
    return saved ? parseInt(saved) : 256
  })
  const resizing = useRef(false)

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    resizing.current = true
    const startX = e.clientX
    const startWidth = sidebarWidth

    const onMove = (ev: MouseEvent) => {
      const newWidth = Math.max(180, Math.min(500, startWidth + ev.clientX - startX))
      setSidebarWidth(newWidth)
    }
    const onUp = () => {
      resizing.current = false
      localStorage.setItem('sidebar-width', String(sidebarWidth))
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [sidebarWidth])

  // 获取该专题的全部 markdown 内容 + 提取标题层级
  const content = useMemo(() => (topicId ? getMd(topicId) : ''), [topicId])
  const headings = useMemo(() => extractHeadings(content), [content])

  if (!topic) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-32 text-center md:px-6">
        <p className="font-mono text-6xl font-bold text-primary">404</p>
        <h1 className="mt-4 text-2xl font-bold">专题不存在</h1>
        <p className="mt-2 text-muted-foreground">请检查 URL 是否正确。</p>
        <Button className="mt-6" nativeButton={false} render={<Link to="/topics" />}>
          返回专题列表
        </Button>
      </div>
    )
  }

  return (
    <div className="flex w-full">
      {/* 侧栏目录：贴左边，可拖拽宽度 */}
      <aside
        className="sticky top-14 hidden h-[calc(100svh-3.5rem)] shrink-0 overflow-y-auto border-r border-border bg-background/50 px-3 py-6 md:block"
        style={{ width: sidebarWidth }}
      >
        <TopicSidebarNav headings={headings} />
      </aside>

      {/* 拖拽手柄 */}
      <div
        className="hidden w-1.5 shrink-0 cursor-col-resize bg-transparent transition-colors hover:bg-primary/30 md:block"
        onMouseDown={handleResizeStart}
      />

      <main className="min-w-0 flex-1 py-10 pl-6 pr-6 md:pl-10 md:pr-10">
        {/* 专题头部 */}
        <div className="mb-8">
          <Link
            to="/topics"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            返回专题列表
          </Link>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{topic.category}</Badge>
            <Badge variant={DIFFICULTY_VARIANT[topic.difficulty]}>
              {topic.difficulty}
            </Badge>
            {topic.hasDemo && <Badge variant="outline">交互演示</Badge>}
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            {topic.title}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground md:text-lg">
            {topic.summary}
          </p>
        </div>

        {/* 章节内容：整体渲染 00-overview.md */}
        {content ? (
          <motion.section
            id="overview"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4 }}
            className="mb-8 scroll-mt-20"
          >
            <Card className="p-6 md:p-10">
              <MarkdownRenderer content={content} />
            </Card>
          </motion.section>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-lg text-muted-foreground">该专题内容正在编写中，敬请期待。</p>
          </Card>
        )}
      </main>
    </div>
  )
}
