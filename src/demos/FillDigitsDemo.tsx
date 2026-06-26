import { useEffect, useMemo, useState } from 'react'
import { DemoFrame } from '@/demos/DemoFrame'
import { Badges } from '@/demos/shared/Badges'
import { DigitRow, Choices, StateLegend } from '@/demos/shared/DigitRow'
import { toDigits } from '@/demos/shared/utils'

// 逐位填数演示：手动选每个位置填什么，观察 limit/lead0 变化
export default function FillDigitsDemo() {
  const [N, setN] = useState(324)
  const digits = useMemo(() => toDigits(N), [N])
  const len = digits.length
  const [path, setPath] = useState<number[]>([])
  const [pos, setPos] = useState(0)

  // N 改变时重置填数进度
  useEffect(() => {
    setPath([])
    setPos(0)
  }, [N])

  // limit：已经填的前 pos 位是否完全等于 N 对应位
  const limit = useMemo(() => {
    for (let i = 0; i < pos; i++) if (path[i] !== digits[i]) return false
    return true
  }, [path, pos, digits])

  // lead0：已经填的前 pos 位是否全为 0
  const lead0 = useMemo(() => {
    for (let i = 0; i < pos; i++) if (path[i] !== 0) return false
    return true
  }, [path, pos])

  const up = limit ? digits[pos] : 9
  const done = pos === len

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
  // 在当前 limit 状态下把剩余位「沿上界 / 全 0」填满
  function autoFillFree() {
    const np = [...path]
    let cl = limit
    for (let i = pos; i < len; i++) {
      np[i] = cl ? digits[i] : 0
    }
    setPath(np)
    setPos(len)
  }

  return (
    <DemoFrame
      title="逐位填数与 limit/lead0 状态"
      desc={`目标：填出一个不超过 N=${N} 的数。手动点击数字位选择当前位填什么，观察 limit(红)和 lead0(黄)如何变化。绿色=自由，可填 0-9。`}
    >
      <div className="demo-controls">
        <label>
          N ={' '}
          <input
            type="number"
            value={N}
            onChange={(e) => setN(Math.max(1, +e.target.value || 1))}
          />
        </label>
        <button className="sec" onClick={back} disabled={pos === 0}>
          ← 回退
        </button>
        <button className="sec" onClick={reset}>
          重置
        </button>
        <button onClick={autoFillFree} disabled={done}>
          一键填满剩余
        </button>
      </div>

      <Badges limit={limit} lead0={lead0} />

      <DigitRow digits={digits} path={path} pos={pos} />

      {!done && (
        <>
          <div
            style={{ fontSize: 13, marginTop: 14, color: 'var(--foreground)' }}
          >
            当前位 <b>第 {pos} 位</b>，
            {limit ? (
              <>
                受 N 限制，只能填 <b>0 ~ {up}</b>
              </>
            ) : (
              <>
                自由，可填 <b>0 ~ 9</b>
              </>
            )}
            ：
          </div>
          <Choices up={up} onPick={choose} />
        </>
      )}

      {done && (
        <div className="statline">
          填出的数字：<b>{path.join('')}</b>{' '}
          {parseInt(path.join('')) <= N ? '✓ 不超过 N' : '✗ 超过 N'}
          <br />
          {(() => {
            const num = parseInt(path.join(''))
            return (
              <>
                它 {num === 0 ? '是 0' : '= ' + num}，{' '}
                <b>
                  {' '}
                  {limit
                    ? '贴着 N 的上界'
                    : '在某一位后脱离上界，后面自由'}
                </b>
              </>
            )
          })()}
        </div>
      )}

      <StateLegend />

      <div
        className="mt-3 rounded-lg border-l-4 border-emerald-500 bg-emerald-500/10 px-4 py-3 text-sm"
        style={{ marginTop: 12 }}
      >
        <strong>感悟：</strong> 一旦某一位填了 <b>小于</b> N
        对应位的数字(limit 变 0)，后面所有位都变成 0-9 自由填 ——
        这就是数位 DP 把指数级枚举压成多项式的关键。
      </div>
    </DemoFrame>
  )
}