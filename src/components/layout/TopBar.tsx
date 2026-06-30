import { useState, useCallback } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Binary, Menu, X, LogOut, User as UserIcon } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { SidebarNav } from './SidebarNav'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/', label: '首页', end: true },
  { to: '/topics', label: '专题', end: true },
  { to: '/blog', label: '博客', end: false },
  { to: '/about', label: '关于', end: false },
]

export function TopBar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeMobile = useCallback(() => setMobileOpen(false), [])
  const { user, signOut, loading } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || '用户'

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Binary className="h-5 w-5" />
          </span>
          <span className="hidden sm:inline">咕嘎学不会算法</span>
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
          {!loading && (
            user ? (
              // 已登录：显示用户名 + 退出
              <div className="hidden items-center gap-2 sm:flex">
                <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  <UserIcon className="h-3.5 w-3.5" />
                  {username}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="退出登录">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              // 未登录：显示登录/注册
              <div className="hidden items-center gap-1.5 sm:flex">
                <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/login" />}>
                  登录
                </Button>
                <Button variant="default" size="sm" nativeButton={false} render={<Link to="/register" />}>
                  注册
                </Button>
              </div>
            )
          )}
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
