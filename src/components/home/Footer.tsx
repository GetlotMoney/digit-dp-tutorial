import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row md:px-6">
        <p className="text-sm text-muted-foreground">
          咕嘎学不会算法 · 把抽象的算法变成看得见的动画
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link to="/topics" className="hover:text-foreground">专题</Link>
          <Link to="/blog" className="hover:text-foreground">博客</Link>
          <Link to="/about" className="hover:text-foreground">关于</Link>
        </div>
      </div>
    </footer>
  )
}
