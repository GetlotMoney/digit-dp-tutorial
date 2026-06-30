export type BlogPost = {
  slug: string
  title: string
  date: string // YYYY-MM-DD
  summary: string
  tags: string[]
  content: string // raw markdown（不含 frontmatter）
}
