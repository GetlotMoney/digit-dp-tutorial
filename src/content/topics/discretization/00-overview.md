# 离散化与分块

**离散化**和**分块**是竞赛编程中两种重要的预处理与数据组织技巧。离散化将稀疏的大值域映射到紧凑的连续下标，让数组型数据结构（树状数组、线段树等）能够处理原本开不下空间的问题；分块则是一种"化整为零"的思想，将区间拆成若干等长块，在暴力与高级数据结构之间取得一个简洁的平衡，常数小、代码短、适用面广。

适用场景：
- 值域很大（如 $10^9$）但有效元素不多（如 $10^5$），需要按值排序或索引——**坐标离散化**
- 区间操作（修改 + 查询）想要比 $O(n)$ 更快，但不想写线段树——**分块 / 块状数组**
- 需要维护中位数、第 $k$ 小等排序信息——**值域离散化 + 分桶**

---

## 核心思想

### 坐标离散化

当数据的值域远大于实际元素个数时，直接用值做下标会浪费巨大空间。**坐标离散化**将原始值映射到 $1, 2, 3, \ldots, m$（$m$ 为不同值的个数），保持原始的大小关系不变。

具体做法：

1. 将所有需要离散化的值收集到数组 $b$ 中。
2. 对 $b$ 排序并去重（`std::sort` + `std::unique`）。
3. 用 `std::lower_bound` 查询每个原始值对应的新下标。

$$
\text{rank}(x) = \text{lower\_bound}(b, x) - b
$$

时间复杂度 $O(n \log n)$，空间 $O(n)$。去重后 $b$ 的长度 $m$ 就是离散化后的值域大小。

<!--DEMO:discretization-mapping-->

### 值域离散化

与坐标离散化不同，**值域离散化**关注的是"所有可能的取值"而非"已经出现的值"。典型场景：区间染色问题中，端点坐标需要排序去重后才能构建线段树。

有时需要把值域分成 $O(\sqrt{n})$ 组，每组维护一个有序容器，这就是"值域分块"的雏形。

### 分块思想

分块的核心是**将长度为 $n$ 的序列分成 $\lceil n / B \rceil$ 块，每块大小约为 $B = \sqrt{n}$**。对整块打标记，对散块暴力处理，总复杂度：

$$
O\!\left(\frac{n}{B} + B\right) = O(\sqrt{n})
$$

这是"时间复杂度的几何均值"——当 $B = \sqrt{n}$ 时，两部分平衡。

分块能做的操作非常多：
- **区间加 / 区间求和**：每块维护 sum 和 add 懒标记
- **区间求最大值**：每块维护块内最大值
- **区间第 $k$ 小**：归并排序后二分，或值域分块
- **区间赋值 / 区间覆盖**：整块打标记，散块暴力

<!--DEMO:block-decomposition-->

### 块状数组

**块状数组**是分块的直接实现：将原始数组拆成若干块，每块内部维护额外信息（和、最大值、懒标记等）。它是线段树的"穷人版"——功能类似，但常数更小、代码更短、调试更容易。

---

## 模板代码

### 坐标离散化

```cpp
// 坐标离散化模板
// 将原数组 a[1..n] 中的值映射到 [1, m]，保持大小关系
int n, a[N], b[N], m;
// a[] 原始数据，b[] 离散化用的临时数组

void discretize() {
    // 第一步：复制到临时数组
    for (int i = 1; i <= n; i++) b[i] = a[i];
    // 第二步：排序 + 去重
    sort(b + 1, b + n + 1);
    m = unique(b + 1, b + n + 1) - b - 1;
    // 第三步：用 lower_bound 做映射
    for (int i = 1; i <= n; i++)
        a[i] = lower_bound(b + 1, b + m + 1, a[i]) - b;
}
```

### 区间加 + 区间求和（分块）

```cpp
// 分块模板：区间加值 + 区间求和
// 块大小 B = sqrt(n)，共 S = ceil(n/B) 块
int n, B, S;
int a[N];           // 原始值
long long sum[N];   // sum[i] = 第 i 块的元素和
long long add[N];   // add[i] = 第 i 块的懒标记（整块加值）

int L[N], R[N];     // L[i], R[i] = 第 i 块的左右边界
int bel[N];         // bel[i] = 元素 i 所属的块编号

// 初始化分块
void init() {
    B = sqrt(n);
    S = (n + B - 1) / B;  // 块数
    for (int i = 1; i <= S; i++) {
        L[i] = (i - 1) * B + 1;
        R[i] = min((long long)i * B, (long long)n);
    }
    for (int i = 1; i <= n; i++) {
        bel[i] = (i - 1) / B + 1;
        sum[bel[i]] += a[i];
    }
}

// 区间 [l, r] 每个元素加 v，O(sqrt(n))
void range_add(int l, int r, int v) {
    int bl = bel[l], br = bel[r];
    if (bl == br) {
        // 同一块内，直接暴力
        for (int i = l; i <= r; i++) a[i] += v;
        sum[bl] += (long long)v * (r - l + 1);
        return;
    }
    // 左侧散块
    for (int i = l; i <= R[bl]; i++) a[i] += v;
    sum[bl] += (long long)v * (R[bl] - l + 1);
    // 中间整块
    for (int i = bl + 1; i < br; i++) add[i] += v;
    // 右侧散块
    for (int i = L[br]; i <= r; i++) a[i] += v;
    sum[br] += (long long)v * (r - L[br] + 1);
}

// 区间 [l, r] 求和，O(sqrt(n))
long long query_sum(int l, int r) {
    int bl = bel[l], br = bel[r];
    long long res = 0;
    if (bl == br) {
        for (int i = l; i <= r; i++)
            res += a[i] + add[bl];
        return res;
    }
    for (int i = l; i <= R[bl]; i++)
        res += a[i] + add[bl];
    for (int i = bl + 1; i < br; i++)
        res += sum[i] + add[i] * (R[i] - L[i] + 1);
    for (int i = L[br]; i <= r; i++)
        res += a[i] + add[br];
    return res;
}
```

### 区间求最大值（分块）

```cpp
// 分块：区间加 + 区间最大值
long long mx[N];   // mx[i] = 第 i 块的最大值

// 初始化 mx 数组
void init_mx() {
    for (int i = 1; i <= n; i++)
        mx[bel[i]] = max(mx[bel[i]], (long long)a[i]);
}

// 区间 [l, r] 每个元素加 v
// （range_add 函数同上，额外维护 mx 数组较复杂，此处分块后暴力重建）

// 区间 [l, r] 查询最大值，O(sqrt(n))
long long query_max(int l, int r) {
    int bl = bel[l], br = bel[r];
    long long res = -1e18;
    if (bl == br) {
        for (int i = l; i <= r; i++)
            res = max(res, a[i] + add[bl]);
        return res;
    }
    for (int i = l; i <= R[bl]; i++)
        res = max(res, a[i] + add[bl]);
    for (int i = bl + 1; i < br; i++)
        res = max(res, mx[i] + add[i]);
    for (int i = L[br]; i <= r; i++)
        res = max(res, a[i] + add[br]);
    return res;
}
```

<!--DEMO:block-query-visual-->

---

## 例题详解

### 例题 1：洛谷 P1908 逆序对（离散化应用）

**题意：** 给定长度为 $n$ 的序列，求逆序对个数。$n \leq 5 \times 10^5$，$|a[i]| \leq 10^9$。

**思路：** 求逆序对的经典做法是树状数组，但值域高达 $10^9$，需要先离散化。将所有值映射到 $[1, n]$，然后从右向左扫描，对每个 $a[i]$ 查询已插入中小于 $a[i]$ 的个数，即 `sum(a[i] - 1)`。

```cpp
#include <cstdio>
#include <algorithm>
using namespace std;
const int N = 500005;
int n, a[N], b[N], c[N];

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
    // 离散化
    sort(b + 1, b + n + 1);
    int m = unique(b + 1, b + n + 1) - b - 1;
    for (int i = 1; i <= n; i++)
        a[i] = lower_bound(b + 1, b + m + 1, a[i]) - b;

    long long ans = 0;
    for (int i = n; i >= 1; i--) {
        ans += sum(a[i] - 1);
        add(a[i], 1);
    }
    printf("%lld\n", ans);
    return 0;
}
```

> **说明：** 如果没有离散化，$a[i]$ 可达 $10^9$，树状数组需要开 $10^9$ 大小，直接爆空间。离散化后值域压缩到 $n$，空间 $O(n)$ 即可。

### 例题 2：洛谷 P3870 [TJOI2009] 开关（分块应用）

**题意：** 有 $n$ 盏灯（初始全灭），支持两种操作：(1) 将区间 $[l, r]$ 内的灯状态翻转（开变关、关变开）；(2) 查询区间 $[l, r]$ 内亮着的灯的数量。$n, m \leq 10^5$。

**思路：** 区间翻转 + 区间查询，线段树可以做，但分块更简洁。每块维护：
- 亮灯数 `cnt[i]`
- 是否整体翻转的懒标记 `tag[i]`

整块翻转时：`cnt[i] = 块大小 - cnt[i]`，`tag[i] ^= 1`；散块暴力修改。

```cpp
#include <cstdio>
#include <cmath>
using namespace std;
const int N = 100005;
int n, m, B, S;
int bel[N], L[N], R[N];
int a[N], cnt[N], tag[N];

void init() {
    B = sqrt(n);
    S = (n + B - 1) / B;
    for (int i = 1; i <= S; i++) {
        L[i] = (i - 1) * B + 1;
        R[i] = i * B < n ? i * B : n;
    }
    for (int i = 1; i <= n; i++)
        bel[i] = (i - 1) / B + 1;
}

// 下推整块翻转标记，将第 k 块中每个元素真实翻转
void push_down(int k) {
    if (!tag[k]) return;
    for (int i = L[k]; i <= R[k]; i++)
        a[i] ^= 1;
    tag[k] = 0;
}

// 区间 [l, r] 翻转
void range_flip(int l, int r) {
    int bl = bel[l], br = bel[r];
    if (bl == br) {
        push_down(bl);
        for (int i = l; i <= r; i++) {
            a[i] ^= 1;
            cnt[bl] += a[i] ? 1 : -1;
        }
        return;
    }
    // 左散块
    push_down(bl);
    for (int i = l; i <= R[bl]; i++) {
        a[i] ^= 1;
        cnt[bl] += a[i] ? 1 : -1;
    }
    // 中间整块
    for (int i = bl + 1; i < br; i++) {
        tag[i] ^= 1;
        cnt[i] = (R[i] - L[i] + 1) - cnt[i];
    }
    // 右散块
    push_down(br);
    for (int i = L[br]; i <= r; i++) {
        a[i] ^= 1;
        cnt[br] += a[i] ? 1 : -1;
    }
}

// 查询区间 [l, r] 亮灯数
int query_sum(int l, int r) {
    int bl = bel[l], br = bel[r];
    int res = 0;
    if (bl == br) {
        push_down(bl);
        for (int i = l; i <= r; i++)
            res += a[i];
        return res;
    }
    push_down(bl);
    for (int i = l; i <= R[bl]; i++)
        res += a[i];
    for (int i = bl + 1; i < br; i++)
        res += cnt[i];
    push_down(br);
    for (int i = L[br]; i <= r; i++)
        res += a[i];
    return res;
}

int main() {
    scanf("%d%d", &n, &m);
    init();
    while (m--) {
        int op, l, r;
        scanf("%d%d%d", &op, &l, &r);
        if (op == 0) {
            range_flip(l, r);
        } else {
            printf("%d\n", query_sum(l, r));
        }
    }
    return 0;
}
```

> **说明：** 这道题用分块的代码量约为线段树的一半，而且常数更小，非常适合在比赛中快速实现。

---

## 练习题单

| 平台 | 题号 / 题名 | 难度 | 考点 |
|------|-------------|------|------|
| 洛谷 | P1908 逆序对 | 入门 | 坐标离散化 + 树状数组 |
| 洛谷 | P3870 [TJOI2009] 开关 | 入门 | 分块：区间翻转 + 查询 |
| 洛谷 | P3372 【模板】线段树 1 | 进阶 | 用分块实现区间加 + 区间求和 |
| 洛谷 | P3863 序列 | 进阶 | 分块 + 排序 |
| 洛谷 | P4168 [Violet] 蒲公英 | 综合 | 分块求区间众数 / 中位数 |
| LeetCode | 1649. 通过指令创建有序数组 | 进阶 | 离散化 + 树状数组 |
| Codeforces | 86D. Powerful array | 综合 | 莫队（分块 + 离线） |
| 洛谷 | P2801 教授的魔法 | 综合 | 分块 + 区间加 + 区间排名查询 |

---

## 常见错误

### 1. 离散化时忘记去重

使用 `std::sort` 后必须配合 `std::unique` 去重，否则 `lower_bound` 返回的位置可能不连续。正确写法：

```cpp
sort(b + 1, b + n + 1);
int m = unique(b + 1, b + n + 1) - b - 1; // m 是去重后的元素个数
```

### 2. 分块时块大小选错

块大小 $B$ 应取 $\sqrt{n}$，而不是一个固定常数。当 $n$ 很大时用固定 $B = 100$ 会导致块数过多，查询变慢。正确做法：

```cpp
B = sqrt(n);  // 或 (int)sqrt((double)n)
```

### 3. 分块散块暴力时忘记处理懒标记

整块的懒标记（`add[k]`、`tag[k]`）在访问散块之前必须**下推**（push down），否则散块中的元素值不正确。这是分块最容易出 bug 的地方。

### 4. 离散化后新值域大小搞错

`unique` 返回的是去重后的尾后迭代器，需要减去首地址再减 1 才是有效个数。如果写成 `m = unique(...) - b`，会导致 $m$ 比实际多 1，后续操作可能越界。

### 5. 分块边界计算溢出

计算第 $i$ 块的右边界 `R[i] = min(i * B, n)` 时，当 `i * B` 超过 `int` 范围会溢出。保险起见可以写成 `min(1LL * i * B, 1LL * n)` 或用 `long long`。

---

## 延伸阅读

- [OI Wiki - 离散化](https://oi-wiki.org/misc/discrete/)：离散化的原理、与排序的配合、与各种数据结构的搭配。
- [OI Wiki - 分块](https://oi-wiki.org/ds/decompose/)：分块的思想、块状数组、以及莫队算法的基础。
- [OI Wiki - 块状数组](https://oi-wiki.org/ds/block-array/)：块状链表、块状数组等进阶应用。
- [洛谷题单 - 分块入门](https://www.luogu.com.cn/training/list)：搜索"分块"标签即可找到系统练习题。
