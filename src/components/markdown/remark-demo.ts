import type { Plugin } from 'unified'
import type { Root } from 'mdast'

const DEMO_RE = /<!--DEMO:([a-z0-9-]+)-->/

type DemoNode = {
  type: 'demo'
  name: string
  data?: { hName?: string; hProperties?: Record<string, unknown> }
}

export const remarkDemo: Plugin<[], Root> = () => (tree) => {
  const walk = (node: any) => {
    if (node.children && Array.isArray(node.children)) {
      node.children = node.children.flatMap((c: any) => {
        if (c.type === 'html' && typeof c.value === 'string') {
          const m = c.value.match(DEMO_RE)
          if (m) {
            const demo: DemoNode = {
              type: 'demo',
              name: m[1],
              data: { hName: 'demo', hProperties: { name: m[1] } },
            }
            return [demo]
          }
        }
        walk(c)
        return [c]
      })
    }
  }
  walk(tree)
}
