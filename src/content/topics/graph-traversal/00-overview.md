# 图的遍历

图（Graph）是算法竞赛中最核心的数据结构之一。从社交网络中的好友关系、地图中的路径规划，到状态机中的状态转移，图无处不在。**图的遍历**是指系统地访问图中所有顶点和边的过程，是后续几乎所有图论算法（最短路、生成树、网络流等）的基石。

本章将从图的存储方式讲起，深入讲解深度优先搜索（DFS）和广度优先搜索（BFS）两种遍历策略，并通过连通分量计数、二分图判定、欧拉路径等经典应用，帮助你建立完整的图遍历知识体系。

<!--DEMO:graph-traversal-->

---

## 核心思想

### 1. 图的存储

竞赛中最常用的两种存储方式：

**邻接矩阵**：用二维数组 `g[u][v]` 表示边权。适合**稠密图**（边数 $m$ 接近 $n^2$），查询 $O(1)$，但空间 $O(n^2)$。

**邻接表**：对每个顶点维护一个链表（通常用 `vector`），只存实际存在的边。适合**稀疏图**（$m \ll n^2$），空间 $O(n + m)$，是竞赛的首选。

| 存储方式 | 空间 | 查边 | 遍历邻接点 |
|---------|------|------|-----------|
| 邻接矩阵 | $O(n^2)$ | $O(1)$ | $O(n)$ |
| 邻接表 | $O(n+m)$ | $O(\deg(u))$ | $O(\deg(u))$ |

### 2. DFS 与 BFS

**深度优先搜索（DFS）** 沿着一条路尽可能深地走到底，再回溯。用递归或栈实现。DFS 天然适合：
- 连通分量标记
- 拓扑排序
- 求割点与桥
- 回溯搜索

**广度优先搜索（BFS）** 从起点出发，先访问所有距离为 1 的邻居，再访问距离为 2 的，依此类推。用队列实现。BFS 天然适合：
- 无权图最短路
- 层序遍历
- 二分图判定

> **关键区别**：BFS 保证第一次到达某个节点时走的是最短路径（边权为 1 时），DFS 不保证。

<!--DEMO:bfs-traversal-->

### 3. 连通分量

无向图中，**连通分量**是极大的互相可达的顶点集合。用 DFS 或 BFS 从每个未访问的顶点出发，标记所有可达顶点，即可计数。设连通分量个数为 $c$，则：
- $c = 1$：图连通
- $c > 1$：图不连通，需要至少 $c - 1$ 条边才能连通

### 4. 二分图判定

**二分图**是指顶点可以分成两个集合 $A$、$B$，使得每条边的两个端点分别属于 $A$ 和 $B$。判定方法：BFS/DFS 染色——给起点染颜色 0，相邻点染颜色 1，相邻的相邻染颜色 0……如果某条边的两个端点颜色相同，则不是二分图。

一个图是二分图 **当且仅当** 它不含奇数长度的环。

### 5. 欧拉路径

**欧拉路径**是经过图中每条边恰好一次的路径。如果路径的起点和终点相同，则称为**欧拉回路**。判定条件（无向图）：
- 欧拉回路：所有顶点度数为偶数
- 欧拉路径：恰好两个顶点度数为奇数（即为起点和终点）

有向图的判定类似，只需将"度数"替换为"入度与出度之差"。求解常用 **Hierholzer 算法**，时间复杂度 $O(n + m)$。

---

## 模板代码

### 邻接表建图 + DFS

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1e5 + 5;
vector<int> adj[MAXN]; // 邻接表
bool vis[MAXN];        // 访问标记

// DFS 遍历从 u 出发能到达的所有节点
void dfs(int u) {
    vis[u] = true;
    for (int v : adj[u]) {
        if (!vis[v]) {
            dfs(v);
        }
    }
}

// 统计无向图连通分量个数
int count_components(int n) {
    memset(vis, 0, sizeof(vis));
    int cnt = 0;
    for (int i = 1; i <= n; i++) {
        if (!vis[i]) {
            dfs(i);      // 从新起点开始，发现一个新连通分量
            cnt++;
        }
    }
    return cnt;
}
```

### BFS 无权图最短路

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1e5 + 5;
vector<int> adj[MAXN];
int dist[MAXN]; // dist[i] = 从起点到 i 的最短距离

// BFS 求从 s 到所有点的最短距离（边权为 1）
void bfs(int s, int n) {
    memset(dist, -1, sizeof(int) * (n + 1));
    queue<int> q;
    dist[s] = 0;
    q.push(s);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (dist[v] == -1) { // 未访问
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }
}
```

### 二分图判定（BFS 染色）

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1e5 + 5;
vector<int> adj[MAXN];
int color[MAXN]; // 0=未染色, 1=颜色A, 2=颜色B

// 判断以 s 为起点的连通分量是否为二分图
bool is_bipartite_bfs(int s) {
    queue<int> q;
    color[s] = 1;
    q.push(s);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (color[v] == 0) {
                color[v] = 3 - color[u]; // 染相反颜色
                q.push(v);
            } else if (color[v] == color[u]) {
                return false; // 相邻同色，不是二分图
            }
        }
    }
    return true;
}
```

### 欧拉路径（Hierholzer 算法）

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1e5 + 5;
vector<pair<int,int>> adj[MAXN]; // {邻居, 边编号}
bool used_edge[MAXN * 5];        // 边是否已使用
vector<int> path;                // 存储欧拉路径

void hierholzer(int u) {
    // 贪心地走未走过的边，走到死路时加入路径（逆序）
    while (!adj[u].empty()) {
        auto [v, eid] = adj[u].back();
        adj[u].pop_back();
        if (used_edge[eid]) continue;
        used_edge[eid] = true;
        hierholzer(v);
    }
    path.push_back(u); // 回溯时记录，最终 path 是逆序的
}
```

---

## 例题详解

### 例题 1：洛谷 P5318 查找文献

**题意：** 给定一个 $n$ 个点 $m$ 条边的有向图，从顶点 1 出发分别进行 DFS 和 BFS，输出遍历顺序。当有多个未访问的邻居时，优先访问编号小的。$n \le 10^5$，$m \le 2 \times 10^5$。

**思路：** 本题是遍历的模板题。关键细节：每次选择**编号最小**的未访问邻居。做法是对每个顶点的邻接表排序。DFS 用递归，BFS 用队列，注意 BFS 中入队即标记（不要出队时才标记，否则同一节点可能多次入队）。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1e5 + 5;
vector<int> adj[MAXN];
bool vis[MAXN];
vector<int> dfs_order, bfs_order;

void dfs(int u) {
    vis[u] = true;
    dfs_order.push_back(u);
    for (int v : adj[u]) {
        if (!vis[v]) dfs(v);
    }
}

void bfs(int s) {
    memset(vis, 0, sizeof(vis));
    queue<int> q;
    vis[s] = true;   // 入队时就标记！
    q.push(s);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        bfs_order.push_back(u);
        for (int v : adj[u]) {
            if (!vis[v]) {
                vis[v] = true;
                q.push(v);
            }
        }
    }
}

int main() {
    int n, m;
    scanf("%d%d", &n, &m);
    for (int i = 0; i < m; i++) {
        int u, v;
        scanf("%d%d", &u, &v);
        adj[u].push_back(v);
    }
    // 排序：编号小的优先
    for (int i = 1; i <= n; i++)
        sort(adj[i].begin(), adj[i].end());

    dfs(1);
    bfs(1);
    for (int i = 0; i < (int)dfs_order.size(); i++)
        printf("%d%c", dfs_order[i], " \n"[i + 1 == (int)dfs_order.size()]);
    for (int i = 0; i < (int)bfs_order.size(); i++)
        printf("%d%c", bfs_order[i], " \n"[i + 1 == (int)bfs_order.size()]);
    return 0;
}
```

### 例题 2：LeetCode 785 判断二分图

**题意：** 给定一个 $n$ 个节点的无向图 `graph`，其中 `graph[u]` 是节点 `u` 的邻居列表。判断该图是否是二分图。

**思路：** 标准的 BFS 染色。遍历所有顶点，对每个未染色的顶点启动一次 BFS，尝试二染色。如果某次 BFS 中发现相邻顶点同色，则返回 `false`。

```cpp
class Solution {
public:
    bool isBipartite(vector<vector<int>>& graph) {
        int n = graph.size();
        vector<int> color(n, 0); // 0=未染色, 1=颜色A, -1=颜色B

        for (int i = 0; i < n; i++) {
            if (color[i] != 0) continue; // 已经染过色
            // BFS 染色
            queue<int> q;
            color[i] = 1;
            q.push(i);
            while (!q.empty()) {
                int u = q.front(); q.pop();
                for (int v : graph[u]) {
                    if (color[v] == 0) {
                        color[v] = -color[u]; // 相反颜色
                        q.push(v);
                    } else if (color[v] == color[u]) {
                        return false; // 相邻同色
                    }
                }
            }
        }
        return true;
    }
};
```

---

## 练习题单

| # | 平台 | 题号/名称 | 难度 | 关键词 |
|---|------|----------|------|--------|
| 1 | 洛谷 | P5318 查找文献 | 入门 | DFS / BFS 遍历顺序 |
| 2 | 洛谷 | P1706 全排列问题（图视角） | 入门 | DFS 回溯 |
| 3 | LeetCode | 200 岛屿数量 | 入门 | DFS/BFS 求连通分量 |
| 4 | LeetCode | 785 判断二分图 | 进阶 | BFS 染色 |
| 5 | 洛谷 | P2661 信息传递 | 进阶 | DFS 求最小环（基环树） |
| 6 | LeetCode | 332 重新安排行程 | 综合 | 欧拉路径 / Hierholzer |
| 7 | Codeforces | 1272E Nearest Opposite Parity | 综合 | 反向 BFS + 多源最短路 |
| 8 | 洛谷 | P2746 校园网 | 综合 | 强连通分量 / Tarjan |

---

## 常见错误

**1. BFS 入队时机错误**

BFS 中应**入队时就标记 `vis[v] = true`**，而不是出队时标记。如果出队时才标记，同一个节点可能被多次加入队列，导致重复遍历甚至超时。

**2. 邻接表存有向图忘了方向**

`adj[u].push_back(v)` 只加了 $u \to v$ 的边。无向图需要加两次：`adj[u].push_back(v); adj[v].push_back(u);`。漏加反向边会导致遍历不到，是最常见的建图错误。

**3. DFS 递归爆栈**

$n$ 较大（如 $10^5$）且图退化成链时，递归深度可能达到 $10^5$，超出系统栈限制导致段错误（RE）。解法：改用手动栈的非递归 DFS，或在编译时加 `-Wl,-stack,67108864` 扩大栈空间。

**4. 二分图判定只从一个点开始**

如果图不连通，只从一个点做 BFS 染色是不够的。必须对每个连通分量分别染色。正确做法：遍历所有顶点，对未染色的顶点启动 BFS。

**5. 欧拉路径判错起点**

Hierholzer 算法要求从正确的起点开始：无向图中，如果存在度数为奇数的顶点，必须从其中一个奇度顶点出发；否则任意选取有边的顶点。从错误的起点出发可能走不到所有边。

---

## 延伸阅读

- OI Wiki - 图的存储：https://oi-wiki.org/graph/save/
- OI Wiki - DFS：https://oi-wiki.org/search/dfs/
- OI Wiki - BFS：https://oi-wiki.org/search/bfs/
- OI Wiki - 二分图：https://oi-wiki.org/graph/bi-graph/
- OI Wiki - 欧拉图：https://oi-wiki.org/graph/euler/
- 《算法竞赛进阶指南》第 6 章 图论
