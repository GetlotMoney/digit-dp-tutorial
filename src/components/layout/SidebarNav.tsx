import { motion, useReducedMotion } from 'framer-motion'
import { SECTIONS } from '@/content/sections-meta'
import { useScrollSpy } from '@/hooks/useScrollSpy'
import { cn } from '@/lib/utils'

type Props = {
  /** 点击章节后的回调（用于移动端关闭 Sheet） */
  onNavigate?: () => void
  className?: string
}

/**
 * 共享的教程目录导航。桌面端 Sidebar 与移动端 Sheet 都用它。
 * 第一个 active 章节时由 useScrollSpy 给出，pill 用 layoutId 做平滑滑动。
 */
export function SidebarNav({ onNavigate, className }: Props) {
  const ids = SECTIONS.map((s) => s.id)
  const active = useScrollSpy(ids)
  const reduce = useReducedMotion()

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
      history.replaceState(null, '', `#${id}`)
    }
    onNavigate?.()
  }

  return (
    <nav className={cn('space-y-0.5', className)} aria-label="教程目录">
      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        目录
      </p>
      {SECTIONS.map((s) => {
        const isActive = active === s.id
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(e) => handleClick(e, s.id)}
            className={cn(
              'relative block rounded-md px-3 py-1.5 text-sm transition-colors',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {isActive && (
              <motion.span
                layoutId={reduce ? undefined : 'active-pill'}
                className="absolute inset-0 rounded-md bg-primary/10"
                transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative">{s.nav}</span>
          </a>
        )
      })}
    </nav>
  )
}