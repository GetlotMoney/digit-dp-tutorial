# 线段树

线段树（Segment Tree）是竞赛中最常用的区间数据结构之一。它能够在 $O(\log n)$ 时间内完成**区间查询**（求和、最大值、最小值等）和**区间修改**（区间加、区间赋值等），是树状数组（Fenwick Tree）的升级版——功能更强大，适用面更广，但代码量也更大。

**什么时候该想到线段树？**

- 需要对数组做频繁的**区间修改**（区间加、区间赋值）+ **区间查询**（区间和、区间最值）
- 操作不是简单的前缀查询，而是任意区间的查询和修改
- 树状数组难以处理的**区间赋值**或**多操作叠加**场景

线段树的核心思想是**分治**：把一个大区间不断二分成小区间，每个节点维护对应区间的聚合信息。查询和修改时只需要访问 $O(\log n)$ 个节点，效率极高。

<!--DEMO:segment-tree-visual-->

---

## 核心思想

### 1. 线段树的结构

线段树是一棵**完全二叉树**。对于长度为 $n$ 的数组，线段树的每个节点对应一个区间 $[l, r]$：

- **叶子节点**：对应单个元素 $[i, i]$。
- **内部节点**：对应区间 $[l, r]$，其左孩子对应 $[l, \text{mid}]$，右孩子对应 $[\text{mid}+1, r]$，其中 $\text{mid} = \lfloor(l + r) / 2\rfloor$。
- **根节点**：对应整个数组 $[1, n]$。

用一维数组存储线段树（堆式存储）：

- 根节点编号为 $1$。
- 节点 $p$ 的左孩子编号为 $2p$，右孩子为 $2p + 1$。
- 节点 $p$ 的父亲编号为 $\lfloor p / 2 \rfloor$。

数组大小开 $4n$ 即可保证不会越界（$n$ 为数组长度）。

### 2. 区间查询

给定查询区间 $[ql, qr]$，从根节点开始递归：

- 若当前节点区间 $[l, r]$ 完全被 $[ql, qr]$ 包含，直接返回该节点的值。
- 否则，将查询拆分到左孩子和右孩子上，分别递归后合并结果。

每次查询最多访问 $O(\log n)$ 个节点，因为每一层最多拆分两次。

$$
\text{query}(p, l, r, ql, qr) = \begin{cases} \text{tree}[p] & \text{if } ql \leq l \wedge r \leq qr \\ \text{merge}(\text{query}(2p, l, m, ql, qr),\; \text{query}(2p+1, m+1, r, ql, qr)) & \text{otherwise} \end{cases}
$$

### 3. 单点修改

修改位置 $pos$ 的值后，从叶子节点向上回溯更新所有祖先。只需沿着一条从根到叶子的路径更新，复杂度 $O(\log n)$。

### 4. 区间修改与懒标记

线段树的精髓在于**懒标记（Lazy Tag）**。区间修改如果逐点更新，复杂度会退化到 $O(n)$。懒标记的思路是：

1. **不下传**：对一个完全被修改区间覆盖的节点，只在该节点打上标记，记录"我的子节点还没有更新"，而不立刻更新子节点。
2. **需要时下传**：当后续操作需要用到该节点的子节点时，先把标记下传给左右孩子，再清除当前节点的标记。
3. **向上合并**：修改完成后，用子节点的值更新父亲节点。

这样，每次区间修改和区间查询的复杂度都是 $O(\log n)$。

懒标记的典型类型：

| 操作类型 | 标记含义 | 下传方式 |
|---------|---------|---------|
| 区间加 $v$ | `add += v` | 子节点 `add` 累加，子节点 `sum += v * 子区间长度` |
| 区间赋值 $v$ | `set = v` | 子节点 `set = v`（覆盖旧标记），子节点 `sum = v * 子区间长度` |

> **注意**：当两种操作同时存在时，需要设计标记的优先级——一般规定「赋值」覆盖「加法」。

### 5. 权值线段树

权值线段树不是在原数组上建树，而是在**值域**上建树。每个叶子对应一个值，节点维护"值在该范围内的元素个数"。经典应用：

- **第 $k$ 小**：在权值线段树上二分，左子树元素个数 $\geq k$ 就走左，否则走右。
- **动态排名**：配合离散化，支持插入、删除、查询排名。
- **可持久化**：权值线段树天然适合做可持久化（主席树），每个版本保留一条路径，空间 $O(n \log n)$。

### 6. 线段树合并

当需要合并两棵结构相同的线段树时（如树上启发式合并），可以递归合并：两棵树对应节点都存在时合并，只有一棵存在时直接接上。合并的总复杂度与两棵树的总节点数成正比，即 $O(n \log n)$。

---

## 模板代码

下面给出**区间加 + 区间求和**的完整线段树模板，包含建树、懒标记下传、区间修改、区间查询四个核心操作。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 100005;

int a[MAXN];         // 原始数组
long long tree[4 * MAXN];  // 线段树节点值（区间和）
long long lazy[4 * MAXN];  // 懒标记（区间加）

// 用子节点的值更新当前节点
void pushUp(int p) {
    tree[p] = tree[p * 2] + tree[p * 2 + 1];
}

// 下传懒标记
void pushDown(int p, int l, int r) {
    if (lazy[p] == 0) return;  // 没有标记，不用下传
    int mid = (l + r) / 2;
    // 左孩子
    tree[p * 2] += lazy[p] * (mid - l + 1);
    lazy[p * 2] += lazy[p];
    // 右孩子
    tree[p * 2 + 1] += lazy[p] * (r - mid);
    lazy[p * 2 + 1] += lazy[p];
    // 清除当前标记
    lazy[p] = 0;
}

// 建树：p=当前节点编号，[l,r]=当前区间
void build(int p, int l, int r) {
    if (l == r) {
        tree[p] = a[l];  // 叶子节点，直接赋值
        return;
    }
    int mid = (l + r) / 2;
    build(p * 2, l, mid);          // 建左子树
    build(p * 2 + 1, mid + 1, r);  // 建右子树
    pushUp(p);                      // 合并
}

// 区间修改：[ql, qr] 每个元素加 val
void update(int p, int l, int r, int ql, int qr, long long val) {
    if (ql <= l && r <= qr) {
        // 当前区间被完全覆盖
        tree[p] += val * (r - l + 1);
        lazy[p] += val;  // 打标记，不立刻下传
        return;
    }
    pushDown(p, l, r);  // 需要访问子节点，先下传标记
    int mid = (l + r) / 2;
    if (ql <= mid) update(p * 2, l, mid, ql, qr, val);
    if (qr > mid)  update(p * 2 + 1, mid + 1, r, ql, qr, val);
    pushUp(p);  // 子节点更新完，回溯更新
}

// 区间查询：求 [ql, qr] 的和
long long query(int p, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) return tree[p];  // 完全包含
    pushDown(p, l, r);  // 需要访问子节点，先下传标记
    int mid = (l + r) / 2;
    long long res = 0;
    if (ql <= mid) res += query(p * 2, l, mid, ql, qr);
    if (qr > mid)  res += query(p * 2 + 1, mid + 1, r, ql, qr);
    return res;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n, m;
    cin >> n >> m;
    for (int i = 1; i <= n; i++) cin >> a[i];

    build(1, 1, n);  // 从根节点（编号1）开始建树

    while (m--) {
        int op, x, y;
        long long k;
        cin >> op >> x >> y;
        if (op == 1) {
            // 区间 [x, y] 每个元素加 k
            cin >> k;
            update(1, 1, n, x, y, k);
        } else {
            // 查询区间 [x, y] 的和
            cout << query(1, 1, n, x, y) << '\n';
        }
    }
    return 0;
}
```

> **说明**：上面是面向竞赛的写法（1-indexed，堆式存储）。`4 * MAXN` 的数组大小足以覆盖所有情况。如果空间卡得紧，可以动态开点。

---

## 例题详解

### 例题 1：洛谷 P3372 - 线段树 1

> 给定长度为 $n$ 的序列，执行 $m$ 次操作：区间加、区间求和。

**思路**：这是线段树的入门题，直接套用上面的区间加 + 区间求和模板。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 100005;
int a[MAXN];
long long tree[4 * MAXN], lazy[4 * MAXN];

void pushUp(int p) { tree[p] = tree[p*2] + tree[p*2+1]; }

void pushDown(int p, int l, int r) {
    if (!lazy[p]) return;
    int mid = (l + r) / 2;
    tree[p*2] += lazy[p] * (mid - l + 1);
    lazy[p*2] += lazy[p];
    tree[p*2+1] += lazy[p] * (r - mid);
    lazy[p*2+1] += lazy[p];
    lazy[p] = 0;
}

void build(int p, int l, int r) {
    if (l == r) { tree[p] = a[l]; return; }
    int mid = (l + r) / 2;
    build(p*2, l, mid);
    build(p*2+1, mid+1, r);
    pushUp(p);
}

void update(int p, int l, int r, int ql, int qr, long long v) {
    if (ql <= l && r <= qr) {
        tree[p] += v * (r - l + 1);
        lazy[p] += v;
        return;
    }
    pushDown(p, l, r);
    int mid = (l + r) / 2;
    if (ql <= mid) update(p*2, l, mid, ql, qr, v);
    if (qr > mid)  update(p*2+1, mid+1, r, ql, qr, v);
    pushUp(p);
}

long long query(int p, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) return tree[p];
    pushDown(p, l, r);
    int mid = (l + r) / 2;
    long long res = 0;
    if (ql <= mid) res += query(p*2, l, mid, ql, qr);
    if (qr > mid)  res += query(p*2+1, mid+1, r, ql, qr);
    return res;
}

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, m; cin >> n >> m;
    for (int i = 1; i <= n; i++) cin >> a[i];
    build(1, 1, n);
    while (m--) {
        int op, x, y; long long k;
        cin >> op >> x >> y;
        if (op == 1) { cin >> k; update(1, 1, n, x, y, k); }
        else cout << query(1, 1, n, x, y) << '\n';
    }
}
```

**复杂度**：建树 $O(n)$，每次操作 $O(\log n)$，总计 $O(n + m \log n)$。

### 例题 2：洛谷 P3373 - 线段树 2

> 在区间加的基础上，增加**区间乘**操作，两种操作交替出现，同时需要区间求和。

**思路**：需要同时维护"加法标记"和"乘法标记"。关键在于标记下传的优先级：**乘法标记优先于加法标记**。下传时，先把乘法标记作用于子节点的加法标记和值，再处理加法标记。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 100005;
int n, m, mod;
int a[MAXN];
long long tree[4 * MAXN];
long long mul_tag[4 * MAXN];  // 乘法标记
long long add_tag[4 * MAXN];  // 加法标记

void pushUp(int p) {
    tree[p] = (tree[p*2] + tree[p*2+1]) % mod;
}

// 应用乘法标记到子节点
void applyMul(int p, int l, int r, long long v) {
    tree[p] = tree[p] * v % mod;
    mul_tag[p] = mul_tag[p] * v % mod;
    add_tag[p] = add_tag[p] * v % mod;  // 加法标记也要乘
}

// 应用加法标记到子节点
void applyAdd(int p, int l, int r, long long v) {
    int len = r - l + 1;
    tree[p] = (tree[p] + v * len % mod) % mod;
    add_tag[p] = (add_tag[p] + v) % mod;
}

void pushDown(int p, int l, int r) {
    if (mul_tag[p] == 1 && add_tag[p] == 0) return;
    int mid = (l + r) / 2;
    // 先乘后加！乘法标记要同步作用于子节点的加法标记
    if (mul_tag[p] != 1) {
        applyMul(p*2, l, mid, mul_tag[p]);
        applyMul(p*2+1, mid+1, r, mul_tag[p]);
        mul_tag[p] = 1;
    }
    if (add_tag[p] != 0) {
        applyAdd(p*2, l, mid, add_tag[p]);
        applyAdd(p*2+1, mid+1, r, add_tag[p]);
        add_tag[p] = 0;
    }
}

void build(int p, int l, int r) {
    mul_tag[p] = 1;  // 乘法标记初始化为 1！
    if (l == r) { tree[p] = a[l] % mod; return; }
    int mid = (l + r) / 2;
    build(p*2, l, mid);
    build(p*2+1, mid+1, r);
    pushUp(p);
}

void updateMul(int p, int l, int r, int ql, int qr, long long v) {
    if (ql <= l && r <= qr) { applyMul(p, l, r, v); return; }
    pushDown(p, l, r);
    int mid = (l + r) / 2;
    if (ql <= mid) updateMul(p*2, l, mid, ql, qr, v);
    if (qr > mid)  updateMul(p*2+1, mid+1, r, ql, qr, v);
    pushUp(p);
}

void updateAdd(int p, int l, int r, int ql, int qr, long long v) {
    if (ql <= l && r <= qr) { applyAdd(p, l, r, v); return; }
    pushDown(p, l, r);
    int mid = (l + r) / 2;
    if (ql <= mid) updateAdd(p*2, l, mid, ql, qr, v);
    if (qr > mid)  updateAdd(p*2+1, mid+1, r, ql, qr, v);
    pushUp(p);
}

long long query(int p, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) return tree[p];
    pushDown(p, l, r);
    int mid = (l + r) / 2;
    long long res = 0;
    if (ql <= mid) res = (res + query(p*2, l, mid, ql, qr)) % mod;
    if (qr > mid)  res = (res + query(p*2+1, mid+1, r, ql, qr)) % mod;
    return res;
}

int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    cin >> n >> m >> mod;
    for (int i = 1; i <= n; i++) cin >> a[i];
    build(1, 1, n);
    while (m--) {
        int op, x, y; long long k;
        cin >> op >> x >> y;
        if (op == 1) { cin >> k; updateMul(1, 1, n, x, y, k); }
        else if (op == 2) { cin >> k; updateAdd(1, 1, n, x, y, k); }
        else cout << query(1, 1, n, x, y) << '\n';
    }
}
```

> **关键细节**：乘法标记初始化为 1（不是 0），因为乘法的单位元是 1。下传时必须先乘后加，且乘法标记要同步作用于子节点的加法标记（因为 $(a + b) \times c = a \times c + b \times c$）。

<!--DEMO:segment-tree-lazy-->

---

## 练习题单

| # | 平台 | 题号 / 名称 | 难度 | 关键点 |
|---|------|------------|------|--------|
| 1 | 洛谷 | P3372 线段树 1 | 入门 | 区间加 + 区间求和，模板题 |
| 2 | LeetCode | 307. Range Sum Query - Mutable | 入门 | 单点修改 + 区间求和 |
| 3 | 洛谷 | P3373 线段树 2 | 进阶 | 区间加 + 区间乘，双标记 |
| 4 | LeetCode | 315. Count of Smaller Numbers After Self | 进阶 | 权值线段树 / 离散化 |
| 5 | 洛谷 | P1908 逆序对 | 进阶 | 权值线段树求逆序对 |
| 6 | 洛谷 | P2023 维护序列 | 综合 | 区间加 + 区间乘 + 区间求和 |
| 7 | Codeforces | 52C - Circular RMQ | 综合 | 环形区间 + 区间加 + 区间最小值 |
| 8 | 洛谷 | P4588 数学计算 | 综合 | 线段树维护区间乘积 |

> **刷题建议**：先做 P3372（模板题）熟悉基本操作，再做 P3373 理解多标记下传的优先级。之后做 LeetCode 307 体会单点修改的简化版。进阶阶段尝试权值线段树和逆序对问题，最后挑战多操作叠加的综合题。

---

## 常见错误

### 1. 懒标记下传遗漏

区间修改时打上标记后，如果后续操作要访问子节点（查询或修改时区间不完全覆盖），必须先 `pushDown`。忘记下传会导致子节点的值是过时的，查询结果错误。

```cpp
// 错误：直接递归子节点，忘记下传
if (ql <= mid) update(p*2, l, mid, ql, qr, v);

// 正确：先下传，再递归
pushDown(p, l, r);
if (ql <= mid) update(p*2, l, mid, ql, qr, v);
```

**检查方法**：确保每次递归子节点前都调用了 `pushDown`。

### 2. 乘法标记初始化为 0

加法标记初始化为 0（加法单位元是 0），但乘法标记必须初始化为 1（乘法单位元是 1）。如果乘法标记初始化为 0，那么 $0 \times$ 任何数都是 0，所有值会被清零。

```cpp
// 建树时
mul_tag[p] = 1;  // 乘法标记初始化为 1！
add_tag[p] = 0;  // 加法标记初始化为 0
```

### 3. 区间乘下传时忘记更新加法标记

当乘法标记下传时，子节点的加法标记也要乘以同样的值。因为区间内每个元素都要乘 $v$，而加法标记代表"待加的值"，这些待加的值本身也要乘 $v$。

```cpp
// 错误：只更新乘法标记
tree[p*2] = tree[p*2] * v % mod;
mul_tag[p*2] = mul_tag[p*2] * v % mod;

// 正确：加法标记也要乘
tree[p*2] = tree[p*2] * v % mod;
mul_tag[p*2] = mul_tag[p*2] * v % mod;
add_tag[p*2] = add_tag[p*2] * v % mod;  // 容易漏！
```

### 4. 数组开小了

堆式存储的线段树，节点编号最大可达 $4n$。如果只开 `2n` 或 `3n`，在某些情况下会越界导致 RE（Runtime Error）。

```cpp
// 错误：开 2n 或 3n
long long tree[2 * MAXN];  // 可能越界！

// 正确：开 4n
long long tree[4 * MAXN];
```

### 5. 离散化与线段树配合时忘记处理重复值

权值线段树配合离散化时，如果值域中有重复元素，需要确保离散化后的值一一对应。可以用 `std::unique` 去重后建树，或者在建树时处理多值映射到同一叶子的情况。

---

## 延伸阅读

- [OI Wiki - 线段树](https://oi-wiki.org/ds/seg/)：线段树的详细讲解，含各种变体和例题。
- [OI Wiki - 线段树合并](https://oi-wiki.org/ds/seg/#线段树合并)：线段树合并的原理与应用。
- [OI Wiki - 主席树（可持久化线段树）](https://oi-wiki.org/ds/persistent-seg/)：权值线段树的可持久化版本。
- [洛谷线段树题单](https://www.luogu.com.cn/training/167)：从入门到进阶的线段树专题练习。
- 《算法竞赛进阶指南》第 0x40 节「数据结构进阶」：线段树的竞赛视角深入讲解。
