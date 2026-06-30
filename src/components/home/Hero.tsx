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

          <div className="mt-10 flex flex-wrap gap-3 md:mt-12">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90" nativeButton={false} render={<Link to="/topics" />}>
              <BookOpen className="mr-2 h-4 w-4" />
              浏览专题
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
