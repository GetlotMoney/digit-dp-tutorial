import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { TopBar } from '@/components/layout/TopBar'
import { PageTransition } from '@/components/layout/PageTransition'
import { Footer } from '@/components/home/Footer'
import LandingAuthPage from '@/pages/LandingAuthPage'

const PUBLIC_PATHS = ['/login', '/register']

function AppContent() {
  const location = useLocation()
  const { user, loading } = useAuth()
  const isPublicPath = PUBLIC_PATHS.includes(location.pathname)

  // 加载中：显示全屏 spinner
  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // 未登录 + 非公开路径 → 展示落地页
  if (!user && !isPublicPath) {
    return <LandingAuthPage />
  }

  // 已登录 或 公开路径 → 正常布局
  return (
    <div className="flex min-h-svh flex-col">
      <TopBar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
