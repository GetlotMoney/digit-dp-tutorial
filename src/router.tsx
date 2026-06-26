import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { App } from './App'
import LandingPage from './pages/LandingPage'
import TutorialPage from './pages/TutorialPage'
import ProblemsPage from './pages/ProblemsPage'
import AboutPage from './pages/AboutPage'
import NotFoundPage from './pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'tutorial', element: <TutorialPage /> },
      { path: 'problems', element: <ProblemsPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export function Router() {
  return <RouterProvider router={router} />
}
