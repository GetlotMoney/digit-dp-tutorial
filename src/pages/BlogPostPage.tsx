import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Tag } from 'lucide-react'
import { getBlogPost } from '@/content/blog/registry'
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = useMemo(() => (slug ? getBlogPost(slug) : null), [slug])

  if (!post) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-32 text-center md:px-6">
        <p className="font-mono text-6xl font-bold text-primary">404</p>
        <h1 className="mt-4 text-2xl font-bold">文章不存在</h1>
        <p className="mt-2 text-muted-foreground">请检查链接是否正确。</p>
        <Button className="mt-6" nativeButton={false} render={<Link to="/blog" />}>
          返回博客列表
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 md:px-6">
      {/* 返回按钮 */}
      <Button variant="ghost" className="mb-6 -ml-2" nativeButton={false} render={<Link to="/blog" />}>
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        返回列表
      </Button>

      {/* 文章头部 */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{post.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {post.date}
          </span>
          {post.tags.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </span>
          )}
        </div>
      </header>

      {/* 正文 */}
      <article>
        <MarkdownRenderer content={post.content} />
      </article>
    </div>
  )
}
