# 状压DP

状压DP（Bitmask DP，也叫状态压缩动态规划）是动态规划家族中一类非常强大的技巧。它的核心思路是：**用一个整数的二进制位来表示一个集合的状态**，然后在这个压缩后的状态空间上做 DP。当问题涉及"对若干元素做选择/排列/配对"且元素个数 $n$ 较小（通常 $n \leq 20$）时，状压DP往往是首选方案。

状压DP的经典应用场景包括：

- **旅行商问题（TSP）**：访问所有城市恰好一次的最短路径
- **棋盘覆盖 / 放置问题**：在棋盘上放置互不攻击的棋子
- **集合DP**：枚举子集进行分组、配对或转移
- **图论中的哈密顿路径/回路**：是否存在恰好经过每个顶点一次的路径
- **任务分配 / 最优匹配**：将 $n$ 个任务分配给 $n$ 个人的最小代价

**什么时候该想到状压DP？**

- $n$ 较小（$\leq 20$），且每个元素只有"选/不选"两种状态
- 需要在某个**集合**上进行 DP，而非简单的线性序列
- 转移时需要快速判断"某个元素是否在集合中"或"枚举集合的子集"

---

## 核心思想

### 1. 用二进制表示集合

对于 $n$ 个元素，用一个 $n$ 位二进制数 $S$ 来表示一个子集：第 $i$ 位为 1 表示元素 $i$ 在集合中，为 0 表示不在。

例如 $n = 4$，$S = 1011_2 = 11$ 表示集合 $\{0, 1, 3\}$（从低到高第 0、1、3 位为 1）。

常用的位运算操作：

| 操作 | 含义 | 代码 |
|------|------|------|
| `S & (1 << i)` | 判断 $i$ 是否在集合中 | 非零则在 |
| `S \| (1 << i)` | 将 $i$ 加入集合 | `S \|= (1 << i)` |
| `S & ~(1 << i)` | 将 $i$ 从集合中移除 | `S &= ~(1 << i)` |
| `S ^ (1 << i)` | 翻转 $i$ 是否在集合中 | `S ^= (1 << i)` |
| `S & (S - 1)` | 去掉最低位的 1 | 常用于枚举子集 |
| `__builtin_popcount(S)` | 集合中元素个数 | GCC 内建函数 |

### 2. 状态设计

状压DP的状态通常形如 $dp[S][\ldots]$，其中 $S$ 是一个压缩后的集合状态，省略号代表额外维度（如"当前所在位置""已放置的行数"等）。

以旅行商问题（TSP）为例：$dp[S][i]$ 表示**已经访问过的城市集合为 $S$，当前位于城市 $i$** 的最短路径长度。这里 $S$ 是一个 $n$ 位二进制数，$i \in [0, n-1]$。

### 3. 转移与枚举子集

转移的核心操作是：从集合 $S$ 中选取一个元素 $j$ 进行下一步操作，或者枚举 $S$ 的某个子集进行分割。

枚举集合 $S$ 的所有子集的标准写法：

```cpp
// 枚举 S 的所有非空子集
for (int sub = S; sub; sub = (sub - 1) & S) {
    // sub 是 S 的一个子集
}
```

这个技巧的时间复杂度是 $O(3^n)$，因为每个元素有"在 $S$ 不在 sub""在 $S$ 也在 sub""不在 $S$"三种状态。

<!--DEMO:bitmask-subset:interactive enumeration of subsets of a bitmask-->

### 4. 复杂度分析

状压DP的时间复杂度通常是 $O(2^n \cdot n \cdot \ldots)$：

- 状态空间：$2^n$ 个可能的集合（乘以额外维度）
- 每个状态的转移：遍历集合中的元素，通常 $O(n)$
- 总复杂度：$O(2^n \cdot n^2)$ 或 $O(2^n \cdot n)$

当 $n \leq 20$ 时，$2^{20} \approx 10^6$，完全可接受。当 $n$ 超过 25 时，一般需要考虑其他方法。

---

## 模板代码

### 模板一：旅行商问题（TSP）

```cpp
// 经典 TSP：从城市 0 出发，经过所有城市恰好一次，回到城市 0，求最短路径
// dp[S][i] = 已访问集合为 S，当前在城市 i 的最短路径
int tsp(int n, int dist[][20]) {
    const int INF = 1e9;
    int dp[1 << 20][20]; // n <= 20
    memset(dp, 0x3f, sizeof(dp));

    // 初始状态：从城市 0 出发
    dp[1][0] = 0; // 集合只含城市 0，在城市 0，距离为 0

    for (int S = 1; S < (1 << n); S++) {         // 枚举所有集合
        for (int i = 0; i < n; i++) {             // 当前城市
            if (!(S & (1 << i))) continue;        // i 不在集合中，跳过
            if (dp[S][i] >= INF) continue;        // 不可达
            for (int j = 0; j < n; j++) {         // 下一个城市
                if (S & (1 << j)) continue;       // j 已在集合中，跳过
                int nS = S | (1 << j);            // 新集合
                dp[nS][j] = min(dp[nS][j], dp[S][i] + dist[i][j]);
            }
        }
    }

    // 回到城市 0，取所有城市的最小值
    int ans = INF;
    int full = (1 << n) - 1; // 所有城市都在集合中
    for (int i = 1; i < n; i++) {
        ans = min(ans, dp[full][i] + dist[i][0]);
    }
    return ans;
}
```

### 模板二：枚举子集做集合 DP

```cpp
// 集合分割类问题通用模板
// dp[S] = 将集合 S 进行某种操作的最优值
int solveSubset(int n) {
    const int INF = 1e9;
    int dp[1 << 20];
    memset(dp, 0x3f, sizeof(dp));
    dp[0] = 0; // 空集的基准值

    for (int S = 1; S < (1 << n); S++) {
        // 枚举 S 的所有非空真子集进行转移
        for (int sub = S; sub; sub = (sub - 1) & S) {
            int rest = S ^ sub; // 补集
            // 根据题意更新 dp[S]
            // 例如：dp[S] = min(dp[S], dp[rest] + cost[sub]);
            (void)rest; // 占位，实际使用时替换
            (void)sub;
        }
    }
    return dp[(1 << n) - 1];
}
```

### 模板三：快速位运算工具函数

```cpp
// 常用位运算工具
inline bool hasBit(int S, int i) { return (S >> i) & 1; }     // 判断第 i 位
inline int addBit(int S, int i) { return S | (1 << i); }      // 添加第 i 位
inline int removeBit(int S, int i) { return S & ~(1 << i); }  // 移除第 i 位
inline int lowbit(int S) { return S & (-S); }                 // 最低位的 1

// 枚举所有大小为 k 的子集（组合枚举）
// 先枚举最小的子集，然后不断取下一个同大小子集
void enumSubsets(int n, int k) {
    int S = (1 << k) - 1; // 最小的含 k 个元素的子集：低 k 位全 1
    while (S < (1 << n)) {
        // 处理子集 S ...
        int c = S & (-S);       // 最低位的 1
        int r = S + c;          // 进位
        S = (((r ^ S) >> 2) / c) | r; // 下一个同大小子集
    }
}
```

---

## 例题详解

### 例题 1：洛谷 P1433 - 吃奶酪

**题意**：房间中有 $n$ 块奶酪（$n \leq 15$），一只老鼠从原点 $(0, 0)$ 出发，需要**经过所有奶酪**后停下（不需要回到原点）。求老鼠走的最短路程。

**分析**：经典的 TSP 变体。$n \leq 15$，状态数 $2^{15} \times 15 \approx 5 \times 10^5$，完全可以状压 DP。

- 状态定义：$dp[S][i]$ 表示已吃奶酪集合为 $S$，当前在奶酪 $i$ 的最短路径
- 初始状态：$dp[\{i\}][i] = \text{dist}(原点, 奶酪_i)$
- 转移：从状态 $(S, i)$ 转移到 $(S \cup \{j\}, j)$，其中 $j \notin S$
- 答案：$\min_{i} dp[\text{full}][i]$

```cpp
#include <bits/stdc++.h>
using namespace std;

double x[20], y[20];
double dp[1 << 16][16]; // dp[S][i]: 已吃集合 S，在奶酪 i 的最短路径
double dist(int i, int j) {
    double dx = x[i] - x[j], dy = y[i] - y[j];
    return sqrt(dx * dx + dy * dy);
}

int main() {
    int n;
    cin >> n;
    // 奶酪编号从 0 到 n-1
    for (int i = 0; i < n; i++) cin >> x[i] >> y[i];

    const double INF = 1e18;
    memset(dp, 0x7f, sizeof(dp));

    // 初始状态：从原点 (0,0) 出发，第一步到达某块奶酪
    for (int i = 0; i < n; i++) {
        dp[1 << i][i] = sqrt(x[i] * x[i] + y[i] * y[i]);
    }

    // 枚举所有集合
    for (int S = 1; S < (1 << n); S++) {
        for (int i = 0; i < n; i++) {
            if (!(S & (1 << i))) continue;    // i 不在集合中
            if (dp[S][i] >= INF) continue;
            // 尝试走到下一块奶酪 j
            for (int j = 0; j < n; j++) {
                if (S & (1 << j)) continue;   // j 已吃过
                int nS = S | (1 << j);
                dp[nS][j] = min(dp[nS][j], dp[S][i] + dist(i, j));
            }
        }
    }

    // 答案：吃完所有奶酪后的最短路径
    int full = (1 << n) - 1;
    double ans = INF;
    for (int i = 0; i < n; i++) {
        ans = min(ans, dp[full][i]);
    }
    printf("%.2f\n", ans);
    return 0;
}
```

**复杂度**：$O(2^n \cdot n^2)$，对于 $n = 15$ 约 $7 \times 10^6$ 次运算，轻松通过。

<!--DEMO:tsp-path:interactive visualization of TSP bitmask DP state transitions-->

### 例题 2：洛谷 P2704 - 炮兵阵地

**题意**：有一个 $N \times M$ 的网格地图（$N \leq 100, M \leq 10$），部分格子是平原（可放炮兵），部分是山地（不可放）。炮兵可以攻击上下左右各两格的范围。求最多能放多少个炮兵。

**分析**：$M \leq 10$，每一行的放置状态可以用一个 $M$ 位二进制数表示。关键观察：一个炮兵影响两行内的其他炮兵，所以 DP 时需要记录**前两行**的状态。

- 状态定义：$dp[i][S][T]$ 表示第 $i$ 行状态为 $S$，第 $i-1$ 行状态为 $T$ 时的最大炮兵数
- 限制条件：
  1. 同一行中任意两个炮兵距离 $\geq 3$（即 `S & (S << 1) == 0` 且 `S & (S << 2) == 0`）
  2. 不能放在山地上（即 `S & 山地掩码 == 0`）
  3. 相邻两行不能互相攻击（`S & T == 0`，因为上一行的炮兵攻击正下方两格）

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;

    // 读入地图，预处理每行的山地掩码
    int hill[105] = {}; // hill[i]: 第 i 行的山地掩码（1 表示山地）
    for (int i = 0; i < n; i++) {
        string row;
        cin >> row;
        for (int j = 0; j < m; j++) {
            if (row[j] == 'H') hill[i] |= (1 << j);
        }
    }

    // 预处理所有合法状态（同一行内不冲突）
    vector<int> valid;
    for (int S = 0; S < (1 << m); S++) {
        if ((S & (S << 1)) == 0 && (S & (S << 2)) == 0) {
            valid.push_back(S);
        }
    }

    // 预计算每个状态的炮兵数
    auto popcnt = [](int x) { return __builtin_popcount(x); };

    // dp[S][T]: 当前行状态 S，上一行状态 T 的最大炮兵数（滚动数组优化）
    int dp[105][70][70] = {}; // 100 行，最多约 60 个合法状态
    int V = valid.size();

    // 第 0 行
    for (int a = 0; a < V; a++) {
        int Sa = valid[a];
        if (Sa & hill[0]) continue; // 放在山地上，不合法
        dp[0][a][0] = popcnt(Sa);   // 第 -1 行为空（用下标 0 代替）
    }

    // 第 1 行及之后
    for (int i = 1; i < n; i++) {
        for (int a = 0; a < V; a++) {           // 当前行
            int Sa = valid[a];
            if (Sa & hill[i]) continue;
            for (int b = 0; b < V; b++) {       // 上一行
                int Sb = valid[b];
                if (Sa & Sb) continue;          // 上一行攻击当前行
                for (int c = 0; c < V; c++) {   // 上上行
                    int Sc = valid[c];
                    if (Sa & Sc) continue;      // 上上行攻击当前行
                    dp[i][a][b] = max(dp[i][a][b],
                                      dp[i - 1][b][c] + popcnt(Sa));
                }
            }
        }
    }

    // 取答案
    int ans = 0;
    for (int a = 0; a < V; a++) {
        for (int b = 0; b < V; b++) {
            ans = max(ans, dp[n - 1][a][b]);
        }
    }
    cout << ans << endl;
    return 0;
}
```

**复杂度**：合法状态数约 $V \leq 60$（$M = 10$ 时），总复杂度 $O(n \cdot V^3) \approx O(100 \times 60^3) \approx 2 \times 10^7$，可以通过。

这道题是状压 DP 在棋盘类问题上的经典应用——通过逐行递推，用位运算高效地检查炮兵之间的冲突关系。

---

## 练习题单

| # | 平台 | 题号 / 名称 | 难度 | 关键点 |
|---|------|-------------|------|--------|
| 1 | LeetCode | 1986. Minimum Number of Work Sessions to Finish the Tasks | 进阶 | 集合枚举子集，分组状压 DP |
| 2 | 洛谷 | P1433 吃奶酪 | 入门 | 经典 TSP，状压 DP 入门 |
| 3 | 洛谷 | P2704 炮兵阵地 | 进阶 | 棋盘状压，需记录两行状态 |
| 4 | 洛谷 | P1896 互不侵犯 | 进阶 | 类似炮兵阵地，在 $N \times N$ 棋盘放国王 |
| 5 | LeetCode | 698. Partition to K Equal Sum Subsets | 进阶 | 集合分割，枚举子集转移 |
| 6 | 洛谷 | P3052 Cows in a Skyscraper G | 进阶 | 集合划分，背包 + 状压 |
| 7 | Codeforces | 11D - A Simple Task | 综合 | 图中简单环计数，状压 DP |
| 8 | LeetCode | 1681. Minimum Incompatibility | 综合 | 集合划分 + 枚举子集预处理 |

---

## 常见错误

### 1. 状态数组开太大导致 MLE

**错误**：`int dp[1 << 25][25]` 直接开 $2^{25} \approx 3 \times 10^7$ 的二维数组，占用数百 MB 内存。

**正确做法**：状压 DP 的 $n$ 一般 $\leq 20$（$2^{20} \approx 10^6$）。如果 $n$ 较大，考虑滚动数组优化或换用其他算法。数组大小根据题目给定的 $n$ 动态决定，不要盲目开到 `1 << 25`。

### 2. 位运算优先级踩坑

**错误**：

```cpp
if (S & 1 << i) ...     // 实际是 S & (1 << i) 吗？不，是 (S & 1) << i！
if (S & (S << 1) == 0)  // 实际是 S & ((S << 1) == 0) == S & 0 == 0，永远为 true！
```

**正确做法**：位运算优先级低于比较运算符和算术运算符，**永远加括号**：

```cpp
if (S & (1 << i)) ...
if ((S & (S << 1)) == 0) ...
```

### 3. 混淆"集合中含 i"和"下标为 i"

**错误**：在枚举集合元素时，误把"下标"当成"元素编号"，比如用 `valid[i]` 而不是用 `valid[a]` 对应的掩码 `Sa` 做位运算。

**正确做法**：严格区分两种下标——**状态压缩的原始位编号**（$0$ 到 $n-1$）和**合法状态数组的下标**（$0$ 到 $V-1$）。代码中用不同变量名（如 $i, j$ 表示位编号，$a, b$ 表示合法状态编号）来避免混淆。

### 4. 忘记处理"空集"作为初始状态

**错误**：初始化 `dp` 数组时忘记将基准状态设为 0，或者 `dp[0]` 应该为 0 但被 memset 覆盖成 INF。

**正确做法**：明确基准情况——通常 `dp[1 << i][i] = 初始值`（单元素集合）或 `dp[0] = 0`（空集）。在 memset 之后手动设置基准状态，注意 memset 的顺序。

### 5. 枚举子集时写错循环导致漏枚举或死循环

**错误**：

```cpp
// 错误：这会枚举所有数，不是 S 的子集
for (int sub = 0; sub <= S; sub++) { ... }
```

**正确做法**：使用标准的子集枚举模板 `for (int sub = S; sub; sub = (sub - 1) & S)`。注意这个循环不会枚举空集（`sub = 0`），如果需要空集要单独处理。

---

## 延伸阅读

- [OI Wiki - 状态压缩 DP](https://oi-wiki.org/dp/bitmask/)：系统讲解状压 DP 的理论与例题，包含 TSP、哈密顿路等经典模型
- [OI Wiki - 位运算](https://oi-wiki.org/math/bit/)：位运算基础与进阶技巧汇总
- [LeetCode Bitmask 题单](https://leetcode.cn/tag/bitmask/)：LeetCode 上的状压 DP 相关题目集合
- 《算法竞赛进阶指南》第 5.3 节：状压 DP 的系统讲解，包含棋盘覆盖、集合划分等进阶模型
