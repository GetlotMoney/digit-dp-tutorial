import { motion, useReducedMotion } from 'framer-motion'
import { useScrollSpy } from '@/hooks/useScrollSpy'
import { cn } from '@/lib/utils'

type Section = { id: string; nav: string; title: string }

type Props = {
  sections: Section[]
  onNavigate?: () => void
  className?: string
}

/**
 * 专题侧栏导航：接受 sections 作为 prop，不硬编码。
 * TopicPage 和移动端 Sheet 都用它。
 */
export function TopicSidebarNav({ sections, onNavigate, className }: Props) {
  const ids = sections.map((s) => s.id)
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
      {sections.map((s) => {
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
