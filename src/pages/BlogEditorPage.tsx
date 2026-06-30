import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import LinkExtension from '@tiptap/extension-link'
import ImageExtension from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { common, createLowlight } from 'lowlight'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, ListChecks,
  Code, Link as LinkIcon, ImageIcon,
  Quote, Minus, Undo2, Redo2,
  Save, ArrowLeft, Eye, EyeOff, FileCode, Upload,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  createPost, updatePost, getPostById, uploadImage,
  type BlogPost, type CreatePostInput,
} from '@/lib/blog-service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const CATEGORIES = ['算法', '数据结构', '学习笔记', '博客', '其他']
const lowlight = createLowlight(common)

/* ================================================================
   工具栏按钮
   ================================================================ */
function ToolbarBtn({
  active, onClick, children, title, disabled,
}: {
  active?: boolean; onClick: () => void; children: React.ReactNode; title: string; disabled?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-7 w-7 items-center justify-center rounded text-sm transition-colors disabled:opacity-40 ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px bg-border" />
}

/* ================================================================
   上传进度提示
   ================================================================ */
function UploadToast({ progress }: { progress: number }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 shadow-lg">
      <Upload className="h-4 w-4 animate-pulse text-primary" />
      <span className="text-sm">图片上传中... {progress}%</span>
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

/* ================================================================
   主组件
   ================================================================ */
export default function BlogEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()

  // 表单状态
  const [title, setTitle] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [customCategory, setCustomCategory] = useState('')
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const [published, setPublished] = useState(false)
  const [reactCode, setReactCode] = useState('')
  const [sourceMode, setSourceMode] = useState(false)
  const [htmlContent, setHtmlContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingPost, setLoadingPost] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  // 用于 source mode textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // 文件 input ref
  const fileInputRef = useRef<HTMLInputElement>(null)

  const tags = tagsInput
    .split(/[,，]/)
    .map((t) => t.trim())
    .filter(Boolean)

  const isEditing = Boolean(id)
  const currentCategory = isCustomCategory ? customCategory : category

  /* ---- 图片上传处理 ---- */
  const handleImageUpload = useCallback(async (file: File) => {
    setUploadProgress(0)
    try {
      // 模拟进度（Supabase SDK 不提供上传进度回调）
      const timer = setInterval(() => {
        setUploadProgress((p) => {
          if (p === null || p >= 90) { clearInterval(timer); return 90 }
          return p + 10
        })
      }, 200)
      const url = await uploadImage(file)
      clearInterval(timer)
      setUploadProgress(100)
      setTimeout(() => setUploadProgress(null), 600)
      return url
    } catch (e) {
      setUploadProgress(null)
      throw e
    }
  }, [])

  /* ---- TipTap 编辑器 ---- */
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      Strike,
      LinkExtension.configure({ openOnClick: false }),
      ImageExtension.configure({ allowBase64: false }),
      Placeholder.configure({ placeholder: '开始写博客内容...（支持拖拽图片上传）' }),
      CodeBlockLowlight.configure({ lowlight }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: '',
    onUpdate: ({ editor: ed }) => {
      setHtmlContent(ed.getHTML())
    },
  })

  /* ---- 拖拽 & 粘贴图片 ---- */
  useEffect(() => {
    if (!editor) return
    const editorEl = document.querySelector('.tiptap-editor-area') as HTMLElement | null
    if (!editorEl) return

    const handleFiles = async (files: FileList | File[]) => {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue
        try {
          const url = await handleImageUpload(file)
          editor.chain().focus().setImage({ src: url }).run()
        } catch (e) {
          setError(e instanceof Error ? e.message : '图片上传失败')
        }
      }
    }

    const onDrop = (e: DragEvent) => {
      e.preventDefault()
      if (e.dataTransfer?.files.length) {
        handleFiles(e.dataTransfer.files)
      }
    }

    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      const imageFiles: File[] = []
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) imageFiles.push(file)
        }
      }
      if (imageFiles.length) {
        e.preventDefault()
        handleFiles(imageFiles)
      }
    }

    const onDragOver = (e: DragEvent) => { e.preventDefault() }

    editorEl.addEventListener('drop', onDrop)
    editorEl.addEventListener('paste', onPaste)
    editorEl.addEventListener('dragover', onDragOver)
    return () => {
      editorEl.removeEventListener('drop', onDrop)
      editorEl.removeEventListener('paste', onPaste)
      editorEl.removeEventListener('dragover', onDragOver)
    }
  }, [editor, handleImageUpload])

  /* ---- 进入 sourceMode 时同步编辑器内容到 textarea ---- */
  const toggleSourceMode = useCallback(() => {
    if (sourceMode) {
      // 切回编辑器模式：把 textarea 内容写回编辑器
      editor?.commands.setContent(htmlContent)
    }
    setSourceMode((v) => !v)
  }, [sourceMode, editor, htmlContent])

  /* ---- 编辑模式：加载已有文章 ---- */
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
        setPublished(post.published)
        setReactCode(post.react_code || '')
        setHtmlContent(post.content)
        editor.commands.setContent(post.content)
        // 恢复分类
        if (CATEGORIES.includes(post.category)) {
          setCategory(post.category)
          setIsCustomCategory(false)
        } else {
          setIsCustomCategory(true)
          setCustomCategory(post.category)
        }
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoadingPost(false))
  }, [id, editor])

  /* ---- 保存 ---- */
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
        category: currentCategory,
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

  /* ---- 工具栏操作 ---- */
  const insertImageFromFile = () => {
    fileInputRef.current?.click()
  }

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await handleImageUpload(file)
      editor?.chain().focus().setImage({ src: url }).run()
    } catch (err) {
      setError(err instanceof Error ? err.message : '图片上传失败')
    }
    // 重置 input 以便重复选择同一文件
    e.target.value = ''
  }

  const insertLink = () => {
    const url = window.prompt('请输入链接地址')
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run()
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
    <div className="flex h-[calc(100vh-56px)] flex-col pt-14">
      {/* ---- 顶部栏 ---- */}
      <div className="sticky top-14 z-20 shrink-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        {/* 第一行：操作按钮 */}
        <div className="flex items-center justify-between px-4 py-2">
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/blog" />}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            返回
          </Button>

          <div className="flex items-center gap-2">
            {error && (
              <span className="mr-2 max-w-xs truncate text-xs text-destructive">{error}</span>
            )}
            <Button
              variant={sourceMode ? 'secondary' : 'ghost'}
              size="sm"
              onClick={toggleSourceMode}
            >
              <FileCode className="mr-1 h-4 w-4" />
              {sourceMode ? '编辑器' : '源码'}
            </Button>
            <label className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-input accent-primary"
              />
              <span className="text-muted-foreground">发布</span>
            </label>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="mr-1.5 h-4 w-4" />
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>

        {/* 第二行：标题 */}
        <div className="px-4 pb-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入文章标题..."
            className="w-full border-none bg-transparent text-xl font-bold tracking-tight outline-none placeholder:text-muted-foreground md:text-2xl"
          />
        </div>

        {/* 第三行：分类 + 标签 */}
        <div className="flex flex-wrap items-center gap-2 px-4 pb-2">
          <select
            value={isCustomCategory ? '__custom__' : category}
            onChange={(e) => {
              if (e.target.value === '__custom__') {
                setIsCustomCategory(true)
              } else {
                setIsCustomCategory(false)
                setCategory(e.target.value)
              }
            }}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="__custom__">自定义...</option>
          </select>

          {isCustomCategory && (
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="自定义分类"
              className="h-8 w-32 rounded-md border border-input bg-background px-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          )}

          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="标签（逗号分隔）"
            className="h-8 min-w-[200px] flex-1 rounded-md border border-input bg-background px-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((t) => (
                <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---- 工具栏（仅编辑器模式） ---- */}
      {!sourceMode && (
        <div className="shrink-0 border-b border-border bg-muted/20 px-3 py-1.5">
          <div className="flex flex-wrap items-center gap-0.5">
            {/* 文本格式 */}
            <ToolbarBtn title="加粗" active={editor?.isActive('bold')} onClick={() => editor?.chain().focus().toggleBold().run()}>
              <Bold className="h-4 w-4" />
            </ToolbarBtn>
            <ToolbarBtn title="斜体" active={editor?.isActive('italic')} onClick={() => editor?.chain().focus().toggleItalic().run()}>
              <Italic className="h-4 w-4" />
            </ToolbarBtn>
            <ToolbarBtn title="下划线" active={editor?.isActive('underline')} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
              <UnderlineIcon className="h-4 w-4" />
            </ToolbarBtn>
            <ToolbarBtn title="删除线" active={editor?.isActive('strike')} onClick={() => editor?.chain().focus().toggleStrike().run()}>
              <Strikethrough className="h-4 w-4" />
            </ToolbarBtn>

            <ToolbarDivider />

            {/* 标题 */}
            <ToolbarBtn title="标题 1" active={editor?.isActive('heading', { level: 1 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>
              <Heading1 className="h-4 w-4" />
            </ToolbarBtn>
            <ToolbarBtn title="标题 2" active={editor?.isActive('heading', { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
              <Heading2 className="h-4 w-4" />
            </ToolbarBtn>
            <ToolbarBtn title="标题 3" active={editor?.isActive('heading', { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>
              <Heading3 className="h-4 w-4" />
            </ToolbarBtn>

            <ToolbarDivider />

            {/* 列表 */}
            <ToolbarBtn title="无序列表" active={editor?.isActive('bulletList')} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
              <List className="h-4 w-4" />
            </ToolbarBtn>
            <ToolbarBtn title="有序列表" active={editor?.isActive('orderedList')} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
              <ListOrdered className="h-4 w-4" />
            </ToolbarBtn>
            <ToolbarBtn title="任务列表" active={editor?.isActive('taskList')} onClick={() => editor?.chain().focus().toggleTaskList().run()}>
              <ListChecks className="h-4 w-4" />
            </ToolbarBtn>

            <ToolbarDivider />

            {/* 块级元素 */}
            <ToolbarBtn title="代码块" active={editor?.isActive('codeBlock')} onClick={() => editor?.chain().focus().toggleCodeBlock().run()}>
              <Code className="h-4 w-4" />
            </ToolbarBtn>
            <ToolbarBtn title="引用" active={editor?.isActive('blockquote')} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
              <Quote className="h-4 w-4" />
            </ToolbarBtn>
            <ToolbarBtn title="分割线" onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
              <Minus className="h-4 w-4" />
            </ToolbarBtn>

            <ToolbarDivider />

            {/* 插入 */}
            <ToolbarBtn title="插入链接" active={editor?.isActive('link')} onClick={insertLink}>
              <LinkIcon className="h-4 w-4" />
            </ToolbarBtn>
            <ToolbarBtn title="插入图片" onClick={insertImageFromFile}>
              <ImageIcon className="h-4 w-4" />
            </ToolbarBtn>

            <ToolbarDivider />

            {/* 撤销/重做 */}
            <ToolbarBtn title="撤销" onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()}>
              <Undo2 className="h-4 w-4" />
            </ToolbarBtn>
            <ToolbarBtn title="重做" onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()}>
              <Redo2 className="h-4 w-4" />
            </ToolbarBtn>
          </div>
        </div>
      )}

      {/* 隐藏的文件 input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileSelected}
      />

      {/* ---- 编辑器主体（分栏） ---- */}
      <div className="flex min-h-0 flex-1">
        {/* 左栏：编辑器 */}
        <div className="flex min-w-0 flex-1 flex-col border-r border-border">
          {sourceMode ? (
            <textarea
              ref={textareaRef}
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              className="min-h-0 flex-1 resize-none border-none bg-background p-4 font-mono text-sm leading-relaxed outline-none focus-visible:ring-0"
              placeholder="HTML 源码..."
              spellCheck={false}
            />
          ) : (
            <div className="tiptap-editor-area min-h-0 flex-1 overflow-y-auto">
              <EditorContent
                editor={editor}
                className="[&_.tiptap]:min-h-full [&_.tiptap]:outline-none [&_.tiptap]:p-4 [&_.tiptap]:focus:outline-none prose-tutorial"
              />
            </div>
          )}
        </div>

        {/* 右栏：实时预览 */}
        <div className="hidden min-w-0 flex-1 flex-col md:flex">
          <div className="shrink-0 border-b border-border bg-muted/30 px-4 py-1.5">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Eye className="h-3.5 w-3.5" />
              实时预览
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            {title && (
              <h1 className="mb-4 text-2xl font-bold tracking-tight">{title}</h1>
            )}
            {(currentCategory || tags.length > 0) && (
              <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {currentCategory && <Badge variant="secondary">{currentCategory}</Badge>}
                {tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                ))}
              </div>
            )}
            <article
              className="prose-tutorial"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        </div>
      </div>

      {/* ---- 管理员：React 组件 ---- */}
      {isAdmin && (
        <div className="shrink-0 border-t border-dashed border-primary/30 bg-muted/10 px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-xs">管理员</Badge>
            <span className="text-sm font-medium">React 组件（可选）</span>
          </div>
          <textarea
            value={reactCode}
            onChange={(e) => setReactCode(e.target.value)}
            className="h-20 w-full resize-none rounded-md border border-input bg-background p-2 font-mono text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder={'function App() {\n  return <div>你好世界</div>\n}'}
          />
        </div>
      )}

      {/* ---- 上传进度提示 ---- */}
      {uploadProgress !== null && <UploadToast progress={uploadProgress} />}
    </div>
  )
}
