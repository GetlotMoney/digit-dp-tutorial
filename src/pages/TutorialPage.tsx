import { motion, useReducedMotion } from 'framer-motion'
import { Sidebar } from '@/components/layout/Sidebar'
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { SECTIONS } from '@/content/sections-meta'

// Vite ?raw 导入：把 markdown 文件作为字符串读入
const md = import.meta.glob('../content/sections/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

function getMd(file: string): string {
  const key = `../content/sections/${file}`
  return md[key] ?? ''
}

export default function TutorialPage() {
  const reduce = useReducedMotion()

  return (
    <div className="mx-auto flex max-w-6xl px-4 md:px-6">
      <Sidebar />
      <main className="min-w-0 flex-1 py-10">
        {SECTIONS.map((s, i) => (
          <motion.section
            key={s.id}
            id={s.id}
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4 }}
            className="mb-8 scroll-mt-20"
          >
            <Card className="p-6 md:p-10">
              <div className="mb-4 flex items-center gap-2">
                {i >= 2 && (
                  <Badge variant="secondary" className="font-mono">
                    {s.nav.split('.')[0]}
                  </Badge>
                )}
                <h2 className="border-b-2 border-primary pb-2 text-2xl font-bold tracking-tight md:text-3xl">
                  {s.title}
                </h2>
              </div>
              <MarkdownRenderer content={getMd(s.file)} />
            </Card>
          </motion.section>
        ))}
      </main>
    </div>
  )
}
