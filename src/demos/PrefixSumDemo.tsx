import { useState } from 'react'
import { DemoFrame } from '@/demos/DemoFrame'

// 前缀和转化演示：求 [L, R] 中偶数个数 = f(R) - f(L-1)
// f(n) = [0, n] 中偶数个数（含 0）
export default function PrefixSumDemo() {
  const [L, setL] = useState(3)
  const [R, setR] = useState(10)

  const cond = (x: number) => x % 2 === 0
  const f = (n: number) => {
    let c = 0
    for (let i = 0; i <= n; i++) if (cond(i)) c++
    return c
  }

  const fR = f(R)
  const fL = f(L - 1)
  const ans = fR - fL

  return (
    <DemoFrame
      title="前缀和转化"
      desc="问题：求 [L, R] 中「偶数」的个数。转化为 f(R) - f(L-1)，其中 f(n) = [0,n] 中偶数个数(含 0)。"
    >
      <div className="demo-controls">
        <label>
          L ={' '}
          <input
            type="number"
            value={L}
            onChange={(e) => setL(Math.max(0, +e.target.value || 0))}
          />
        </label>
        <label>
          R ={' '}
          <input
            type="number"
            value={R}
            onChange={(e) => setR(Math.max(L, +e.target.value || 0))}
          />
        </label>
      </div>
      <div className="rangebar" style={{ width: '100%' }}>
        <div className="seg b" style={{ width: `${(L / (R + 1)) * 100}%` }}>
          0…L-1
        </div>
        <div className="seg a" style={{ width: `${((R - L + 1) / (R + 1)) * 100}%` }}>
          L…R
        </div>
      </div>
      <div className="statline">
        区间 <b>[{L}, {R}]</b>。前缀和转化：
        <br />
        f({R}) = [0,{R}] 偶数个数 = <b>{fR}</b>
        <br />
        f({L - 1}) = [0,{L - 1}] 偶数个数 = <b>{fL}</b>
        <br />
        答案 = f({R}) - f({L - 1}) ={' '}
        <b>
          {fR} - {fL} = {ans}
        </b>
      </div>
      <div className="legend">
        <span>
          <span className="badge lead" style={{ padding: '2px 8px' }}>
            {' '}
          </span>{' '}
          [0,L-1] 被「减掉」
        </span>
        <span>
          <span className="badge free" style={{ padding: '2px 8px' }}>
            {' '}
          </span>{' '}
          [L,R] 我们要的
        </span>
      </div>
      <div
        className="mt-3 rounded-lg border-l-4 border-emerald-500 bg-emerald-500/10 px-4 py-3 text-sm"
        style={{ marginTop: 12 }}
      >
        <strong>要点：</strong> 数位 DP 里只实现 f(n) = [0,n] 的计数，任何区间 [L,R]
        都用这个减法搞定。这就是为什么模板只写一个 <code>solve(n)</code>。
      </div>
    </DemoFrame>
  )
}