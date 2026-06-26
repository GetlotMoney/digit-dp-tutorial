import { useMemo, useState } from 'react'
import { DemoFrame } from '@/demos/DemoFrame'
import { toDigits } from '@/demos/shared/utils'

interface TreeNode {
  text: string
  cls: 'hit' | 'miss' | 'cache' | ''
}

// 记忆化递归树演示：展示为什么只缓存 limit=0 && lead0=0 的状态
export default function MemTreeDemo() {
  const [N, setN] = useState(23)
  const digits = useMemo(() => toDigits(N), [N])
  const len = digits.length

  const { lines, stats } = useMemo(() => {
    const lines: TreeNode[] = []
    let total = 0
    let cached = 0
    let hits = 0
    const memo = new Set<string>()
    const key = (pos: number, l: boolean, ld: boolean) =>
      `${pos},${l ? 1 : 0},${ld ? 1 : 0}`

    function rec(pos: number, limit: boolean, lead0: boolean, depth: number) {
      total++
      const indent = '  '.repeat(depth)
      if (pos === -1) {
        lines.push({ text: indent + '□ 叶(返回1)', cls: '' })
        return
      }
      const up = limit ? digits[pos] : 9
      const isFree = !limit && !lead0
      let tag = ''
      let cls: TreeNode['cls'] = ''
      if (isFree) {
        const k = key(pos, limit, lead0)
        if (memo.has(k)) {
          hits++
          lines.push({
            text: indent + `◉ 命中缓存(pos=${pos},自由)`,
            cls: 'hit',
          })
          return
        }
        memo.add(k)
        cached++
        tag = ' [缓存]'
        cls = 'cache'
      } else {
        tag = limit ? ' [受限·不缓存]' : lead0 ? ' [前导零·不缓存]' : ''
        cls = 'miss'
      }
      const icon = limit ? '🔒' : lead0 ? '🔅' : '🟢'
      lines.push({ text: indent + `${icon} pos=${pos} up=${up}${tag}`, cls })
      for (let d = 0; d <= up; d++) {
        rec(pos - 1, limit && d === up, lead0 && d === 0, depth + 1)
      }
    }

    rec(len - 1, true, true, 0)
    return { lines, stats: { total, cached, hits } }
  }, [N, digits, len])

  return (
    <DemoFrame
      title="记忆化递归树"
      desc="以「统计 [0,N] 中数的个数」为线索画递归树。🔒红=受限(不缓存)，🔅黄=前导零(不缓存)，🟢绿=自由状态(缓存)。命中缓存时不再展开。"
    >
      <div className="demo-controls">
        <label>
          N ={' '}
          <input
            type="number"
            value={N}
            onChange={(e) =>
              setN(Math.max(1, Math.min(999, +e.target.value || 1)))
            }
          />
        </label>
        <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
          (建议 1-999 以保证树可读)
        </span>
      </div>

      <div className="tree">
        {lines.map((l, i) => (
          <div key={i} className={l.cls}>
            {l.text}
          </div>
        ))}
      </div>

      <div className="statline">
        节点总数(若不记忆化)：<b>{stats.total}</b> | 自由状态被缓存：
        <b>{stats.cached}</b> | 命中缓存次数：<b>{stats.hits}</b>
        <br />
        对比：暴力枚举 [0,{N}] 要遍历 <b>{N + 1}</b> 个数；数位
        DP+记忆化把复杂度压到与位数×状态数相关。
      </div>

      <div className="legend">
        <span>
          <span className="hit">命中缓存</span>
        </span>
        <span>
          <span className="cache">首次缓存</span>
        </span>
        <span>
          <span className="miss">受限/前导零(不缓存)</span>
        </span>
      </div>

      <div
        className="mt-3 rounded-lg border-l-4 border-emerald-500 bg-emerald-500/10 px-4 py-3 text-sm"
        style={{ marginTop: 12 }}
      >
        <strong>关键：</strong> 只有 <code>limit=0 &amp;&amp; lead0=0</code>
        (绿色)的节点才进缓存。受限(limit=1)和前导零(lead0=1)分支各自只走一条由
        N 决定的单链，没有重复子问题，缓存无收益；且 limit=1
        的状态依赖 a[pos] 具体值，跨路径复用会读到错误结果。
      </div>
    </DemoFrame>
  )
}