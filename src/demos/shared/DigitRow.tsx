// 数字方格行：显示 N 的每一位 + 已填/当前/未填三种状态
// 被 FillDigitsDemo 和 FullProblemDemo 共用

export function DigitRow({
  digits,
  path,
  pos,
}: {
  digits: number[]
  /** 已填数字（按位），未填位置为 undefined */
  path: number[]
  /** 当前要填的位置 */
  pos: number
}) {
  return (
    <div className="digit-row">
      {digits.map((d, i) => {
        let cls = 'digit'
        if (i < pos) cls += ' fill'
        else if (i === pos) cls += ' cur'
        else cls += ' fixed'
        return (
          <div key={i} className={cls}>
            {i < pos ? path[i] : i === pos ? '?' : '·'}
            <span className="tag">N[{i}]={d}</span>
          </div>
        )
      })}
    </div>
  )
}

// 0-9 数字选择按钮：超过 up 的禁用
export function Choices({ up, onPick }: { up: number; onPick: (d: number) => void }) {
  return (
    <div className="choices">
      {Array.from({ length: 10 }, (_, d) => (
        <div
          key={d}
          className={`choice ${d > up ? 'dis' : ''}`}
          onClick={() => onPick(d)}
        >
          {d}
        </div>
      ))}
    </div>
  )
}

// limit/lead0/free 三色图例（共用）
export function StateLegend() {
  return (
    <div className="legend">
      <span>
        <span className="badge lim" style={{ padding: '2px 8px' }}>
          {' '}
        </span>{' '}
        limit:仍贴着 N 上界
      </span>
      <span>
        <span className="badge lead" style={{ padding: '2px 8px' }}>
          {' '}
        </span>{' '}
        lead0:前面全是前导零
      </span>
      <span>
        <span className="badge free" style={{ padding: '2px 8px' }}>
          {' '}
        </span>{' '}
        自由:可缓存的状态
      </span>
    </div>
  )
}
