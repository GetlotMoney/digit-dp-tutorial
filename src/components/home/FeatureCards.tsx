import { motion, useReducedMotion } from 'framer-motion'
import { Layers, MousePointerClick, Route } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const FEATURES = [
  {
    icon: Layers,
    title: '25+ 算法专题',
    desc: '从基础到进阶，覆盖 DP / 数据结构 / 图论 / 数学 / 字符串。每个专题配有讲解、演示和练习题单。',
  },
  {
    icon: MousePointerClick,
    title: '交互式演示',
    desc: '把抽象的状态变化变成看得见、点得动的动画。改参数、单步执行、观察记忆化命中——不再只靠脑补。',
  },
  {
    icon: Route,
    title: '学习路线',
    desc: '按难度递进，每个专题配自检清单和练习题单。知道自己在哪里、下一步该学什么。',
  },
]

export function FeatureCards() {
  const reduce = useReducedMotion()
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 md:px-6 md:py-28 mb-8">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">为什么是「交互式」</h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg">
          多数教程是文字 + 静态代码。算法的状态变化只能靠脑补，我们把它变成看得见的动画。
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
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
