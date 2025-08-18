'use client'

import { useCallback, useRef, useEffect } from 'react'

interface NavigationControllerProps {
  currentIndex: number
  totalPages: number
  isTransitioning: boolean
  onNavigate: (direction: 'next' | 'prev') => void
  onGoToFirst: () => void
  scrollThrottle?: number
}

export const NavigationController = ({
  currentIndex,
  totalPages,
  isTransitioning,
  onNavigate,
  onGoToFirst,
  scrollThrottle = 800
}: NavigationControllerProps) => {
  const lastScrollTime = useRef(0)
  const touchStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const touchEnd = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  // Wheel/scroll navigation
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    
    const now = Date.now()
    if (now - lastScrollTime.current < scrollThrottle) return
    lastScrollTime.current = now
    
    const direction = e.deltaY > 0 ? 'next' : 'prev'
    onNavigate(direction)
  }, [onNavigate, scrollThrottle])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault()
      onNavigate('next')
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault()
      onNavigate('prev')
    } else if (e.key === 'Home') {
      e.preventDefault()
      onGoToFirst()
    }
  }, [onNavigate, onGoToFirst])

  // Touch/swipe navigation
  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    }
  }, [])
  
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    touchEnd.current = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    }
    
    const diffX = touchStart.current.x - touchEnd.current.x
    const diffY = touchStart.current.y - touchEnd.current.y
    
    const minSwipeDistance = 50
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > minSwipeDistance) {
        const direction = diffX > 0 ? 'next' : 'prev'
        onNavigate(direction)
      }
    } else {
      if (Math.abs(diffY) > minSwipeDistance) {
        const direction = diffY > 0 ? 'next' : 'prev'
        onNavigate(direction)
      }
    }
  }, [onNavigate])

  // Set up event listeners
  useEffect(() => {
    const container = document.body
    
    container.addEventListener('wheel', handleWheel, { passive: false })
    document.addEventListener('keydown', handleKeyDown)
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })
    
    return () => {
      container.removeEventListener('wheel', handleWheel)
      document.removeEventListener('keydown', handleKeyDown)
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleWheel, handleKeyDown, handleTouchStart, handleTouchEnd])

  return null // This component doesn't render anything
}
