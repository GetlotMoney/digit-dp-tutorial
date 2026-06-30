# 最近公共祖先

给定一棵有根树，两个节点 $u$ 和 $v$ 的**最近公共祖先**（Lowest Common Ancestor, LCA）定义为：在树上同时是 $u$ 和 $v$ 的祖先且深度最大的那个节点。LCA 是图论中最基础、最常用的数据结构问题之一，大量树上问题都可以转化为 LCA 查询。

**什么时候该想到 LCA？**

- 需要求树上两个节点之间的**距离**：$\text{dist}(u, v) = \text{dep}[u] + \text{dep}[v] - 2 \cdot \text{dep}[\text{LCA}(u,v)]$
- 需要对树上 $u \to v$ 的**路径**做区间操作（加值、求和、求最值）
- 处理**树上差分**问题（例如统计每条边/节点被多少条路径覆盖）
- 各类图论、树上问题的子步骤（如 Tarjan 离线算法、Kruskal 重构树上的查询）

本文介绍四种求解 LCA 的方法：**倍增法**、**Tarjan 离线算法**、**树链剖分**、**欧拉序 + ST 表**。其中倍增法是最常用、最推荐优先掌握的在线算法。

<!--DEMO:lca-tree-->

---

## 核心思想

### 1. 倍增法

倍增法的核心思想是**二进制拆分跳跃**：预处理每个节点 $v$ 向上跳 $2^k$ 步后到达的祖先 $\text{fa}[v][k]$，查询时从高位到低位贪心地跳。

**预处理**：通过一次 DFS，对每个节点 $v$ 计算：
$$\text{fa}[v][k] = \text{fa}[\text{fa}[v][k-1]][k-1]$$
即 $v$ 的第 $2^k$ 级祖先 = $v$ 的第 $2^{k-1}$ 级祖先的第 $2^{k-1}$ 级祖先。

**查询 LCA(u, v)**：

1. **对齐深度**：假设 $\text{dep}[u] \ge \text{dep}[v]$，用倍增把 $u$ 向上跳到与 $v$ 同一深度。如果跳完发现 $u = v$，直接返回。
2. **共同上跳**：从高位到低位枚举 $k$，如果 $\text{fa}[u][k] \ne \text{fa}[v][k]$，说明 $u$ 和 $v$ 还在 LCA 的下方，同时上跳。循环结束后 $\text{fa}[u][0]$ 就是 LCA。

倍增法每次查询 $O(\log n)$，预处理 $O(n \log n)$，空间 $O(n \log n)$，是最通用的在线 LCA 算法。

<!--DEMO:lca-binary-lifting-->

### 2. Tarjan 离线算法

Tarjan 离线算法利用**并查集 + DFS**，在一次遍历中回答所有查询。核心思想：在 DFS 回溯时，用并查集把已访问完的子树"缩"到根节点上。

流程：

1. 从根节点开始 DFS
2. 访问节点 $u$ 时，标记 $u$ 为"已访问"
3. 递归处理 $u$ 的所有子树
4. 回溯时将 $u$ 的并查集指向其父节点：$\text{fa}[u] \leftarrow \text{parent}(u)$
5. 对于每个与 $u$ 有关的查询 $(u, v)$：如果 $v$ 已经被访问过，那么 $\text{find}(v)$ 就是 $\text{LCA}(u, v)$

时间复杂度 $O(n + q \cdot \alpha(n))$，接近线性，但必须**离线**（事先知道所有查询）。

### 3. 树链剖分求 LCA

树链剖分把树拆成若干条**重链**，每条重链上的节点在 DFS 序中连续。求 LCA 时：

1. 如果 $u$ 和 $v$ 在同一条重链上，深度较小的就是 LCA
2. 否则，把所在重链链头深度较大的那个节点跳到其链头的父节点
3. 重复直到两者在同一重链上

树链剖分求 LCA 每次查询 $O(\log n)$（实际上常数极小，通常比倍增法更快），且不需要额外的倍增数组——可以复用树剖本身的 `top[]` 数组。

### 4. 欧拉序 + ST 表

对树做 DFS，按访问顺序记录**欧拉序**（进入节点和回溯时都记录），则 $u$ 和 $v$ 之间的 LCA 就是欧拉序中 $u$ 到 $v$ 之间**深度最小**的那个节点。

预处理用 **ST 表**（稀疏表）$O(n \log n)$，查询 $O(1)$。适合 LCA 查询量极大的场景。

---

## 模板代码

### 倍增法模板

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 500005;
const int MAXLOG = 20;

vector<int> adj[MAXN];
int dep[MAXN];          // 节点深度
int fa[MAXN][MAXLOG];   // fa[v][k]：v 的第 2^k 级祖先
int n, m, root;

// DFS 预处理深度和倍增数组
void dfs(int u, int parent) {
    dep[u] = dep[parent] + 1;
    fa[u][0] = parent;
    for (int k = 1; k < MAXLOG; k++) {
        fa[u][k] = fa[fa[u][k-1]][k-1];
    }
    for (int v : adj[u]) {
        if (v == parent) continue;
        dfs(v, u);
    }
}

// 查询 u 和 v 的最近公共祖先
int lca(int u, int v) {
    // 步骤 1：对齐深度
    if (dep[u] < dep[v]) swap(u, v);
    int diff = dep[u] - dep[v];
    for (int k = 0; k < MAXLOG; k++) {
        if (diff >> k & 1) {
            u = fa[u][k];
        }
    }
    if (u == v) return u;

    // 步骤 2：共同上跳
    for (int k = MAXLOG - 1; k >= 0; k--) {
        if (fa[u][k] != fa[v][k]) {
            u = fa[u][k];
            v = fa[v][k];
        }
    }
    return fa[u][0];
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> m >> root;
    for (int i = 1; i < n; i++) {
        int u, v;
        cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    // 以 root 为根做预处理
    dfs(root, 0);

    // 处理 m 次查询
    while (m--) {
        int u, v;
        cin >> u >> v;
        cout << lca(u, v) << "\n";
    }
    return 0;
}
```

### 树链剖分求 LCA 模板

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 500005;

vector<int> adj[MAXN];
int dep[MAXN], fa[MAXN];    // 深度、父节点
int sz[MAXN], son[MAXN];    // 子树大小、重儿子
int top[MAXN];               // 重链链头
int n, m, root;

// 第一遍 DFS：求 dep、fa、sz、son
void dfs1(int u, int parent) {
    dep[u] = dep[parent] + 1;
    fa[u] = parent;
    sz[u] = 1;
    son[u] = 0;
    int maxsz = 0;
    for (int v : adj[u]) {
        if (v == parent) continue;
        dfs1(v, u);
        sz[u] += sz[v];
        if (sz[v] > maxsz) {
            maxsz = sz[v];
            son[u] = v;
        }
    }
}

// 第二遍 DFS：确定每条重链的链头
void dfs2(int u, int tp) {
    top[u] = tp;
    if (son[u]) dfs2(son[u], tp); // 重儿子继承当前链头
    for (int v : adj[u]) {
        if (v == fa[u] || v == son[u]) continue;
        dfs2(v, v);               // 轻儿子自成新链
    }
}

// 查询 LCA：沿重链上跳
int lca(int u, int v) {
    while (top[u] != top[v]) {
        if (dep[top[u]] < dep[top[v]]) swap(u, v);
        u = fa[top[u]]; // 跳到链头的父节点
    }
    return dep[u] < dep[v] ? u : v;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> m >> root;
    for (int i = 1; i < n; i++) {
        int u, v;
        cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    dfs1(root, 0);
    dfs2(root, root);

    while (m--) {
        int u, v;
        cin >> u >> v;
        cout << lca(u, v) << "\n";
    }
    return 0;
}
```

### 欧拉序 + ST 表模板

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 500005;
const int MAXLOG = 20;

vector<int> adj[MAXN];
int dep[MAXN];
int first[MAXN];               // 节点首次出现在欧拉序中的下标
int euler[MAXN * 2];           // 欧拉序数组
int depth_euler[MAXN * 2];     // 欧拉序中对应节点的深度
int st[MAXN * 2][MAXLOG];      // ST 表：区间深度最小值的下标
int n, m, root, tot;

// DFS 构建欧拉序
void dfs(int u, int parent, int d) {
    dep[u] = d;

    euler[++tot] = u;
    depth_euler[tot] = d;
    first[u] = tot;

    for (int v : adj[u]) {
        if (v == parent) continue;
        dfs(v, u, d + 1);
        euler[++tot] = u;
        depth_euler[tot] = d;
    }
}

// 预处理 ST 表
void build_st() {
    int len = tot;
    for (int i = 1; i <= len; i++) st[i][0] = i;
    for (int k = 1; (1 << k) <= len; k++) {
        for (int i = 1; i + (1 << k) - 1 <= len; i++) {
            int a = st[i][k-1], b = st[i + (1 << (k-1))][k-1];
            st[i][k] = (depth_euler[a] < depth_euler[b]) ? a : b;
        }
    }
}

// 查询区间最小值的下标
int query_min(int l, int r) {
    if (l > r) swap(l, r);
    int k = __lg(r - l + 1);
    int a = st[l][k], b = st[r - (1 << k) + 1][k];
    return depth_euler[a] < depth_euler[b] ? a : b;
}

// O(1) 查询 LCA
int lca(int u, int v) {
    int pos = query_min(first[u], first[v]);
    return euler[pos];
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> m >> root;
    for (int i = 1; i < n; i++) {
        int u, v;
        cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    dfs(root, 0, 0);
    build_st();

    while (m--) {
        int u, v;
        cin >> u >> v;
        cout << lca(u, v) << "\n";
    }
    return 0;
}
```

---

## 例题详解

### 例题 1：洛谷 P3379 - 【模板】最近公共祖先（LCA）

**题意**：给定一棵 $n$ 个节点的有根树，$m$ 次查询两个节点的 LCA。

**分析**：标准的 LCA 模板题。数据范围 $n, m \le 5 \times 10^5$，倍增法 $O((n+m) \log n)$ 足够。输入可能很大，记得开快读。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 500005;
const int MAXLOG = 20;

vector<int> adj[MAXN];
int dep[MAXN], fa[MAXN][MAXLOG];
int n, m, root;

void dfs(int u, int parent) {
    dep[u] = dep[parent] + 1;
    fa[u][0] = parent;
    for (int k = 1; k < MAXLOG; k++)
        fa[u][k] = fa[fa[u][k-1]][k-1];
    for (int v : adj[u]) {
        if (v != parent) dfs(v, u);
    }
}

int lca(int u, int v) {
    if (dep[u] < dep[v]) swap(u, v);
    int diff = dep[u] - dep[v];
    for (int k = 0; k < MAXLOG; k++)
        if (diff >> k & 1) u = fa[u][k];
    if (u == v) return u;
    for (int k = MAXLOG - 1; k >= 0; k--)
        if (fa[u][k] != fa[v][k]) { u = fa[u][k]; v = fa[v][k]; }
    return fa[u][0];
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n >> m >> root;
    for (int i = 1; i < n; i++) {
        int u, v; cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    dfs(root, 0);
    while (m--) {
        int u, v; cin >> u >> v;
        cout << lca(u, v) << "\n";
    }
    return 0;
}
```

**复杂度**：预处理 $O(n \log n)$，查询 $O(m \log n)$。

### 例题 2：洛谷 P1967 - 货车运输

**题意**：$n$ 个城市、$m$ 条双向道路，每条路有承重限制。$q$ 次查询：从 $a$ 到 $b$，货车能装载的最大重量是多少？

**分析**：这是经典的**最大生成树 + 倍增 LCA** 问题。在最大生成树上，$a$ 到 $b$ 的路径瓶颈（路径上最小边权）就是答案。用倍增法同时维护 `fa[v][k]`（祖先）和 `mn[v][k]`（到祖先路径上的最小边权）。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 10005;
const int MAXLOG = 15;
const int INF = 0x3f3f3f3f;

struct Edge { int u, v, w; };

int fa[MAXN], dep[MAXN];
int pa[MAXN][MAXLOG], mn[MAXN][MAXLOG];
vector<pair<int,int>> tree[MAXN];

int find(int x) {
    return fa[x] == x ? x : fa[x] = find(fa[x]);
}

void dfs(int u, int parent) {
    dep[u] = dep[parent] + 1;
    pa[u][0] = parent;
    for (int k = 1; k < MAXLOG; k++) {
        pa[u][k] = pa[pa[u][k-1]][k-1];
        mn[u][k] = min(mn[u][k-1], mn[pa[u][k-1]][k-1]);
    }
    for (auto& [v, w] : tree[u]) {
        if (v == parent) continue;
        mn[v][0] = w;
        dfs(v, u);
    }
}

int query(int a, int b) {
    if (find(a) != find(b)) return -1;
    int ans = INF;
    if (dep[a] < dep[b]) swap(a, b);
    int diff = dep[a] - dep[b];
    for (int k = 0; k < MAXLOG; k++) {
        if (diff >> k & 1) {
            ans = min(ans, mn[a][k]);
            a = pa[a][k];
        }
    }
    if (a == b) return ans;
    for (int k = MAXLOG - 1; k >= 0; k--) {
        if (pa[a][k] != pa[b][k]) {
            ans = min(ans, mn[a][k]);
            ans = min(ans, mn[b][k]);
            a = pa[a][k]; b = pa[b][k];
        }
    }
    ans = min(ans, mn[a][0]);
    ans = min(ans, mn[b][0]);
    return ans;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m; cin >> n >> m;
    vector<Edge> edges(m);
    for (int i = 0; i < m; i++) cin >> edges[i].u >> edges[i].v >> edges[i].w;

    sort(edges.begin(), edges.end(), [](auto& a, auto& b) { return a.w > b.w; });
    for (int i = 1; i <= n; i++) fa[i] = i;

    for (auto& e : edges) {
        int fu = find(e.u), fv = find(e.v);
        if (fu != fv) {
            fa[fu] = fv;
            tree[e.u].push_back({e.v, e.w});
            tree[e.v].push_back({e.u, e.w});
        }
    }

    memset(mn, 0x3f, sizeof(mn));
    for (int i = 1; i <= n; i++)
        if (!dep[i]) dfs(i, 0);

    int q; cin >> q;
    while (q--) {
        int a, b; cin >> a >> b;
        cout << query(a, b) << "\n";
    }
    return 0;
}
```

**复杂度**：建树 $O(m \log m)$，预处理 $O(n \log n)$，查询 $O(q \log n)$。

---

## 练习题单

| # | 平台 | 题号/名称 | 难度 | 关键点 |
|---|------|-----------|------|--------|
| 1 | 洛谷 | P3379 【模板】最近公共祖先 | 入门 | 倍增 LCA 模板 |
| 2 | 洛谷 | P1967 货车运输 | 进阶 | 最大生成树 + LCA 维护路径最小值 |
| 3 | 洛谷 | P3398 仓鼠找 sugar | 进阶 | 利用 LCA 判断树上路径是否相交 |
| 4 | 洛谷 | P2680 运输计划 | 综合 | 树上差分 + 二分答案 + LCA |
| 5 | Codeforces | CF 609E - Minimum spanning tree for each edge | 进阶 | MST + LCA 维护路径最大/次大边 |
| 6 | 洛谷 | P4281 紧急集合 | 进阶 | 三点 LCA（两两 LCA 取最优） |
| 7 | LeetCode | 1483. Kth Ancestor of a Tree Node | 综合 | 倍增法 + 离线查询 |
| 8 | 洛谷 | P5836 美丽道路 | 综合 | 树上路径问题 + 按颜色分类 LCA |

---

## 常见错误

### 1. MAXLOG 设得不够大

```cpp
// 错误：MAXLOG 设为 15，但 n 可能达到 5e5，log2(5e5) ≈ 19
const int MAXLOG = 15; // 会导致跳不到 LCA 以上的祖先，结果错误

// 正确：MAXLOG 至少为 log2(n) + 1
const int MAXLOG = 20; // 覆盖 n <= 10^6
```

`MAXLOG` 的取值建议：取 $\lceil \log_2 n \rceil + 1$。如果 $n \le 5 \times 10^5$，取 20 即可。

### 2. 对齐深度时遍历方式错误

```cpp
// 错误：用 while 循环逐层上跳，退化为 O(n) 导致 TLE
while (dep[u] > dep[v]) u = fa[u][0];

// 正确：用倍增一步到位
int diff = dep[u] - dep[v];
for (int k = 0; k < MAXLOG; k++)
    if (diff >> k & 1) u = fa[u][k];
```

倍增法的核心价值就是 $O(\log n)$ 跳跃，不要退化回逐层跳。

### 3. DFS 时没跳过父节点，陷入死循环

```cpp
// 错误：无向图建邻接表后，DFS 不判断父节点
void dfs(int u) {
    for (int v : adj[u]) {
        dfs(v); // u -> v -> u -> v ... 无限递归，栈溢出
    }
}

// 正确：传入父节点，跳过
void dfs(int u, int parent) {
    for (int v : adj[u]) {
        if (v == parent) continue;
        dfs(v, u);
    }
}
```

### 4. 用倍增 LCA 时没处理 u = v 的情况

```cpp
// 错误：对齐深度后直接进入共同上跳循环
// 当 u == v 时，LCA 就是 u 本身，不需要再跳
if (dep[u] < dep[v]) swap(u, v);
int diff = dep[u] - dep[v];
for (int k = 0; k < MAXLOG; k++)
    if (diff >> k & 1) u = fa[u][k];
// 缺少: if (u == v) return u;  <-- 这行必须加
for (int k = MAXLOG - 1; k >= 0; k--) ...
```

不加 `if (u == v) return u` 的话，共同上跳循环会多做无用功，甚至在 `fa[root][0] = 0` 时把 `u` 或 `v` 跳到 0（不存在的节点），导致错误结果或越界。

### 5. 树链剖分的 dfs2 忘记先递归重儿子

```cpp
// 错误：直接按邻接表顺序递归，没有优先处理重儿子
void dfs2(int u, int tp) {
    top[u] = tp;
    for (int v : adj[u]) {
        if (v == fa[u]) continue;
        dfs2(v, v); // 重链被打断，树剖退化
    }
}

// 正确：先递归重儿子，再递归轻儿子
void dfs2(int u, int tp) {
    top[u] = tp;
    if (son[u]) dfs2(son[u], tp);  // 重儿子继承链头
    for (int v : adj[u]) {
        if (v == fa[u] || v == son[u]) continue;
        dfs2(v, v);                 // 轻儿子自成新链
    }
}
```

不优先递归重儿子会导致重链被拆散，查询时无法利用"同一重链上深度较浅的就是 LCA"的性质。

---

## 延伸阅读

- [OI Wiki - 最近公共祖先](https://oi-wiki.org/graph/lca/)：倍增、Tarjan、树剖、欧拉序四种方法的系统讲解
- [OI Wiki - 树链剖分](https://oi-wiki.org/graph/hld/)：重链剖分的完整原理与应用
- [OI Wiki - 稀疏表](https://oi-wiki.org/ds/sparse-table/)：ST 表的原理，可配合欧拉序实现 $O(1)$ 查询 LCA
- [洛谷题单 - 树上问题](https://www.luogu.com.cn/training/list)：包含大量 LCA 相关练习
