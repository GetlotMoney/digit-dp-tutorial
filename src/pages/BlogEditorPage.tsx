import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import LinkExtension from '@tiptap/extension-link'
import ImageExtension from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import {
  Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2,
  List, ListOrdered, Code, Link as LinkIcon, ImageIcon, Eye, EyeOff,
  Save, FileText, ArrowLeft,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  createPost, updatePost, getPostById, type BlogPost, type CreatePostInput,
} from '@/lib/blog-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const CATEGORIES = ['算法', '数据结构', '学习笔记', '博客', '其他']
const lowlight = createLowlight(common)

/* ---- 工具栏按钮 ---- */
function ToolbarBtn({
  active, onClick, children, title,
}: {
  active?: boolean; onClick: () => void; children: React.ReactNode; title: string
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}

/* ---- 主组件 ---- */
export default function BlogEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()

  // 表单状态
  const [title, setTitle] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [published, setPublished] = useState(false)
  const [reactCode, setReactCode] = useState('')
  const [sourceMode, setSourceMode] = useState(false)
  const [htmlContent, setHtmlContent] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingPost, setLoadingPost] = useState(false)
  const [error, setError] = useState('')

  const tags = tagsInput
    .split(/[,，]/)
    .map((t) => t.trim())
    .filter(Boolean)

  const isEditing = Boolean(id)

  // TipTap 编辑器
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      LinkExtension.configure({ openOnClick: false }),
      ImageExtension,
      Placeholder.configure({ placeholder: '开始写博客内容...' }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: '',
    onUpdate: ({ editor: ed }) => {
      setHtmlContent(ed.getHTML())
    },
  })

  // 进入 sourceMode 时同步编辑器内容到 textarea
  const toggleSourceMode = useCallback(() => {
    if (!sourceMode) {
      // 切到源码模式：htmlContent 已在 onUpdate 中同步
    } else {
      // 切回编辑器模式：把 textarea 内容写回编辑器
      editor?.commands.setContent(htmlContent)
    }
    setSourceMode((v) => !v)
  }, [sourceMode, editor, htmlContent])

  // 编辑模式：加载已有文章
  useEffect(() => {
    if (!id || !editor) return
    setLoadingPost(true)
    getPostById(id)
      .then((post: BlogPost | null) => {
        if (!post) {
          setError('文章不存在')
          return
        }
        setTitle(post.title)
        setTagsInput(post.tags.join(', '))
        setCategory(post.category)
        setPublished(post.published)
        setReactCode(post.react_code || '')
        setHtmlContent(post.content)
        editor.commands.setContent(post.content)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoadingPost(false))
  }, [id, editor])

  // 保存
  const handleSave = async () => {
    if (!title.trim()) {
      setError('请输入标题')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload: CreatePostInput = {
        title: title.trim(),
        content: htmlContent,
        tags,
        category,
        published,
        react_code: reactCode || undefined,
      }
      if (isEditing && id) {
        await updatePost(id, payload)
      } else {
        await createPost(payload)
      }
      navigate('/blog')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (loadingPost) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[900px] px-4 py-20 md:px-6">
      {/* 顶部操作栏 */}
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/blog" />}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          返回列表
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
            <Eye className="mr-1.5 h-4 w-4" />
            预览
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="mr-1.5 h-4 w-4" />
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="space-y-4 pb-4">
          {/* 标题 */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="文章标题"
            className="w-full border-none bg-transparent text-2xl font-bold tracking-tight outline-none placeholder:text-muted-foreground md:text-3xl"
          />

          {/* 分类 + 标签行 */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="标签（逗号分隔）"
              className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />

            {/* 发布/草稿 切换 */}
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              发布
            </label>
          </div>

          {/* 标签预览 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {/* 工具栏 */}
          {!sourceMode && (
            <div className="flex flex-wrap items-center gap-1 rounded-md border border-border bg-muted/30 p-1.5">
              <ToolbarBtn title="加粗" active={editor?.isActive('bold')} onClick={() => editor?.chain().focus().toggleBold().run()}>
                <Bold className="h-4 w-4" />
              </ToolbarBtn>
              <ToolbarBtn title="斜体" active={editor?.isActive('italic')} onClick={() => editor?.chain().focus().toggleItalic().run()}>
                <Italic className="h-4 w-4" />
              </ToolbarBtn>
              <ToolbarBtn title="下划线" active={editor?.isActive('underline')} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
                <UnderlineIcon className="h-4 w-4" />
              </ToolbarBtn>
              <div className="mx-1 h-5 w-px bg-border" />
              <ToolbarBtn title="标题 1" active={editor?.isActive('heading', { level: 1 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>
                <Heading1 className="h-4 w-4" />
              </ToolbarBtn>
              <ToolbarBtn title="标题 2" active={editor?.isActive('heading', { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
                <Heading2 className="h-4 w-4" />
              </ToolbarBtn>
              <div className="mx-1 h-5 w-px bg-border" />
              <ToolbarBtn title="无序列表" active={editor?.isActive('bulletList')} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
                <List className="h-4 w-4" />
              </ToolbarBtn>
              <ToolbarBtn title="有序列表" active={editor?.isActive('orderedList')} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
                <ListOrdered className="h-4 w-4" />
              </ToolbarBtn>
              <div className="mx-1 h-5 w-px bg-border" />
              <ToolbarBtn title="代码块" active={editor?.isActive('codeBlock')} onClick={() => editor?.chain().focus().toggleCodeBlock().run()}>
                <Code className="h-4 w-4" />
              </ToolbarBtn>
              <ToolbarBtn
                title="插入链接"
                active={editor?.isActive('link')}
                onClick={() => {
                  const url = window.prompt('请输入链接地址')
                  if (url) {
                    editor?.chain().focus().setLink({ href: url }).run()
                  }
                }}
              >
                <LinkIcon className="h-4 w-4" />
              </ToolbarBtn>
              <ToolbarBtn
                title="插入图片"
                onClick={() => {
                  const url = window.prompt('请输入图片地址')
                  if (url) {
                    editor?.chain().focus().setImage({ src: url }).run()
                  }
                }}
              >
                <ImageIcon className="h-4 w-4" />
              </ToolbarBtn>
            </div>
          )}

          {/* 编辑器 / 源码 切换 */}
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={toggleSourceMode}>
              <FileText className="mr-1.5 h-4 w-4" />
              {sourceMode ? '编辑器模式' : 'HTML 源码'}
            </Button>
          </div>

          {/* 编辑器区域 */}
          {sourceMode ? (
            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              className="min-h-[400px] w-full rounded-md border border-input bg-background p-4 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="HTML 源码..."
            />
          ) : (
            <div className="min-h-[400px] rounded-md border border-input bg-background shadow-sm">
              <EditorContent
                editor={editor}
                className="prose-tutorial [&_.tiptap]:min-h-[400px] [&_.tiptap]:outline-none [&_.tiptap]:p-4 [&_.tiptap]:focus:outline-none"
              />
            </div>
          )}

          {/* 管理员：React 组件模式 */}
          {isAdmin && (
            <div className="space-y-2 rounded-md border border-dashed border-primary/30 p-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">管理员</Badge>
                <span className="text-sm font-medium">React 组件（可选）</span>
              </div>
              <textarea
                value={reactCode}
                onChange={(e) => setReactCode(e.target.value)}
                className="min-h-[120px] w-full rounded-md border border-input bg-background p-3 font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder={'function App() {\n  return <div>你好世界</div>\n}'}
              />
              <p className="text-xs text-muted-foreground">
                写一个导出 App 组件的 JSX 代码，将在文章页面以沙盒 iframe 渲染。
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 预览弹窗 */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-border bg-background p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">文章预览</h2>
              <Button variant="ghost" size="sm" onClick={() => setPreviewOpen(false)}>
                <EyeOff className="mr-1.5 h-4 w-4" />
                关闭
              </Button>
            </div>
            <h1 className="mb-4 text-3xl font-bold tracking-tight">{title || '无标题'}</h1>
            <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">{category}</Badge>
              {tags.map((t) => (
                <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
              ))}
            </div>
            <article
              className="prose-tutorial"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
