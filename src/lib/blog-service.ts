import { supabase } from '@/lib/supabase'

// ---- 类型定义 ----

export type BlogPost = {
  id: string
  title: string
  content: string
  react_code: string
  tags: string[]
  category: string
  author_id: string
  author_name: string
  published: boolean
  created_at: string
  updated_at: string
}

export type CreatePostInput = {
  title: string
  content: string
  react_code?: string
  tags: string[]
  category: string
  published?: boolean
}

// ---- CRUD 函数 ----

/** 获取已发布文章，支持按分类/标签过滤 */
export async function getPublishedPosts(
  filters?: { category?: string; tag?: string }
): Promise<BlogPost[]> {
  let query = supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.tag) {
    query = query.contains('tags', [filters.tag])
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as BlogPost[]
}

/** 根据 ID 获取单篇文章 */
export async function getPostById(id: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // 未找到
    throw new Error(error.message)
  }
  return data as BlogPost
}

/** 获取某作者的所有文章（含未发布） */
export async function getPostsByAuthor(authorId: string): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('author_id', authorId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as BlogPost[]
}

/** 创建新文章 */
export async function createPost(post: CreatePostInput): Promise<BlogPost> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('未登录')

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      title: post.title,
      content: post.content,
      react_code: post.react_code ?? '',
      tags: post.tags,
      category: post.category,
      published: post.published ?? false,
      author_id: user.id,
      author_name: user.user_metadata?.username ?? user.email ?? '',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as BlogPost
}

/** 更新文章 */
export async function updatePost(
  id: string,
  updates: Partial<CreatePostInput>
): Promise<BlogPost> {
  const { data, error } = await supabase
    .from('blog_posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as BlogPost
}

/** 删除文章 */
export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

/** 获取所有分类（来自已发布文章） */
export async function getAllCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('category')
    .eq('published', true)

  if (error) throw new Error(error.message)

  const categories = [...new Set((data ?? []).map((row) => row.category))]
  return categories.sort()
}

/** 获取所有标签（来自已发布文章） */
export async function getAllTags(): Promise<string[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('tags')
    .eq('published', true)

  if (error) throw new Error(error.message)

  const tagSet = new Set<string>()
  for (const row of data ?? []) {
    for (const tag of (row.tags as string[]) ?? []) {
      tagSet.add(tag)
    }
  }
  return [...tagSet].sort()
}

// ---- 图片上传 ----

/**
 * 上传图片到 Supabase Storage 并返回公开 URL。
 * 需要在 Supabase Dashboard 创建名为 'blog-images' 的 public bucket：
 * Storage → New bucket → name: blog-images → public 勾选。
 */
export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'png'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { data, error } = await supabase.storage
    .from('blog-images')
    .upload(path, file, { contentType: file.type })
  if (error) throw new Error(`图片上传失败: ${error.message}`)
  const { data: urlData } = supabase.storage
    .from('blog-images')
    .getPublicUrl(data.path)
  return urlData.publicUrl
}

// ---- 管理员工具 ----

/**
 * 将某个用户设为管理员。
 * 注意：此操作需要 service_role 权限，无法在客户端直接完成。
 * 请在 Supabase SQL Editor 中运行以下 SQL：
 *
 * UPDATE auth.users
 * SET raw_user_meta_data = raw_user_meta_data || '{"role":"admin"}'
 * WHERE id = '<user-id>';
 */
export async function setAdminRole(_userId: string): Promise<void> {
  console.warn(
    'setAdminRole 需要在 Supabase SQL Editor 中手动执行 SQL，请参见 supabase-schema.sql 末尾的注释。'
  )
}
