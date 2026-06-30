# 并查集

并查集（Union-Find / Disjoint Set Union, DSU）是一种用于管理**不相交集合**的数据结构，支持两个核心操作：**合并**两个集合、**查询**某个元素属于哪个集合。它常用于图论中维护连通性——判断两个节点是否连通、统计连通分量个数，也是 Kruskal 最小生成树算法的基石。并查集单次操作的均摊时间复杂度可以做到接近 $O(1)$（严格来说是 $O(\alpha(n))$，其中 $\alpha$ 是反阿克曼函数），非常高效。

<!--DEMO:union-find-tree-->

---

## 核心思想

**1. 森林表示**

并查集用一棵**树**来表示一个集合，树根就是该集合的「代表元素」。所有元素构成一片**森林**（多棵树）。初始时每个元素自成一棵树（即每个元素都是自己的根），表示 $n$ 个独立的集合。

**2. Find — 查找所属集合**

查找元素 $x$ 所属的集合，就是沿着 $x$ 的父节点一路向上，找到树根。朴素实现中树可能退化成链，最坏 $O(n)$。为了优化，引入**路径压缩**：在查找过程中，将沿途所有节点直接挂到根上，使后续查询接近 $O(1)$。

**3. Union — 合并两个集合**

要合并元素 $x$ 和 $y$ 所在的集合，先分别找到各自的根 $r_x$、$r_y$，若不同根则将一棵树的根挂到另一棵树的根上。为了控制树高，引入**按秩合并**（union by rank）：总是把较矮的树挂到较高的树下，保证树高增长尽可能慢。

<!--DEMO:union-find-merge-->

**4. 复杂度**

| 操作 | 朴素 | 路径压缩 + 按秩合并 |
|------|------|---------------------|
| Find | $O(n)$ 最坏 | 均摊 $O(\alpha(n))$ |
| Union | $O(n)$ 最坏 | 均摊 $O(\alpha(n))$ |

> $\alpha(n)$ 为反阿克曼函数，对实际中任何合理的 $n$（$\le 10^{60}$），$\alpha(n) \le 4$。因此并查集操作可视为常数时间。

**5. 带权并查集**

在一些题目中，元素之间不只是「属于同一集合」的关系，还附带一个**权值**（例如相对距离、相对大小）。带权并查集在 `fa[]` 之外维护一个 `d[]`（或 `w[]`）数组，记录每个节点到其父节点的偏移量。路径压缩和合并时同步维护权值，就能在查询时得到任意两个同集合元素之间的关系。

---

## 模板代码

### 基础版：路径压缩 + 按秩合并

竞赛中最常用的并查集模板，同时使用路径压缩和按秩合并：

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1e5 + 5;
int fa[MAXN], rk[MAXN]; // fa: 父节点, rk: 秩（树高的上界）

// 初始化：每个元素自成一个集合
void init(int n) {
    for (int i = 1; i <= n; i++) {
        fa[i] = i;  // 自己是自己的根
        rk[i] = 1;  // 初始秩为 1
    }
}

// 查找 x 的根，同时路径压缩
int find(int x) {
    if (fa[x] != x) fa[x] = find(fa[x]); // 递归压缩：直接挂到根上
    return fa[x];
}

// 合并 x 和 y 所在集合，按秩合并
void merge(int x, int y) {
    int rx = find(x), ry = find(y);
    if (rx == ry) return; // 已在同一集合，无需合并
    // 把秩小的树挂到秩大的树下
    if (rk[rx] < rk[ry]) swap(rx, ry);
    fa[ry] = rx;              // 合并
    if (rk[rx] == rk[ry]) rk[rx]++; // 秩相同时，合并后秩加 1
}
```

### 带权并查集

以「维护到父节点的距离」为例，`d[x]` 表示 $x$ 到 $fa[x]$ 的权值。查询时路径压缩同步更新 `d[]`。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1e5 + 5;
int fa[MAXN];
long long d[MAXN]; // d[x]: x 到 fa[x] 的权值（距离/偏移）

void init(int n) {
    for (int i = 1; i <= n; i++) {
        fa[i] = i;
        d[i] = 0; // 到自己的距离为 0
    }
}

// 查找根，路径压缩时更新 d[]
int find(int x) {
    if (fa[x] != x) {
        int root = find(fa[x]); // 先递归找到根
        d[x] += d[fa[x]];       // 更新权值：x 到根 = x 到父 + 父到根
        fa[x] = root;           // 路径压缩
    }
    return fa[x];
}

// 合并：令 d[ry] = val，含义是 ry 到 rx 的权值为 val
// 即 "x 到 y 的关系为 val" 时，rx 到 ry 的偏移为 d[x] + val - d[y]
void merge(int x, int y, long long val) {
    int rx = find(x), ry = find(y);
    if (rx == ry) return;
    fa[ry] = rx;
    d[ry] = d[x] + val - d[y];
}
```

---

## 例题详解

### 例题 1：洛谷 P3367 【模板】并查集

**题意：** 有 $n$ 个元素，初始时互不相交。进行 $m$ 次操作，每次操作为「合并两个元素所在的集合」或「查询两个元素是否在同一集合」。$n, m \le 2 \times 10^5$。

**思路：** 直接使用基础并查集模板。对每次合并调用 `merge(x, y)`，对每次查询调用 `find(x) == find(y)` 即可。时间复杂度 $O(m \cdot \alpha(n))$。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1e4 + 5; // 模板题数据范围较小
int fa[MAXN], rk[MAXN];

int find(int x) {
    return fa[x] == x ? x : fa[x] = find(fa[x]);
}

void merge(int x, int y) {
    int rx = find(x), ry = find(y);
    if (rx == ry) return;
    if (rk[rx] < rk[ry]) swap(rx, ry);
    fa[ry] = rx;
    if (rk[rx] == rk[ry]) rk[rx]++;
}

int main() {
    int n, m;
    scanf("%d%d", &n, &m);
    for (int i = 1; i <= n; i++) fa[i] = i, rk[i] = 1;
    while (m--) {
        int op, x, y;
        scanf("%d%d%d", &op, &x, &y);
        if (op == 1) {
            merge(x, y);
        } else {
            puts(find(x) == find(y) ? "Y" : "N");
        }
    }
    return 0;
}
```

### 例题 2：LeetCode 990 等式方程的可满足性

**题意：** 给定一组字符串方程，如 `"a==b"`, `"b!=c"`。判断是否存在一组变量赋值使得所有方程同时满足。

**思路：** 先把所有 `==` 方程涉及的变量合并到同一个集合，然后遍历所有 `!=` 方程，若两个变量在同一集合则矛盾，返回 `false`。全部通过返回 `true`。

```cpp
class Solution {
public:
    int fa[26];

    int find(int x) {
        return fa[x] == x ? x : fa[x] = find(fa[x]);
    }

    void merge(int x, int y) {
        fa[find(x)] = find(y);
    }

    bool equationsPossible(vector<string>& equations) {
        // 初始化 26 个小写字母各为一个集合
        for (int i = 0; i < 26; i++) fa[i] = i;
        // 第一遍：合并所有 == 方程
        for (auto& eq : equations) {
            if (eq[1] == '=') {
                merge(eq[0] - 'a', eq[3] - 'a');
            }
        }
        // 第二遍：检查所有 != 方程
        for (auto& eq : equations) {
            if (eq[1] == '!') {
                if (find(eq[0] - 'a') == find(eq[3] - 'a'))
                    return false;
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
| 1 | 洛谷 | P3367 【模板】并查集 | 入门 | 并查集基本操作 |
| 2 | LeetCode | 547 省份数量 | 入门 | 连通分量计数 |
| 3 | LeetCode | 200 岛屿数量 | 进阶 | 网格 + 并查集替代 DFS |
| 4 | 洛谷 | P1525 关押罪犯 | 进阶 | 扩展域 / 带权并查集判二分图 |
| 5 | LeetCode | 990 等式方程的可满足性 | 进阶 | 先合并再判矛盾 |
| 6 | 洛谷 | P1536 村村通 | 进阶 | 连通分量 → 补边数 |
| 7 | Codeforces | 25D Roads not only in Berland | 进阶 | 拆边 + 连通分量 |
| 8 | 洛谷 | P2024 食物链 | 综合 | 带权并查集（三类关系） |

---

## 常见错误

**1. 路径压缩写错导致死循环**

`find` 函数中路径压缩的写法应为 `fa[x] = find(fa[x])`，即先递归再赋值。如果写成 `fa[fa[x]] = find(fa[x])` 则会丢失中间节点的更新，造成信息错误。

**2. 合并时没有取根节点**

`merge(x, y)` 必须先对 $x$ 和 $y$ 分别执行 `find` 操作获取根节点，再决定如何合并。直接 `fa[x] = y` 会把某个中间节点（而非整个集合的根）链接过去，破坏树结构。

**3. 忘记初始化**

并查集使用前必须初始化：每个元素的父节点设为自己。遗漏初始化会导致 `find` 访问未定义的 `fa[]` 值，产生错误结果。

**4. 带权并查集的权值更新顺序**

在 `find` 中做路径压缩时，必须**先递归**再更新 `d[x]`。如果先更新 `d[x]` 再递归，此时 `fa[x]` 还未压缩，`d[fa[x]]` 的值不正确，导致权值计算错误。

**5. 按秩合并时遗漏秩相等的处理**

当两棵树的秩相等时，合并后新根的秩应加 1。如果遗漏这一步，树高上界不准确，虽然均摊复杂度不变，但树的实际高度会略大于预期。

---

## 延伸阅读

- OI Wiki - 并查集：https://oi-wiki.org/ds/dsu/
- OI Wiki - 并查集复杂度证明：https://oi-wiki.org/ds/dsu-complexity/
- LeetCode 并查集专题：https://leetcode.cn/tag/union-find/
- 《算法导论》第 21 章：不相交集合的数据结构
- VisuAlgo DSU 可视化：https://visualgo.net/en/ufds
