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
