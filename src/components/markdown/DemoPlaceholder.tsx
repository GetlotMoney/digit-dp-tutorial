import { Loader2, Play } from 'lucide-react'

const DEMO_LABELS: Record<string, string> = {
  prefixsum: '前缀和转化',
  filldigits: '逐位填数 + limit/lead0 状态',
  memtree: '记忆化递归树',
  waviness: '波动值（峰谷）判定',
  fullproblem: '完整例题 LeetCode 3753',
}

export function DemoPlaceholder({
  name,
  loading = false,
}: {
  name: string
  loading?: boolean
}) {
  const label = DEMO_LABELS[name] ?? name
  return (
    <div className="my-6 flex items-center gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      ) : (
        <Play className="h-4 w-4 text-primary" />
      )}
      <span>
        交互演示 · <strong className="text-foreground">{label}</strong>
        {!loading && '（将在 M3 阶段上线）'}
      </span>
    </div>
  )
}
