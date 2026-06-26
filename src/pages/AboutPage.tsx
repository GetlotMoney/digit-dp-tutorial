import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const STACK = [
  'Vite', 'React 18', 'TypeScript', 'Tailwind CSS v4',
  'shadcn/ui', 'Framer Motion', 'react-markdown', 'Shiki', 'KaTeX',
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 md:px-6">
      <h1 className="text-3xl font-bold">关于本项目</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        一个以「数位 DP」为首批专题、面向竞赛与求职者的交互式算法教程网站。
        把只能靠脑补的 DP 状态用可操作的演示讲透，按工程化标准组织内容与代码。
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>技术栈</CardTitle>
          <CardDescription>当前工程化阶段（阶段 A）所用技术</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {STACK.map((s) => (
              <Badge key={s} variant="secondary">{s}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>核心心法</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed">
            永远把区间计数问题转化为 <code className="rounded bg-muted px-1.5 py-0.5">f(R) − f(L−1)</code>，
            即求「<code className="rounded bg-muted px-1.5 py-0.5">[0, N]</code> 满足条件的个数」。
            掌握这一点，就掌握了数位 DP 的半壁江山。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
