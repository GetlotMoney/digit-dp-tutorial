import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HeadingItem } from '@/lib/extract-headings'

type Props = {
  headings: HeadingItem[]
  onNavigate?: () => void
  className?: string
}

/**
 * 专题侧栏导航：从 markdown 提取的 h2/h3 标题生成层级目录。
 * h2 为一级项（可展开/折叠其下的 h3），h3 为二级缩进项。
 */
export function TopicSidebarNav({ headings, onNavigate, className }: Props) {
  const reduce = useReducedMotion()
  const [activeId, setActiveId] = useState(headings[0]?.id ?? '')
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    // 默认展开所有 h2
    return new Set(headings.filter(h => h.level === 2).map(h => h.id))
  })

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    setActiveId(id)
    const el = document.getElementById(id)
    if (el) {
      const topBarHeight = 56 // 14 * 4 = h-14
      const offset = topBarHeight + 16
      const y = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' })
      history.replaceState(null, '', `#${id}`)
    }
    onNavigate?.()
  }

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // 构建层级结构：每个 h2 后面跟着它的 h3 子项
  type TreeNode = HeadingItem & { children: HeadingItem[] }
  const tree: TreeNode[] = []
  let currentParent: TreeNode | null = null

  for (const h of headings) {
    if (h.level === 2) {
      currentParent = { ...h, children: [] }
      tree.push(currentParent)
    } else if (h.level === 3 && currentParent) {
      currentParent.children.push(h)
    }
  }

  const renderItem = (item: HeadingItem, isChild: boolean) => {
    const isActive = activeId === item.id
    return (
      <a
        key={item.id}
        href={`#${item.id}`}
        onClick={(e) => handleClick(e, item.id)}
        className={cn(
          'relative block rounded-md py-1.5 text-sm transition-colors',
          isChild ? 'pl-8 pr-3' : 'pl-3 pr-3',
          isActive
            ? 'font-medium text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        {isActive && (
          <motion.span
            layoutId={reduce ? undefined : 'sidebar-active'}
            className="absolute inset-0 rounded-md bg-primary/10"
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 350, damping: 30 }}
          />
        )}
        <span className="relative">{item.text}</span>
      </a>
    )
  }

  return (
    <nav className={cn('space-y-0.5', className)} aria-label="教程目录">
      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        目录
      </p>
      {headings.length === 0 ? (
        <p className="px-3 text-sm text-muted-foreground">暂无目录</p>
      ) : (
        tree.map(parent => {
          const isExpanded = expanded.has(parent.id)
          return (
            <div key={parent.id}>
              {/* h2 一级项：可点击跳转 + 可展开/折叠 */}
              <div className="flex items-center">
                {parent.children.length > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleExpand(parent.id) }}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label={isExpanded ? '折叠' : '展开'}
                  >
                    <ChevronRight
                      className={cn('h-3.5 w-3.5 transition-transform', isExpanded && 'rotate-90')}
                    />
                  </button>
                )}
                <div className="flex-1">
                  {renderItem(parent, false)}
                </div>
              </div>
              {/* h3 子项 */}
              {isExpanded && parent.children.length > 0 && (
                <div className="space-y-0.5">
                  {parent.children.map(child => renderItem(child, true))}
                </div>
              )}
            </div>
          )
        })
      )}
    </nav>
  )
}
