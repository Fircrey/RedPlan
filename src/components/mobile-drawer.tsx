'use client'

import { useState, useRef, useCallback } from 'react'

interface MobileDrawerProps {
  children: React.ReactNode
  title?: string
}

export function MobileDrawer({ children, title = 'Panel' }: MobileDrawerProps) {
  const [expanded, setExpanded] = useState(false)
  const startY = useRef(0)
  const dragging = useRef(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
    dragging.current = true
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!dragging.current) return
    dragging.current = false
    const diff = startY.current - e.changedTouches[0].clientY
    if (Math.abs(diff) > 30) {
      setExpanded(diff > 0)
    }
  }, [])

  return (
    <>
      {/* Desktop: normal sidebar */}
      <div className="hidden md:block w-96 flex-shrink-0 border-r border-[var(--color-border)] overflow-hidden">
        {children}
      </div>

      {/* Mobile: bottom sheet */}
      <div
        aria-label={title}
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-surface)] border-t border-[var(--color-border)] rounded-t-2xl shadow-lg transition-[max-height] duration-300 ease-in-out ${
          expanded ? 'max-h-[70vh]' : 'max-h-[80px]'
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <button
          onClick={() => setExpanded(!expanded)}
          aria-label={expanded ? `Cerrar ${title}` : `Abrir ${title}`}
          className="w-full flex flex-col items-center pt-2 pb-3 px-4 cursor-pointer"
        >
          <div className="w-10 h-1 rounded-full bg-[var(--color-border)] mb-2" />
          <span className="text-sm font-semibold text-[var(--color-text)]">{title}</span>
        </button>

        {/* Content */}
        <div className={`overflow-y-auto transition-opacity duration-200 ${
          expanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`} style={{ maxHeight: 'calc(70vh - 80px)' }}>
          {children}
        </div>
      </div>
    </>
  )
}
