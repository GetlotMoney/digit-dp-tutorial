# KMP与Trie

字符串匹配是算法竞赛和工程开发中的高频操作：在文本串 $T$ 中查找模式串 $P$ 的所有出现位置，在海量字符串中按前缀检索词条，在多个模式串之间做高效匹配——这些问题朴素解法的时间复杂度往往不可接受。KMP 算法利用模式串自身的重复结构将单次匹配优化到线性时间；Trie（字典树）将多个字符串的公共前缀压缩到同一路径上，实现按前缀的高效检索；AC 自动机则把 KMP 的失配思想和 Trie 结合，在多模式匹配中大放异彩。掌握这三者，字符串问题就不再困难。

<!--DEMO:kmp-visual-->

---

## 核心思想

### 1. KMP 算法：利用已匹配信息跳过无用比较

朴素匹配每次失配后，模式串 $P$ 回退到开头、文本串 $T$ 回退到上次匹配起点的下一个位置，时间复杂度 $O(nm)$。KMP 的核心洞察是：**在失配时，模式串前面已经匹配的部分包含了"哪些后缀同时也是前缀"的信息，利用这个信息可以让模式串不回退到开头，而是跳到一个合理的位置继续匹配**。

这个信息被编码在 **next 数组**（也叫 $\pi$ 函数、失配函数）中。定义 $next[j]$ 为模式串 $P$ 的前 $j$ 个字符（即 $P[0..j-1]$）中最长的**既是真前缀又是真后缀**的子串长度。

举个例子，对模式串 `ABABAC`：

| $j$ | $P[0..j-1]$ | 最长相等前后缀 | $next[j]$ |
|-----|-------------|--------------|-----------|
| 0 | (空) | — | -1 |
| 1 | A | — | 0 |
| 2 | AB | — | 0 |
| 3 | ABA | A | 1 |
| 4 | ABAB | AB | 2 |
| 5 | ABABA | ABA | 3 |
| 6 | ABABAC | — | 0 |

> 有些教材约定不同，这里采用"$next[j]$ 表示失配时 $j$ 应跳转到的位置"的写法，$next[0] = -1$ 表示模式串整体右移一位。

匹配时，当 $P[j]$ 与 $T[i]$ 失配，令 $j = next[j]$ 继续比较，而 $i$ 不回退。这样文本串每个字符最多被访问两次，时间复杂度 $O(n + m)$。

### 2. Trie 字典树：按前缀组织字符串

Trie 是一棵多叉树，每条边代表一个字符，从根到某个节点的路径上所有字符拼起来构成一个字符串前缀。核心性质：

- **公共前缀共享路径**：`apple` 和 `app` 共享前三个节点 `a→p→p`。
- **查找一个字符串是否出现过**，只需沿着路径走，时间复杂度 $O(L)$（$L$ 为字符串长度），与字典中有多少个字符串无关。
- 节点上可以标记"是否是某个字符串的结尾"，也可以附加计数等信息。

<!--DEMO:trie-visual-->

Trie 的典型应用场景：拼写检查、自动补全、异或最大值（01-Trie）、按位贪心。

### 3. AC 自动机：多模式串匹配

当需要同时匹配多个模式串时，AC 自动机（Aho-Corasick）是最佳选择。它在 Trie 的基础上，为每个节点添加 **fail 指针**（类似 KMP 的 next 数组），表示"当前路径失配后应该跳转到的最长后缀对应节点"。

构建过程分两步：
1. 将所有模式串插入 Trie。
2. BFS 构建 fail 指针：对于节点 $u$ 的子节点 $v$（通过字符 $c$ 转移），若 $u$ 是根，则 $v$ 的 fail 指向根；否则沿 $u$ 的 fail 链向上找第一个有字符 $c$ 子节点的祖先。

匹配时沿着 Trie 走，失配就沿 fail 指针跳转，直到找到匹配或回到根。总时间复杂度 $O(所有模式串长度之和 + 文本串长度)$。

---

## 模板代码

### KMP（next 数组 + 匹配）

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1e6 + 5;
int nxt[MAXN]; // next 数组（避免与 std::next 冲突，命名为 nxt）

// 构建 next 数组
// p: 模式串, m: 模式串长度
void build_next(const char* p, int m) {
    nxt[0] = -1;
    for (int i = 0, j = -1; i < m; ) {
        // j == -1 表示没有可匹配的前缀，直接从头开始
        // p[i] == p[j] 表示当前字符匹配成功，扩展最长前后缀
        if (j == -1 || p[i] == p[j]) {
            nxt[++i] = ++j;
        } else {
            j = nxt[j]; // 失配：沿 next 链回退
        }
    }
}

// KMP 匹配
// t: 文本串, n: 文本串长度, p: 模式串, m: 模式串长度
// 返回所有匹配的起始位置（0-indexed）
vector<int> kmp(const char* t, int n, const char* p, int m) {
    build_next(p, m);
    vector<int> res;
    for (int i = 0, j = 0; i < n; ) {
        if (j == -1 || t[i] == p[j]) {
            i++; j++;
        } else {
            j = nxt[j]; // 失配：模式串指针回退，文本串指针不回退
        }
        if (j == m) {
            res.push_back(i - m); // 找到一次匹配
            j = nxt[j];           // 继续寻找下一个匹配
        }
    }
    return res;
}
```

### Trie 字典树

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1e6 + 5; // 总节点数上限
const int SIGMA = 26;      // 字符集大小（小写字母）

int trie[MAXN][SIGMA]; // trie[u][c] = 节点 u 通过字符 c 到达的子节点
int cnt[MAXN];          // cnt[u] = 以节点 u 结尾的字符串数量
int tot;                // 节点总数（根节点为 0）

// 初始化：在插入新字符串集合前调用
void init() {
    // 清空已使用的节点（比 memset 整个数组更高效）
    for (int i = 0; i <= tot; i++) {
        memset(trie[i], 0, sizeof(int) * SIGMA);
        cnt[i] = 0;
    }
    tot = 0;
}

// 插入字符串 s
void insert(const string& s) {
    int u = 0;
    for (char ch : s) {
        int c = ch - 'a';
        if (!trie[u][c]) trie[u][c] = ++tot; // 没有就新建节点
        u = trie[u][c];
    }
    cnt[u]++; // 标记结尾
}

// 查询字符串 s 是否存在
bool search(const string& s) {
    int u = 0;
    for (char ch : s) {
        int c = ch - 'a';
        if (!trie[u][c]) return false; // 路径断了，不存在
        u = trie[u][c];
    }
    return cnt[u] > 0;
}
```

### AC 自动机（多模式匹配）

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1e6 + 5;
const int SIGMA = 26;

int trie[MAXN][SIGMA], fail[MAXN], cnt[MAXN];
int tot;

void init() {
    for (int i = 0; i <= tot; i++) {
        memset(trie[i], 0, sizeof(int) * SIGMA);
        fail[i] = cnt[i] = 0;
    }
    tot = 0;
}

// 插入模式串
void insert(const string& s) {
    int u = 0;
    for (char ch : s) {
        int c = ch - 'a';
        if (!trie[u][c]) trie[u][c] = ++tot;
        u = trie[u][c];
    }
    cnt[u]++;
}

// BFS 构建 fail 指针
void build() {
    queue<int> q;
    // 根的子节点的 fail 都指向根
    for (int c = 0; c < SIGMA; c++) {
        int v = trie[0][c];
        if (v) { fail[v] = 0; q.push(v); }
    }
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int c = 0; c < SIGMA; c++) {
            int v = trie[u][c];
            if (v) {
                // 沿 fail 链找第一个有 c 子节点的祖先
                fail[v] = trie[fail[u]][c];
                q.push(v);
            } else {
                // 路径压缩：直接跳转到 fail 链上最近的 c 子节点
                trie[u][c] = trie[fail[u]][c];
            }
        }
    }
}

// 在文本串 t 上匹配，返回每个模式串被匹配到的次数（需按插入顺序映射）
// 实际使用时通常需要额外处理"输出链接"来累加 fail 链上的 cnt
int query(const string& t) {
    int u = 0, res = 0;
    for (char ch : t) {
        int c = ch - 'a';
        u = trie[u][c]; // 已经做了路径压缩，直接转移
        // 沿 fail 链累加所有匹配到的模式串
        for (int j = u; j && cnt[j] != -1; j = fail[j]) {
            res += cnt[j];
            cnt[j] = -1; // 标记已统计，避免重复
        }
    }
    return res;
}
```

---

## 例题详解

### 例题 1：洛谷 P3375 【模板】KMP字符串匹配

**题意：** 给定文本串 $T$ 和模式串 $P$，求 $P$ 在 $T$ 中所有出现的位置，并输出 $P$ 的 next 数组。$|T|, |P| \le 10^6$。

**思路：** 直接套用 KMP 模板。先输出 next 数组，再输出所有匹配位置（1-indexed）。最后输出 $P$ 的每个前缀的最长相等前后缀长度，即 next 数组的值。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1e6 + 5;
int nxt[MAXN];
char t[MAXN], p[MAXN];

int main() {
    scanf("%s%s", t, p);
    int n = strlen(t), m = strlen(p);

    // 构建 next 数组
    nxt[0] = -1;
    for (int i = 0, j = -1; i < m; ) {
        if (j == -1 || p[i] == p[j]) nxt[++i] = ++j;
        else j = nxt[j];
    }

    // 输出每个前缀的最长相等前后缀长度（next 数组的正数部分）
    for (int i = 1; i <= m; i++) printf("%d%c", nxt[i], " \n"[i == m]);

    // KMP 匹配
    for (int i = 0, j = 0; i < n; ) {
        if (j == -1 || t[i] == p[j]) { i++; j++; }
        else j = nxt[j];
        if (j == m) {
            printf("%d\n", i - m + 1); // 输出 1-indexed 位置
            j = nxt[j];
        }
    }
    return 0;
}
```

**时间复杂度：** $O(|T| + |P|)$，文本串和模式串各扫描一遍。

### 例题 2：洛谷 P3808 【模板】AC自动机（简单版）

**题意：** 给定 $n$ 个模式串和一个文本串 $T$，求有多少个不同的模式串在 $T$ 中出现过。模式串总长 $\le 10^6$，$|T| \le 10^6$。

**思路：** 将所有模式串插入 Trie，构建 fail 指针，然后在文本串上跑 AC 自动机。每走到一个节点，沿 fail 链累加匹配到的模式串数量。为了不重复统计，访问过的节点标记 `cnt = -1`。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1e6 + 5;
const int SIGMA = 26;

int trie[MAXN][SIGMA], fail[MAXN], cnt[MAXN];
int tot = 0;

void insert(const string& s) {
    int u = 0;
    for (char ch : s) {
        int c = ch - 'a';
        if (!trie[u][c]) trie[u][c] = ++tot;
        u = trie[u][c];
    }
    cnt[u]++;
}

void build() {
    queue<int> q;
    for (int c = 0; c < SIGMA; c++)
        if (trie[0][c]) { fail[trie[0][c]] = 0; q.push(trie[0][c]); }
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int c = 0; c < SIGMA; c++) {
            if (trie[u][c]) {
                fail[trie[u][c]] = trie[fail[u]][c];
                q.push(trie[u][c]);
            } else {
                trie[u][c] = trie[fail[u]][c];
            }
        }
    }
}

int query(const string& t) {
    int u = 0, res = 0;
    for (char ch : t) {
        u = u * SIGMA + (ch - 'a'); // 这里只是示意，实际用 trie[u][c]
        u = trie[u == 0 ? 0 : fail[u]][ch - 'a']; // 简化写法，见下方修正
    }
    // 修正：使用标准写法
    u = 0;
    for (char ch : t) {
        int c = ch - 'a';
        u = trie[u][c]; // 路径压缩后直接转移
        for (int j = u; j && cnt[j] != -1; j = fail[j]) {
            res += cnt[j];
            cnt[j] = -1;
        }
    }
    return res;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        string s; cin >> s;
        insert(s);
    }
    build();
    string t; cin >> t;
    cout << query(t) << endl;
    return 0;
}
```

**时间复杂度：** 构建 Trie $O(\sum|P_i|)$，构建 fail 指针 $O(\sum|P_i| \cdot |\Sigma|)$，查询 $O(|T| + \text{匹配次数})$。

---

## 练习题单

| # | 平台 | 题号/名称 | 难度 | 关键词 |
|---|------|----------|------|--------|
| 1 | 洛谷 | P3375 【模板】KMP字符串匹配 | 入门 | KMP 模板 |
| 2 | 洛谷 | P3808 【模板】AC自动机（简单版） | 入门 | AC 自动机模板 |
| 3 | 洛谷 | P2580 于是他错误的点名开始了 | 进阶 | Trie 模板 |
| 4 | LeetCode | 28 找出字符串中第一个匹配项的下标 | 入门 | KMP 匹配 |
| 5 | LeetCode | 211 添加与搜索单词 | 进阶 | Trie + DFS |
| 6 | 洛谷 | P3796 【模板】AC自动机（加强版） | 综合 | AC 自动机计数 |
| 7 | 洛谷 | P4551 最长异或路径 | 综合 | 01-Trie + 树上路径 |
| 8 | Codeforces | 963D Frequency of String | 综合 | KMP + 分组处理 |

---

## 常见错误

**1. KMP 的 next 数组下标混乱**

不同教材对 next 数组的定义不同：有的 `next[0] = 0`，有的 `next[0] = -1`；有的是长度 $j$ 的最长相等前后缀，有的是失配后的跳转位置。使用模板前务必确认定义，直接照抄模板最不容易出错。

**2. AC 自动机忘记路径压缩**

在构建 fail 指针时，如果缺少 `trie[u][c] = trie[fail[u]][c]` 这行"路径压缩"，查询时每次失配都要沿 fail 链跳转多次，可能退化到 $O(|T| \cdot \text{fail 链长度})$。加上路径压缩后，每次转移都是 $O(1)$。

**3. Trie 的字符集范围没算对**

字符集不一定是 26 个小写字母。如果包含大写字母或数字，SIGMA 要相应调大。如果字符是 ASCII 全集，可以用 `map` 或 `unordered_map` 替代数组，但会损失常数。

**4. AC 自动机查询时沿 fail 链重复统计**

同一个模式串可能通过不同的 fail 链路径被多次统计。解决方案：在累加后将 `cnt[j]` 标记为 -1（或 0），保证每个匹配到的模式串只统计一次。

**5. Trie 节点数估算不足导致越界**

每个字符可能产生一个新节点，总节点数上限 = 所有模式串的字符数之和 + 1。竞赛中常开 $10^6$ 级别的数组。如果使用动态开点（`new` 节点），注意内存泄漏问题。

---

## 延伸阅读

- OI Wiki - KMP：https://oi-wiki.org/string/kmp/
- OI Wiki - Trie 字典树：https://oi-wiki.org/string/trie/
- OI Wiki - AC 自动机：https://oi-wiki.org/string/ac-automaton/
- OI Wiki - 字符串匹配概览：https://oi-wiki.org/string/match/
- CP-Algorithms - Prefix Function (KMP)：https://cp-algorithms.com/string/prefix-function.html
