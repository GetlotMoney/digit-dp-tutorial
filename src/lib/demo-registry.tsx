import { lazy, Suspense } from 'react'
import { DemoPlaceholder } from '@/components/markdown/DemoPlaceholder'

const demoRegistry: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  prefixsum: lazy(() => import('@/demos/PrefixSumDemo')),
  filldigits: lazy(() => import('@/demos/FillDigitsDemo')),
  memtree: lazy(() => import('@/demos/MemTreeDemo')),
  waviness: lazy(() => import('@/demos/WavinessDemo')),
  fullproblem: lazy(() => import('@/demos/FullProblemDemo')),
}

export function renderDemo(name: string) {
  const Comp = demoRegistry[name]
  if (!Comp) return <DemoPlaceholder name={name} />
  return (
    <Suspense fallback={<DemoPlaceholder name={name} loading />}>
      <Comp />
    </Suspense>
  )
}