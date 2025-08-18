'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PersistentBackground } from './PersistentBackground'
import { PageContent } from './PageContent'
import { PageNavigation } from './PageNavigation'
import { AudioToggle } from './AudioToggle'
import { ShareButton } from './ShareButton'
import { PAGES_DATA, PageData } from '@/data/pages'

interface PersistentLayoutProps {
  className?: string
}

export function PersistentLayout({ className = "" }: PersistentLayoutProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [showMobileHint, setShowMobileHint] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentPage = PAGES_DATA[currentPageIndex]
  const totalPages = PAGES_DATA.length

  // Audio initialization
  useEffect(() => {
    const audio = new Audio('/track.mp3')
    audio.loop = true
    audio.volume = 0.3
    audio.preload = 'auto'
    
    audio.addEventListener('canplaythrough', () => {
      console.log('🎵 Audio ready to play')
      audio.play().then(() => {
        console.log('✅ Audio started playing automatically')
        setIsAudioPlaying(true)
      }).catch((error) => {
        console.log('❌ Auto-play failed:', error)
        setIsAudioPlaying(false)
      })
    })

    audio.addEventListener('play', () => {
      console.log('▶️ Audio started playing')
      setIsAudioPlaying(true)
    })

    audio.addEventListener('pause', () => {
      console.log('⏸️ Audio paused')
      setIsAudioPlaying(false)
    })

    setAudioElement(audio)

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [])

  // Load audio preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('audioEnabled')
    if (saved !== null) {
      const enabled = JSON.parse(saved)
      setAudioEnabled(enabled)
      
      if (enabled && audioElement && audioElement.paused) {
        audioElement.play().catch(console.error)
      }
    }
  }, [audioElement])

  // Save audio preference to localStorage
  useEffect(() => {
    localStorage.setItem('audioEnabled', JSON.stringify(audioEnabled))
  }, [audioEnabled])

  // Handle audio toggle
  const handleAudioToggle = useCallback((enabled: boolean) => {
    if (audioElement) {
      if (enabled) {
        audioElement.play().then(() => {
          setIsAudioPlaying(true)
          console.log('✅ Audio unmuted and playing')
        }).catch((error) => {
          console.log('❌ Failed to resume audio:', error)
          setIsAudioPlaying(false)
        })
      } else {
        audioElement.pause()
        setIsAudioPlaying(false)
        console.log('🔇 Audio muted')
      }
    }
    
    setAudioEnabled(enabled)
  }, [audioElement])

  // Navigation functions
  const navigateToPage = useCallback((direction: 'next' | 'prev') => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    
    if (direction === 'next' && currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(prev => prev + 1)
    } else if (direction === 'prev' && currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1)
    }
    
    setTimeout(() => setIsTransitioning(false), 100)
  }, [currentPageIndex, totalPages, isTransitioning])

  const goToFirst = useCallback(() => {
    if (isTransitioning || currentPageIndex === 0) return
    
    setIsTransitioning(true)
    setCurrentPageIndex(0)
    setTimeout(() => setIsTransitioning(false), 100)
  }, [currentPageIndex, isTransitioning])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault()
      navigateToPage('next')
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault()
      navigateToPage('prev')
    } else if (e.key === 'Home') {
      e.preventDefault()
      goToFirst()
    }
  }, [navigateToPage, goToFirst])

  // Touch/swipe navigation
  const touchStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const touchEnd = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  
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
        navigateToPage(direction)
      }
    } else {
      if (Math.abs(diffY) > minSwipeDistance) {
        const direction = diffY > 0 ? 'next' : 'prev'
        navigateToPage(direction)
      }
    }
  }, [navigateToPage])

  // Event listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    document.addEventListener('keydown', handleKeyDown)
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleKeyDown, handleTouchStart, handleTouchEnd])

  // User interaction for audio
  useEffect(() => {
    const handleUserInteraction = async () => {
      if (audioElement && audioElement.paused && audioEnabled) {
        try {
          await audioElement.play()
          console.log('✅ Audio started on user interaction')
          setIsAudioPlaying(true)
        } catch (error) {
          console.log('❌ Failed to start audio on user interaction:', error)
        }
      }
    }

    const events = ['click', 'mousedown', 'touchstart', 'keydown']
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true, passive: true })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction)
      })
    }
  }, [audioElement, audioEnabled])

  // Mobile hint
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    if (isMobile) {
      setShowMobileHint(true)
      const timer = setTimeout(() => setShowMobileHint(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className={`relative h-screen w-screen overflow-hidden touch-scroll ${className}`}
    >
      {/* Persistent Background - Never unmounts */}
      <PersistentBackground 
        currentPage={currentPage}
        className="absolute inset-0 z-0"
      />

      {/* Main content */}
      <main className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 min-h-screen">
        <AnimatePresence mode="sync">
          <PageContent 
            key={currentPage.id}
            page={currentPage}
          />
        </AnimatePresence>
      </main>

      {/* Mobile navigation hint */}
      {showMobileHint && (
        <motion.div
          className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <span>👆 Swipe up/down or left/right to navigate</span>
          </div>
        </motion.div>
      )}

      {/* Navigation and Controls */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20">
        <PageNavigation
          currentPage={currentPage}
          totalPages={totalPages}
          onNavigate={navigateToPage}
          onGoToFirst={goToFirst}
        />
      </div>

      {/* Audio and Share controls - positioned separately for better layout */}
      <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 z-20 flex items-center gap-2">
        <AudioToggle 
          enabled={audioEnabled} 
          onToggle={handleAudioToggle} 
        />
        <ShareButton />
      </div>
    </div>
  )
}



