'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { PAGES_DATA, PageData } from '@/data/pages'
import { AudioToggle } from '@/components/AudioToggle'
import { ShareButton } from '@/components/ShareButton'

export default function Home() {
  const [currentSection, setCurrentSection] = useState(0)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [nextSection, setNextSection] = useState<number | null>(null)
  const [imageBaseSection, setImageBaseSection] = useState(0)
  
  const containerRef = useRef<HTMLDivElement>(null)

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

  // Preload images for instant display
  useEffect(() => {
    const preloadAllImages = () => {
      console.log('🖼️ Preloading all background images for instant display...')
      
      PAGES_DATA.forEach((page, index) => {
        const img = new Image()
        img.onload = () => {
          console.log(`✅ Image ${index + 1} loaded: ${page.backgroundImage}`)
        }
        img.onerror = () => {
          console.log(`❌ Failed to load image ${index + 1}: ${page.backgroundImage}`)
        }
        img.src = page.backgroundImage
      })
    }
    
    preloadAllImages()
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

  // Smooth transition navigation to section - image and text change simultaneously
  const goToSection = useCallback((sectionIndex: number, direction: 'next' | 'prev' | null = null) => {
    if (isTransitioning || sectionIndex === currentSection) return
    
    // Start transition: prepare both image and text for simultaneous change
    setIsTransitioning(true)
    setNextSection(sectionIndex)
    
    // Complete transition after animation - image and text change together
    setTimeout(() => {
      setCurrentSection(sectionIndex)
      setImageBaseSection(sectionIndex)
      setIsTransitioning(false)
      setNextSection(null)
    }, 300) // Match CSS transition duration
  }, [currentSection, isTransitioning])

  // Instant navigation to section - image and text change simultaneously
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === ' ') {
      e.preventDefault()
      if (currentSection < PAGES_DATA.length - 1) {
        goToSection(currentSection + 1, 'next')
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (currentSection > 0) {
        goToSection(currentSection - 1, 'prev')
      }
    }
  }, [currentSection, goToSection])

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
        // Horizontal swipe - could be used for additional navigation
        // Start audio on horizontal swipe
        if (audioElement && audioElement.paused && audioEnabled) {
          audioElement.play().catch(console.error)
        }
      }
    } else {
      if (Math.abs(diffY) > minSwipeDistance) {
        const direction = diffY > 0 ? 'next' : 'prev'
        
        if (direction === 'next' && currentSection < PAGES_DATA.length - 1) {
          goToSection(currentSection + 1, 'next')
        } else if (direction === 'prev' && currentSection > 0) {
          goToSection(currentSection - 1, 'prev')
        }
        
        // Start audio on vertical swipe
        if (audioElement && audioElement.paused && audioEnabled) {
          audioElement.play().catch(console.error)
        }
      }
    }
  }, [currentSection, goToSection, audioElement, audioEnabled])

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

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                    window.innerWidth <= 768
      setIsMobile(mobile)
      
      if (mobile) {
        // Removed mobile hint popup
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Render text with highlights
  const renderTextWithHighlights = (text: string, highlightWords?: string[]) => {
    if (!highlightWords || highlightWords.length === 0) {
      return text
    }

    let parts: (string | JSX.Element)[] = [text]

    highlightWords.forEach((word, index) => {
      const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
      parts = parts.map(part => {
        if (typeof part === 'string') {
          const splitParts = part.split(regex)
          return splitParts.map((splitPart, splitIndex) => {
            if (regex.test(splitPart)) {
              return (
                <span
                  key={`${index}-${splitIndex}`}
                  className="inline-block text-yellow-300 font-extrabold highlighted-text"
                >
                  {splitPart}
                </span>
              )
            }
            return splitPart
          })
        }
        return part
      }).flat()
    })

    return parts
  }

  // Render question marks with special styling
  const renderQuestionMarks = (text: string) => {
    const parts = text.split('?')
    if (parts.length === 1) return null

    return (
      <>
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && (
              <span className="inline-block text-yellow-400 font-extrabold text-6xl md:text-7xl lg:text-8xl mobile-question-mark">
                ?
              </span>
            )}
          </span>
        ))}
      </>
    )
  }

  const currentPage = PAGES_DATA[currentSection]
  const baseImagePage = PAGES_DATA[imageBaseSection]
  const nextPage = nextSection !== null ? PAGES_DATA[nextSection] : null

  return (
    <div 
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden"
    >
      {/* Background Images - Smooth Transitions */}
      <div className="absolute inset-0 z-0 w-screen h-screen">
        {/* Base (current) background image */}
        <img
          src={baseImagePage.backgroundImage}
          alt={`Background for section ${currentSection + 1}`}
          className={`w-screen h-screen object-cover background-image ${
            isTransitioning ? 'transitioning' : ''
          }`}
          style={{ 
            width: '100vw', 
            height: '100vh', 
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
          loading="eager"
          decoding="sync"
          fetchPriority="high"
        />
        
        {/* Next background image (for smooth transition) */}
        {isTransitioning && nextPage && (
          <img
            src={nextPage.backgroundImage}
            alt={`Background for section ${nextSection! + 1}`}
            className="w-screen h-screen object-cover background-image next-image show"
            style={{ 
              width: '100vw', 
              height: '100vh', 
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }}
            loading="eager"
            decoding="sync"
            fetchPriority="high"
          />
        )}
        
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
      </div>

      {/* Text Content - Smooth Transitions */}
      <div className="relative z-10 h-full flex items-center justify-center mobile-text-container">
        <div className="text-center mx-auto px-2 sm:px-4 w-full max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl mobile-text-content">
          {/* Current text content (kept stable, no transition classes) */}
          <div 
            className={`content-text ${
              currentPage.textSize === 'title' ? 'text-7xl md:text-8xl lg:text-9xl font-bold tracking-wider mobile-title-text' :
              currentPage.textSize === 'large' ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide mobile-large-text' :
              currentPage.textSize === 'medium' ? 'text-4xl md:text-5xl font-bold tracking-wide mobile-medium-text' :
              currentPage.textSize === 'small' ? 'text-3xl md:text-4xl font-normal leading-relaxed mobile-small-text' :
              currentPage.textSize === 'contact' ? 'text-2xl md:text-3xl font-medium mobile-contact-text' :
              'text-3xl md:text-4xl font-normal leading-relaxed mobile-medium-text'
            } ${
              currentPage.textSize === 'title' ? 'text-white' : 
              currentPage.textSize === 'contact' ? 'text-soft-gray' : 
              'text-white'
            } drop-shadow-2xl text-balance font-bold mobile-text-spacing`}
            style={{
              textShadow: currentPage.textSize === 'title' 
                ? '0 0 30px rgba(0,0,0,0.8), 0 0 60px rgba(0,0,0,0.6), 0 0 90px rgba(0,0,0,0.4)'
                : currentPage.textSize === 'medium'
                ? '0 0 20px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.6), 0 0 60px rgba(0,0,0,0.4)'
                : '0 0 18px rgba(0,0,0,0.7), 0 0 35px rgba(0,0,0,0.5), 0 0 50px rgba(0,0,0,0.3)'
            }}
          >
            {currentPage.specialStyling === 'question' 
              ? renderQuestionMarks(currentPage.text)
              : renderTextWithHighlights(currentPage.text, currentPage.highlightWords)
            }
          </div>
        </div>
      </div>

      {/* Navigation Controls - Moved up for mobile */}
      <div className="absolute bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 sm:gap-4 mobile-nav-container">
        {/* Previous button */}
        {currentSection > 0 && (
          <button
            onClick={() => {
              goToSection(currentSection - 1, 'prev')
            }}
            className="w-12 h-12 sm:w-12 sm:h-12 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 mobile-nav-button"
            title="Previous section"
          >
            <svg 
              className="w-5 h-5 sm:w-5 sm:h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 15l7-7 7 7" 
              />
            </svg>
          </button>
        )}
        
        {/* Restart button */}
        {currentSection > 0 && (
          <button
            onClick={() => {
              goToSection(0, 'prev')
            }}
            className="w-12 h-12 sm:w-12 sm:h-12 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 mobile-nav-button"
            title="Restart from beginning"
          >
            <svg 
              className="w-5 h-5 sm:w-5 sm:h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
          </button>
        )}
        
        {/* Audio control button */}
        <AudioToggle 
          enabled={audioEnabled} 
          onToggle={handleAudioToggle} 
        />
        
        {/* Share button */}
        <ShareButton />

        {/* Next button */}
        {currentSection < PAGES_DATA.length - 1 && (
          <button
            onClick={() => {
              goToSection(currentSection + 1, 'next')
            }}
            className="w-12 h-12 sm:w-12 sm:h-12 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 mobile-nav-button"
            title="Next section"
          >
            <svg 
              className="w-5 h-5 sm:w-5 sm:h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 9l-7 7-7-7" 
              />
            </svg>
          </button>
        )}
      </div>

      {/* Mobile navigation hint */}
      {/* Removed mobile hint popup */}
    </div>
  )
}