import { motion, useReducedMotion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const CATEGORIES = [
  { icon: '📐', title: '算法基础', desc: '二分、排序、前缀和、双指针、贪心' },
  { icon: '🔍', title: '搜索', desc: 'DFS / BFS、回溯与剪枝' },
  { icon: '📊', title: '动态规划', desc: '背包、区间、树形、状压、数位' },
  { icon: '🏗️', title: '数据结构', desc: '栈队列、并查集、线段树、树状数组' },
  { icon: '🕸️', title: '图论', desc: '最短路、MST、LCA、拓扑排序' },
  { icon: '🧮', title: '数学与字符串', desc: '数论、KMP、Trie' },
]

export function RoadmapPreview() {
  const reduce = useReducedMotion()
  return (
    <section className="bg-muted/30 border-y border-border">
      <div className="mx-auto max-w-6xl px-4 py-24 md:px-6 md:py-28">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">专题分类</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground md:text-lg">
            六大类覆盖主流算法与数据结构，由浅入深。点击进入对应专题开始学习。
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <Card className="h-full border-t-2 border-t-primary/60 p-5">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-base">{cat.icon}</Badge>
                  <h3 className="font-semibold">{cat.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{cat.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
