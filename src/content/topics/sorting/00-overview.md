# 排序算法

排序是算法竞赛和工程开发中最基础的操作之一。把一组数据按特定顺序（升序或降序）重新排列，不仅本身是一类常见问题，更是二分查找、贪心、分治等高级算法的前置步骤。本章系统讲解竞赛中常用的八种排序算法，从最朴素的 $O(n^2)$ 排序到高效的 $O(n\log n)$ 排序，再到利用数据值域特性的线性排序。

<!--DEMO:sorting-visual-->

---

## 核心思想

排序算法可以从三个维度理解：

**1. 比较排序 vs 非比较排序**

比较排序通过元素之间的两两比较确定顺序，理论下界为 $O(n\log n)$。冒泡、选择、插入、归并、快排、堆排都属于比较排序。非比较排序利用数据本身的数值特征（如位数、出现次数），可以突破 $O(n\log n)$ 的下界，计数排序和基数排序属于此类。

**2. 稳定性**

如果相等元素在排序后保持原有的相对顺序，则该排序算法是**稳定**的。稳定性在多关键字排序中非常重要：先按第二关键字排，再按第一关键字稳定排序，即可完成双关键字排序。

| 算法 | 平均时间 | 最坏时间 | 空间 | 稳定性 |
|------|---------|---------|------|--------|
| 冒泡排序 | $O(n^2)$ | $O(n^2)$ | $O(1)$ | 稳定 |
| 选择排序 | $O(n^2)$ | $O(n^2)$ | $O(1)$ | 不稳定 |
| 插入排序 | $O(n^2)$ | $O(n^2)$ | $O(1)$ | 稳定 |
| 归并排序 | $O(n\log n)$ | $O(n\log n)$ | $O(n)$ | 稳定 |
| 快速排序 | $O(n\log n)$ | $O(n^2)$ | $O(\log n)$ | 不稳定 |
| 堆排序 | $O(n\log n)$ | $O(n\log n)$ | $O(1)$ | 不稳定 |
| 计数排序 | $O(n+k)$ | $O(n+k)$ | $O(k)$ | 稳定 |
| 基数排序 | $O(d \cdot n)$ | $O(d \cdot n)$ | $O(n+k)$ | 稳定 |

> 其中 $n$ 为元素个数，$k$ 为值域大小，$d$ 为最大位数。

**3. 分治与原地**

归并排序和快速排序都基于分治思想，但策略不同：归并是「先分后合」——递归拆成两半再合并；快排是「边分边排」——选基准元素划分后递归处理两侧。归并需要额外 $O(n)$ 空间但保证 $O(n\log n)$，快排原地排序但最坏退化到 $O(n^2)$。

---

## 模板代码

下面给出竞赛中最常用的三种排序的 C++ 模板，均经过反复验证，可以直接作为模板库使用。

### 归并排序（求逆序对）

归并排序在竞赛中最常见的用途是**求逆序对数量**，在合并过程中统计跨区间的逆序对即可。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 5e5 + 5;
int a[MAXN], tmp[MAXN]; // 原数组和临时数组
long long inv_cnt;       // 逆序对计数

// 归并排序：对 [l, r] 区间排序，同时统计逆序对
void merge_sort(int a[], int l, int r) {
    if (l >= r) return;
    int mid = (l + r) / 2;
    merge_sort(a, l, mid);       // 排左半
    merge_sort(a, mid + 1, r);   // 排右半

    // 合并过程
    int i = l, j = mid + 1, k = l;
    while (i <= mid && j <= r) {
        if (a[i] <= a[j]) {
            tmp[k++] = a[i++];
        } else {
            // a[i] > a[j]，说明左半的 a[i..mid] 都和 a[j] 构成逆序对
            inv_cnt += mid - i + 1;
            tmp[k++] = a[j++];
        }
    }
    while (i <= mid) tmp[k++] = a[i++];
    while (j <= r)   tmp[k++] = a[j++];
    for (int p = l; p <= r; p++) a[p] = tmp[p]; // 拷回原数组
}
```

### 快速排序

竞赛中手写快排比 `std::sort` 稍慢，但在需要自定义比较或理解原理时很有用。下面使用**三路划分**（Dutch National Flag），对含大量重复元素的数组更高效。

```cpp
#include <bits/stdc++.h>
using namespace std;

// 三路快排：将 [l, r] 分为 <pivot / ==pivot / >pivot 三段
void quick_sort(int a[], int l, int r) {
    if (l >= r) return;

    // 随机选基准，避免最坏情况
    int pivot = a[l + rand() % (r - l + 1)];
    int lt = l, gt = r, i = l;
    // 不变量：a[l..lt-1] < pivot, a[lt..i-1] == pivot, a[gt+1..r] > pivot
    while (i <= gt) {
        if (a[i] < pivot)      swap(a[lt++], a[i++]);
        else if (a[i] > pivot) swap(a[i], a[gt--]);
        else                   i++;
    }
    quick_sort(a, l, lt - 1);   // 递归排小于部分
    quick_sort(a, gt + 1, r);   // 递归排大于部分
}
```

### 计数排序

当值域 $k$ 不大（例如 $k \le 10^6$）时，计数排序是线性时间的最优选择。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 1e6 + 5;
int a[MAXN], cnt[MAXN], sorted_arr[MAXN];

// 计数排序：值域 [0, k]
void counting_sort(int n, int k) {
    memset(cnt, 0, sizeof(int) * (k + 1));
    // 统计每个值出现的次数
    for (int i = 0; i < n; i++) cnt[a[i]]++;
    // 前缀和：cnt[i] 表示 <= i 的元素个数
    for (int i = 1; i <= k; i++) cnt[i] += cnt[i - 1];
    // 从后往前遍历，保证稳定性
    for (int i = n - 1; i >= 0; i--) {
        sorted_arr[--cnt[a[i]]] = a[i];
    }
}
```

---

## 例题详解

### 例题 1：洛谷 P1908 逆序对

**题意：** 给定长度为 $n$ 的序列，求逆序对个数。逆序对定义：对于 $i < j$，若 $a_i > a_j$，则 $(i, j)$ 是一对逆序对。$n \le 5 \times 10^5$。

**思路：** 归并排序天然适合求逆序对。在合并两个有序子数组时，如果右半部分的元素 `a[j]` 比左半部分的 `a[i]` 小，说明左半部分从 `i` 到 `mid` 的所有元素都和 `a[j]` 构成逆序对，共 `mid - i + 1` 对。时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int MAXN = 5e5 + 5;
int a[MAXN], tmp[MAXN];
long long inv_cnt;

void merge_sort(int a[], int l, int r) {
    if (l >= r) return;
    int mid = (l + r) / 2;
    merge_sort(a, l, mid);
    merge_sort(a, mid + 1, r);
    int i = l, j = mid + 1, k = l;
    while (i <= mid && j <= r) {
        if (a[i] <= a[j]) {
            tmp[k++] = a[i++];
        } else {
            inv_cnt += mid - i + 1; // 统计逆序对
            tmp[k++] = a[j++];
        }
    }
    while (i <= mid) tmp[k++] = a[i++];
    while (j <= r)   tmp[k++] = a[j++];
    for (int p = l; p <= r; p++) a[p] = tmp[p];
}

int main() {
    int n;
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    merge_sort(a, 0, n - 1);
    printf("%lld\n", inv_cnt);
    return 0;
}
```

### 例题 2：LeetCode 912 排序数组

**题意：** 给定整数数组 `nums`，将数组升序排列。

**思路：** 本题考察排序算法的实现能力。这里使用堆排序：先建最大堆（$O(n)$），然后反复取堆顶放到末尾（$O(n\log n)$）。堆排序的优势在于原地排序且最坏情况仍为 $O(n\log n)$。

```cpp
class Solution {
public:
    // 下沉操作：维护堆性质
    void sift_down(vector<int>& a, int n, int i) {
        while (true) {
            int largest = i;
            int l = 2 * i + 1, r = 2 * i + 2;
            if (l < n && a[l] > a[largest]) largest = l;
            if (r < n && a[r] > a[largest]) largest = r;
            if (largest == i) break;
            swap(a[i], a[largest]);
            i = largest;
        }
    }

    vector<int> sortArray(vector<int>& nums) {
        int n = nums.size();
        // 建堆：从最后一个非叶节点开始下沉
        for (int i = n / 2 - 1; i >= 0; i--)
            sift_down(nums, n, i);
        // 逐个取出堆顶
        for (int i = n - 1; i > 0; i--) {
            swap(nums[0], nums[i]);  // 堆顶放到末尾
            sift_down(nums, i, 0);   // 对前 i 个元素维护堆
        }
        return nums;
    }
};
```

---

## 练习题单

| # | 平台 | 题号/名称 | 难度 | 关键词 |
|---|------|----------|------|--------|
| 1 | 洛谷 | P1177 【模板】快速排序 | 入门 | 快排模板 |
| 2 | 洛谷 | P1908 逆序对 | 入门 | 归并排序求逆序对 |
| 3 | LeetCode | 912 排序数组 | 入门 | 手写排序 |
| 4 | LeetCode | 215 数组中的第K个最大元素 | 进阶 | 快速选择 / 堆排序 |
| 5 | LeetCode | 56 合并区间 | 进阶 | 排序 + 贪心合并 |
| 6 | 洛谷 | P1090 合并果子（哈夫曼） | 进阶 | 小顶堆 + 贪心 |
| 7 | Codeforces | 762B USB vs PS/2 | 进阶 | 多关键字排序 + 贪心 |
| 8 | 洛谷 | P1168 中位数 | 综合 | 对顶堆 / 插入排序变体 |

---

## 常见错误

**1. 快排不加随机化导致超时**

当数组近乎有序或全部相同时，朴素快排（始终选第一个元素为基准）退化到 $O(n^2)$。解法：使用随机基准或三路划分。竞赛中如果数据量较大且卡常，建议直接使用 `std::sort`。

**2. 归并排序忘记拷回原数组**

`merge_sort` 的临时数组 `tmp` 存储了合并结果，必须在每层递归结束时拷回原数组，否则上层读到的还是未排序的数据。

**3. 计数排序的值域偏移**

当数组元素包含负数时，直接用元素值做下标会越界。处理方法：先找到最小值 `minv`，用 `a[i] - minv` 做下标映射到 $[0, k]$ 范围。

**4. 逆序对计数用 `int` 溢出**

长度为 $n$ 的数组最多有 $n(n-1)/2$ 个逆序对，当 $n = 5 \times 10^5$ 时结果约 $1.25 \times 10^{11}$，超出 `int` 范围。必须用 `long long` 存储。

**5. 混淆排序的稳定性**

`std::sort` 是不稳定的（通常基于快排或内省排序），需要稳定排序时应使用 `std::stable_sort`（基于归并）。选择排序和堆排序也是不稳定的。

---

## 延伸阅读

- OI Wiki - 排序：https://oi-wiki.org/basic/sort/
- OI Wiki - 快速排序：https://oi-wiki.org/basic/quick-sort/
- OI Wiki - 归并排序：https://oi-wiki.org/basic/merge-sort/
- VisuAlgo 排序可视化：https://visualgo.net/en/sorting
- 《算法导论》第 2 章和第 6-8 章
