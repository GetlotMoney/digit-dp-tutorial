import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { TopBar } from '@/components/layout/TopBar'
import { PageTransition } from '@/components/layout/PageTransition'
import { Footer } from '@/components/home/Footer'

export function App() {
  const location = useLocation()
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

export default App
