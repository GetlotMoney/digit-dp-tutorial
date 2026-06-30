import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { LogIn, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

const FLOAT_DIGITS = [
  { d: '3', x: '8%', y: '22%', delay: 0 },
  { d: '2', x: '18%', y: '68%', delay: 0.6 },
  { d: '4', x: '82%', y: '28%', delay: 0.3 },
  { d: '7', x: '90%', y: '64%', delay: 0.9 },
  { d: '9', x: '72%', y: '78%', delay: 1.2 },
  { d: '1', x: '30%', y: '32%', delay: 0.4 },
]

export default function LandingAuthPage() {
  const reduce = useReducedMotion()

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary to-[var(--accent-orange)] text-primary-foreground">
      {/* 背景光晕 */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(60% 50% at 30% 20%, rgba(255,255,255,0.25), transparent), radial-gradient(50% 40% at 80% 80%, rgba(255,255,255,0.18), transparent)',
        }}
      />

      {/* 浮动数字方格 */}
      {!reduce &&
        FLOAT_DIGITS.map((f) => (
          <motion.div
            key={f.d}
            className="pointer-events-none absolute hidden h-14 w-14 items-center justify-center rounded-xl border border-white/30 bg-white/10 text-2xl font-bold backdrop-blur-sm md:flex"
            style={{ left: f.x, top: f.y }}
            animate={{ y: [0, -12, 0] }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: 'easeInOut',
              delay: f.delay,
            }}
          >
            {f.d}
          </motion.div>
        ))}

      {/* 主内容 */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex max-w-xl flex-col items-center px-6 text-center"
      >
        <h1 className="text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl">
          咕嘎
          <br />
          学不会算法
        </h1>

        <p className="mt-8 max-w-md text-lg text-primary-foreground/85 md:text-xl">
          交互式算法教程，25+ 专题，把抽象的算法状态变成看得见的动画
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button
            size="lg"
            variant="secondary"
            className="bg-white px-8 text-primary hover:bg-white/90"
            nativeButton={false}
            render={<Link to="/login" />}
          >
            <LogIn className="mr-2 h-4 w-4" />
            登录
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/40 bg-transparent px-8 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
            nativeButton={false}
            render={<Link to="/register" />}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            注册
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
