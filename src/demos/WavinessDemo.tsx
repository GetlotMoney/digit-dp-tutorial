import { useMemo, useState } from 'react'
import { DemoFrame } from '@/demos/DemoFrame'
import { wavinessOf } from '@/demos/shared/utils'

// 波动值（峰谷）判定演示
export default function WavinessDemo() {
  const [num, setNum] = useState('4848')
  const clean = num.replace(/[^0-9]/g, '') || '0'
  const { w, marks } = useMemo(() => wavinessOf(clean), [clean])
  const n = parseInt(clean)

  const nearby: number[] = []
  for (let k = Math.max(0, n - 4); k <= n + 4; k++) nearby.push(k)

  return (
    <DemoFrame
      title="波动值(峰谷)判定"
      desc="峰=严格大于相邻两位(红)，谷=严格小于相邻两位(蓝)。首尾两位不算。少于 3 位波动值为 0。"
    >
      <div className="demo-controls">
        <label>
          数字 ={' '}
          <input
            type="text"
            value={num}
            onChange={(e) => setNum(e.target.value)}
            style={{ width: 120 }}
          />
        </label>
      </div>

      <div className="wave">
        {clean.split('').map((c, i) => (
          <span key={i} className={marks[i]}>
            {c}
          </span>
        ))}
      </div>

      <div className="statline">
        波动值 = <b>{w}</b>{' '}
        {marks.includes('pk') || marks.includes('vy')
          ? `(${marks.filter((m) => m === 'pk').length} 峰 + ${
              marks.filter((m) => m === 'vy').length
            } 谷)`
          : ''}
      </div>

      <table className="wavtbl">
        <thead>
          <tr>
            <th>数字</th>
            {nearby.map((k) => (
              <th key={k}>{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>波动值</td>
            {nearby.map((k) => {
              const r = wavinessOf(String(k))
              return (
                <td key={k} className={r.w > 0 ? 'w' : ''}>
                  {r.w}
                </td>
              )
            })}
          </tr>
        </tbody>
      </table>

      <div className="legend">
        <span>
          <span className="pk">峰</span> 严格大于左右
        </span>
        <span>
          <span className="vy">谷</span> 严格小于左右
        </span>
        <span>
          <span className="norm">普通位</span>
        </span>
      </div>
    </DemoFrame>
  )
}