-- 博客文章表
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',        -- HTML 内容（来自 TipTap 编辑器）
  react_code TEXT DEFAULT '',              -- JSX 代码（仅管理员可用）
  tags TEXT[] DEFAULT '{}',                -- 例如 ['算法', 'DP']
  category TEXT DEFAULT '博客',            -- 例如 '算法', '数据结构', '学习笔记', '博客'
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT DEFAULT '',
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 策略
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- 任何人都可以阅读已发布的文章
CREATE POLICY "Public can read published posts" ON blog_posts
  FOR SELECT USING (published = true);

-- 作者可以阅读自己未发布的文章
CREATE POLICY "Authors can read own posts" ON blog_posts
  FOR SELECT USING (auth.uid() = author_id);

-- 已登录用户可以创建文章
CREATE POLICY "Authenticated users can create posts" ON blog_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 作者可以更新自己的文章
CREATE POLICY "Authors can update own posts" ON blog_posts
  FOR UPDATE USING (auth.uid() = author_id);

-- 作者可以删除自己的文章
CREATE POLICY "Authors can delete own posts" ON blog_posts
  FOR DELETE USING (auth.uid() = author_id);

-- 查询索引
CREATE INDEX idx_blog_posts_published ON blog_posts(published, created_at DESC);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_tags ON blog_posts USING GIN(tags);

-- updated_at 自动更新触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 将某个用户设为管理员（请替换 <user-id> 为实际用户 ID）
-- 在 Supabase SQL Editor 中运行：
-- UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role":"admin"}' WHERE id = '<user-id>';
-- ============================================================
