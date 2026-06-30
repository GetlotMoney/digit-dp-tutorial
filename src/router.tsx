import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { App } from './App'
import LandingPage from './pages/LandingPage'
import TopicsPage from './pages/TopicsPage'
import TopicPage from './pages/TopicPage'
import BlogListPage from './pages/BlogListPage'
import BlogPostPage from './pages/BlogPostPage'
import ProblemsPage from './pages/ProblemsPage'
import AboutPage from './pages/AboutPage'
import NotFoundPage from './pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'topics', element: <TopicsPage /> },
      { path: 'topics/:topicId', element: <TopicPage /> },
      { path: 'tutorial', element: <Navigate to="/topics/digit-dp" replace /> },
      { path: 'blog', element: <BlogListPage /> },
      { path: 'blog/:slug', element: <BlogPostPage /> },
      { path: 'problems', element: <ProblemsPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export function Router() {
  return <RouterProvider router={router} />
}
