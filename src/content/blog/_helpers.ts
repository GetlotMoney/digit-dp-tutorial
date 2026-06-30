/**
 * 简易 frontmatter 解析器：提取 --- 之间的 YAML 键值对。
 * 支持 string / array / number 类型，足够满足博客场景。
 */
export function parseFrontmatter(raw: string): {
  frontmatter: Record<string, unknown>
  body: string
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { frontmatter: {}, body: raw }

  const yaml = match[1]
  const body = match[2]
  const fm: Record<string, unknown> = {}

  for (const line of yaml.split('\n')) {
    const m = line.match(/^(\w+)\s*:\s*(.+)$/)
    if (!m) continue
    const key = m[1].trim()
    let val: unknown = m[2].trim()

    // 数组：[a, b, c]
    if (typeof val === 'string' && val.startsWith('[') && val.endsWith(']')) {
      val = val
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
    }
    // 去掉引号
    if (typeof val === 'string') {
      val = val.replace(/^['"]|['"]$/g, '')
    }

    fm[key] = val
  }

  return { frontmatter: fm, body }
}
