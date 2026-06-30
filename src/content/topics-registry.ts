/**
 * 专题注册表 — 集中管理全部 25 个专题的元数据
 *
 * 专题内容本身位于 topics/{id}/index.ts，此文件仅声明列表与分类。
 */

export type TopicCategory =
  | '算法基础'
  | '搜索'
  | '动态规划'
  | '数据结构'
  | '图论'
  | '数学'
  | '字符串'
  | '杂项'

export type TopicDifficulty = '入门' | '进阶' | '综合'

export type DemoLevel = 'heavy' | 'light' | 'none'

export type TopicMeta = {
  id: string
  title: string
  category: TopicCategory
  difficulty: TopicDifficulty
  summary: string
  hasDemo: boolean
  demoType: DemoLevel
  /** lucide-react 图标组件名 */
  icon: string
  /** 同类别内的排序权重（从 1 开始） */
  order: number
}

/* ────────────────────────────────────────────────────────────
 * 全部 25 个专题，按 category → order 排列
 * ──────────────────────────────────────────────────────────── */

export const TOPICS: TopicMeta[] = [
  // ── 算法基础 ──────────────────────────────────────────────
  {
    id: 'binary-search',
    title: '二分查找',
    category: '算法基础',
    difficulty: '入门',
    summary: '整数二分、浮点二分、二分答案，掌握有序与单调场景下的高效搜索。',
    hasDemo: true,
    demoType: 'light',
    icon: 'Search',
    order: 1,
  },
  {
    id: 'sorting',
    title: '排序算法',
    category: '算法基础',
    difficulty: '入门',
    summary: '快排、归并、堆排的原理与实现，时间复杂度分析与稳定性比较。',
    hasDemo: true,
    demoType: 'heavy',
    icon: 'ArrowUpDown',
    order: 2,
  },
  {
    id: 'prefix-sum',
    title: '前缀和与差分',
    category: '算法基础',
    difficulty: '入门',
    summary: '一维/二维前缀和、差分数组的构建与区间操作，O(1) 区间查询。',
    hasDemo: true,
    demoType: 'light',
    icon: 'Sigma',
    order: 3,
  },
  {
    id: 'two-pointers',
    title: '双指针与滑动窗口',
    category: '算法基础',
    difficulty: '入门',
    summary: '对撞指针、快慢指针、定长/变长滑动窗口的经典模型与应用。',
    hasDemo: true,
    demoType: 'light',
    icon: 'MoveHorizontal',
    order: 4,
  },
  {
    id: 'greedy',
    title: '贪心算法',
    category: '算法基础',
    difficulty: '进阶',
    summary: '贪心选择性质与最优子结构，区间调度、哈夫曼编码等经典模型。',
    hasDemo: false,
    demoType: 'none',
    icon: 'TrendingUp',
    order: 5,
  },

  // ── 搜索 ──────────────────────────────────────────────────
  {
    id: 'dfs-bfs',
    title: 'DFS与BFS',
    category: '搜索',
    difficulty: '入门',
    summary: '深度优先搜索与广度优先搜索的递归/迭代实现，状态空间遍历基础。',
    hasDemo: true,
    demoType: 'heavy',
    icon: 'Network',
    order: 1,
  },
  {
    id: 'backtracking',
    title: '回溯与剪枝',
    category: '搜索',
    difficulty: '进阶',
    summary: '排列/组合/子集枚举，N 皇后，约束传播与可行性剪枝技巧。',
    hasDemo: true,
    demoType: 'light',
    icon: 'GitBranch',
    order: 2,
  },

  // ── 动态规划 ──────────────────────────────────────────────
  {
    id: 'knapsack-dp',
    title: '背包DP',
    category: '动态规划',
    difficulty: '入门',
    summary: '0-1 背包、完全背包、多重背包的状态定义与空间优化。',
    hasDemo: true,
    demoType: 'heavy',
    icon: 'Package',
    order: 1,
  },
  {
    id: 'interval-dp',
    title: '区间DP',
    category: '动态规划',
    difficulty: '进阶',
    summary: '石子合并、矩阵链乘，区间分割与枚举顺序的典型技巧。',
    hasDemo: true,
    demoType: 'light',
    icon: 'Columns',
    order: 2,
  },
  {
    id: 'tree-dp',
    title: '树形DP',
    category: '动态规划',
    difficulty: '进阶',
    summary: '树上背包、换根 DP、树的直径，利用 DFS 序在树结构上转移。',
    hasDemo: true,
    demoType: 'light',
    icon: 'TreePine',
    order: 3,
  },
  {
    id: 'bitmask-dp',
    title: '状压DP',
    category: '动态规划',
    difficulty: '综合',
    summary: '用二进制掩码表示集合状态，TSP、覆盖问题等位运算优化。',
    hasDemo: false,
    demoType: 'none',
    icon: 'Binary',
    order: 4,
  },
  {
    id: 'digit-dp',
    title: '数位DP',
    category: '动态规划',
    difficulty: '进阶',
    summary: '逐位枚举、limit/lead0 状态设计，记忆化搜索模板与经典例题。',
    hasDemo: true,
    demoType: 'heavy',
    icon: 'Hash',
    order: 5,
  },

  // ── 数据结构 ──────────────────────────────────────────────
  {
    id: 'stack-queue',
    title: '栈与队列',
    category: '数据结构',
    difficulty: '入门',
    summary: '栈、队列、双端队列的基本操作与应用场景，表达式求值。',
    hasDemo: true,
    demoType: 'light',
    icon: 'Layers',
    order: 1,
  },
  {
    id: 'union-find',
    title: '并查集',
    category: '数据结构',
    difficulty: '入门',
    summary: '路径压缩与按秩合并，连通分量计数与带权并查集。',
    hasDemo: true,
    demoType: 'heavy',
    icon: 'Link',
    order: 2,
  },
  {
    id: 'segment-tree',
    title: '线段树',
    category: '数据结构',
    difficulty: '进阶',
    summary: '区间修改与区间查询、懒标记下传、可持久化线段树入门。',
    hasDemo: true,
    demoType: 'heavy',
    icon: 'BarChart3',
    order: 3,
  },
  {
    id: 'fenwick-tree',
    title: '树状数组',
    category: '数据结构',
    difficulty: '进阶',
    summary: '单点修改前缀查询、区间修改区间查询，lowbit 技巧。',
    hasDemo: true,
    demoType: 'light',
    icon: 'AlignVerticalSpaceAround',
    order: 4,
  },
  {
    id: 'mono-stack',
    title: '单调栈与单调队列',
    category: '数据结构',
    difficulty: '进阶',
    summary: '下一个更大元素、滑动窗口最大值，维护单调性的核心思路。',
    hasDemo: true,
    demoType: 'light',
    icon: 'ArrowDownUp',
    order: 5,
  },

  // ── 图论 ──────────────────────────────────────────────────
  {
    id: 'graph-traversal',
    title: '图的遍历',
    category: '图论',
    difficulty: '入门',
    summary: '邻接表/邻接矩阵、BFS 层序遍历、DFS 连通分量、网格搜索。',
    hasDemo: true,
    demoType: 'light',
    icon: 'Waypoints',
    order: 1,
  },
  {
    id: 'shortest-path',
    title: '最短路径',
    category: '图论',
    difficulty: '进阶',
    summary: 'Dijkstra、Bellman-Ford、SPFA、Floyd 的适用场景与实现细节。',
    hasDemo: true,
    demoType: 'heavy',
    icon: 'Route',
    order: 2,
  },
  {
    id: 'mst',
    title: '最小生成树',
    category: '图论',
    difficulty: '进阶',
    summary: 'Kruskal 与 Prim 算法，边权排序与并查集维护连通性。',
    hasDemo: true,
    demoType: 'light',
    icon: 'TreeDeciduous',
    order: 3,
  },
  {
    id: 'topo-sort',
    title: '拓扑排序',
    category: '图论',
    difficulty: '入门',
    summary: 'DAG 判定、Kahn 算法、关键路径，任务依赖关系建模。',
    hasDemo: true,
    demoType: 'light',
    icon: 'ListOrdered',
    order: 4,
  },
  {
    id: 'lca',
    title: '最近公共祖先',
    category: '图论',
    difficulty: '综合',
    summary: '倍增法、Tarjan 离线算法、树链剖分求 LCA 与路径查询。',
    hasDemo: false,
    demoType: 'none',
    icon: 'GitMerge',
    order: 5,
  },

  // ── 数学 ──────────────────────────────────────────────────
  {
    id: 'number-theory',
    title: '数论基础',
    category: '数学',
    difficulty: '进阶',
    summary: '素数筛、GCD/LCM、快速幂、模逆元、组合数计算。',
    hasDemo: false,
    demoType: 'none',
    icon: 'Pi',
    order: 1,
  },

  // ── 字符串 ────────────────────────────────────────────────
  {
    id: 'kmp-trie',
    title: 'KMP与Trie',
    category: '字符串',
    difficulty: '进阶',
    summary: 'KMP 的 next 数组本质、Trie 树的构建与前缀查询。',
    hasDemo: true,
    demoType: 'heavy',
    icon: 'Text',
    order: 1,
  },

  // ── 杂项 ──────────────────────────────────────────────────
  {
    id: 'discretization',
    title: '离散化与分块',
    category: '杂项',
    difficulty: '进阶',
    summary: '坐标离散化、值域分块、莫队算法的入门与应用。',
    hasDemo: false,
    demoType: 'none',
    icon: 'Grid3x3',
    order: 1,
  },
]

/* ────────────────────────────────────────────────────────────
 * 分类列表（按推荐学习顺序）
 * ──────────────────────────────────────────────────────────── */

export const TOPIC_CATEGORIES: TopicCategory[] = [
  '算法基础',
  '搜索',
  '动态规划',
  '数据结构',
  '图论',
  '数学',
  '字符串',
  '杂项',
]

/* ────────────────────────────────────────────────────────────
 * 工具函数
 * ──────────────────────────────────────────────────────────── */

/** 获取指定分类下的所有专题（按 order 排序） */
export function getTopicsByCategory(category: string): TopicMeta[] {
  return TOPICS
    .filter((t) => t.category === category)
    .sort((a, b) => a.order - b.order)
}

/** 根据 id 查找专题，不存在则返回 undefined */
export function getTopicById(id: string): TopicMeta | undefined {
  return TOPICS.find((t) => t.id === id)
}
