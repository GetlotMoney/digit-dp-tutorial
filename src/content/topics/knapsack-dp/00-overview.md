# 背包DP

背包问题是动态规划中最经典的一类问题，也是学习 DP 思维的绝佳起点。其核心模型是：有 $n$ 件物品和一个容量为 $W$ 的背包，每件物品有重量 $w_i$ 和价值 $v_i$，在不超过背包容量的前提下，选择若干件物品使得总价值最大。

背包问题的变体丰富、应用广泛，从竞赛到面试都是高频考点。掌握背包 DP 的状态定义与转移方程，是理解所有 DP 问题的基石。

## 核心思想

### 0-1 背包

每件物品**只能选一次**。定义状态 $dp[j]$ 表示容量为 $j$ 的背包能获得的最大价值。转移方程：

$$dp[j] = \max(dp[j],\ dp[j - w_i] + v_i)$$

关键技巧：**倒序遍历容量** $j$，保证每件物品只被使用一次。

<!--DEMO:knapsack-01-->

下面的代码演示了朴素二维写法与空间优化后的一维写法：

```cpp
// 0-1 背包 · 二维写法（便于理解）
for (int i = 1; i <= n; i++) {
    for (int j = 0; j <= W; j++) {
        dp[i][j] = dp[i-1][j];            // 不选第 i 件
        if (j >= w[i])
            dp[i][j] = max(dp[i][j], dp[i-1][j - w[i]] + v[i]);  // 选
    }
}

// 0-1 背包 · 一维空间优化（倒序遍历 j）
for (int i = 1; i <= n; i++) {
    for (int j = W; j >= w[i]; j--) {     // 倒序！
        dp[j] = max(dp[j], dp[j - w[i]] + v[i]);
    }
}
```

> **TIP** 倒序遍历容量是 0-1 背包的灵魂。正序遍历会导致同一物品被重复选取，变成完全背包。

### 完全背包

每件物品**可以选无限次**。只需把 0-1 背包的遍历顺序改为**正序**：

$$dp[j] = \max(dp[j],\ dp[j - w_i] + v_i)$$

```cpp
// 完全背包 · 一维写法（正序遍历 j）
for (int i = 1; i <= n; i++) {
    for (int j = w[i]; j <= W; j++) {     // 正序！
        dp[j] = max(dp[j], dp[j - w[i]] + v[i]);
    }
}
```

> **TIP** 完全背包的正序遍历意味着：在计算 $dp[j]$ 时，$dp[j - w_i]$ 可能已经包含了物品 $i$，因此物品 $i$ 可以被多次选取。

### 多重背包

每件物品有**数量上限** $s_i$。最直接的做法是把 $s_i$ 件物品展开成 0-1 背包，时间复杂度 $O(W \cdot \sum s_i)$。

**二进制拆分优化**：把 $s_i$ 拆成 $1, 2, 4, \dots, 2^k, r$ 份（$r$ 为剩余），转化为 $\log s_i$ 个 0-1 物品。总复杂度降为 $O(W \cdot \sum \log s_i)$。

```cpp
// 多重背包 · 二进制拆分
vector<int> ws, vs; // 拆分后的物品
for (int i = 1; i <= n; i++) {
    int s = cnt[i];
    for (int k = 1; k <= s; k <<= 1) {
        ws.push_back(k * w[i]);
        vs.push_back(k * v[i]);
        s -= k;
    }
    if (s > 0) {
        ws.push_back(s * w[i]);
        vs.push_back(s * v[i]);
    }
}
// 然后对拆分后的物品跑 0-1 背包
```

**单调队列优化**：可在 $O(nW)$ 时间内解决多重背包，通过维护滑动窗口最大值来加速转移。适用于 $s_i$ 非常大的场景。

### 分组背包

有 $G$ 组物品，每组内只能选**至多一件**。遍历顺序为：先枚举组，再枚举容量，最后枚举组内物品。

```cpp
// 分组背包
for (int g = 1; g <= G; g++) {           // 枚举组
    for (int j = W; j >= 0; j--) {       // 枚举容量（倒序）
        for (auto &[wi, vi] : group[g])  // 枚举组内物品
            if (j >= wi)
                dp[j] = max(dp[j], dp[j - wi] + vi);
    }
}
```

### 混合背包

有些物品只能选一次（0-1），有些可选无限次（完全），有些有数量限制（多重）。处理方式：按物品类型分别套用对应算法。0-1 物品倒序，完全物品正序，多重物品先二进制拆分再倒序。也可以统一用**泛化物品**的思路来处理。

### 背包问题的变体

背包 DP 远不止「最大价值」一种问法。以下是常见变体：

| 变体 | 状态含义 | 说明 |
|------|---------|------|
| 方案计数 | $dp[j]$ = 恰好装满 $j$ 的方案数 | 转移求和而非求 max |
| 是否可行 | $dp[j]$ = 能否恰好装到 $j$ | 布尔型 DP |
| 求第 $k$ 优解 | $dp[j][k]$ | 归并 $A$ 和 $B$ 的前 $k$ 大 |
| 依赖背包 | 树形 DP + 背包 | 物品间存在树形依赖关系 |
| 背包求方案 | 记录转移来源回溯 | 需要输出选择了哪些物品 |

<!--DEMO:knapsack-types-->

## 模板代码

下面是背包 DP 的通用模板，涵盖 0-1 背包和完全背包。加了详细注释，可直接套用。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1005;
int w[MAXN], v[MAXN];   // 重量、价值
int dp[MAXN];            // 一维 DP 数组

// 0-1 背包：n 件物品，背包容量 W，求最大价值
int knapsack_01(int n, int W) {
    memset(dp, 0, sizeof(dp));
    for (int i = 1; i <= n; i++) {
        for (int j = W; j >= w[i]; j--) {     // 倒序
            dp[j] = max(dp[j], dp[j - w[i]] + v[i]);
        }
    }
    return dp[W];
}

// 完全背包：每件物品可选无限次
int knapsack_complete(int n, int W) {
    memset(dp, 0, sizeof(dp));
    for (int i = 1; i <= n; i++) {
        for (int j = w[i]; j <= W; j++) {     // 正序
            dp[j] = max(dp[j], dp[j - w[i]] + v[i]);
        }
    }
    return dp[W];
}

// 多重背包（二进制拆分 + 0-1 背包）
int knapsack_multiple(int n, int W, int cnt[]) {
    memset(dp, 0, sizeof(dp));
    for (int i = 1; i <= n; i++) {
        int num = cnt[i];
        // 二进制拆分
        int k = 1;
        while (k <= num) {
            int tw = k * w[i], tv = k * v[i];
            for (int j = W; j >= tw; j--)
                dp[j] = max(dp[j], dp[j - tw] + tv);
            num -= k;
            k <<= 1;
        }
        if (num > 0) {
            int tw = num * w[i], tv = num * v[i];
            for (int j = W; j >= tw; j--)
                dp[j] = max(dp[j], dp[j - tw] + tv);
        }
    }
    return dp[W];
}

// 方案计数：恰好装满容量 W 的方案数（0-1 背包）
int knapsack_count(int n, int W) {
    memset(dp, 0, sizeof(dp));
    dp[0] = 1;  // 容量为 0 有 1 种方案：什么都不选
    for (int i = 1; i <= n; i++) {
        for (int j = W; j >= w[i]; j--) {
            dp[j] += dp[j - w[i]];  // 累加方案数
        }
    }
    return dp[W];
}
```

> **TIP** 初始化技巧：求最大价值时 $dp$ 全部初始化为 0；求「恰好装满」的最优值时，除 $dp[0]=0$ 外其余初始化为 $-\infty$；方案计数时 $dp[0]=1$ 其余为 0。

## 例题详解

### 例题 1：采药（洛谷 P1048）

**题意**：有 $T$ 分钟和 $m$ 株草药，每株需要时间 $t_i$ 且有收益 $v_i$，求最大收益。经典 0-1 背包。

**分析**：$T$ 就是背包容量，每株草药是一件物品。直接套 0-1 背包模板。

```cpp
#include <bits/stdc++.h>
using namespace std;

int dp[1005]; // dp[j] = 容量 j 的最大收益

int main() {
    int T, m;
    cin >> T >> m;
    for (int i = 1; i <= m; i++) {
        int t, v;
        cin >> t >> v;
        for (int j = T; j >= t; j--)   // 0-1 背包，倒序
            dp[j] = max(dp[j], dp[j - t] + v);
    }
    cout << dp[T] << endl;
    return 0;
}
```

### 例题 2：零钱兑换（LeetCode 322）

**题意**：给定面额数组 `coins` 和金额 `amount`，求凑出该金额的最少硬币数。每种硬币可使用无限次。

**分析**：完全背包变体——目标不是最大价值，而是**最少物品数**。$dp[j]$ 表示凑出金额 $j$ 的最少硬币数，转移取 $\min$。初始化为 $\infty$，$dp[0]=0$。

```cpp
class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        vector<int> dp(amount + 1, 1e9);  // 初始化为极大值
        dp[0] = 0;
        for (int coin : coins) {
            for (int j = coin; j <= amount; j++) {  // 完全背包，正序
                dp[j] = min(dp[j], dp[j - coin] + 1);
            }
        }
        return dp[amount] >= 1e9 ? -1 : dp[amount];
    }
};
```

> **WARN** 这里用 $10^9$ 而非 `INT_MAX`，是因为 `INT_MAX + 1` 会溢出。背包 DP 中如果转移是加法，初始化要注意溢出问题。

## 练习题单

以下题目按难度递进，建议在掌握模板后依次练习。

| # | 平台 | 题号 | 题目 | 难度 |
|---|------|------|------|------|
| 1 | 洛谷 | P1048 | 采药 | 入门 |
| 2 | 洛谷 | P1060 | 开心的金明 | 入门 |
| 3 | LeetCode | 322 | 零钱兑换 | 入门 |
| 4 | 洛谷 | P1776 | 宝物筛选 | 进阶 |
| 5 | LeetCode | 474 | 一和零 | 进阶 |
| 6 | 洛谷 | P1757 | 通天之分组背包 | 进阶 |
| 7 | LeetCode | 879 | 盈利计划 | 综合 |
| 8 | Codeforces | 106C | Buns | 综合 |

## 常见错误

**1. 0-1 背包正序遍历导致重复选取**

最经典的错误。0-1 背包必须倒序遍历容量 $j$，否则同一物品会在同一次迭代中被重复放入。

```cpp
// 错误写法（正序 = 完全背包）
for (int j = w[i]; j <= W; j++)  // x

// 正确写法（倒序 = 0-1 背包）
for (int j = W; j >= w[i]; j--)  // ok
```

**2. 初始化不匹配问题要求**

- 求最大价值且允许不满：$dp$ 全初始化为 $0$
- 求「恰好装满」的最大价值：$dp[0]=0$，其余 $dp[j]=-\infty$
- 求方案数：$dp[0]=1$，其余 $dp[j]=0$
- 求最少数量：$dp[0]=0$，其余 $dp[j]=+\infty$

初始化错误会导致不合法状态参与转移，答案出错。

**3. 多重背包暴力展开超时**

将 $s_i$ 件物品一件件展开为 0-1 物品，时间复杂度 $O(W \cdot \sum s_i)$，当 $s_i$ 很大时必然超时。正确做法是二进制拆分或单调队列优化。

**4. 遍历顺序搞混**

| 背包类型 | 外层枚举 | 内层枚举容量 |
|---------|---------|------------|
| 0-1 背包 | 物品 | 倒序 $W \to w_i$ |
| 完全背包 | 物品 | 正序 $w_i \to W$ |
| 分组背包 | 组 → 容量（倒序） → 组内物品 | — |

如果分组背包的容量和组内物品枚举顺序反了，就会变成「每组可选多件」而非「每组至多一件」。

**5. 溢出问题**

当转移中涉及加法且 $dp$ 初始值很大时（如 `INT_MAX`），`dp[j - w[i]] + v[i]` 可能溢出。建议用 $10^9$ 级别的大数代替 `INT_MAX`，或者在转移前加溢出检查。

## 延伸阅读

- [OI Wiki - 背包 DP](https://oi-wiki.org/dp/knapsack/)：背包问题的完整分类、证明与优化技巧
- [OI Wiki - DP 优化](https://oi-wiki.org/dp/opt/)：单调队列优化多重背包等进阶技巧
- 《算法竞赛入门经典》（刘汝佳）第 9 章：DP 专题的经典讲解
- [洛谷题单 - 背包 DP](https://www.luogu.com.cn/training/list)：搜索「背包」标签可获取大量练习题
