### 例题 1：洛谷 P3379 - 【模板】最近公共祖先（LCA）

**题意**：给定一棵 $n$ 个节点的有根树，$m$ 次查询两个节点的 LCA。

**分析**：标准的 LCA 模板题。数据范围 $n, m \le 5 \times 10^5$，倍增法 $O((n+m) \log n)$ 足够。输入可能很大，记得开快读。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 500005;
const int MAXLOG = 20;

vector<int> adj[MAXN];
int dep[MAXN], fa[MAXN][MAXLOG];
int n, m, root;

void dfs(int u, int parent) {
    dep[u] = dep[parent] + 1;
    fa[u][0] = parent;
    for (int k = 1; k < MAXLOG; k++)
        fa[u][k] = fa[fa[u][k-1]][k-1];
    for (int v : adj[u]) {
        if (v != parent) dfs(v, u);
    }
}

int lca(int u, int v) {
    if (dep[u] < dep[v]) swap(u, v);
    int diff = dep[u] - dep[v];
    for (int k = 0; k < MAXLOG; k++)
        if (diff >> k & 1) u = fa[u][k];
    if (u == v) return u;
    for (int k = MAXLOG - 1; k >= 0; k--)
        if (fa[u][k] != fa[v][k]) { u = fa[u][k]; v = fa[v][k]; }
    return fa[u][0];
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n >> m >> root;
    for (int i = 1; i < n; i++) {
        int u, v; cin >> u >> v;
        adj[u].push_back(v);
        adj[v].push_back(u);
    }
    dfs(root, 0);
    while (m--) {
        int u, v; cin >> u >> v;
        cout << lca(u, v) << "\n";
    }
    return 0;
}
```

**复杂度**：预处理 $O(n \log n)$，查询 $O(m \log n)$。

### 例题 2：洛谷 P1967 - 货车运输

**题意**：$n$ 个城市、$m$ 条双向道路，每条路有承重限制。$q$ 次查询：从 $a$ 到 $b$，货车能装载的最大重量是多少？

**分析**：这是经典的**最大生成树 + 倍增 LCA** 问题。在最大生成树上，$a$ 到 $b$ 的路径瓶颈（路径上最小边权）就是答案。用倍增法同时维护 `fa[v][k]`（祖先）和 `mn[v][k]`（到祖先路径上的最小边权）。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 10005;
const int MAXLOG = 15;
const int INF = 0x3f3f3f3f;

struct Edge { int u, v, w; };

int fa[MAXN], dep[MAXN];
int pa[MAXN][MAXLOG], mn[MAXN][MAXLOG];
vector<pair<int,int>> tree[MAXN];

int find(int x) {
    return fa[x] == x ? x : fa[x] = find(fa[x]);
}

void dfs(int u, int parent) {
    dep[u] = dep[parent] + 1;
    pa[u][0] = parent;
    for (int k = 1; k < MAXLOG; k++) {
        pa[u][k] = pa[pa[u][k-1]][k-1];
        mn[u][k] = min(mn[u][k-1], mn[pa[u][k-1]][k-1]);
    }
    for (auto& [v, w] : tree[u]) {
        if (v == parent) continue;
        mn[v][0] = w;
        dfs(v, u);
    }
}

int query(int a, int b) {
    if (find(a) != find(b)) return -1;
    int ans = INF;
    if (dep[a] < dep[b]) swap(a, b);
    int diff = dep[a] - dep[b];
    for (int k = 0; k < MAXLOG; k++) {
        if (diff >> k & 1) {
            ans = min(ans, mn[a][k]);
            a = pa[a][k];
        }
    }
    if (a == b) return ans;
    for (int k = MAXLOG - 1; k >= 0; k--) {
        if (pa[a][k] != pa[b][k]) {
            ans = min(ans, mn[a][k]);
            ans = min(ans, mn[b][k]);
            a = pa[a][k]; b = pa[b][k];
        }
    }
    ans = min(ans, mn[a][0]);
    ans = min(ans, mn[b][0]);
    return ans;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m; cin >> n >> m;
    vector<Edge> edges(m);
    for (int i = 0; i < m; i++) cin >> edges[i].u >> edges[i].v >> edges[i].w;

    sort(edges.begin(), edges.end(), [](auto& a, auto& b) { return a.w > b.w; });
    for (int i = 1; i <= n; i++) fa[i] = i;

    for (auto& e : edges) {
        int fu = find(e.u), fv = find(e.v);
        if (fu != fv) {
            fa[fu] = fv;
            tree[e.u].push_back({e.v, e.w});
            tree[e.v].push_back({e.u, e.w});
        }
    }

    memset(mn, 0x3f, sizeof(mn));
    for (int i = 1; i <= n; i++)
        if (!dep[i]) dfs(i, 0);

    int q; cin >> q;
    while (q--) {
        int a, b; cin >> a >> b;
        cout << query(a, b) << "\n";
    }
    return 0;
}
```

**复杂度**：建树 $O(m \log m)$，预处理 $O(n \log n)$，查询 $O(q \log n)$。
