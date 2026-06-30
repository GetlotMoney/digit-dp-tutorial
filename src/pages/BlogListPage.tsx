import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Tag, PenLine, FolderOpen } from 'lucide-react'
import { getPublishedPosts, getAllCategories, getAllTags, type BlogPost } from '@/lib/blog-service'
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function BlogListPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeTag, setActiveTag] = useState<string | null>(null)

  // 加载分类和标签
  useEffect(() => {
    Promise.all([getAllCategories(), getAllTags()])
      .then(([cats, tags]) => {
        setCategories(cats)
        setAllTags(tags)
      })
      .catch(() => {
        // 分类/标签加载失败不影响文章列表
      })
  }, [])

  // 加载文章（按筛选条件）
  useEffect(() => {
    setLoading(true)
    getPublishedPosts({
      category: activeCategory ?? undefined,
      tag: activeTag ?? undefined,
    })
      .then(setPosts)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [activeCategory, activeTag])

  // 格式化日期
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-20 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">博客</h1>
          <p className="mt-2 text-muted-foreground">算法笔记、解题思路、竞赛复盘</p>
        </div>
        {user && (
          <Button nativeButton={false} render={<Link to="/blog/new" />}>
            <PenLine className="mr-1.5 h-4 w-4" />
            写博客
          </Button>
        )}
      </div>

      {/* 分类筛选 */}
      {categories.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
          <Badge
            variant={activeCategory === null ? 'default' : 'outline'}
            className="cursor-pointer select-none"
            onClick={() => setActiveCategory(null)}
          >
            全部
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              className="cursor-pointer select-none"
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      )}

      {/* 标签筛选 */}
      {allTags.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
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

      {/* 加载状态 */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <div className="mt-8 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* 文章列表 */}
      {!loading && !error && (
        <div className="mt-8 flex flex-col gap-4">
          {posts.length === 0 && (
            <p className="py-12 text-center text-muted-foreground">
              暂无文章
              {activeCategory ? `（分类：${activeCategory}）` : ''}
              {activeTag ? `（标签：${activeTag}）` : ''}
            </p>
          )}
          {posts.map((post) => (
            <Link key={post.id} to={`/blog/${post.id}`} className="block group">
              <Card className="p-5 transition-colors hover:bg-accent/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(post.created_at)}
                      </span>
                      {post.author_name && (
                        <span>{post.author_name}</span>
                      )}
                      {post.category && (
                        <Badge variant="secondary" className="text-xs">
                          {post.category}
                        </Badge>
                      )}
                    </div>
                    {post.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {post.tags.map((t) => (
                          <Badge key={t} variant="outline" className="text-xs">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
