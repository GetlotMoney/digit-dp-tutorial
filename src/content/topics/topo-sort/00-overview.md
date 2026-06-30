# 拓扑排序

拓扑排序（Topological Sort）是针对**有向无环图（DAG, Directed Acyclic Graph）** 的一种线性排序方式，使得对于图中每条有向边 $u \to v$，顶点 $u$ 在排序中都出现在 $v$ 之前。简单来说，拓扑排序回答的问题是：**当一组任务之间存在先后依赖关系时，如何安排一个合法的执行顺序？**

拓扑排序在工程中有广泛应用：编译系统中编译单元的依赖排序、课程先修关系的排课方案、构建系统（Make/CMake）的执行顺序、数据管道中算子的调度等。在竞赛中，拓扑排序是 DAG 检测、DAG 上 DP、关键路径求解等算法的基础。

本章将系统讲解 BFS（Kahn 算法）和 DFS 两种拓扑排序实现，介绍如何检测图中是否存在环，并展示 DAG 上动态规划的经典套路。

<!--DEMO:topo-sort-->

---

## 核心思想

### 1. 什么是拓扑排序

给定一个有向图 $G = (V, E)$，拓扑排序是顶点的一个线性序列 $\langle v_1, v_2, \ldots, v_n \rangle$，满足：

$$\forall\; (v_i, v_j) \in E,\quad \text{position}(v_i) < \text{position}(v_j)$$

直觉上，如果把边 $u \to v$ 理解为"$u$ 必须在 $v$ 之前完成"，拓扑排序就是一个满足所有依赖的执行计划。

**重要性质**：
- 只有 DAG 才存在拓扑排序。如果图中有环，就无法找到合法的线性序列。
- DAG 的拓扑排序**不一定唯一**。一个 DAG 可能有多种合法排序。
- 如果拓扑排序中相邻两个顶点之间都有边，则这种排序是唯一的。

### 2. BFS 拓扑排序（Kahn 算法）

Kahn 算法的核心思想极其简洁：

1. 计算每个顶点的**入度** $\text{indeg}(v)$（有多少条边指向 $v$）。
2. 将所有入度为 0 的顶点加入队列。入度为 0 意味着没有前置依赖，可以立即执行。
3. 不断从队列中取出顶点 $u$，将其加入排序结果，然后将 $u$ 的所有邻居 $v$ 的入度减 1。如果 $v$ 的入度变为 0，加入队列。
4. 如果排序结果中顶点数等于 $n$，则排序成功；否则图中有环。

Kahn 算法的过程天然符合 BFS 的模式，因此得名 BFS 拓扑排序。

<!--DEMO:bfs-topo-->

**时间复杂度**：$O(n + m)$，其中 $n$ 为顶点数，$m$ 为边数。每个顶点和每条边各处理一次。

**为什么能检测环？** 如果图中有环，环上所有顶点的入度始终不会降为 0（因为环上的边互相依赖），它们永远不会进入队列。因此，最终排序结果中的顶点数 $< n$。

### 3. DFS 拓扑排序

DFS 实现拓扑排序利用了后序遍历的性质：

1. 对图进行 DFS 遍历。
2. 当一个顶点的所有邻居都访问完毕后（即递归回溯时），将该顶点压入栈中。
3. 最终栈中从顶到底的顺序就是一个合法的拓扑排序。

DFS 版本同样可以在遍历过程中检测环：用三种状态标记顶点——未访问（白色）、正在访问（灰色）、已完成（黑色）。如果 DFS 过程中遇到灰色顶点，说明存在后向边，即图中有环。

**时间复杂度**：同样是 $O(n + m)$。

> 两种方法在竞赛中都很常用。Kahn 算法更直观、易于理解，且方便在排序过程中进行 DAG 上的 DP；DFS 版本代码更短，适合快速实现。

### 4. DAG 上的 DP

拓扑排序一个极其重要的应用是**在 DAG 上做动态规划**。当 DP 的状态转移关系构成一个 DAG 时，沿着拓扑排序的顺序依次更新，可以保证计算某个状态时，它的所有前驱状态都已经算好。

经典模型包括：
- **最长/最短路径**：给定带权 DAG，求源点到汇点的最长路或最短路。按拓扑序依次松弛，时间 $O(n + m)$。
- **关键路径**：所有任务的最长路径即为项目的最短完成时间。关键路径上的任务不能延迟，否则会影响总工期。
- **DAG 上的方案计数**：统计从源点到汇点的路径数，按拓扑序累加即可。

---

## 模板代码

### BFS 拓扑排序（Kahn 算法）

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1e5 + 5;
vector<int> adj[MAXN];  // 邻接表
int indeg[MAXN];         // 入度数组
vector<int> topo;        // 拓扑排序结果

// 返回 true 表示无环，topo 中存放合法的拓扑序
// 返回 false 表示有环
bool kahn(int n) {
    queue<int> q;
    // 将所有入度为 0 的顶点入队
    for (int i = 1; i <= n; i++) {
        if (indeg[i] == 0) q.push(i);
    }
    while (!q.empty()) {
        int u = q.front(); q.pop();
        topo.push_back(u);
        for (int v : adj[u]) {
            if (--indeg[v] == 0) {
                q.push(v);  // 入度降为 0，可以执行
            }
        }
    }
    return (int)topo.size() == n; // 全部排完则无环
}
```

### DFS 拓扑排序

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1e5 + 5;
vector<int> adj[MAXN];
int state[MAXN];       // 0=未访问, 1=正在访问, 2=已完成
vector<int> topo;      // 拓扑排序结果（逆序）
bool has_cycle = false;

void dfs(int u) {
    state[u] = 1;  // 标记为"正在访问"（灰色）
    for (int v : adj[u]) {
        if (state[v] == 1) {
            has_cycle = true;  // 遇到灰色顶点，有环！
            return;
        }
        if (state[v] == 0) dfs(v);
    }
    state[u] = 2;  // 标记为"已完成"（黑色）
    topo.push_back(u);  // 后序入栈
}

// 对所有未访问顶点调用 dfs
void topo_sort(int n) {
    for (int i = 1; i <= n; i++) {
        if (state[i] == 0) dfs(i);
    }
    reverse(topo.begin(), topo.end()); // 反转得到拓扑序
}
```

### DAG 最长路径（关键路径）

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1e5 + 5;
vector<pair<int,int>> adj[MAXN]; // {邻居, 边权}
int indeg[MAXN];
int dist[MAXN]; // dist[i] = 从源点到 i 的最长距离

// 先用 Kahn 算法获取拓扑序，再按序 DP
int longest_path(int n, int s) {
    // 第一步：Kahn 算法求拓扑序
    queue<int> q;
    vector<int> topo;
    for (int i = 1; i <= n; i++) {
        if (indeg[i] == 0) q.push(i);
    }
    while (!q.empty()) {
        int u = q.front(); q.pop();
        topo.push_back(u);
        for (auto [v, w] : adj[u]) {
            if (--indeg[v] == 0) q.push(v);
        }
    }
    // 第二步：按拓扑序 DP
    memset(dist, -1, sizeof(int) * (n + 1));
    dist[s] = 0;
    int ans = 0;
    for (int u : topo) {
        if (dist[u] == -1) continue; // 不可达
        for (auto [v, w] : adj[u]) {
            dist[v] = max(dist[v], dist[u] + w);
            ans = max(ans, dist[v]);
        }
    }
    return ans;
}
```

---

## 例题详解

### 例题 1：洛谷 P1347 排序

**题意：** 给定 $n$ 个变量和 $m$ 条形如 $A < B$ 的不等式关系，判断能否确定所有变量的大小关系。输出在第几条关系时可以确定或发现矛盾。

**思路：** 这是拓扑排序检测环 + 判断拓扑序唯一性的经典题。每加入一条边 $A \to B$ 后：

1. 用 Kahn 算法判断是否出现环（矛盾）。
2. 如果无环，检查队列中是否始终只有一个入度为 0 的顶点。如果是，则拓扑序唯一；否则有多种合法排序，无法确定。

关键优化：每次只新增一条边，可以增量更新入度，不需要从头重建。

```cpp
#include <bits/stdc++.h>
using namespace std;

int n, m;
vector<int> adj[30];
int indeg[30], tmp_deg[30];

// 检查当前图的状态：0=不确定, 1=确定有序, 2=有环
int check() {
    // 复制入度数组
    memcpy(tmp_deg, indeg, sizeof(int) * (n + 1));
    queue<int> q;
    for (int i = 1; i <= n; i++) {
        if (tmp_deg[i] == 0) q.push(i);
    }
    int cnt = 0;      // 已排序的顶点数
    bool unique = true; // 拓扑序是否唯一
    while (!q.empty()) {
        if (q.size() > 1) unique = false; // 多个入度为 0 → 不唯一
        int u = q.front(); q.pop();
        cnt++;
        for (int v : adj[u]) {
            if (--tmp_deg[v] == 0) q.push(v);
        }
    }
    if (cnt < n) return 2;        // 有环
    if (unique) return 1;          // 确定有序
    return 0;                      // 无环但不确定
}

int main() {
    scanf("%d%d", &n, &m);
    for (int i = 1; i <= m; i++) {
        char buf[10];
        scanf("%s", buf);
        int a = buf[0] - 'A' + 1, b = buf[2] - 'A' + 1;
        adj[a].push_back(b);
        indeg[b]++;
        int res = check();
        if (res == 2) {
            printf("Inconsistency found after %d relations.\n", i);
            return 0;
        }
        if (res == 1) {
            // 重新拓扑排序，输出确定的顺序
            memcpy(tmp_deg, indeg, sizeof(int) * (n + 1));
            queue<int> q;
            for (int j = 1; j <= n; j++) {
                if (tmp_deg[j] == 0) q.push(j);
            }
            printf("Sorted sequence determined after %d relations: ", i);
            while (!q.empty()) {
                int u = q.front(); q.pop();
                putchar('A' + u - 1);
                for (int v : adj[u]) {
                    if (--tmp_deg[v] == 0) q.push(v);
                }
            }
            printf(".\n");
            return 0;
        }
    }
    printf("Sorted sequence cannot be determined.\n");
    return 0;
}
```

### 例题 2：LeetCode 207 课程表

**题意：** 有 $n$ 门课程（编号 $0$ 到 $n-1$），部分课程有先修关系 `prerequisites[i] = [a, b]` 表示修 $a$ 之前必须先修 $b$。判断能否完成所有课程。

**思路：** 本质是判断有向图是否有环。如果存在环（如 A→B→C→A），则互相依赖，无法完成。直接用 Kahn 算法，如果拓扑排序结果包含所有 $n$ 个顶点，返回 `true`。

```cpp
class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        vector<int> adj[numCourses];
        vector<int> indeg(numCourses, 0);
        // 建图
        for (auto& p : prerequisites) {
            adj[p[1]].push_back(p[0]); // b → a
            indeg[p[0]]++;
        }
        // Kahn 算法
        queue<int> q;
        for (int i = 0; i < numCourses; i++) {
            if (indeg[i] == 0) q.push(i);
        }
        int cnt = 0;
        while (!q.empty()) {
            int u = q.front(); q.pop();
            cnt++;
            for (int v : adj[u]) {
                if (--indeg[v] == 0) q.push(v);
            }
        }
        return cnt == numCourses; // 全部排完 → 无环 → 可完成
    }
};
```

---

## 练习题单

| # | 平台 | 题号/名称 | 难度 | 关键词 |
|---|------|----------|------|--------|
| 1 | LeetCode | 207 课程表 | 入门 | DAG 检测 / Kahn |
| 2 | LeetCode | 210 课程表 II | 入门 | 输出拓扑序 |
| 3 | 洛谷 | P1347 排序 | 进阶 | 增量拓扑 / 唯一性判断 |
| 4 | 洛谷 | P1983 信号覆盖 | 进阶 | 建图 + 拓扑序 DP |
| 5 | LeetCode | 269 火星词典 | 进阶 | 字符串建图 / 拓扑排序 |
| 6 | 洛谷 | P1137 旅行计划 | 综合 | DAG 最长路径 DP |
| 7 | Codeforces | 510C Fox And Names | 综合 | 字典序建图 + 拓扑 |
| 8 | 洛谷 | P1807 最长路 | 综合 | 带权 DAG 最长路 |

---

## 常见错误

**1. 建图方向搞反**

先修关系 `b 是 a 的先修` 对应边 $b \to a$（$b$ 在前），不是 $a \to b$。这是拓扑排序题目中最常见的错误。读题时要仔细确认依赖方向：如果"a 依赖 b"，则 $b \to a$。

**2. 忘记检测环**

很多题目只要求输出拓扑排序，但如果图中有环，Kahn 算法会返回不完整的序列，DFS 版本会给出错误结果。**务必检查排序结果是否包含所有顶点**，否则会 WA 而不自知。

**3. DFS 拓扑排序不反转**

DFS 后序遍历的结果是**逆拓扑序**（依赖项在前），需要 `reverse` 之后才是正序。如果题目要求按依赖顺序输出，忘记反转会导致答案错误。

**4. 多组数据未清空**

拓扑排序涉及入度数组、邻接表、状态数组等多处全局数据。**每组数据开始前必须全部清空**，否则残留数据会导致 WA 或 RE。

**5. 将 DAG 最长路径误用 Dijkstra**

Dijkstra 算法**不适用于**带负权边的图。而 DAG 上即使有负权边，拓扑序 DP 仍然正确（因为按拓扑序处理天然保证了松弛的正确性）。求 DAG 上的最长/最短路，用拓扑序 DP，不要用 Dijkstra。

---

## 延伸阅读

- OI Wiki - 拓扑排序：https://oi-wiki.org/graph/topo/
- OI Wiki - 关键路径：https://oi-wiki.org/graph/critical-path/
- OI Wiki - DAG 上的 DP：https://oi-wiki.org/dp/dag/
- 《算法竞赛进阶指南》第 6 章 图论 - 拓扑排序
- CP-Algorithms - Topological Sorting：https://cp-algorithms.com/graph/topological-sort.html
