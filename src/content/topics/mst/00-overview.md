# 最小生成树

给定一张**无向连通加权图** $G = (V, E)$，最小生成树（Minimum Spanning Tree, MST）是一棵包含所有 $n = |V|$ 个顶点、恰好 $n - 1$ 条边的树，且所有边的**权值之和最小**。最小生成树不一定是唯一的——当图中存在多条边权相同的边时，可能有多种不同的 MST，但它们的总权值一定相等。

**什么时候该想到最小生成树？**

- 题目要求用**最少的代价**把所有节点连通（网络铺设、道路修建）
- 在一个带权无向图中选取若干边，使图连通且总权值最小
- 需要求**最小瓶颈路**（MST 上的路径即为瓶颈最小的路径）
- 与 Kruskal 重构树配合处理"最大边权最小"类问题

<!--DEMO:mst-visual-->

---

## 核心思想

最小生成树的经典算法有三种：Kruskal、Prim 和 Borůvka。它们都基于 MST 的两条核心性质：

**切性质（Cut Property）**：对于图的任意一个割（把顶点分成两个非空集合），跨越割的**权值最小的边**一定属于某棵 MST。

**圈性质（Cycle Property）**：对于图中的任意一个环，环上**权值最大的边**一定不属于任何一棵 MST（除非有等权边）。

这两条性质是所有 MST 算法正确性的理论基础。

### 1. Kruskal 算法

Kruskal 是最常用的 MST 算法，核心思路是**贪心 + 并查集**：

1. 将所有边按权值**从小到大排序**
2. 依次考虑每条边 $(u, v, w)$：如果 $u$ 和 $v$ **不在同一个连通分量**中，则将这条边加入 MST，并合并 $u$ 和 $v$ 所在的集合
3. 重复直到选了 $n - 1$ 条边

Kruskal 的时间复杂度为 $O(m \log m)$，瓶颈在排序。当边数 $m$ 远小于 $n^2$（稀疏图）时，Kruskal 表现优秀。

<!--DEMO:kruskal-process-->

### 2. Prim 算法

Prim 的思路类似 Dijkstra，从一个起始点出发，逐步扩展已选顶点集合：

1. 维护一个"已选集合" $S$，初始只含一个起始点
2. 维护每个未选顶点到 $S$ 的**最小边权** `dist[v]`
3. 每次选出 `dist` 最小的未选顶点 $u$，将其加入 $S$，并用 $(u, v)$ 的边权更新邻居的 `dist`
4. 重复 $n - 1$ 次

Prim 的时间复杂度取决于实现方式：
- **朴素 Prim**：$O(n^2)$，适合**稠密图**（$m \approx n^2$）
- **堆优化 Prim**：$O(m \log n)$，适合稀疏图

### 3. Borůvka 算法

Borůvka 是最早的 MST 算法（1926年），思路是**并行收缩**：

1. 初始时每个顶点自成一个连通分量
2. 对每个分量，找到连接它与外部的**权值最小的边**，加入 MST
3. 合并所有通过这些边相连的分量
4. 重复直到只剩一个分量

每轮分量数至少减半，所以最多 $O(\log n)$ 轮。如果用并查集维护分量，总复杂度 $O(m \log n)$。Borůvka 在并行计算和某些特殊场景（如只给边查询接口的图）中很有用。

<!--DEMO:boruvka-process-->

### 4. 最小瓶颈路

**最小瓶颈路**：对于 $s$ 到 $t$ 的所有路径，定义一条路径的"瓶颈"为路径上**最大边权**。最小瓶颈路就是瓶颈最小的那条路径。

一个重要结论：**MST 上 $s$ 到 $t$ 的唯一路径就是最小瓶颈路**。因此，先建 MST，再在树上求路径最大值即可。这可以通过倍增法或树链剖分在 $O(\log n)$ 时间内回答查询。

---

## 模板代码

### Kruskal 模板

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 200005;
const int MAXM = 400005;

struct Edge {
    int u, v, w;
    bool operator<(const Edge& o) const { return w < o.w; }
} edges[MAXM];

int fa[MAXN]; // 并查集父节点
int n, m;

// 并查集：路径压缩 + 按秩合并
int find(int x) {
    return fa[x] == x ? x : fa[x] = find(fa[x]);
}

// Kruskal 算法，返回 MST 总权值
// 若图不连通返回 -1
long long kruskal() {
    sort(edges, edges + m); // 按边权排序

    // 初始化并查集
    for (int i = 1; i <= n; i++) fa[i] = i;

    long long total = 0;   // MST 总权值
    int cnt = 0;            // 已选边数

    for (int i = 0; i < m; i++) {
        int u = edges[i].u, v = edges[i].v, w = edges[i].w;
        int fu = find(u), fv = find(v);
        if (fu != fv) {       // 不在同一连通分量
            fa[fu] = fv;       // 合并
            total += w;
            cnt++;
            if (cnt == n - 1) break; // 已选够 n-1 条边
        }
    }

    return cnt == n - 1 ? total : -1; // -1 表示图不连通
}
```

### 朴素 Prim 模板

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 5005;
const int INF = 0x3f3f3f3f;

// 邻接矩阵存图（适合稠密图）
int g[MAXN][MAXN];
int dist[MAXN];     // dist[v]：v 到已选集合的最小边权
bool vis[MAXN];     // 是否已加入 MST
int n;

long long prim() {
    memset(dist, 0x3f, sizeof(dist));
    memset(vis, 0, sizeof(vis));
    dist[1] = 0; // 从 1 号点开始

    long long total = 0;
    for (int i = 0; i < n; i++) {
        // 找 dist 最小的未选顶点
        int u = -1;
        for (int j = 1; j <= n; j++) {
            if (!vis[j] && (u == -1 || dist[j] < dist[u]))
                u = j;
        }

        if (dist[u] == INF) return -1; // 图不连通
        vis[u] = true;
        total += dist[u];

        // 用 u 更新邻居
        for (int v = 1; v <= n; v++) {
            if (!vis[v] && g[u][v] < dist[v]) {
                dist[v] = g[u][v];
            }
        }
    }
    return total;
}
```

### 堆优化 Prim 模板

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 200005;
const int MAXM = 400005;
const int INF = 0x3f3f3f3f;

struct Edge { int v, w; };
vector<Edge> adj[MAXN];

int dist[MAXN];
bool vis[MAXN];
int n, m;

long long prim() {
    memset(dist, 0x3f, sizeof(dist));
    memset(vis, 0, sizeof(vis));
    dist[1] = 0;

    // 小根堆：{权值, 顶点}
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq;
    pq.push({0, 1});

    long long total = 0;
    int cnt = 0; // 已加入 MST 的顶点数

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();
        if (vis[u]) continue; // 跳过已处理的冗余条目
        vis[u] = true;
        total += d;
        cnt++;

        for (auto& e : adj[u]) {
            if (!vis[e.v] && e.w < dist[e.v]) {
                dist[e.v] = e.w;
                pq.push({e.w, e.v});
            }
        }
    }

    return cnt == n ? total : -1;
}
```

---

## 例题详解

### 例题 1：洛谷 P3366 - 最小生成树

**题意**：给定 $n$ 个点 $m$ 条边的无向图，求最小生成树的总权值。若图不连通输出 `orz`。

**分析**：标准的 MST 模板题。图可能不连通，需要判断选出的边数是否为 $n - 1$。使用 Kruskal 即可，实现简单且效率高。

```cpp
#include <bits/stdc++.h>
using namespace std;

struct Edge {
    int u, v, w;
    bool operator<(const Edge& o) const { return w < o.w; }
};

int fa[5005];
int n, m;

int find(int x) {
    return fa[x] == x ? x : fa[x] = find(fa[x]);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    cin >> n >> m;
    vector<Edge> edges(m);
    for (int i = 0; i < m; i++) {
        cin >> edges[i].u >> edges[i].v >> edges[i].w;
    }

    sort(edges.begin(), edges.end());

    for (int i = 1; i <= n; i++) fa[i] = i;

    long long total = 0;
    int cnt = 0;
    for (auto& e : edges) {
        int fu = find(e.u), fv = find(e.v);
        if (fu != fv) {
            fa[fu] = fv;
            total += e.w;
            cnt++;
        }
    }

    if (cnt == n - 1) {
        cout << total << endl;
    } else {
        cout << "orz" << endl;
    }
    return 0;
}
```

**复杂度**：$O(m \log m)$，主要是排序的开销。

### 例题 2：洛谷 P1967 - 货车运输

**题意**：$n$ 个城市、$m$ 条双向道路，每条路有承重限制。$q$ 次查询：从城市 $a$ 到城市 $b$，货车能装载的最大重量是多少？（即路径上所有边承重限制的最小值最大）

**分析**：这是经典的**最大瓶颈路**问题。在最大生成树（把边权取负求最小，或降序排序）上，$a$ 到 $b$ 的路径就是答案。原因：最大生成树的路径瓶颈 = 所有 $a \to b$ 路径中瓶颈的最大值。

建好最大生成树后，用**倍增法**预处理路径上的最小边权，$O(\log n)$ 回答每次查询。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 10005;
const int MAXLOG = 15;
const int INF = 0x3f3f3f3f;

struct Edge { int u, v, w; };

int fa[MAXN];
vector<pair<int,int>> tree[MAXN]; // 邻接表存 MST：{邻居, 边权}

// 倍增数组
int dep[MAXN];
int pa[MAXN][MAXLOG];   // pa[v][k]：v 的第 2^k 级祖先
int mw[MAXN][MAXLOG];   // mw[v][k]：v 到 pa[v][k] 路径上的最小边权

int find(int x) {
    return fa[x] == x ? x : fa[x] = find(fa[x]);
}

// DFS 预处理倍增
void dfs(int u, int parent) {
    dep[u] = dep[parent] + 1;
    pa[u][0] = parent;
    for (int k = 1; k < MAXLOG; k++) {
        pa[u][k] = pa[pa[u][k-1]][k-1];
        mw[u][k] = min(mw[u][k-1], mw[pa[u][k-1]][k-1]);
    }
    for (auto& [v, w] : tree[u]) {
        if (v == parent) continue;
        mw[v][0] = w; // v 到父节点 u 的边权
        dfs(v, u);
    }
}

// 查询 a 到 b 路径上的最小边权
int query(int a, int b) {
    if (find(a) != find(b)) return -1; // 不连通

    int ans = INF;
    // 先让 a 和 b 到同一深度
    if (dep[a] < dep[b]) swap(a, b);
    for (int k = MAXLOG - 1; k >= 0; k--) {
        if (dep[pa[a][k]] >= dep[b]) {
            ans = min(ans, mw[a][k]);
            a = pa[a][k];
        }
    }
    if (a == b) return ans;
    // 一起往上跳
    for (int k = MAXLOG - 1; k >= 0; k--) {
        if (pa[a][k] != pa[b][k]) {
            ans = min(ans, mw[a][k]);
            ans = min(ans, mw[b][k]);
            a = pa[a][k];
            b = pa[b][k];
        }
    }
    ans = min(ans, mw[a][0]);
    ans = min(ans, mw[b][0]);
    return ans;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m;
    cin >> n >> m;
    vector<Edge> edges(m);
    for (int i = 0; i < m; i++) {
        cin >> edges[i].u >> edges[i].v >> edges[i].w;
    }

    // 按边权降序排序，求最大生成树
    sort(edges.begin(), edges.end(), [](const Edge& a, const Edge& b) {
        return a.w > b.w;
    });

    for (int i = 1; i <= n; i++) fa[i] = i;

    // Kruskal 建最大生成树
    for (auto& e : edges) {
        int fu = find(e.u), fv = find(e.v);
        if (fu != fv) {
            fa[fu] = fv;
            tree[e.u].push_back({e.v, e.w});
            tree[e.v].push_back({e.u, e.w});
        }
    }

    // 对每棵树分别做倍增预处理
    memset(mw, 0x3f, sizeof(mw));
    memset(dep, 0, sizeof(dep));
    for (int i = 1; i <= n; i++) {
        if (dep[i] == 0) { // 未访问过，是某棵树的根
            dfs(i, 0);
        }
    }

    int q;
    cin >> q;
    while (q--) {
        int a, b;
        cin >> a >> b;
        cout << query(a, b) << "\n";
    }
    return 0;
}
```

**复杂度**：建树 $O(m \log m)$，预处理 $O(n \log n)$，每次查询 $O(\log n)$。

---

## 练习题单

| # | 平台 | 题号/名称 | 难度 | 关键点 |
|---|------|-----------|------|--------|
| 1 | 洛谷 | P3366 最小生成树 | 入门 | Kruskal 模板 |
| 2 | LeetCode | 1584. Min Cost to Connect All Points | 入门 | Kruskal 或 Prim 模板 |
| 3 | 洛谷 | P2872 Building Roads | 入门 | 已知坐标的完全图 MST |
| 4 | 洛谷 | P1967 货车运输 | 进阶 | 最大生成树 + 倍增 LCA |
| 5 | 洛谷 | P4047 部落划分 | 进阶 | 二分答案 + MST / 类 Kruskal |
| 6 | Codeforces | CF 1245D - Shichikuji and Power Grid | 进阶 | 虚拟节点建图 + MST |
| 7 | 洛谷 | P4180 严格次小生成树 | 综合 | 次小生成树，倍增维护最大/次大边权 |
| 8 | Luogu | P3623 免费的馅饼 | 综合 | Kruskal 重构树 |

---

## 常见错误

### 1. 并查集未做路径压缩

```cpp
// 错误：只做朴素 find，退化为 O(n) 导致 TLE
int find(int x) {
    while (fa[x] != x) x = fa[x];
    return x;
}

// 正确：路径压缩
int find(int x) {
    return fa[x] == x ? x : fa[x] = find(fa[x]);
}
```

Kruskal 中并查集被调用 $O(m)$ 次，不做路径压缩可能退化为 $O(nm)$，在大数据下超时。

### 2. Kruskal 排序时忘记排序键

```cpp
// 错误：只写了函数名但忘记按边权排序
sort(edges, edges + m); // 如果 Edge 没有重载 operator<，结果未定义

// 正确：确保 Edge 结构体重载了 operator<，或者使用 lambda
sort(edges, edges + m, [](const Edge& a, const Edge& b) {
    return a.w < b.w;
});
```

### 3. 判断图连通时条件写错

```cpp
// 错误：检查的是 cnt == n（选了 n 条边），但 MST 只有 n-1 条边
if (cnt == n) { ... }

// 正确：
if (cnt == n - 1) { ... }
```

### 4. Prim 用邻接矩阵时初始化 INF 不够大

```cpp
// 错误：INF 设为 0x7fffffff，后续 dist[v] = min(dist[v], w) 不会溢出
// 但在某些题目中权值可能达到 10^9，2 * 10^9 接近 INT_MAX
const int INF = 0x7fffffff;

// 更安全的做法：
const int INF = 0x3f3f3f3f; // 约 10^9，足够覆盖常见权值范围
```

`0x3f3f3f3f` 是竞赛常用的 INF 值，约为 $1.06 \times 10^9$，且 `0x3f3f3f3f + 0x3f3f3f3f` 不溢出。`memset(arr, 0x3f, sizeof(arr))` 可以一次性将数组初始化为该值。

### 5. 边数开错 / 存图时漏存反向边

```cpp
// 错误：无向图只存了一条边
adj[e.u].push_back({e.v, e.w});

// 正确：无向图要存两条边
adj[e.u].push_back({e.v, e.w});
adj[e.v].push_back({e.u, e.w});
```

Kruskal 用边集数组不受影响，但 Prim 用邻接表时必须注意。

---

## 延伸阅读

- [OI Wiki - 最小生成树](https://oi-wiki.org/graph/mst/)：Kruskal、Prim、Borůvka 的系统讲解与复杂度分析
- [OI Wiki - 最小生成树性质](https://oi-wiki.org/graph/mst/#_8)：切性质、圈性质的证明
- [OI Wiki - Kruskal 重构树](https://oi-wiki.org/graph/mst-kruskal/)：基于 MST 的高级技巧
- [LeetCode Graph 题单](https://leetcode.cn/tag/graph/)：含 MST 相关题目
