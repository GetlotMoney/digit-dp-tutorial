/**
 * 从 Markdown 内容中提取 h2/h3 标题，生成层级目录。
 * 返回 { id, text, level } 数组，level 2 = h2，level 3 = h3。
 */
export type HeadingItem = {
  id: string
  text: string
  level: 2 | 3
}

/** 简单 slug 生成：中文取前 8 字符 + hash，英文转 kebab-case */
export function slugify(text: string): string {
  // 移除 markdown 格式（**bold**、`code`、$math$）
  const clean = text
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/\$/g, '')
    .replace(/[()[\]{}]/g, '')
    .trim()

  // 英文 slug
  if (/^[a-zA-Z0-9\s\-_/]+$/.test(clean)) {
    return clean
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 40)
  }

  // 中文 slug：取前 8 字符 + 简单 hash
  const chars = clean.replace(/\s+/g, '').slice(0, 8)
  let hash = 0
  for (let i = 0; i < clean.length; i++) {
    hash = ((hash << 5) - hash + clean.charCodeAt(i)) | 0
  }
  return `h-${chars}-${Math.abs(hash).toString(36)}`
}

export function extractHeadings(markdown: string): HeadingItem[] {
  const lines = markdown.split('\n')
  const headings: HeadingItem[] = []

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (match) {
      const level = match[1].length as 2 | 3
      const text = match[2].trim()
      const id = slugify(text)
      headings.push({ id, text, level })
    }
  }

  return headings
}
