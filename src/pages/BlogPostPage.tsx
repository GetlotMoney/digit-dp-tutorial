import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Tag, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { getPostById, deletePost, type BlogPost } from '@/lib/blog-service'
import { useAuth } from '@/hooks/useAuth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

/* ---- React 沙盒渲染 ---- */
function ReactSandbox({ code }: { code: string }) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"><\/script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"><\/script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.24.7/babel.min.js"><\/script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${code}
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(App || (() => React.createElement('div', null, 'No App component exported'))));
  <\/script>
</body>
</html>`
  return (
    <iframe
      srcDoc={html}
      style={{ width: '100%', height: '500px', border: 'none', borderRadius: '8px' }}
      sandbox="allow-scripts"
      title="React 组件预览"
    />
  )
}

/* ---- 删除确认弹窗 ---- */
function DeleteConfirm({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold">确认删除</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          删除后不可恢复，确定要删除这篇文章吗？
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            取消
          </Button>
          <Button variant="destructive" size="sm" onClick={onConfirm}>
            删除
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ---- 主组件 ---- */
export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // 根据 id 加载文章（路由参数名仍叫 slug，实际传的是 id）
  useEffect(() => {
    if (!slug) return
    setLoading(true)
    getPostById(slug)
      .then(setPost)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [slug])

  // 删除文章
  const handleDelete = async () => {
    if (!post) return
    setDeleting(true)
    try {
      await deletePost(post.id)
      navigate('/blog')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '删除失败')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  // 判断当前用户是否为作者
  const isAuthor = user && post && user.id === post.author_id

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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-32 text-center md:px-6">
        <p className="font-mono text-6xl font-bold text-primary">404</p>
        <h1 className="mt-4 text-2xl font-bold">文章不存在</h1>
        <p className="mt-2 text-muted-foreground">{error || '请检查链接是否正确。'}</p>
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
            {formatDate(post.created_at)}
          </span>
          {post.author_name && (
            <span>{post.author_name}</span>
          )}
          {post.category && (
            <Badge variant="secondary">{post.category}</Badge>
          )}
          {post.tags.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </span>
          )}
        </div>

        {/* 作者操作按钮 */}
        {isAuthor && (
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link to={`/blog/edit/${post.id}`} />}
            >
              <Pencil className="mr-1.5 h-4 w-4" />
              编辑
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              删除
            </Button>
          </div>
        )}
      </header>

      {/* 正文 */}
      <article
        className="prose-tutorial"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* React 组件渲染（管理员可见） */}
      {post.react_code && user && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Badge variant="outline">交互演示</Badge>
            React 组件
          </h2>
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <ReactSandbox code={post.react_code} />
          </div>
        </section>
      )}

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <DeleteConfirm
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}
