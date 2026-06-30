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
