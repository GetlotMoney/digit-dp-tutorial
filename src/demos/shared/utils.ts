// 共享纯函数（从原 index.html 平移，加 TS 类型）

/**
 * 把非负整数拆成各位数字数组（高位在前）。
 * 0 -> [0]；其余按从高位到低位返回。
 */
export function toDigits(n: number): number[] {
  if (n === 0) return [0]
  const a: number[] = []
  let t = Math.abs(n)
  while (t) {
    a.push(t % 10)
    t = Math.floor(t / 10)
  }
  return a.reverse()
}

export type WaveMark = 'norm' | 'pk' | 'vy'

export interface Waviness {
  /** 波动值（峰 + 谷的总数） */
  w: number
  /** 每一位的标记：norm 普通 / pk 峰 / vy 谷 */
  marks: WaveMark[]
}

/**
 * 计算一个数字字符串的波动值与每位标记。
 * 峰 = 严格大于左右相邻位；谷 = 严格小于左右相邻位。
 * 首尾两位不计；少于 3 位波动值为 0。
 */
export function wavinessOf(numStr: string): Waviness {
  const ds = numStr.split('').map(Number)
  if (ds.length < 3) {
    return { w: 0, marks: ds.map(() => 'norm' as const) }
  }
  const marks: WaveMark[] = ds.map(() => 'norm')
  let w = 0
  for (let i = 1; i < ds.length - 1; i++) {
    if (ds[i] > ds[i - 1] && ds[i] > ds[i + 1]) {
      marks[i] = 'pk'
      w++
    } else if (ds[i] < ds[i - 1] && ds[i] < ds[i + 1]) {
      marks[i] = 'vy'
      w++
    }
  }
  return { w, marks }
}
