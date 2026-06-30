# DFS与BFS

## 概述

深度优先搜索（DFS, Depth-First Search）和广度优先搜索（BFS, Breadth-First Search）是两种最基本、最重要的图与树的遍历算法。几乎所有涉及"搜索"的问题都可以归结为在某种**状态空间**上进行 DFS 或 BFS 遍历。

**它们分别解决什么问题？**

- **DFS**：适合需要**穷举所有可能**的场景，如排列组合、连通分量、迷宫路径计数、回溯问题。DFS 的空间消耗与深度成正比，实现通常用递归或显式栈。
- **BFS**：适合需要**找到最短路径**（无权图）或**按层扩展**的场景，如最短步数、最少操作次数、多源扩散问题。BFS 的空间消耗与宽度成正比，实现用队列。

两者的时间复杂度均为 $O(V + E)$，其中 $V$ 为顶点数，$E$ 为边数（对于网格图，$E$ 与格子数同阶）。

<!--DEMO:bfs-traversal-->

## 核心思想

### DFS：一条路走到黑

DFS 的核心策略是**尽可能深地探索**：从当前节点出发，选择一个未访问的邻居继续递归，直到走不通时回溯到上一个分岔口，换一条路继续。

递归的本质是系统帮我们维护了一个**调用栈**，每深入一层就压栈，回溯时弹栈。如果用迭代实现，则需要手动维护一个栈。

**关键性质**：DFS 生成一棵**深度优先搜索树**（DFS 树），每条边要么是树边，要么是返祖边、前向边或横叉边（有向图中）。

### BFS：逐层铺开

BFS 的核心策略是**按距离逐步扩展**：从起点出发，先访问所有距离为 1 的节点，再访问所有距离为 2 的节点……用队列维护"待访问"列表，保证先发现的节点先被处理。

**关键性质**：在**无权图**上，BFS 第一次到达某个节点时，经过的路径就是从起点到该节点的**最短路径**。这个性质使得 BFS 成为无权图最短路的标准做法。

### DFS 与 BFS 的选择

| 特征 | 选 DFS | 选 BFS |
|------|--------|--------|
| 求最短路（无权图） | | ✅ |
| 求所有方案 | ✅ | |
| 连通分量 | ✅ | ✅ |
| 拓扑排序 | ✅ | ✅（Kahn） |
| 记忆化搜索 | ✅ | |
| 层序遍历 | | ✅ |

## 模板代码

### DFS 模板（递归）

```cpp
// 邻接表存图，visited 记录已访问节点
vector<vector<int>> adj;  // 邻接表
vector<bool> visited;     // 访问标记

// DFS 遍历：从节点 u 出发，深入探索整张图
void dfs(int u) {
    visited[u] = true;           // 标记当前节点已访问
    // 在此处处理当前节点（如收集结果、计数等）
    for (int v : adj[u]) {       // 遍历 u 的所有邻居
        if (!visited[v]) {
            dfs(v);              // 递归深入
        }
    }
    // 回溯：如果需要恢复状态，在此处撤销操作
}

// 对整张图执行 DFS（处理非连通图）
void dfs_all(int n) {
    visited.assign(n, false);
    int components = 0;          // 连通分量计数
    for (int i = 0; i < n; i++) {
        if (!visited[i]) {
            dfs(i);
            components++;
        }
    }
}
```

### DFS 模板（迭代 / 显式栈）

```cpp
void dfs_iterative(int start) {
    stack<int> stk;
    stk.push(start);
    visited[start] = true;

    while (!stk.empty()) {
        int u = stk.top();
        stk.pop();
        // 在此处处理节点 u
        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                stk.push(v);
            }
        }
    }
}
```

### BFS 模板（队列）

```cpp
// BFS 求从 start 到所有节点的最短距离
vector<int> bfs(int start, int n) {
    vector<int> dist(n, -1);     // -1 表示不可达
    queue<int> q;

    dist[start] = 0;             // 起点距离为 0
    q.push(start);

    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (int v : adj[u]) {
            if (dist[v] == -1) { // 未访问过
                dist[v] = dist[u] + 1;  // 距离 +1
                q.push(v);
            }
        }
    }
    return dist;
}
```

### 网格图的 DFS / BFS

竞赛中大量迷宫题用**二维网格**建模，四个方向的偏移量写法：

```cpp
// 四个方向：上、右、下、左
int dx[] = {-1, 0, 1, 0};
int dy[] = {0, 1, 0, -1};

// 网格 BFS 模板
int grid_bfs(vector<string>& grid, int sx, int sy, int ex, int ey) {
    int n = grid.size(), m = grid[0].size();
    vector<vector<int>> dist(n, vector<int>(m, -1));
    queue<pair<int, int>> q;

    dist[sx][sy] = 0;
    q.push({sx, sy});

    while (!q.empty()) {
        auto [x, y] = q.front();
        q.pop();

        for (int d = 0; d < 4; d++) {
            int nx = x + dx[d], ny = y + dy[d];
            // 越界检查 + 障碍检查 + 未访问检查
            if (nx >= 0 && nx < n && ny >= 0 && ny < m
                && grid[nx][ny] != '#' && dist[nx][ny] == -1) {
                dist[nx][ny] = dist[x][y] + 1;
                q.push({nx, ny});
            }
        }
    }
    return dist[ex][ey]; // 返回终点最短距离，-1 表示不可达
}
```

<!--DEMO:bfs-traversal-->

## 例题详解

### 例题 1：[洛谷 P1706 全排列问题](https://www.luogu.com.cn/problem/P1706)

**题意**：输入一个整数 $n$，输出 $1$ 到 $n$ 的所有全排列，按字典序。

**思路**：这是 DFS 回溯的经典入门题。用一个数组记录当前排列，一个 `used` 数组标记哪些数字已经使用。每次递归时从 $1$ 到 $n$ 尝试放入一个未使用的数字，放满 $n$ 个就输出。

**复杂度**：$O(n \cdot n!)$，因为有 $n!$ 种排列，每种排列输出需要 $O(n)$。

```cpp
#include <iostream>
#include <vector>
using namespace std;

int n;
vector<int> path;       // 当前排列
vector<bool> used;      // used[i] = true 表示数字 i 已使用

void dfs() {
    // 终止条件：排列长度达到 n，输出结果
    if ((int)path.size() == n) {
        for (int i = 0; i < n; i++) {
            printf("%5d", path[i]); // 按题目格式输出
        }
        cout << endl;
        return;
    }
    // 尝试放入每个未使用的数字
    for (int i = 1; i <= n; i++) {
        if (!used[i]) {
            path.push_back(i);   // 做选择
            used[i] = true;      // 标记已使用
            dfs();               // 递归
            path.pop_back();     // 撤销选择（回溯）
            used[i] = false;     // 恢复状态
        }
    }
}

int main() {
    cin >> n;
    used.assign(n + 1, false);
    dfs();
    return 0;
}
```

### 例题 2：[洛谷 P1162 填涂颜色](https://www.luogu.com.cn/problem/P1162)

**题意**：给一个 $n \times n$ 的网格，$0$ 表示白格、$1$ 表示黑格。要求找到被 $1$ 围起来的 $0$ 区域，将它们变成 $2$，然后输出。

**思路**：被围住的 $0$ 区域与边界不连通。我们反过来思考——用 BFS 从**所有边界上的 $0$** 出发，标记它们为"不被围住"。最后遍历网格，未被标记的 $0$ 就是被围住的，改为 $2$。这是一个典型的**多源 BFS**。

**复杂度**：$O(n^2)$，每个格子最多入队一次。

```cpp
#include <iostream>
#include <queue>
using namespace std;

int n;
int grid[35][35];
bool visited[35][35];  // 标记从边界能到达的 0

int dx[] = {-1, 0, 1, 0};
int dy[] = {0, 1, 0, -1};

void bfs() {
    queue<pair<int, int>> q;

    // 将边界上所有 0 加入队列（多源 BFS）
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            if ((i == 0 || i == n - 1 || j == 0 || j == n - 1)
                && grid[i][j] == 0) {
                visited[i][j] = true;
                q.push({i, j});
            }
        }
    }

    // 从边界 0 向内扩散
    while (!q.empty()) {
        auto [x, y] = q.front();
        q.pop();
        for (int d = 0; d < 4; d++) {
            int nx = x + dx[d], ny = y + dy[d];
            if (nx >= 0 && nx < n && ny >= 0 && ny < n
                && !visited[nx][ny] && grid[nx][ny] == 0) {
                visited[nx][ny] = true;
                q.push({nx, ny});
            }
        }
    }
}

int main() {
    cin >> n;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            cin >> grid[i][j];

    bfs();

    // 未被访问的 0 就是被围住的，改为 2
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            if (grid[i][j] == 0 && !visited[i][j])
                cout << 2 << " ";
            else
                cout << grid[i][j] << " ";
        }
        cout << endl;
    }
    return 0;
}
```

**本题启示**：正面求"被围住的区域"需要识别连通块边界，不好实现；**反向思考**——从边界出发排除不被围住的区域，反而简单直接。这种"补集思维"在搜索题中非常常见。

## 练习题单

| 序号 | 平台 | 题号/名称 | 方法 | 难度 |
|------|------|-----------|------|------|
| 1 | 洛谷 | [P1219 八皇后](https://www.luogu.com.cn/problem/P1219) | DFS 回溯 | 入门 |
| 2 | 洛谷 | [P1443 马的遍历](https://www.luogu.com.cn/problem/P1443) | BFS 最短路 | 入门 |
| 3 | LeetCode | [200. 岛屿数量](https://leetcode.cn/problems/number-of-islands/) | DFS/BFS 连通分量 | 入门 |
| 4 | 洛谷 | [P1141 01 迷宫](https://www.luogu.com.cn/problem/P1141) | DFS/BFS 连通块 | 进阶 |
| 5 | LeetCode | [542. 01 矩阵](https://leetcode.cn/problems/01-matrix/) | 多源 BFS | 进阶 |
| 6 | Codeforces | [CF 520B - Two Buttons](https://codeforces.com/problemset/problem/520/B) | BFS 建图 | 进阶 |
| 7 | 洛谷 | [P3956 棋盘](https://www.luogu.com.cn/problem/P3956) | DFS + 剪枝 | 综合 |
| 8 | LeetCode | [127. 单词接龙](https://leetcode.cn/problems/word-ladder/) | BFS 最短路 | 综合 |

## 常见错误

### 1. 忘记标记已访问，导致无限递归/循环

**现象**：栈溢出（RE）或程序卡死。

**原因**：DFS 递归或 BFS 入队时没有标记 `visited`，导致同一个节点被反复访问。

**解决**：在递归调用 `dfs(v)` **之前**（或入队 `q.push(v)` **之前**）就标记 `visited[v] = true`，而不是在函数开头才标记。这样可以避免重复入队。

### 2. 网格越界

**现象**：访问数组下标越界，运行时错误。

**原因**：使用方向数组 `dx[] / dy[]` 时，忘记检查新坐标 `nx, ny` 是否在 $[0, n) \times [0, m)$ 范围内。

**解决**：在访问 `grid[nx][ny]` 之前，务必加上边界检查 `nx >= 0 && nx < n && ny >= 0 && ny < m`。

### 3. BFS 求最短路时错用 DFS

**现象**：某些情况下得到的不是最短路径。

**原因**：DFS 是"一条路走到底"，不保证第一次到达目标就是最短路径。只有 BFS 的"逐层扩展"特性才能保证无权图最短路。

**解决**：凡是求"最少步数"、"最少操作次数"，无脑选 BFS。

### 4. 回溯时忘记恢复状态

**现象**：全排列等枚举问题输出结果有误（重复或遗漏）。

**原因**：在 DFS 中做了选择（如 `used[i] = true`、`path.push_back(i)`），但在递归返回后没有撤销。

**解决**：遵循"**选择 → 递归 → 撤销**"三步范式。每做一次选择，在递归之后立刻对称地恢复状态。

### 5. 连通分量问题只从一个点出发

**现象**：非连通图只能遍历到一个连通分量。

**原因**：只对起点做了 DFS/BFS，没有考虑图可能不连通。

**解决**：对每个未访问的节点都启动一次 DFS/BFS，即 `for (int i = 0; i < n; i++) if (!visited[i]) dfs(i);`。

## 延伸阅读

- [OI Wiki - DFS（搜索）](https://oi-wiki.org/search/dfs/)：DFS 的理论基础与更多应用场景。
- [OI Wiki - BFS](https://oi-wiki.org/search/bfs/)：BFS 及其变种（双向 BFS、0-1 BFS）。
- [OI Wiki - 图的存储](https://oi-wiki.org/graph/save/)：邻接矩阵、邻接表、链式前星的对比。
- [Visualgo - Graph Traversal](https://visualgo.net/en/dfsbfs)：DFS 与 BFS 的可视化动画演示。
