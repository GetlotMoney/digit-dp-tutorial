import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Tag } from 'lucide-react'
import { getBlogPosts } from '@/content/blog/registry'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function BlogListPage() {
  const posts = useMemo(() => getBlogPosts(), [])
  const [activeTag, setActiveTag] = useState<string | null>(null)

  // 收集所有标签
  const allTags = useMemo(() => {
    const set = new Set<string>()
    posts.forEach((p) => p.tags.forEach((t) => set.add(t)))
    return [...set].sort()
  }, [posts])

  // 按标签筛选
  const filtered = activeTag
    ? posts.filter((p) => p.tags.includes(activeTag))
    : posts

  return (
    <div className="mx-auto max-w-4xl px-4 py-20 md:px-6">
      <h1 className="text-3xl font-bold tracking-tight">博客</h1>
      <p className="mt-2 text-muted-foreground">算法笔记、解题思路、竞赛复盘</p>

      {/* 标签筛选 */}
      {allTags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Badge
            variant={activeTag === null ? 'default' : 'outline'}
            className="cursor-pointer select-none"
            onClick={() => setActiveTag(null)}
          >
            全部
          </Badge>
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={activeTag === tag ? 'default' : 'outline'}
              className="cursor-pointer select-none"
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* 文章列表 */}
      <div className="mt-8 flex flex-col gap-4">
        {filtered.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">
            暂无{activeTag ? `「${activeTag}」相关的` : ''}文章
          </p>
        )}
        {filtered.map((post) => (
          <Link key={post.slug} to={`/blog/${post.slug}`} className="block group">
            <Card className="p-5 transition-colors hover:bg-accent/50">
              <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {post.date}
                </span>
                {post.tags.length > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" />
                    {post.tags.join(' / ')}
                  </span>
                )}
              </div>
              {post.summary && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {post.summary}
                </p>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
