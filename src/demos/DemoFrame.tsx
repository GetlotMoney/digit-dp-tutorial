import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * 演示外框：统一的标题、描述、悬浮微动效。
 * 替代原 .demo/.demo-title/.demo-desc 几个 CSS 类，用 Tailwind 取代。
 * 缩减动效用户关掉悬浮位移。
 */
export function DemoFrame({
  title,
  desc,
  children,
}: {
  title: string
  desc?: string
  children: ReactNode
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
    whileHover={reduce ? undefined : { y: -2 }}
      className="my-6 overflow-x-auto rounded-2xl border border-primary/30 bg-gradient-to-br from-muted/50 to-primary/5 p-6 dark:from-muted/20 dark:to-primary/10"
    >
      <div className="mb-4 text-xs font-bold uppercase tracking-wider text-primary">
        交互演示 · {title}
      </div>
      {desc && <div className="mb-5 text-sm leading-relaxed text-muted-foreground">{desc}</div>}
      {children}
    </motion.div>
  )
}
