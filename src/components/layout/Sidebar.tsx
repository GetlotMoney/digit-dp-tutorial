import { SidebarNav } from './SidebarNav'

export function Sidebar() {
  return (
    <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-border bg-background/50 px-3 py-6 md:block">
      <SidebarNav />
    </aside>
  )
}