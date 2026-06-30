import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Search } from 'lucide-react'
import { TOPICS, TOPIC_CATEGORIES, getTopicsByCategory, type TopicMeta } from '@/content/topics-registry'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const DIFFICULTY_VARIANT: Record<TopicMeta['difficulty'], 'default' | 'secondary' | 'destructive'> = {
  '入门': 'default',
  '进阶': 'secondary',
  '综合': 'destructive',
}

export default function TopicsPage() {
  const [query, setQuery] = useState('')
  const reduce = useReducedMotion()

  const filtered = useMemo(() => {
    if (!query.trim()) return TOPICS
    const q = query.trim().toLowerCase()
    return TOPICS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      {/* 页头 */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">全部专题</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground md:text-lg">
          {TOPICS.length} 个专题，涵盖 {TOPIC_CATEGORIES.length} 大类，从入门到综合逐步提升。
        </p>
      </div>

      {/* 搜索 */}
      <div className="relative mx-auto mb-12 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索专题名称或关键词..."
          className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* 按分类列出 */}
      {TOPIC_CATEGORIES.map((cat) => {
        const topics = filtered.filter((t) => t.category === cat)
        if (topics.length === 0) return null
        return (
          <section key={cat} className="mb-12">
            <h2 className="mb-6 text-xl font-bold tracking-tight md:text-2xl">{cat}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic, i) => (
                <motion.div
                  key={topic.id}
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                >
                  <Link to={`/topics/${topic.id}`} className="block h-full">
                    <Card className="h-full transition-shadow hover:shadow-lg">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Badge variant={DIFFICULTY_VARIANT[topic.difficulty]}>
                            {topic.difficulty}
                          </Badge>
                          {topic.hasDemo && (
                            <Badge variant="outline">交互演示</Badge>
                          )}
                        </div>
                        <CardTitle className="mt-2 text-lg">{topic.title}</CardTitle>
                        <CardDescription className="pt-1 leading-relaxed">
                          {topic.summary}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )
      })}

      {/* 搜索无结果 */}
      {query.trim() && filtered.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          没有找到匹配「{query.trim()}」的专题
        </div>
      )}
    </div>
  )
}
