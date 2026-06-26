import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row md:px-6">
        <p className="text-sm text-muted-foreground">
          数位 DP 交互教程 · 把只能靠脑补的状态变成看得见的动画
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link to="/about" className="hover:text-foreground">关于</Link>
          <Link to="/tutorial" className="hover:text-foreground">教程</Link>
          <Link to="/problems" className="hover:text-foreground">题库</Link>
        </div>
      </div>
    </footer>
  )
}
