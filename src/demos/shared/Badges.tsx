// 共享状态徽章：limit / lead0 两个标志位
// 颜色语义固定：红=limit，黄=lead0，绿=free（来自 demos.css 的 .badge.lim/.lead/.free）

export function Badges({ limit, lead0 }: { limit: boolean; lead0: boolean }) {
  return (
    <div className="badges">
      <span className={`badge ${limit ? 'lim' : 'free'}`}>
        <span className="dot" />
        {limit ? 'limit=1 受限' : 'limit=0 自由'}
      </span>
      <span className={`badge ${lead0 ? 'lead' : 'free'}`}>
        <span className="dot" />
        {lead0 ? 'lead0=1 前导零' : 'lead0=0 已开始'}
      </span>
    </div>
  )
}
