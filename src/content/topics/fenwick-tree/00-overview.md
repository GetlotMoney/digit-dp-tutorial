# 树状数组

**树状数组**（Binary Indexed Tree，简称 BIT，又称 Fenwick Tree）是一种高效支持**单点修改 + 前缀查询**的数据结构，常数小、代码短、应用广。它能在 $O(\log n)$ 时间内完成单点加值和区间求和，是线段树的轻量替代方案——当问题只需维护前缀信息（和、积、异或等满足结合律的运算）时，树状数组往往比线段树更简洁、更快。

适用场景：
- 单点修改 + 区间求和 / 求前缀最值
- 区间修改 + 单点查询（配合差分思想）
- 求逆序对个数
- 二维平面上的子矩阵加值与查询

---

## 核心思想

### Lowbit 运算

树状数组的核心是一个非常精巧的位运算——$\text{lowbit}(x)$，定义为 $x$ 在二进制表示下**最低位的 1 及其后面的 0** 组成的数值：

$$
\text{lowbit}(x) = x \mathbin{\&} (-x)
$$

例如 $\text{lowbit}(12) = 12 \mathbin{\&} (-12) = 1100_2 \mathbin{\&} 0100_2 = 4$。

为什么 $x \mathbin{\&} (-x)$ 能取出最低位的 1？因为 $-x$ 在补码下是 $\sim x + 1$，它恰好把 $x$ 的最低位 1 保留，更高位全部翻转，做 AND 后只剩那一个 1。

<!--DEMO:fenwick-tree-structure-->

### 数组结构

树状数组用一个数组 $c[1..n]$ 来维护信息。$c[i]$ 管辖的区间由 $\text{lowbit}(i)$ 决定：

$$
c[i] = \sum_{k = i - \text{lowbit}(i) + 1}^{i} a[k]
$$

即 $c[i]$ 存储原数组 $a$ 中从 $i - \text{lowbit}(i) + 1$ 到 $i$ 这 $\text{lowbit}(i)$ 个元素的和。例如：

- $c[1]$ 管 $a[1]$（$\text{lowbit}(1)=1$）
- $c[2]$ 管 $a[1..2]$（$\text{lowbit}(2)=2$）
- $c[4]$ 管 $a[1..4]$（$\text{lowbit}(4)=4$）
- $c[6]$ 管 $a[5..6]$（$\text{lowbit}(6)=2$）

前缀和 $\text{sum}(i) = a[1] + a[2] + \cdots + a[i]$ 可以通过不断跳到 $i - \text{lowbit}(i)$ 来累加，复杂度 $O(\log n)$。修改 $a[i]$ 时，需要向上更新所有包含 $a[i]$ 的 $c$ 节点，同样是 $O(\log n)$。

### 区间修改 + 单点查询

树状数组天然支持「单点修改 + 区间查询」。如果题目要求反过来——**区间修改 + 单点查询**，只需把树状数组用在差分数组 $d$ 上：

- 区间 $[l, r]$ 加 $v$：在 $d$ 上执行 `add(l, v)` 和 `add(r+1, -v)`
- 查询 $a[i]$ 的值：在 $d$ 上执行 `sum(i)`

两次 $O(\log n)$ 操作即可完成，非常优雅。

### 二维树状数组

把一维树状数组推广到二维矩阵。查询子矩阵和、对子矩阵加值，都可以在 $O(\log n \cdot \log m)$ 时间内完成。核心思路是维护二维前缀和：

$$
c[i][j] \text{ 管辖 } a \text{ 中以 } (i - \text{lowbit}(i) + 1,\; j - \text{lowbit}(j) + 1) \text{ 为左上角、} (i, j) \text{ 为右下角的子矩阵}
$$

操作和一维完全类似，只是查询和修改都变成两层循环。

### 逆序对

求序列中逆序对的个数是树状数组的经典应用。从右向左扫描序列，每遇到一个 $a[i]$，查询已经插入的元素中小于 $a[i]$ 的个数，即 `sum(a[i] - 1)`；然后把 $a[i]$ 插入树状数组（`add(a[i], 1)`）。如果值域较大，需要先做离散化。

---

## 模板代码

### 单点修改 + 区间查询

```cpp
// 树状数组模板：单点加值 + 前缀求和
// c[i] 存储 a[i-lowbit(i)+1..i] 的和
int n, c[N];

// 单点加值：将 a[pos] 加上 val，O(log n)
void add(int pos, int val) {
    for (int i = pos; i <= n; i += i & (-i)) {
        c[i] += val;
    }
}

// 前缀查询：求 a[1] + a[2] + ... + a[pos]，O(log n)
int sum(int pos) {
    int res = 0;
    for (int i = pos; i > 0; i -= i & (-i)) {
        res += c[i];
    }
    return res;
}

// 区间查询：求 a[l] + a[l+1] + ... + a[r]
int query(int l, int r) {
    return sum(r) - sum(l - 1);
}
```

### 区间修改 + 单点查询

```cpp
// 利用差分数组 + 树状数组实现区间修改、单点查询
int n, c[N];

// 对差分数组 d 做单点加值
void add(int pos, int val) {
    for (int i = pos; i <= n; i += i & (-i)) {
        c[i] += val;
    }
}

// 区间 [l, r] 加 v
void range_add(int l, int r, int v) {
    add(l, v);
    add(r + 1, -v);
}

// 查询原数组 a[pos] 的当前值 = d[1] + d[2] + ... + d[pos]
int query(int pos) {
    int res = 0;
    for (int i = pos; i > 0; i -= i & (-i)) {
        res += c[i];
    }
    return res;
}
```

### 区间修改 + 区间查询

```cpp
// 维护两个树状数组 c1、c2，支持区间加 + 区间求和
// 原理：a[i] = i * (d[1]+...+d[i]) - (1*d[1]+...+(i-1)*d[i-1])
//       维护 c1 = d 的前缀和，c2 = (i-1)*d 的前缀和
int n, c1[N], c2[N];

void add(int *c, int pos, int val) {
    for (int i = pos; i <= n; i += i & (-i))
        c[i] += val;
}

// 区间 [l, r] 加 v
void range_add(int l, int r, int v) {
    add(c1, l, v);
    add(c1, r + 1, -v);
    add(c2, l, v * (l - 1));
    add(c2, r + 1, -v * r);
}

// 前缀查询：a[1] + a[2] + ... + a[pos]
int prefix_sum(int pos) {
    int s1 = 0, s2 = 0;
    for (int i = pos; i > 0; i -= i & (-i)) {
        s1 += c1[i];
        s2 += c2[i];
    }
    return pos * s1 - s2;
}

// 区间查询
int query(int l, int r) {
    return prefix_sum(r) - prefix_sum(l - 1);
}
```

### 二维树状数组

```cpp
// 二维树状数组：单点修改 + 子矩阵查询
int n, m, c[N][M];

// 单点加值
void add(int x, int y, int val) {
    for (int i = x; i <= n; i += i & (-i))
        for (int j = y; j <= m; j += j & (-j))
            c[i][j] += val;
}

// 二维前缀查询：左上角 (1,1) 到 (x,y) 的子矩阵和
int sum(int x, int y) {
    int res = 0;
    for (int i = x; i > 0; i -= i & (-i))
        for (int j = y; j > 0; j -= j & (-j))
            res += c[i][j];
    return res;
}

// 子矩阵 (x1,y1) ~ (x2,y2) 的和（容斥原理）
int query(int x1, int y1, int x2, int y2) {
    return sum(x2, y2) - sum(x1 - 1, y2) - sum(x2, y1 - 1) + sum(x1 - 1, y1 - 1);
}
```

### 逆序对

```cpp
// 求长度为 n 的序列的逆序对个数
// 需要先对值域离散化到 [1, n]
int n, c[N], a[N];

void add(int pos, int val) {
    for (int i = pos; i <= n; i += i & (-i))
        c[i] += val;
}

int sum(int pos) {
    int res = 0;
    for (int i = pos; i > 0; i -= i & (-i))
        res += c[i];
    return res;
}

long long count_inversions() {
    long long ans = 0;
    for (int i = n; i >= 1; i--) {
        // 查询已插入元素中小于 a[i] 的个数
        ans += sum(a[i] - 1);
        // 将 a[i] 插入树状数组
        add(a[i], 1);
    }
    return ans;
}
```

<!--DEMO:fenwick-tree-update-->

---

## 例题详解

### 例题 1：洛谷 P3374 【模板】树状数组 1

**题意：** 给定长度为 $n$ 的数列，支持两种操作：(1) 将第 $x$ 个数加上 $k$；(2) 查询区间 $[x, y]$ 的和。

**思路：** 这是树状数组最基础的模板题。直接用单点修改 + 区间查询模板即可。注意初始化时，需要对每个初始值调用一次 `add`，而不是直接赋值给 `c` 数组。

```cpp
#include <cstdio>
using namespace std;
const int N = 500005;
int n, m, c[N];

void add(int pos, int val) {
    for (int i = pos; i <= n; i += i & (-i))
        c[i] += val;
}

int sum(int pos) {
    int res = 0;
    for (int i = pos; i > 0; i -= i & (-i))
        res += c[i];
    return res;
}

int main() {
    scanf("%d%d", &n, &m);
    for (int i = 1, x; i <= n; i++) {
        scanf("%d", &x);
        add(i, x); // 逐个插入初始值
    }
    while (m--) {
        int op, x, y;
        scanf("%d%d%d", &op, &x, &y);
        if (op == 1) {
            add(x, y);         // 单点加值
        } else {
            printf("%d\n", sum(y) - sum(x - 1)); // 区间查询
        }
    }
    return 0;
}
```

> **WARN 注意：** 初始建树不能用 `c[i] = a[i]`，必须对每个 $i$ 执行 `add(i, a[i])`。因为 $c[i]$ 存储的是区间和而非单点值，直接赋值会破坏结构。

### 例题 2：洛谷 P1908 逆序对

**题意：** 给定一个长度为 $n$ 的序列，求其中逆序对的个数。逆序对定义为满足 $i < j$ 且 $a[i] > a[j]$ 的数对 $(i, j)$。

**思路：** 从右向左扫描，对每个 $a[i]$，查询有多少已插入的元素小于 $a[i]$——这些元素位置在 $i$ 右边且值更小，恰好构成逆序对。若值域较大需先离散化。

```cpp
#include <cstdio>
#include <algorithm>
using namespace std;
const int N = 500005;
int n, a[N], b[N], c[N]; // b 为离散化用的临时数组

void add(int pos, int val) {
    for (int i = pos; i <= n; i += i & (-i))
        c[i] += val;
}

int sum(int pos) {
    int res = 0;
    for (int i = pos; i > 0; i -= i & (-i))
        res += c[i];
    return res;
}

int main() {
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        scanf("%d", &a[i]);
        b[i] = a[i];
    }
    // 离散化：将值映射到 [1, n]
    sort(b + 1, b + n + 1);
    int m = unique(b + 1, b + n + 1) - b - 1;
    for (int i = 1; i <= n; i++)
        a[i] = lower_bound(b + 1, b + m + 1, a[i]) - b;

    long long ans = 0;
    for (int i = n; i >= 1; i--) {
        ans += sum(a[i] - 1); // 统计右边比 a[i] 小的元素个数
        add(a[i], 1);         // 插入当前元素
    }
    printf("%lld\n", ans);
    return 0;
}
```

> **TIP 说明：** 离散化是树状数组处理大值域问题的常见技巧。`unique` 去重后用 `lower_bound` 做映射，时间复杂度 $O(n \log n)$，不会比树状数组本身的复杂度更差。

---

## 练习题单

| 平台 | 题号 / 题名 | 难度 | 考点 |
|------|-------------|------|------|
| 洛谷 | P3374 【模板】树状数组 1 | 入门 | 单点修改 + 区间查询 |
| 洛谷 | P3368 【模板】树状数组 2 | 入门 | 区间修改 + 单点查询（差分） |
| 洛谷 | P1908 逆序对 | 入门 | 逆序对 + 离散化 |
| 洛谷 | P1972 [SDOI2009] HH的项链 | 进阶 | 离线 + 树状数组 |
| LeetCode | 307. 区域和检索 - 数组可修改 | 进阶 | 单点修改 + 区间查询 |
| LeetCode | 315. 计算右侧小于当前元素的个数 | 进阶 | 逆序对变体 + 离散化 |
| Codeforces | 597C. Subsequences | 综合 | 树状数组优化 DP |
| 洛谷 | P2163 [SHOI2007] 园丁的烦恼 | 综合 | 二维树状数组 + 离线 |

---

## 常见错误

### 1. 数组下标从 0 开始

树状数组的下标**必须从 1 开始**，因为 $\text{lowbit}(0) = 0$，对 0 做 `add` 会死循环。如果原始数据下标从 0 开始，需要整体偏移 1。

### 2. 初始化时直接赋值而非 add

很多初学者写 `for (int i = 1; i <= n; i++) scanf("%d", &c[i]);` 来初始化，这是错误的。$c[i]$ 不等于 $a[i]$，它存储的是区间和。正确做法是逐个 `add(i, a[i])`。或者可以先算前缀和再按 lowbit 分配，但直接 add 最简单安全。

### 3. 忘记离散化

当值域远大于 $n$（例如 $a[i]$ 可达 $10^9$ 但 $n$ 只有 $10^5$）时，树状数组的大小必须匹配值域。直接开 $10^9$ 大小的数组会爆内存。正确做法是先对值离散化到 $[1, n]$ 再建树。

### 4. 区间修改时 `r+1` 越界

差分操作 `add(r + 1, -v)` 中，当 $r = n$ 时 $r + 1 = n + 1$ 可能越界。数组要多开一点，或者特判 $r < n$。竞赛中这个边界错误极为常见。

### 5. 运算不满足结合律时误用树状数组

树状数组要求运算满足**结合律**（加法、异或、乘法模意义下等）。如果需要求区间最值，树状数组无法高效支持区间 $\min$ / $\max$ 查询（虽然可以支持前缀最值），此时应该用线段树。不要强行用树状数组套不合适的运算。

---

## 延伸阅读

- [OI Wiki - 树状数组](https://oi-wiki.org/ds/fenwick/)：树状数组的原理、扩展与多维推广，含图解说明。
- [OI Wiki - 离散化](https://oi-wiki.org/misc/discrete/)：离散化技巧，树状数组处理大值域时的必备前置。
- [LeetCode 树状数组专题](https://leetcode.cn/tag/binary-indexed-tree/)：按难度排列的树状数组题目集合。
