'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

import { PAGES_DATA, PageData } from '@/data/pages'
import { AudioToggle } from './AudioToggle'
import { ShareButton } from './ShareButton'

interface SinglePageLayoutProps {
  className?: string
}

export function SinglePageLayout({ className = "" }: SinglePageLayoutProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [showMobileHint, setShowMobileHint] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([])

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

  // Preload images in background without blocking UI
  useEffect(() => {
    const preloadAllImages = () => {
      console.log('🖼️ Preloading all background images in background...')
      
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

  // Intersection Observer to track current section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionIndex = parseInt(entry.target.getAttribute('data-section') || '0')
            setCurrentSection(sectionIndex)
          }
        })
      },
      {
        threshold: 0.5,
        rootMargin: '-20% 0px -20% 0px'
      }
    )

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

  // Smooth scroll to section
  const scrollToSection = useCallback((sectionIndex: number) => {
    const section = sectionsRef.current[sectionIndex]
    if (section) {
      section.scrollIntoView({ 
        behavior: 'auto',
        block: 'start'
      })
    }
  }, [])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault()
      if (currentSection < PAGES_DATA.length - 1) {
        scrollToSection(currentSection + 1)
      }
          } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        if (currentSection > 0) {
          scrollToSection(currentSection - 1)
        }
      } else if (e.key === 'Home') {
        e.preventDefault()
        scrollToSection(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        scrollToSection(PAGES_DATA.length - 1)
      }
  }, [currentSection, scrollToSection])

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
      }
    } else {
      if (Math.abs(diffY) > minSwipeDistance) {
        const direction = diffY > 0 ? 'next' : 'prev'
        if (direction === 'next' && currentSection < PAGES_DATA.length - 1) {
          scrollToSection(currentSection + 1)
        } else if (direction === 'prev' && currentSection > 0) {
          scrollToSection(currentSection - 1)
        }
      }
    }
  }, [currentSection, scrollToSection])

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
        setShowMobileHint(true)
        const timer = setTimeout(() => setShowMobileHint(false), 3000)
        return () => clearTimeout(timer)
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
                  className="inline-block text-yellow-300 font-extrabold"
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
              <span
                className="inline-block text-yellow-400 font-extrabold text-6xl md:text-7xl lg:text-8xl"
              >
                ?
              </span>
            )}
          </span>
        ))}
      </>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`relative w-screen overflow-x-hidden ${className}`}
    >






      

      

             {/* Main Content - All Sections */}
       <div className="relative w-screen">
         {PAGES_DATA.map((page: PageData, index: number) => (
                                    <section
               key={page.id}
               ref={(el) => {
                 sectionsRef.current[index] = el as HTMLDivElement | null
               }}
               data-section={index}
               className={`relative h-screen w-screen flex items-center justify-center overflow-hidden ${
                 isMobile ? 'mobile-section' : ''
               }`}
               style={{ 
                 backgroundColor: '#111827' // Dark gray fallback background
               }}
             >
                                                                                                       {/* Background Image */}
               <div className="absolute inset-0 z-0 w-screen h-screen bg-gray-900" style={{ width: '100vw', height: '100vh' }}>
                 <img
                   src={page.backgroundImage}
                   alt={`Background for section ${index + 1}`}
                   className="w-screen h-screen object-cover"
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
                   onLoad={(e) => {
                     // Image loaded successfully
                   }}
                   onError={(e) => {
                     // Handle image loading errors gracefully
                     const target = e.target as HTMLImageElement
                     target.style.opacity = '0.8'
                     console.warn(`Failed to load image: ${page.backgroundImage}`)
                   }}
                 />
                {/* Gradient overlay for better text readability */}
                <div className={`absolute inset-0 ${
                  isMobile ? 'mobile-gradient' : 'bg-gradient-to-b from-black/20 via-transparent to-black/30'
                }`} />
              </div>

                                                   {/* Text Content */}
              <div
                className={`relative z-10 text-center mx-auto px-2 sm:px-4 w-full ${
                  isMobile ? 'mobile-text-container' : 'max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl'
                }`}
              >
                              <div className={`content-text ${
                  isMobile 
                    ? (page.textSize === 'title' ? 'mobile-title' :
                       page.textSize === 'large' ? 'mobile-large' :
                       page.textSize === 'medium' ? 'mobile-medium' :
                       page.textSize === 'small' ? 'mobile-small' :
                       page.textSize === 'contact' ? 'mobile-contact' :
                       'mobile-medium')
                    : (page.textSize === 'title' ? 'text-7xl md:text-8xl lg:text-9xl font-bold tracking-wider' :
                       page.textSize === 'large' ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide' :
                       page.textSize === 'medium' ? 'text-4xl md:text-5xl font-bold tracking-wide' :
                       page.textSize === 'small' ? 'text-3xl md:text-4xl font-normal leading-relaxed' :
                       page.textSize === 'contact' ? 'text-2xl md:text-3xl font-medium' :
                       'text-3xl md:text-4xl font-normal leading-relaxed')
                } ${
                  page.textSize === 'title' ? 'text-white' : 
                  page.textSize === 'contact' ? 'text-soft-gray' : 
                  'text-white'
                } drop-shadow-2xl text-balance font-bold`}
                style={{
                  textShadow: page.textSize === 'title' 
                    ? '0 0 30px rgba(0,0,0,0.8), 0 0 60px rgba(0,0,0,0.6), 0 0 90px rgba(0,0,0,0.4)'
                    : page.textSize === 'large'
                    ? '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
                    : page.textSize === 'medium'
                    ? '0 0 20px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.6), 0 0 60px rgba(0,0,0,0.4)'
                    : '0 0 18px rgba(0,0,0,0.7), 0 0 35px rgba(0,0,0,0.5), 0 0 50px rgba(0,0,0,0.3)'
                }}
                                 >
                    {page.specialStyling === 'question' 
                      ? renderQuestionMarks(page.text)
                      : renderTextWithHighlights(page.text, page.highlightWords)
                    }
                  </div>
                </div>

                {/* Down Arrow - Only show when not on last section */}
                {index < PAGES_DATA.length - 1 && (
                  <div
                    className={`${isMobile ? 'mobile-down-arrow' : 'desktop-down-arrow'}`}
                  >
                    <button
                      onClick={() => scrollToSection(index + 1)}
                      className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-yellow-400/50 flex items-center justify-center group shadow-2xl"
                      title="Next section"
                    >
                     <svg 
                       className="w-8 h-8 text-yellow-400 group-hover:text-yellow-300 drop-shadow-lg" 
                       fill="none" 
                       stroke="currentColor" 
                       viewBox="0 0 24 24"
                     >
                       <path 
                         strokeLinecap="round" 
                         strokeLinejoin="round" 
                         strokeWidth={3} 
                         d="M19 14l-7 7m0 0l-7-7m7 7V3" 
                       />
                     </svg>
                   </button>
                 </div>
                )}
          </section>
        ))}
      </div>

                           {/* Bottom Controls - All Icons in Middle */}
        <div className={`fixed left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 sm:gap-4 ${
          isMobile ? 'mobile-controls' : 'bottom-4 sm:bottom-6'
        }`}>
          {/* Restart button */}
          {currentSection > 0 && (
            <button
              onClick={() => scrollToSection(0)}
              className={`${
                isMobile 
                  ? 'mobile-nav-button' 
                  : 'w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 text-gentle-gray hover:bg-white/30 backdrop-blur-sm border border-white/20'
              } flex items-center justify-center text-gentle-gray`}
              title="Restart from beginning"
            >
              <svg 
                className={`${
                  isMobile ? 'w-5 h-5' : 'w-4 h-4 sm:w-5 sm:h-5'
                }`}
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
        </div>
    </div>
  )
}
