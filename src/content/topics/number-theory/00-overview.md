# 数论基础

数论是研究整数性质的数学分支，在算法竞赛中无处不在。从素数筛到模运算，从快速幂到中国剩余定理，数论工具是解决许多问题的基石。无论你是在做组合计数、密码学模拟还是纯数学推导，掌握这些基础工具都是必不可少的。本章系统梳理竞赛中最常用的数论知识，包括素数判定与筛法、GCD/LCM、裴蜀定理、模逆元、费马小定理、欧拉定理和中国剩余定理。

<!--DEMO:number-theory-->

---

## 核心思想

数论的核心在于**整除与同余**。整数之间的整除关系构成了素数、因数等基本概念；而同余（$a \equiv b \pmod{m}$）则是在模意义下做加减乘运算的理论基础。

**1. 素数与筛法**

一个大于 1 的整数 $p$，如果只有 1 和 $p$ 两个正因数，则称 $p$ 为素数。判断单个数是否为素数，最朴素的方法是试除到 $\sqrt{n}$，时间 $O(\sqrt{n})$。当我们需要批量求出 $[2, n]$ 内的所有素数时，更高效的做法是**埃拉托斯特尼筛法**（埃氏筛），时间 $O(n\log\log n)$；进一步优化为**欧拉筛**（线性筛），时间严格 $O(n)$。

**2. GCD 与 LCM**

最大公约数 $\gcd(a, b)$ 可用**辗转相除法**（欧几里得算法）快速求解：

$$\gcd(a, b) = \begin{cases} a, & b = 0 \\ \gcd(b, \, a \bmod b), & b \neq 0 \end{cases}$$

最小公倍数与最大公约数的关系：$\text{lcm}(a, b) = \frac{a \times b}{\gcd(a, b)}$。在计算时先除后乘，避免溢出。

**3. 裴蜀定理（Bézout 定理）**

对于任意整数 $a, b$，方程 $ax + by = c$ 有整数解的充要条件是 $\gcd(a, b) \mid c$。特别地，$ax + by = \gcd(a, b)$ 一定有解，可以通过扩展欧几里得算法（exgcd）求出一组特解。

**4. 模逆元**

在模 $m$ 意义下，$a$ 的逆元 $a^{-1}$ 满足 $a \cdot a^{-1} \equiv 1 \pmod{m}$。逆元存在的充要条件是 $\gcd(a, m) = 1$。竞赛中求模逆元的常用方法：

- **费马小定理**：当 $m$ 为素数时，$a^{-1} \equiv a^{m-2} \pmod{m}$，用快速幂计算。
- **扩展欧几里得**：解 $ax + my = 1$，得到的 $x$ 即为 $a$ 的逆元（不要求 $m$ 为素数）。

**5. 费马小定理与欧拉定理**

费马小定理：若 $p$ 为素数且 $\gcd(a, p) = 1$，则：

$$a^{p-1} \equiv 1 \pmod{p}$$

欧拉定理是费马小定理的推广：若 $\gcd(a, m) = 1$，则：

$$a^{\varphi(m)} \equiv 1 \pmod{m}$$

其中 $\varphi(m)$ 是欧拉函数，表示 $[1, m]$ 中与 $m$ 互素的整数个数。当 $m$ 为素数时 $\varphi(m) = m - 1$，退化为费马小定理。

欧拉定理的重要应用：当指数 $b$ 很大时，可以在模 $\varphi(m)$ 意义下化简幂次，即 $a^b \equiv a^{b \bmod \varphi(m)} \pmod{m}$（前提是 $\gcd(a, m) = 1$）。

**6. 中国剩余定理（CRT）**

给定一组同余方程：

$$\begin{cases} x \equiv a_1 \pmod{m_1} \\ x \equiv a_2 \pmod{m_2} \\ \quad \vdots \\ x \equiv a_k \pmod{m_k} \end{cases}$$

当 $m_1, m_2, \dots, m_k$ 两两互素时，方程组在模 $M = m_1 m_2 \cdots m_k$ 意义下有唯一解。设 $M_i = M / m_i$，$t_i$ 为 $M_i$ 在模 $m_i$ 下的逆元，则：

$$x \equiv \sum_{i=1}^{k} a_i \cdot M_i \cdot t_i \pmod{M}$$

<!--DEMO:mod-inverse-->

---

## 模板代码

下面给出竞赛中常用的数论模板，经过反复验证，可直接用于做题。

### 欧几里得算法与扩展欧几里得

```cpp
#include <bits/stdc++.h>
using namespace std;

// 辗转相除法求 GCD
long long gcd(long long a, long long b) {
    return b == 0 ? a : gcd(b, a % b);
}

// LCM：先除后乘防溢出
long long lcm(long long a, long long b) {
    return a / gcd(a, b) * b;
}

// 扩展欧几里得：求 ax + by = gcd(a, b) 的一组特解
// 返回 gcd(a, b)，x 和 y 为引用参数
long long exgcd(long long a, long long b, long long &x, long long &y) {
    if (b == 0) {
        x = 1; y = 0;
        return a;
    }
    long long d = exgcd(b, a % b, y, x);
    y -= a / b * x;
    return d;
}
```

### 快速幂与模逆元

```cpp
#include <bits/stdc++.h>
using namespace std;

// 快速幂：计算 a^b mod p，时间 O(log b)
long long qpow(long long a, long long b, long long p) {
    a %= p;
    long long res = 1;
    while (b > 0) {
        if (b & 1) res = res * a % p;
        a = a * a % p;
        b >>= 1;
    }
    return res;
}

// 费马小定理求逆元（p 必须为素数）
long long inv_fermat(long long a, long long p) {
    return qpow(a, p - 2, p);
}

// 扩展欧几里得求逆元（不要求 p 为素数，要求 gcd(a, p) = 1）
long long inv_exgcd(long long a, long long p) {
    long long x, y;
    exgcd(a, p, x, y); // 复用上面的 exgcd
    return (x % p + p) % p; // 保证结果为正
}
```

### 素数筛（欧拉筛 / 线性筛）

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1e7 + 5;
bool is_composite[MAXN]; // true 表示合数
int primes[MAXN];        // 存储所有素数
int prime_cnt;           // 素数个数

// 欧拉筛：每个合数只被其最小素因子筛掉，时间严格 O(n)
void euler_sieve(int n) {
    prime_cnt = 0;
    for (int i = 2; i <= n; i++) {
        if (!is_composite[i]) primes[prime_cnt++] = i;
        for (int j = 0; j < prime_cnt && (long long)i * primes[j] <= n; j++) {
            is_composite[i * primes[j]] = true;
            if (i % primes[j] == 0) break; // 关键：保证每个合数只被最小素因子筛
        }
    }
}
```

### 欧拉函数（单个）

```cpp
// 求 phi(n)：1 到 n 中与 n 互素的数的个数
long long euler_phi(long long n) {
    long long res = n;
    for (long long i = 2; i * i <= n; i++) {
        if (n % i == 0) {
            res = res / i * (i - 1); // 乘上 (1 - 1/p)
            while (n % i == 0) n /= i;
        }
    }
    if (n > 1) res = res / n * (n - 1); // n 本身是素因子
    return res;
}
```

### 中国剩余定理

```cpp
// CRT：求解 x ≡ a[i] (mod m[i])，m[] 两两互素
// 返回 [0, M) 内的唯一解，M = m[1]*m[2]*...*m[k]
long long crt(vector<long long> &a, vector<long long> &m, int k) {
    long long M = 1, x = 0;
    for (int i = 0; i < k; i++) M *= m[i];
    for (int i = 0; i < k; i++) {
        long long Mi = M / m[i];
        long long ti, tmp;
        exgcd(Mi, m[i], ti, tmp); // 求 Mi 模 m[i] 的逆元
        x = (x + a[i] * Mi % M * ((ti % M + M) % M)) % M;
    }
    return (x % M + M) % M;
}
```

---

## 例题详解

### 例题 1：洛谷 P3811 【模板】模意义下的乘法逆元

**题意：** 给定正整数 $n, p$，求 $1 \sim n$ 中每个整数在模 $p$ 意义下的逆元。$n \le 3 \times 10^6$，$p$ 为素数。

**思路：** 如果对每个数分别用费马小定理求逆元，总时间 $O(n \log p)$，会超时。利用递推公式可以在 $O(n)$ 时间内求出所有逆元。推导如下：设 $p = k \cdot i + r$（即 $p \bmod i = r$），在模 $p$ 意义下 $k \cdot i + r \equiv 0$，两边乘 $i^{-1} \cdot r^{-1}$ 得：

$$i^{-1} \equiv -k \cdot r^{-1} \equiv -\lfloor p / i \rfloor \cdot (p \bmod i)^{-1} \pmod{p}$$

这样 $i$ 的逆元可以用 $p \bmod i$ 的逆元递推得到。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 3e6 + 5;
long long inv[MAXN]; // inv[i] 存储 i 在模 p 下的逆元

int main() {
    int n, p;
    scanf("%d%d", &n, &p);
    inv[1] = 1;
    printf("%lld\n", inv[1]);
    for (int i = 2; i <= n; i++) {
        // 递推公式：inv[i] = -(p/i) * inv[p%i] (mod p)
        inv[i] = (long long)(p - p / i) * inv[p % i] % p;
        printf("%lld\n", inv[i]);
    }
    return 0;
}
```

### 例题 2：洛谷 P1495 【模板】中国剩余定理

**题意：** 给定 $k$ 组同余方程 $x \equiv a_i \pmod{m_i}$，其中 $m_i$ 两两互素，求满足所有方程的最小正整数解。$k \le 10$，$m_i \le 10^9$。

**思路：** 直接套用中国剩余定理的公式。需要注意中间过程可能溢出 `long long`，需要用到快速乘（或 `__int128`）。下面的代码使用了简单的取模快速乘。

```cpp
#include <bits/stdc++.h>
using namespace std;

// 快速乘：计算 a*b mod p，防溢出
long long mul(long long a, long long b, long long p) {
    a %= p; b %= p;
    long long res = 0;
    while (b > 0) {
        if (b & 1) res = (res + a) % p;
        a = (a + a) % p;
        b >>= 1;
    }
    return res;
}

long long exgcd(long long a, long long b, long long &x, long long &y) {
    if (b == 0) { x = 1; y = 0; return a; }
    long long d = exgcd(b, a % b, y, x);
    y -= a / b * x;
    return d;
}

int main() {
    int n;
    scanf("%d", &n);
    vector<long long> a(n), m(n);
    long long M = 1;
    for (int i = 0; i < n; i++) {
        scanf("%lld%lld", &m[i], &a[i]);
        M *= m[i];
    }
    long long x = 0;
    for (int i = 0; i < n; i++) {
        long long Mi = M / m[i];
        long long ti, tmp;
        exgcd(Mi, m[i], ti, tmp);
        ti = (ti % m[i] + m[i]) % m[i];
        x = (x + mul(mul(a[i], Mi, M), ti, M)) % M;
    }
    printf("%lld\n", (x % M + M) % M);
    return 0;
}
```

---

## 练习题单

| # | 平台 | 题号/名称 | 难度 | 关键词 |
|---|------|----------|------|--------|
| 1 | 洛谷 | P3383 【模板】线性筛素数 | 入门 | 欧拉筛 |
| 2 | 洛谷 | P3811 【模板】模意义下的乘法逆元 | 入门 | 逆元递推 |
| 3 | 洛谷 | P1082 同余方程 | 入门 | 扩展欧几里得 |
| 4 | 洛谷 | P1495 【模板】中国剩余定理 | 进阶 | CRT |
| 5 | 洛谷 | P2158 仪仗队 | 进阶 | 欧拉函数 |
| 6 | 洛谷 | P3868 TJOI2009 猜数字 | 进阶 | CRT + 快速乘 |
| 7 | Codeforces | 17A Noldbach Problem | 入门 | 素数判定 |
| 8 | LeetCode | 204 计数质数 | 进阶 | 埃氏筛优化 |

---

## 常见错误

**1. 逆元计算时混淆费马小定理和扩展欧几里得的适用条件**

费马小定理要求模数 $p$ 是素数；如果模数不是素数，必须使用扩展欧几里得求逆元。常见错误：对合数模数直接用 `qpow(a, p - 2, p)`，结果完全错误。

**2. LCM 计算顺序导致溢出**

$\text{lcm}(a, b) = a \times b / \gcd(a, b)$ 如果先算乘法再除，当 $a, b$ 接近 $10^9$ 时乘积溢出 `long long`。正确做法：$a / \gcd(a, b) \times b$，先除后乘。

**3. 欧氏筛中 `i * primes[j]` 溢出**

在欧拉筛的内层循环中，`i * primes[j]` 可能超出 `int` 范围。应写成 `(long long)i * primes[j]`，或者直接声明变量为 `long long`。

**4. CRT 中间过程溢出**

中国剩余定理的计算涉及多个大数相乘再取模，即使最终结果在 `long long` 范围内，中间乘积也可能溢出。必须使用快速乘或 `__int128`。

**5. 扩展欧几里得返回的 $x$ 为负数**

`exgcd` 求出的解 $x$ 可能为负数，使用时需要取正：`(x % p + p) % p`。很多调试了半天的 bug 都是忘做这一步导致的。

---

## 延伸阅读

- OI Wiki - 质数（素数）：https://oi-wiki.org/math/number-theory/prime/
- OI Wiki - 最大公约数：https://oi-wiki.org/math/number-theory/gcd/
- OI Wiki - 欧拉函数：https://oi-wiki.org/math/number-theory/euler/
- OI Wiki - 中国剩余定理：https://oi-wiki.org/math/number-theory/crt/
- OI Wiki - 费马小定理：https://oi-wiki.org/math/number-theory/fermat/
- OI Wiki - 乘法逆元：https://oi-wiki.org/math/number-theory/inverse/
- 《算法竞赛进阶指南》第 0x04 节：数论
