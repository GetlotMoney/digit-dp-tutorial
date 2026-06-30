import { motion, useReducedMotion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

const FLOAT_DIGITS = [
  { d: '3', x: '3%',  y: '15%', delay: 0 },
  { d: '2', x: '5%',  y: '72%', delay: 0.6 },
  { d: '4', x: '88%', y: '18%', delay: 0.3 },
  { d: '7', x: '92%', y: '68%', delay: 0.9 },
  { d: '9', x: '78%', y: '82%', delay: 1.2 },
  { d: '1', x: '12%', y: '45%', delay: 0.4 },
]

export function Hero() {
  const reduce = useReducedMotion()

  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-gradient-to-br from-primary via-primary to-[var(--accent-orange)] text-primary-foreground mb-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(60% 50% at 30% 20%, rgba(255,255,255,0.25), transparent), radial-gradient(50% 40% at 80% 80%, rgba(255,255,255,0.18), transparent)',
        }}
      />

      {/* 浮动数字方格装饰，呼应「逐位填数」主题 */}
      {!reduce &&
        FLOAT_DIGITS.map((f) => (
          <motion.div
            key={f.d}
            className="pointer-events-none absolute hidden h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-xl font-bold text-white/40 backdrop-blur-sm md:flex"
            style={{ left: f.x, top: f.y }}
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: f.delay }}
          >
            {f.d}
          </motion.div>
        ))}

      <div className="relative mx-auto max-w-6xl px-4 py-24 md:px-6 md:py-32">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            交互式算法教程 · 咕嘎学不会算法
          </span>

          <h1 className="mt-10 text-4xl font-bold leading-[1.1] tracking-tight md:mt-12 md:text-7xl">
            咕嘎
            <br />
            学不会算法
          </h1>

          <p className="mt-8 max-w-xl text-lg text-primary-foreground/85 md:mt-10 md:text-xl">
            把抽象的算法状态变成看得见、点得动的交互演示。覆盖
            <code className="rounded bg-white/20 px-1.5 py-0.5 text-base">25+</code> 个专题，由浅入深，专治学不会。
          </p>
        </motion.div>
      </div>

      {/* 底部斜切过渡 */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-background/0" />
    </section>
  )
}
