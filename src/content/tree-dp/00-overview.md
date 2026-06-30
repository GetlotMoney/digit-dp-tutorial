# 树形DP

树形DP 是一类在**树结构**上进行动态规划的算法。与线性 DP 不同，树形 DP 的状态转移依赖于树的父子关系，通常通过**后序遍历（DFS）**自底向上计算子树信息，再汇总得到全局答案。

树形DP 可以解决的问题包括但不限于：

- **树上背包**：在树上选若干节点，满足依赖关系下的最优方案
- **树的直径**：求树上最远两点之间的距离
- **树的重心**：删除某个节点后最大连通块最小
- **换根DP**：对每个节点计算"以它为根"时的最优值
- **树上最长路径/最大独立集**：各类带约束的树上优化问题

**适用场景**：当问题定义在一棵树上，且答案可以通过合并子树信息得到时，优先考虑树形 DP。

---

## 核心思想

树形 DP 的本质是**在树上做自底向上的信息合并**。设 $u$ 为当前节点，$v_1, v_2, \dots, v_k$ 为其子节点，则一般思路为：

1. **递归进入子树**：先对每个子节点 $v_i$ 求解子问题
2. **定义状态**：$dp[u][\cdot]$ 表示以 $u$ 为根的子树中，满足某种约束的最优值
3. **转移**：利用子节点的结果 $dp[v_i][\cdot]$ 更新 $dp[u][\cdot]$

状态转移方程通常形如：

$$dp[u][s] = \text{merge}\bigl(dp[v_1][\cdot],\; dp[v_2][\cdot],\; \dots,\; dp[v_k][\cdot]\bigr)$$

其中 $s$ 是附加状态维度（如背包容量、选/不选等），$\text{merge}$ 是合并操作。

### 树上背包

树上背包是树形 DP 最经典的模型之一。每个节点有体积 $w_i$ 和价值 $c_i$，父子之间存在**依赖关系**（选子节点必须先选父节点）。状态定义：

$$dp[u][j] = \text{以 } u \text{ 为根的子树，总容量为 } j \text{ 时的最大价值}$$

转移时对 $u$ 的每个子节点做一次"分组背包"——枚举分配给该子树的容量：

```cpp
// u 当前节点，fa 父节点
// 枚举子节点 v，对 v 做分组背包
for (int v : adj[u]) {
    if (v == fa) continue;
    dfs(v, u);                      // 先递归子树
    // 倒序枚举总容量，内部枚举分给子树 v 的容量
    for (int j = W; j >= w[u]; j--)      // j: 已用总容量
        for (int k = 0; k <= j - w[u]; k++) // k: 分给子树 v 的容量
            dp[u][j] = max(dp[u][j],
                           dp[u][j - k] + dp[v][k]);
}
```

> **TIP**：树上背包的枚举顺序很重要——外层倒序枚举总容量 $j$，内层枚举分配给当前子树的容量 $k$，保证每个子节点只被"选一次"（类似 0-1 背包）。

### 树的直径

树的直径是树上最远的两个节点之间的距离。可以用两次 DFS 或树形 DP 求解。树形 DP 的做法只需一次 DFS：

设 $d_1[u]$ 为 $u$ 子树中从 $u$ 出发的最长路径，$d_2[u]$ 为次长路径，则：

$$\text{直径} = \max_{u}(d_1[u] + d_2[u])$$

```cpp
int ans = 0;
void dfs(int u, int fa) {
    d1[u] = d2[u] = 0;
    for (int v : adj[u]) {
        if (v == fa) continue;
        dfs(v, u);
        int len = d1[v] + 1; // u-v 边权为 1
        if (len > d1[u]) {
            d2[u] = d1[u];
            d1[u] = len;
        } else if (len > d2[u]) {
            d2[u] = len;
        }
    }
    ans = max(ans, d1[u] + d2[u]);
}
```

### 换根DP

有些问题需要对**每个节点**计算"以它为根时的答案"。暴力做法是 $O(n^2)$（对每个节点跑一次 DFS），换根 DP 可以优化到 $O(n)$：

1. **第一次 DFS**（固定根，通常选 1）：自底向上计算每个子树的信息
2. **第二次 DFS**：自顶向下，利用父节点的信息"换根"到子节点

设 $f[u]$ 为以 $u$ 为根时的答案。从 $u$ 换根到子节点 $v$ 时：

$$f[v] = \text{combine}(f[u], \text{subtree\_info}[v])$$

即：用 $u$ 的全局答案去掉 $v$ 子树的贡献，再加上"以 $v$ 为根时 $u$ 所在子树"的贡献。

```cpp
// 第一次 DFS：求以 1 为根时每个子树的大小
void dfs1(int u, int fa) {
    sz[u] = 1;
    for (int v : adj[u]) {
        if (v == fa) continue;
        dfs1(v, u);
        sz[u] += sz[v];
    }
}

// 第二次 DFS：换根，f[v] = f[u] - sz[v] + (n - sz[v])
void dfs2(int u, int fa) {
    for (int v : adj[u]) {
        if (v == fa) continue;
        f[v] = f[u] - sz[v] + (n - sz[v]);
        dfs2(v, u);
    }
}
```

---

## 模板代码

以下是树形 DP 的通用框架，适用于大多数"自底向上合并子树信息"的问题：

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 100010;
vector<int> adj[N];  // 邻接表
int dp[N];           // dp[u]: 以 u 为根的子树对应的状态值
int n;               // 节点数

// 树形 DP 核心：后序遍历，先处理子树再合并
void dfs(int u, int fa) {
    // 初始化：根据题意设置 dp[u] 的初始值
    dp[u] = /* 初始值 */;

    for (int v : adj[u]) {
        if (v == fa) continue;   // 避免回到父节点
        dfs(v, u);               // 递归处理子树

        // 合并子树信息到当前节点
        // dp[u] = merge(dp[u], dp[v]);
    }
}

int main() {
    cin >> n;
    for (int i = 1; i < n; i++) {
        int u, v;
        cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);     // 无向边
    }

    dfs(1, 0);                   // 以节点 1 为根
    // 输出答案（通常是 dp 中的最优值）
    return 0;
}
```

> **TIP**：模板中 `fa` 参数用于防止 DFS 沿无向边回退到父节点。如果题目给出了有向树（如指明了根），也可以用 `visited[]` 数组代替。

<!--DEMO:tree-dp-viz-->

---

## 例题详解

### 例题 1：没有上司的舞会（洛谷 P1352）

**题意**：一棵 $n$ 个节点的有根树，每个节点有快乐指数 $h_u$。父子不能同时参加舞会，求最大快乐指数之和。

**状态设计**：

- $dp[u][0]$：节点 $u$ **不参加**时，子树的最大快乐指数
- $dp[u][1]$：节点 $u$ **参加**时，子树的最大快乐指数

**转移方程**：

$$dp[u][0] = \sum_{v \in \text{son}(u)} \max(dp[v][0],\; dp[v][1])$$

$$dp[u][1] = h_u + \sum_{v \in \text{son}(u)} dp[v][0]$$

**代码**：

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 6010;
vector<int> adj[N];
int h[N], dp[N][2]; // dp[u][0]: u 不选, dp[u][1]: u 选
bool has_fa[N];      // 记录谁有父节点，用于找根
int n;

void dfs(int u) {
    dp[u][1] = h[u]; // 选 u，初始为 h[u]
    dp[u][0] = 0;    // 不选 u，初始为 0
    for (int v : adj[u]) {
        dfs(v);
        dp[u][0] += max(dp[v][0], dp[v][1]); // 不选 u，子节点可选可不选
        dp[u][1] += dp[v][0];                // 选 u，子节点不能选
    }
}

int main() {
    cin >> n;
    for (int i = 1; i <= n; i++) cin >> h[i];
    for (int i = 1; i < n; i++) {
        int l, k; // l 是子节点，k 是父节点
        cin >> l >> k;
        adj[k].push_back(l);
        has_fa[l] = true;
    }
    // 找根节点（没有父节点的节点）
    int root = 1;
    for (int i = 1; i <= n; i++)
        if (!has_fa[i]) { root = i; break; }

    dfs(root);
    cout << max(dp[root][0], dp[root][1]) << endl;
    return 0;
}
```

> **TIP**：本题的关键在于**每个节点只有选/不选两种状态**，且父子之间有约束（不能同时选），这是树形 DP 中"最大独立集"模型的经典体现。

### 例题 2：树的直径（AcWing 1072 / 洛谷 P2664）

**题意**：给定一棵 $n$ 个节点的无权树（边权为 1），求树的直径（最长路径的边数）。

**思路**：如核心思想中所述，用树形 DP 在一次 DFS 中同时维护从每个节点出发的最长路径和次长路径。

**代码**：

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 10010;
vector<int> adj[N];
int d1[N], d2[N]; // d1[u]: u 出发最长路径，d2[u]: 次长
int ans = 0;
int n;

void dfs(int u, int fa) {
    d1[u] = d2[u] = 0;
    for (int v : adj[u]) {
        if (v == fa) continue;
        dfs(v, u);
        int len = d1[v] + 1;
        if (len > d1[u]) {
            d2[u] = d1[u];
            d1[u] = len;
        } else if (len > d2[u]) {
            d2[u] = len;
        }
    }
    ans = max(ans, d1[u] + d2[u]);
}

int main() {
    cin >> n;
    for (int i = 1; i < n; i++) {
        int u, v;
        cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    dfs(1, 0);
    cout << ans << endl;
    return 0;
}
```

---

## 练习题单

| 平台 | 题号 / 题名 | 难度 | 知识点 |
|------|------------|------|--------|
| 洛谷 | P1352 没有上司的舞会 | 入门 | 树上最大独立集 |
| 洛谷 | P2015 二叉苹果树 | 入门 | 树上背包 |
| 洛谷 | P1273 有线电视网 | 进阶 | 树上背包（最小花费 / 最大收益） |
| AcWing | 1072 树的最长路径 | 入门 | 树的直径 |
| 洛谷 | P2664 树上游戏 | 进阶 | 换根DP + 路径计数 |
| LeetCode | 124. Binary Tree Maximum Path Sum | 进阶 | 树上路径和 |
| LeetCode | 834. Sum of Distances in Tree | 综合 | 换根DP 经典题 |
| Codeforces | CF 1187E Tree Painting | 综合 | 换根DP |

> **TIP**：建议先完成"入门"级别的题目，熟悉树形 DP 的基本框架后，再挑战换根 DP 和树上背包的综合题。

---

## 常见错误

### 1. 忘记处理无向树的回退

在无向树上 DFS 时，必须用 `fa` 参数或 `visited[]` 数组防止递归回到父节点，否则会无限循环导致栈溢出。

```cpp
// 错误：没有检查父节点
void dfs(int u) {
    for (int v : adj[u]) {
        dfs(v); // 可能回到父节点！
    }
}

// 正确：
void dfs(int u, int fa) {
    for (int v : adj[u]) {
        if (v == fa) continue;
        dfs(v, u);
    }
}
```

### 2. 树上背包的枚举顺序错误

树上背包合并子树时，外层容量必须**倒序枚举**，否则同一个子节点的信息会被重复使用（变成完全背包）。

```cpp
// 错误：正序枚举导致重复使用
for (int j = w[u]; j <= W; j++)  // 错！
    for (int k = 0; k <= j - w[u]; k++)
        dp[u][j] = max(dp[u][j], dp[u][j - k] + dp[v][k]);

// 正确：倒序枚举
for (int j = W; j >= w[u]; j--)  // 对！
    for (int k = 0; k <= j - w[u]; k++)
        dp[u][j] = max(dp[u][j], dp[u][j - k] + dp[v][k]);
```

### 3. 换根时未正确恢复状态

换根 DP 的第二次 DFS 中，从 $u$ 换到 $v$ 时需要先"撤销 $v$ 对 $u$ 的贡献"，否则计算出的 $f[v]$ 不正确。关键是要理解：$f[v]$ 应该等于"以 $u$ 为全局根时去掉 $v$ 子树贡献后的值"加上"以 $v$ 为根时 $u$ 那一侧的贡献"。

### 4. 多组测试未清空邻接表和状态数组

树形 DP 的邻接表和 DP 数组是全局的，每组测试数据之间必须**彻底清空**，否则会残留上一组的数据导致错误答案。

```cpp
// 每组数据开始前：
for (int i = 1; i <= n; i++) {
    adj[i].clear();
    // dp[i] 等状态数组也需要重置
}
```

### 5. 根节点选择不当

有些题目没有明确给出根节点。对于无根树，可以任意选一个节点作为根（通常选 1）。但如果题目暗示了根（如"上司"关系），必须先找到真正的根再开始 DFS。

---

## 延伸阅读

- [OI Wiki - 树形 DP](https://oi-wiki.org/dp/tree/)：树形 DP 的系统讲解与更多例题
- [OI Wiki - 树的直径](https://oi-wiki.org/graph/tree-diameter/)：树的直径的多种求法
- [OI Wiki - 换根 DP](https://oi-wiki.org/dp/tree/#换根-dp)：换根技巧的详细推导
- [洛谷题单 - 树形 DP](https://www.luogu.com.cn/training/list)：按难度递进的练习题集
