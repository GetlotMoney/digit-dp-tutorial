import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-32 text-center md:px-6">
      <p className="font-mono text-6xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold">页面不存在</h1>
      <p className="mt-2 text-muted-foreground">这个数位没填对 —— 超出上界了。</p>
      <Button className="mt-6" nativeButton={false} render={<Link to="/" />}>回到首页</Button>
    </div>
  )
}
