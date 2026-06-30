import { Construction } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function ProblemsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 md:px-6">
      <h1 className="text-3xl font-bold">题库</h1>
      <Card className="mt-8 flex flex-col items-center justify-center gap-4 p-12 text-center">
        <Construction className="h-12 w-12 text-muted-foreground" />
        <div>
          <h2 className="text-xl font-semibold">即将上线</h2>
          <p className="mt-2 text-muted-foreground">
            在线做题、进度追踪、笔记功能将在后续阶段加入。
          </p>
        </div>
        <Button variant="default" nativeButton={false} render={<Link to="/topics/digit-dp" />}>先去看教程</Button>
      </Card>
    </div>
  )
}
