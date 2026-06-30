# 开发进度总结

## 已完成功能清单

### 一、LandingAuthPage — 未登录落地页
- **文件**：`src/pages/LandingAuthPage.tsx`（新建）
- **功能**：
  - 全屏 indigo-violet 渐变背景，与主页 Hero 视觉一致
  - 浮动数字方格动画（3, 2, 4, 7, 9, 1），支持 `useReducedMotion` 无障碍降级
  - 大标题「咕嘎学不会算法」+ 副标题
  - 登录/注册双按钮 CTA
  - 无导航栏、无 footer，纯落地页

### 二、App.tsx — 全局鉴权路由保护
- **文件**：`src/App.tsx`（已修改）
- **功能**：
  - `loading` 状态时显示全屏 spinner
  - 未登录 + 非公开路径（`/login`, `/register`）→ 渲染 `LandingAuthPage`
  - 已登录 或 公开路径 → 正常布局（TopBar + AnimatePresence(Outlet) + Footer）
  - AuthProvider 包裹在最外层
  - `useLocation()` 判断当前路径

### 三、BlogEditorPage — 博客编辑器
- **文件**：`src/pages/BlogEditorPage.tsx`（新建）
- **功能**：
  - TipTap 富文本编辑器（bold, italic, underline, headings, lists, code block, link, image）
  - HTML 源码模式切换（textarea ↔ TipTap 双向同步）
  - 分类下拉选择（算法/数据结构/学习笔记/博客/其他）
  - 逗号分隔标签输入，带 Badge 预览
  - 发布/草稿 checkbox 切换
  - 管理员专属「React 组件」textarea（写 JSX，以 iframe 沙盒渲染）
  - 预览弹窗（展示格式化内容）
  - 保存调用 `blog-service.createPost` / `updatePost`
  - 编辑模式：根据 URL 参数 `:id` 加载已有文章

### 四、router.tsx — 路由更新
- **文件**：`src/router.tsx`（已修改）
- **新增路由**：
  - `/blog/new` → `BlogEditorPage`（新建文章）
  - `/blog/edit/:id` → `BlogEditorPage`（编辑文章）
  - 注意：`/blog/:slug` 放在新路由之后，避免路由冲突

### 五、BlogListPage — 博客列表页（重写）
- **文件**：`src/pages/BlogListPage.tsx`（已修改）
- **功能**：
  - 从 Supabase 加载已发布文章（`getPublishedPosts`）
  - 分类筛选 + 标签筛选双维度过滤
  - 显示文章标题、日期、作者名、分类 Badge、标签列表
  - 每篇文章链接到 `/blog/:id`
  - 管理员可见「写博客」按钮 → `/blog/new`
  - 加载/错误状态处理

### 六、BlogPostPage — 博客文章详情页（重写）
- **文件**：`src/pages/BlogPostPage.tsx`（已修改）
- **功能**：
  - 从 Supabase 按 ID 加载文章（`getPostById`）
  - `dangerouslySetInnerHTML` 渲染 TipTap 生成的 HTML
  - 文章头部：标题、日期、作者名、分类、标签
  - 作者可见「编辑」按钮 → `/blog/edit/:id`
  - 作者可见「删除」按钮 + 确认弹窗（`deletePost`）
  - React 组件渲染（`ReactSandbox`）：用 iframe 沙盒 + Babel Standalone 运行 JSX
  - 404 状态处理

### 七、useAuth — 新增 isAdmin 属性
- **文件**：`src/hooks/useAuth.tsx`（已修改）
- **功能**：
  - `isAdmin` 基于 `user.user_metadata?.role === 'admin'` 计算
  - 暴露到 context，供博客编辑器和列表页使用

### 八、blog-service.ts — Supabase 博客服务层
- **文件**：`src/lib/blog-service.ts`（已存在）
- **使用的函数**：
  - `getPublishedPosts(filters?)` — 获取已发布文章
  - `getPostById(id)` — 按 ID 获取单篇文章
  - `createPost(post)` — 创建新文章
  - `updatePost(id, updates)` — 更新文章
  - `deletePost(id)` — 删除文章
  - `getAllCategories()` — 获取所有分类
  - `getAllTags()` — 获取所有标签

### 九、其他安装依赖
- `@tailwindcss/typography` — 已安装（用于 TipTap 编辑器内容区域的 `prose` 排版）

---

## 文件变更总览

| 文件 | 状态 | 说明 |
|------|------|------|
| `src/pages/LandingAuthPage.tsx` | **新建** | 未登录落地页 |
| `src/pages/BlogEditorPage.tsx` | **新建** | 博客编辑器 |
| `src/App.tsx` | **修改** | 全局鉴权逻辑 |
| `src/router.tsx` | **修改** | 新增 /blog/new、/blog/edit/:id |
| `src/pages/BlogListPage.tsx` | **重写** | 接入 Supabase |
| `src/pages/BlogPostPage.tsx` | **重写** | 接入 Supabase + React 沙盒 |
| `src/hooks/useAuth.tsx` | **修改** | 新增 isAdmin |

## 技术细节

### TipTap 编辑器
- 使用 `@tiptap/react` + `@tiptap/starter-kit`
- 扩展：`underline`, `link`, `image`, `placeholder`, `code-block-lowlight`（使用 `lowlight` 的 `common` 语言包）
- 工具栏使用 `Button` 组件 + lucide-react 图标
- HTML 源码模式：textarea 与编辑器内容双向同步

### ReactSandbox
- 使用 CDN 加载 React 18.3.1 + Babel Standalone 7.24.7
- `sandbox="allow-scripts"` 限制 iframe 权限
- 要求代码导出 `App` 组件

### 鉴权逻辑
- `PUBLIC_PATHS = ['/login', '/register']` 列为公开路径
- 未登录访问非公开路径 → `LandingAuthPage`（不显示 TopBar/Footer）
- 已登录用户正常访问所有路由

---

## 待办（下周可续）

1. **将 TipTap 内容渲染为 Markdown/HTML**：目前直接存 HTML，后续可考虑转 Markdown 存储
2. **图片上传**：目前插入图片只支持 URL，后续可接入 Supabase Storage
3. **评论系统**：博客文章评论功能
4. **搜索功能**：博客全文搜索
5. **草稿列表**：作者可见自己未发布文章的管理页
6. **TipTap 图片拖拽上传**：更好的编辑体验
7. **代码高亮主题**：TipTap 代码块的暗色/亮色主题适配
