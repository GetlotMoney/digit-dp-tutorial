import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Sparkles, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

const FLOAT_DIGITS = [
  { d: '3', x: '8%', y: '22%', delay: 0 },
  { d: '2', x: '18%', y: '68%', delay: 0.6 },
  { d: '4', x: '82%', y: '28%', delay: 0.3 },
  { d: '7', x: '90%', y: '64%', delay: 0.9 },
  { d: '9', x: '72%', y: '78%', delay: 1.2 },
  { d: '1', x: '30%', y: '32%', delay: 0.4 },
]

export function Hero() {
  const reduce = useReducedMotion()

  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-gradient-to-br from-primary via-primary to-[var(--accent-orange)] text-primary-foreground">
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
            className="pointer-events-none absolute hidden h-14 w-14 items-center justify-center rounded-xl border border-white/30 bg-white/10 text-2xl font-bold backdrop-blur-sm md:flex"
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
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            交互式算法教程 · 首批专题
          </span>

          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            数位 DP
            <br />
            交互教程
          </h1>

          <p className="mt-5 max-w-xl text-lg text-primary-foreground/85 md:text-xl">
            把 <code className="rounded bg-white/20 px-1.5 py-0.5 text-base">limit</code>、
            <code className="rounded bg-white/20 px-1.5 py-0.5 text-base">lead0</code>、记忆化递归树这些
            只能靠脑补的状态，变成可点可玩的演示。从 f(R) − f(L−1) 开始，通透数位 DP。
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90" nativeButton={false} render={<Link to="/tutorial" />}>
              <BookOpen className="mr-2 h-4 w-4" />
              开始学习
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
              nativeButton={false}
              render={<Link to="/about" />}
            >
              查看路线
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>

      {/* 底部斜切过渡 */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-background/0" />
    </section>
  )
}
