import { motion, useReducedMotion } from 'framer-motion'
import { MousePointerClick, Map, FileCode2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

const FEATURES = [
  {
    icon: MousePointerClick,
    title: '5 个交互演示',
    desc: '前缀和转化、逐位填数 + limit/lead0 状态、记忆化递归树、波动值判定、完整例题 LeetCode 3753 —— 改参数、单步执行、观察状态变化。',
  },
  {
    icon: Map,
    title: '6 阶段学习路线',
    desc: '从复习记忆化搜索到冲题归纳，3-5 周。每阶段配自检清单，知道什么时候算「会了」。',
  },
  {
    icon: FileCode2,
    title: '完整例题串讲',
    desc: 'LeetCode 3753 范围内总波动值 II：从读题到列状态到写代码，含「求和类数位 DP 要乘子树计数」这个关键坑。',
  },
]

export function FeatureCards() {
  const reduce = useReducedMotion()
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 md:px-6">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">为什么是「交互式」</h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          多数教程是文字 + 静态代码。数位 DP 的状态变化只能靠脑补，我们把它变成看得见的动画。
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Card className="h-full transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{f.title}</CardTitle>
                <CardDescription className="pt-2 leading-relaxed">{f.desc}</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
