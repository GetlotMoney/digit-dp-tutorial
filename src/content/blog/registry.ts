import type { BlogPost } from './types'
import { parseFrontmatter } from './_helpers'

// Vite glob 导入所有 .md 文件为字符串（排除以 _ 开头的文件不会匹配 *.md）
const modules = import.meta.glob('./*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** 从文件路径提取 slug，例如 "./2026-06-30-hello.md" → "2026-06-30-hello" */
function pathToSlug(path: string): string {
  return path.replace(/^\.\/|\.md$/g, '')
}

/** 解析所有博客文章，按日期降序排列 */
export function getBlogPosts(): BlogPost[] {
  const posts: BlogPost[] = []

  for (const [path, raw] of Object.entries(modules)) {
    const slug = pathToSlug(path)
    const { frontmatter, body } = parseFrontmatter(raw)

    posts.push({
      slug,
      title: (frontmatter.title as string) ?? slug,
      date: (frontmatter.date as string) ?? '',
      summary: (frontmatter.summary as string) ?? '',
      tags: Array.isArray(frontmatter.tags) ? (frontmatter.tags as string[]) : [],
      content: body,
    })
  }

  // 按日期降序（最新的在前面）
  posts.sort((a, b) => b.date.localeCompare(a.date))
  return posts
}

/** 根据 slug 获取单篇文章，未找到返回 null */
export function getBlogPost(slug: string): BlogPost | null {
  const raw = modules[`./${slug}.md`]
  if (!raw) return null

  const { frontmatter, body } = parseFrontmatter(raw)
  return {
    slug,
    title: (frontmatter.title as string) ?? slug,
    date: (frontmatter.date as string) ?? '',
    summary: (frontmatter.summary as string) ?? '',
    tags: Array.isArray(frontmatter.tags) ? (frontmatter.tags as string[]) : [],
    content: body,
  }
}
