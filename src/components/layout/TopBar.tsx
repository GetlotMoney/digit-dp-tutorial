import { useState, useCallback } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Binary, Menu, X } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { SidebarNav } from './SidebarNav'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/', label: '首页', end: true },
  { to: '/tutorial', label: '教程' },
  { to: '/problems', label: '题库' },
  { to: '/about', label: '关于' },
]

export function TopBar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeMobile = useCallback(() => setMobileOpen(false), [])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Binary className="h-5 w-5" />
          </span>
          <span className="hidden sm:inline">数位 DP</span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="default" size="sm" className="hidden sm:inline-flex" nativeButton={false} render={<Link to="/tutorial" />}>
            开始学习
          </Button>
          <ThemeToggle />

          {/* 移动端菜单按钮 */}
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            aria-label={mobileOpen ? '关闭目录' : '打开目录'}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* 移动端侧栏抽屉 */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
            onClick={closeMobile}
          />
          <div
            className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-border bg-background px-4 py-16 md:hidden"
          >
            <div className="px-2 pb-2 text-sm font-semibold text-muted-foreground">教程目录</div>
            <SidebarNav onNavigate={closeMobile} />
          </div>
        </>
      )}
    </header>
  )
}
