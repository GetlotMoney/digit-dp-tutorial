// Shiki 高亮器懒加载入口。
// 关键：所有重量级依赖（shiki/core → @shikijs/core + vscode-textmate,
// shiki/engine/oniguruma, @shikijs/langs/cpp, @shikijs/themes/*, shiki/wasm）
// 都通过动态 import() 加载，使它们脱离主 bundle，仅在第一个代码块渲染时
// 才被请求。getHighlighter() 复用同一个 promise 以避免重复加载。

export type Highlighter = Awaited<
  ReturnType<typeof import('shiki/core')['createHighlighterCore']>
>

let highlighterPromise: Promise<Highlighter> | null = null

export function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = (async () => {
      const [{ createHighlighterCore }, { createOnigurumaEngine }] =
        await Promise.all([
          import('shiki/core'),
          import('shiki/engine/oniguruma'),
        ])
      return createHighlighterCore({
        themes: [
          import('@shikijs/themes/github-light'),
          import('@shikijs/themes/github-dark'),
        ],
        langs: [
          import('@shikijs/langs/cpp'),
          import('@shikijs/langs/python'),
          import('@shikijs/langs/javascript'),
          import('@shikijs/langs/typescript'),
          import('@shikijs/langs/java'),
          import('@shikijs/langs/rust'),
          import('@shikijs/langs/go'),
          import('@shikijs/langs/bash'),
          import('@shikijs/langs/json'),
          import('@shikijs/langs/html'),
          import('@shikijs/langs/css'),
          import('@shikijs/langs/sql'),
          import('@shikijs/langs/markdown'),
          import('@shikijs/langs/yaml'),
          import('@shikijs/langs/xml'),
        ],
        engine: createOnigurumaEngine(import('shiki/wasm')),
      })
    })()
  }
  return highlighterPromise
}