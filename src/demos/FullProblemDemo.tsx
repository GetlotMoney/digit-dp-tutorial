import { useEffect, useMemo, useState } from 'react'
import { DemoFrame } from '@/demos/DemoFrame'
import { Badges } from '@/demos/shared/Badges'
import { DigitRow, Choices } from '@/demos/shared/DigitRow'
import { toDigits, wavinessOf } from '@/demos/shared/utils'

// 完整例题演示：LeetCode 3753 区间总波动值 = f(R) - f(L-1)
// 展示对 R 的填数路径，实时累计已填部分内部的峰谷贡献
export default function FullProblemDemo() {
  const [L, setL] = useState(120)
  const [R, setR] = useState(130)

  const brute = (lo: number, hi: number) => {
    let s = 0
    for (let k = lo; k <= hi; k++) s += wavinessOf(String(k)).w
    return s
  }
  const truth = brute(L, R)

  const digitsR = useMemo(() => toDigits(R), [R])
  const len = digitsR.length
  const [path, setPath] = useState<number[]>([])
  const [pos, setPos] = useState(0)

  useEffect(() => {
    setPath([])
    setPos(0)
  }, [R])

  const limit = useMemo(() => {
    for (let i = 0; i < pos; i++) if (path[i] !== digitsR[i]) return false
    return true
  }, [path, pos, digitsR])

  const lead0 = useMemo(() => {
    for (let i = 0; i < pos; i++) if (path[i] !== 0) return false
    return true
  }, [path, pos])

  const up = limit ? digitsR[pos] : 9
  const done = pos === len

  const filledWaviness = useMemo(() => {
    if (path.length < 3) return 0
    const ds = path.slice(0, pos)
    let w = 0
    for (let i = 1; i < ds.length - 1; i++) {
      if (ds[i] > ds[i - 1] && ds[i] > ds[i + 1]) w++
      else if (ds[i] < ds[i - 1] && ds[i] < ds[i + 1]) w++
    }
    return w
  }, [path, pos])

  function choose(d: number) {
    if (d > up) return
    const np = [...path]
    np[pos] = d
    setPath(np)
    setPos(pos + 1)
  }
  function back() {
    if (pos === 0) return
    const np = [...path]
    np.splice(pos - 1, 1)
    setPath(np)
    setPos(pos - 1)
  }
  function reset() {
    setPath([])
    setPos(0)
  }
  function autoOnePath() {
    const np: number[] = []
    for (let i = 0; i < len; i++) np[i] = digitsR[i]
    setPath(np)
    setPos(len)
  }

  return (
    <DemoFrame
      title="完整例题 LeetCode 3753"
      desc="区间 [L,R] 总波动值 = f(R) - f(L-1)。下面演示对 R 的填数过程：每填一位，已填部分内部的峰谷贡献实时累计(实际 DP 中还含对剩余自由位的统计，且贡献要乘子树计数)。"
    >
      <div className="demo-controls">
        <label>
          L ={' '}
          <input
            type="number"
            value={L}
            onChange={(e) => setL(Math.max(1, +e.target.value || 1))}
          />
        </label>
        <label>
          R ={' '}
          <input
            type="number"
            value={R}
            onChange={(e) => setR(Math.max(L, +e.target.value || L))}
          />
        </label>
      </div>

      <div className="statline">
        暴力校验：[{L},{R}] 总波动值 = <b>{truth}</b>
        (小数据直接枚举，用来验证 DP 结果)
      </div>

      <h4 style={{ marginTop: 18, color: 'var(--foreground)' }}>
        对 R={R} 走一条填数路径：
      </h4>

      <Badges limit={limit} lead0={lead0} />

      <DigitRow digits={digitsR} path={path} pos={pos} />

      <div className="demo-controls">
        <button className="sec" onClick={back} disabled={pos === 0}>
          ← 回退
        </button>
        <button className="sec" onClick={reset}>
          重置
        </button>
        <button onClick={autoOnePath} disabled={done}>
          沿上界填满
        </button>
      </div>

      {!done && <Choices up={up} onPick={choose} />}

      <div className="statline">
        已填序列：<b>{path.slice(0, pos).join('') || '(空)'}</b>
        <br />
        已填部分内部波动贡献：<b>{filledWaviness}</b>
        (剩余自由位还会贡献更多 —— DP 把这部分用记忆化批量算，且要乘子树计数)
      </div>

      <div
        className="mt-3 rounded-lg border-l-4 border-emerald-500 bg-emerald-500/10 px-4 py-3 text-sm"
        style={{ marginTop: 12 }}
      >
        <strong>理解：</strong> 数位 DP 不是一条路径，而是「所有合法路径的聚合」。
        单步演示只展示一条路径上峰谷如何产生；真正的 <code>f(R)</code>{' '}
        是对所有填法的贡献求和(每步贡献乘子树计数)，由 <code>dfs</code>{' '}
        递归完成。
      </div>
    </DemoFrame>
  )
}