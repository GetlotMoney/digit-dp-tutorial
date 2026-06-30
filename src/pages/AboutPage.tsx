import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const STACK_FRONTEND = [
  'Vite', 'React 19', 'TypeScript', 'Tailwind CSS v4',
  'shadcn/ui', 'Framer Motion', 'react-markdown', 'Shiki', 'KaTeX',
]

const STACK_DEPLOY = [
  'GitHub', 'Vercel',
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 md:px-6">
      <h1 className="text-3xl font-bold">关于本站</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        「咕嘎学不会算法」是一个交互式算法教程网站。
        不同于传统文字+代码的讲义，本站把算法的核心状态变化做成了可点可玩的演示——
        改参数、单步执行、观察变化，让抽象的概念变得直观。
      </p>

      <p className="mt-4 text-muted-foreground">
        本站面向准备算法竞赛（CSP/NOIP/ICPC）和刷题求职的学习者。
        内容参考 OI Wiki、洛谷、Codeforces 等权威来源，力求准确、简洁、由浅入深。
        如果发现错误，欢迎反馈。
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>技术栈</CardTitle>
          <CardDescription>前端工程化 + 静态部署，零服务器成本</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">前端</p>
            <div className="flex flex-wrap gap-2">
              {STACK_FRONTEND.map((s) => (
                <Badge key={s} variant="secondary">{s}</Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">部署</p>
            <div className="flex flex-wrap gap-2">
              {STACK_DEPLOY.map((s) => (
                <Badge key={s} variant="secondary">{s}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>如何使用</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• 点击「专题」浏览所有算法分类，选择感兴趣的开始学习</p>
          <p>• 带「交互演示」标签的专题配有可操作的可视化，动手试试效果最好</p>
          <p>• 代码块右上角有「复制」按钮，方便粘贴到本地练习</p>
          <p>• 支持暗色模式，点击右上角月亮图标切换</p>
        </CardContent>
      </Card>
    </div>
  )
}
