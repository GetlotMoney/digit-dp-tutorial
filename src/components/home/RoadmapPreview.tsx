import { motion, useReducedMotion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const STAGES = [
  { n: 1, title: '准备', desc: '复习记忆化搜索、DFS 状态设计、前缀和思想。约 1-2 天。' },
  { n: 2, title: '建模板', desc: '理解 limit / lead0 两个标志位，手写通用 DFS 模板。约 2-3 天。' },
  { n: 3, title: '入门题', desc: '统计区间满足条件的数个数，如不含 62、数字之和等。约 3-5 天。' },
  { n: 4, title: '进阶题', desc: '引入更多状态位：前导零、连续段、模数余数等。约 1 周。' },
  { n: 5, title: '变体', desc: '二进制数位、数位+组合数学、数位+AC自动机等。约 1-2 周。' },
  { n: 6, title: '冲题', desc: '刷题单，按专题归纳，整理自己的模板库。持续。' },
]

export function RoadmapPreview() {
  const reduce = useReducedMotion()
  return (
    <section className="bg-muted/30 border-y border-border">
      <div className="mx-auto max-w-6xl px-4 py-20 md:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">学习路线</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            6 个阶段递进，预计 3-5 周（按每天 1-2 小时计）。完整版见教程内。
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STAGES.map((s, i) => (
            <motion.div
              key={s.n}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <Card className="h-full border-t-2 border-t-primary/60 p-5">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono">阶段 {s.n}</Badge>
                  <h3 className="font-semibold">{s.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
