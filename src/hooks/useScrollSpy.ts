import { useEffect, useState } from 'react'

export function useScrollSpy(ids: string[], offset = 0) {
  const [active, setActive] = useState(ids[0] ?? '')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) {
          setActive(visible[0].target.id)
        }
      },
      {
        // 把激活区压在视口中部，避免章节淡入动画导致抖动
        rootMargin: '-40% 0px -55% 0px',
        threshold: 0,
      },
    )

    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [ids.join(','), offset])

  return active
}
