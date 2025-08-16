'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TRACT_SENTENCES } from '@/data/tract'

import { AudioToggle } from '@/components/AudioToggle'
import { ShareButton } from '@/components/ShareButton'
import { ImagePreloader } from '@/components/ImagePreloader'
import { OptimizedBackground, SharedBackground } from '@/components/OptimizedBackground'
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration'

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true) // Start with audio enabled
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [showMobileHint, setShowMobileHint] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastScrollTime = useRef(0)
  const scrollThrottle = 800 // ms

  // Simple audio initialization
  useEffect(() => {
    const audio = new Audio('/track.mp3')
    audio.loop = true
    audio.volume = 0.3
    audio.preload = 'auto'
    
    // Set up audio event listeners
    audio.addEventListener('canplaythrough', () => {
      console.log('🎵 Audio ready to play')
      // Try to start playing immediately
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

    audio.addEventListener('ended', () => {
      console.log('🔚 Audio ended')
      setIsAudioPlaying(false)
    })

    setAudioElement(audio)

    // Cleanup
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
      
      // If audio was previously enabled, try to resume playing
      if (enabled && audioElement && audioElement.paused) {
        audioElement.play().catch(console.error)
      }
    }
  }, [audioElement])

  // Save audio preference to localStorage
  useEffect(() => {
    localStorage.setItem('audioEnabled', JSON.stringify(audioEnabled))
  }, [audioEnabled])

  // Handle audio toggle (mute/unmute)
  const handleAudioToggle = useCallback((enabled: boolean) => {
    if (audioElement) {
      if (enabled) {
        // Unmute: Resume playing
        audioElement.play().then(() => {
          setIsAudioPlaying(true)
          console.log('✅ Audio unmuted and playing')
        }).catch((error) => {
          console.log('❌ Failed to resume audio:', error)
          setIsAudioPlaying(false)
        })
      } else {
        // Mute: Pause audio
        audioElement.pause()
        setIsAudioPlaying(false)
        console.log('🔇 Audio muted')
      }
    }
    
    setAudioEnabled(enabled)
  }, [audioElement])



  const navigateToSentence = useCallback((direction: 'next' | 'prev') => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    
    if (direction === 'next' && currentIndex < TRACT_SENTENCES.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else if (direction === 'prev' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
    
    setTimeout(() => setIsTransitioning(false), 1000)
  }, [currentIndex, isTransitioning])

  const goToFirst = useCallback(() => {
    if (isTransitioning || currentIndex === 0) return
    
    setIsTransitioning(true)
    setCurrentIndex(0)
    setTimeout(() => setIsTransitioning(false), 1000)
  }, [currentIndex, isTransitioning])

  // Handle wheel/scroll events
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    
    const now = Date.now()
    if (now - lastScrollTime.current < scrollThrottle) return
    lastScrollTime.current = now
    
    const direction = e.deltaY > 0 ? 'next' : 'prev'
    navigateToSentence(direction)
  }, [navigateToSentence])

  // Handle keyboard events
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault()
      navigateToSentence('next')
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault()
      navigateToSentence('prev')
    } else if (e.key === 'Home') {
      e.preventDefault()
      goToFirst()
    }
  }, [navigateToSentence, goToFirst])

  // Handle touch/swipe events for mobile
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
    
    const minSwipeDistance = 50 // Minimum swipe distance
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (Math.abs(diffX) > minSwipeDistance) {
        const direction = diffX > 0 ? 'next' : 'prev'
        navigateToSentence(direction)
      }
    } else {
      // Vertical swipe
      if (Math.abs(diffY) > minSwipeDistance) {
        const direction = diffY > 0 ? 'next' : 'prev' // Up swipe = forward, Down swipe = backward
        navigateToSentence(direction)
      }
    }
  }, [navigateToSentence])

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
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

  // Add user interaction listener to help start audio
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

    // Add listeners for common user interactions
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

  // Show mobile hint on first load
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    if (isMobile) {
      setShowMobileHint(true)
      const timer = setTimeout(() => setShowMobileHint(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  const currentSentence = TRACT_SENTENCES[currentIndex]
  const isFirst = currentIndex === 0
  const isLast = currentIndex === TRACT_SENTENCES.length - 1
  const isTitle = currentIndex === 0
  const isSecondPage = currentIndex === 1
  const isThirdPage = currentIndex === 2
  const isFourthPage = currentIndex === 3
  const isFifthPage = currentIndex === 4
  const isSixthPage = currentIndex === 5
  const isSeventhPage = currentIndex === 6
  const isEighthPage = currentIndex === 7
  const isNinthPage = currentIndex === 8
  const isTenthPage = currentIndex === 9
  const isEleventhPage = currentIndex === 10
  const isTwelfthPage = currentIndex === 11
  const isThirteenthPage = currentIndex === 12
  const isFourteenthPage = currentIndex === 13
  const isFifteenthPage = currentIndex === 14
  const isSixteenthPage = currentIndex === 15
  const isSeventeenthPage = currentIndex === 16
  const isEighteenthPage = currentIndex === 17
  const isNineteenthPage = currentIndex === 18
  const isTwentiethPage = currentIndex === 19
  const isTwentyFirstPage = currentIndex === 20
  const isTwentySecondPage = currentIndex === 21
  const isTwentyThirdPage = currentIndex === 22
  const isTwentyFourthPage = currentIndex === 23
  const isTwentyFifthPage = currentIndex === 24
  const isTwentySixthPage = currentIndex === 25
  const isTwentySeventhPage = currentIndex === 26
  const isTwentyEighthPage = currentIndex === 27
  const isTwentyNinthPage = currentIndex === 28
  const isThirtiethPage = currentIndex === 29
  const isThirtyFirstPage = currentIndex === 30
  const isThirtySecondPage = currentIndex === 31
  const isThirtyThirdPage = currentIndex === 32
  const isThirtyFourthPage = currentIndex === 33
  const isThirtyFifthPage = currentIndex === 34
  const isThirtySixthPage = currentIndex === 35
  const isThirtySeventhPage = currentIndex === 36
  const isThirtyEighthPage = currentIndex === 37
  const isThirtyNinthPage = currentIndex === 38
  const isFortiethPage = currentIndex === 39
  const isFortyFirstPage = currentIndex === 40
  const isFortySecondPage = currentIndex === 41
  const isFortyThirdPage = currentIndex === 42
  const isFortyFourthPage = currentIndex === 43
  const isFortyFifthPage = currentIndex === 44
  const isFortySixthPage = currentIndex === 45
  const isContact = currentIndex === TRACT_SENTENCES.length - 2

  // Function to render title with highlighted "Hope"
  const renderTitleWithHighlight = (text: string) => {
    if (!isTitle) return text
    
    const parts = text.split('Hope')
    if (parts.length === 1) return text
    
    return (
      <>
        {parts[0]}
        <motion.span
          className="inline-block text-yellow-300 font-extrabold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          Hope
        </motion.span>
        {parts[1]}
      </>
    )
  }

  // Function to render third page with highlighted "hope"
  const renderThirdPageWithHighlight = (text: string) => {
    if (!isThirdPage) return text
    
    const parts = text.split(/hope/i)
    if (parts.length === 1) return text
    
    return (
      <>
        {parts[0]}
        <motion.span
          className="inline-block text-yellow-300 font-extrabold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {text.match(/hope/i)?.[0] || 'hope'}
        </motion.span>
        {parts[1]}
      </>
    )
  }

  // Function to render fourth page with highlighted question marks
  const renderFourthPageWithHighlight = (text: string) => {
    if (!isFourthPage) return text
    
    const parts = text.split('?')
    if (parts.length === 1) return text
    
    return (
      <>
        {parts[0]}
        <motion.span
          className="inline-block text-yellow-400 font-extrabold text-6xl md:text-7xl lg:text-8xl"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          ?
        </motion.span>
        {parts[1]}
      </>
    )
  }

  // Function to render fifth page with highlighted question marks
  const renderFifthPageWithHighlight = (text: string) => {
    if (!isFifthPage) return text
    
    const parts = text.split('?')
    if (parts.length === 1) return text
    
    return (
      <>
        {parts[0]}
        <motion.span
          className="inline-block text-yellow-400 font-extrabold text-6xl md:text-7xl lg:text-8xl"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          ?
        </motion.span>
        {parts[1]}
      </>
    )
  }

  // Function to render sixth page with highlighted question marks
  const renderSixthPageWithHighlight = (text: string) => {
    if (!isSixthPage) return text
    
    const parts = text.split('?')
    if (parts.length === 1) return text
    
    return (
      <>
        {parts[0]}
        <motion.span
          className="inline-block text-yellow-400 font-extrabold text-6xl md:text-7xl lg:text-8xl"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          ?
        </motion.span>
        {parts[1]}
      </>
    )
  }

  // Function to render seventh page with highlighted question marks
  const renderSeventhPageWithHighlight = (text: string) => {
    if (!isSeventhPage) return text
    
    const parts = text.split('?')
    if (parts.length === 1) return text
    
    return (
      <>
        {parts[0]}
        <motion.span
          className="inline-block text-yellow-400 font-extrabold text-6xl md:text-7xl lg:text-8xl"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          ?
        </motion.span>
        {parts[1]}
      </>
    )
  }

  // Function to render eighth page with highlighted question marks
  const renderEighthPageWithHighlight = (text: string) => {
    if (!isEighthPage) return text
    
    const parts = text.split('?')
    if (parts.length === 1) return text
    
    return (
      <>
        {parts[0]}
        <motion.span
          className="inline-block text-yellow-400 font-extrabold text-6xl md:text-7xl lg:text-8xl"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          ?
        </motion.span>
        {parts[1]}
      </>
    )
  }

  // Function to render ninth page with highlighted question marks
  const renderNinthPageWithHighlight = (text: string) => {
    if (!isNinthPage) return text
    
    const parts = text.split('?')
    if (parts.length === 1) return text
    
    return (
      <>
        {parts[0]}
        <motion.span
          className="inline-block text-yellow-400 font-extrabold text-6xl md:text-7xl lg:text-8xl"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          ?
        </motion.span>
        {parts[1]}
      </>
    )
  }

  // Function to render tenth page with highlighted "there is hope"
  const renderTenthPageWithHighlight = (text: string) => {
    if (!isTenthPage) return text
    
    // Case-insensitive split to handle both "There is hope" and "there is hope"
    const parts = text.split(/there is hope/i)
    if (parts.length === 1) return text
    
    return (
      <>
        {parts[0]}
        <motion.span
          className="inline-block text-yellow-300 font-extrabold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {text.match(/there is hope/i)?.[0] || 'There is hope'}
        </motion.span>
        {parts[1]}
      </>
    )
  }

  // Function to render eleventh page with highlighted question marks
  const renderEleventhPageWithHighlight = (text: string) => {
    if (!isEleventhPage) return text
    
    const parts = text.split('?')
    if (parts.length === 1) return text
    
    return (
      <>
        {parts[0]}
        <motion.span
          className="inline-block text-yellow-400 font-extrabold text-6xl md:text-7xl lg:text-8xl"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          ?
        </motion.span>
        {parts[1]}
      </>
    )
  }

  // Function to render twelfth page with highlighted question marks
  const renderTwelfthPageWithHighlight = (text: string) => {
    if (!isTwelfthPage) return text
    
    const parts = text.split('?')
    if (parts.length === 1) return text
    
    return (
      <>
        {parts[0]}
        <motion.span
          className="inline-block text-yellow-400 font-extrabold text-6xl md:text-7xl lg:text-8xl"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          ?
        </motion.span>
        {parts[1]}
      </>
    )
  }

  // Function to render thirteenth page with highlighted question marks
  const renderThirteenthPageWithHighlight = (text: string) => {
    if (!isThirteenthPage) return text
    
    const parts = text.split('?')
    if (parts.length === 1) return text
    
    return (
      <>
        {parts[0]}
        <motion.span
          className="inline-block text-yellow-400 font-extrabold text-6xl md:text-7xl lg:text-8xl"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          ?
        </motion.span>
        {parts[1]}
      </>
    )
  }

  // Function to render fourteenth page with highlighted question marks
  const renderFourteenthPageWithHighlight = (text: string) => {
    if (!isFourteenthPage) return text
    
    const parts = text.split('?')
    if (parts.length === 1) return text
    
    return (
      <>
        {parts[0]}
        <motion.span
          className="inline-block text-yellow-400 font-extrabold text-6xl md:text-7xl lg:text-8xl"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          ?
        </motion.span>
        {parts[1]}
      </>
    )
  }

  // Function to render fifteenth page with highlighted question marks
  const renderFifteenthPageWithHighlight = (text: string) => {
    if (!isFifteenthPage) return text
    
    const parts = text.split('?')
    if (parts.length === 1) return text
    
    return (
      <>
        {parts[0]}
        <motion.span
          className="inline-block text-yellow-400 font-extrabold text-6xl md:text-7xl lg:text-8xl"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          ?
        </motion.span>
        {parts[1]}
      </>
    )
  }

  // Function to render sixteenth page with highlighted "way out"
  const renderSixteenthPageWithHighlight = (text: string) => {
    if (!isSixteenthPage) return text
    
    const parts = text.split(/way out/i)
    if (parts.length === 1) return text
    
    return (
      <>
        {parts[0]}
        <motion.span
          className="inline-block text-yellow-300 font-extrabold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {text.match(/way out/i)?.[0] || 'way out'}
        </motion.span>
        {parts[1]}
      </>
    )
  }

  // Function to render seventeenth page with highlighted "not"
  const renderSeventeenthPageWithHighlight = (text: string) => {
    if (!isSeventeenthPage) return text
    
    const parts = text.split(/not/i)
    if (parts.length === 1) return text
    
    return (
      <>
        {parts[0]}
        <motion.span
          className="inline-block text-yellow-300 font-extrabold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {text.match(/not/i)?.[0] || 'not'}
        </motion.span>
        {parts[1]}
      </>
    )
  }

  // Function to render eighteenth page with highlighted "there is hope"
  const renderEighteenthPageWithHighlight = (text: string) => {
    if (!isEighteenthPage) return text
    
    const parts = text.split(/there is hope/i)
    if (parts.length === 1) return text
    
    return (
      <>
        {parts[0]}
        <motion.span
          className="inline-block text-yellow-300 font-extrabold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {text.match(/there is hope/i)?.[0] || 'There is hope'}
        </motion.span>
        {parts[1]}
      </>
    )
  }

  // Function to render nineteenth page with highlighted "God" and "Jesus"
  const renderNineteenthPageWithHighlight = (text: string) => {
    if (!isNineteenthPage) return text
    
    // Split by "God" first, then by "Jesus" for each part
    const godParts = text.split(/god/i)
    if (godParts.length === 1) return text
    
    return (
      <>
        {godParts[0]}
        <motion.span
          className="inline-block text-yellow-300 font-extrabold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {text.match(/god/i)?.[0] || 'God'}
        </motion.span>
        {godParts.slice(1).map((part, index) => {
          const jesusParts = part.split(/jesus/i)
          if (jesusParts.length === 1) return part
          
          return (
            <span key={index}>
              {jesusParts[0]}
              <motion.span
                className="inline-block text-yellow-300 font-extrabold"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                {part.match(/jesus/i)?.[0] || 'Jesus'}
              </motion.span>
              {jesusParts[1]}
            </span>
          )
        })}
      </>
    )
  }

  // Function to render twentieth page with highlighted "your"
  const renderTwentiethPageWithHighlight = (text: string) => {
    if (!isTwentiethPage) return text
    
    const parts = text.split(/your/i)
    if (parts.length === 1) return text
    
    return (
      <>
        {parts[0]}
        <motion.span
          className="inline-block text-yellow-300 font-extrabold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {text.match(/your/i)?.[0] || 'your'}
        </motion.span>
        {parts[1]}
      </>
    )
  }

  // Function to render twenty-first page with highlighted "loves"
  const renderTwentyFirstPageWithHighlight = (text: string) => {
    if (!isTwentyFirstPage) return text
    
    const parts = text.split(/loves/i)
    if (parts.length === 1) return text
    
    return (
      <>
        {parts[0]}
        <motion.span
          className="inline-block text-yellow-300 font-extrabold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {text.match(/loves/i)?.[0] || 'loves'}
        </motion.span>
        {parts[1]}
      </>
    )
  }

  // Function to render twenty-second page with highlighted "love"
  const renderTwentySecondPageWithHighlight = (text: string) => {
    if (!isTwentySecondPage) return text
    
    const parts = text.split(/love/i)
    if (parts.length === 1) return text
    
    return (
      <>
        {parts[0]}
        <motion.span
          className="inline-block text-yellow-300 font-extrabold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {text.match(/love/i)?.[0] || 'love'}
        </motion.span>
        {parts[1]}
      </>
    )
  }

  // Function to render twenty-third page with highlighted "No" and "no"
  const renderTwentyThirdPageWithHighlight = (text: string) => {
    if (!isTwentyThirdPage) return text
    
    // Split by both "No" and "no" to handle both cases
    const parts = text.split(/(no)/i)
    if (parts.length === 1) return text
    
    return (
      <>
        {parts.map((part, index) => {
          // Check if this part matches "no" (case insensitive)
          if (/^no$/i.test(part)) {
            return (
              <motion.span
                key={index}
                className="inline-block text-yellow-300 font-extrabold"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                {part}
              </motion.span>
            )
          }
          return part
        })}
      </>
    )
  }

  // Function to render twenty-fourth page with highlighted "Jesus Christ"
  const renderTwentyFourthPageWithHighlight = (text: string) => {
    if (!isTwentyFourthPage) return text
    
    const parts = text.split(/jesus christ/i)
    if (parts.length === 1) return text
    
    return (
      <>
        {parts[0]}
        <motion.span
          className="inline-block text-yellow-300 font-extrabold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {text.match(/jesus christ/i)?.[0] || 'Jesus Christ'}
        </motion.span>
        {parts[1]}
      </>
    )
  }

  // Function to render twenty-fifth page with highlighted "God"
  const renderTwentyFifthPageWithHighlight = (text: string) => {
    if (!isTwentyFifthPage) return text
    
    const parts = text.split(/god/i)
    if (parts.length === 1) return text
    
    return (
      <>
        {parts[0]}
        <motion.span
          className="inline-block text-yellow-300 font-extrabold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {text.match(/god/i)?.[0] || 'God'}
        </motion.span>
        {parts[1]}
      </>
    )
  }

  // Function to render twenty-sixth page with highlighted "Free"
  const renderTwentySixthPageWithHighlight = (text: string) => {
    if (!isTwentySixthPage) return text
    
    const parts = text.split(/free/i)
    if (parts.length === 1) return text
    
    return (
      <>
        {parts[0]}
        <motion.span
          className="inline-block text-yellow-300 font-extrabold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {text.match(/free/i)?.[0] || 'Free'}
        </motion.span>
        {parts[1]}
      </>
    )
  }

  // Function to render twenty-seventh page with highlighted "raised"
  const renderTwentySeventhPageWithHighlight = (text: string) => {
    if (!isTwentySeventhPage) return text
    
    const parts = text.split(/raised/i)
    if (parts.length === 1) return text
    
    return (
      <>
        {parts[0]}
        <motion.span
          className="inline-block text-yellow-300 font-extrabold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {text.match(/raised/i)?.[0] || 'raised'}
        </motion.span>
        {parts[1]}
      </>
    )
  }

  // Function to render twenty-eighth page with highlighted "freedom"
  const renderTwentyEighthPageWithHighlight = (text: string) => {
    if (!isTwentyEighthPage) return text
    
    const parts = text.split(/freedom/i)
    if (parts.length === 1) return text
    
    return (
      <>
        {parts[0]}
        <motion.span
          className="inline-block text-yellow-300 font-extrabold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {text.match(/freedom/i)?.[0] || 'freedom'}
        </motion.span>
        {parts[1]}
      </>
    )
  }

  // Function to render twenty-ninth page with highlighted "Jesus"
  const renderTwentyNinthPageWithHighlight = (text: string) => {
    if (!isTwentyNinthPage) return text
    
    const parts = text.split(/jesus/i)
    if (parts.length === 1) return text
    
    return (
      <>
        {parts[0]}
        <motion.span
          className="inline-block text-yellow-300 font-extrabold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {text.match(/jesus/i)?.[0] || 'Jesus'}
        </motion.span>
        {parts[1]}
      </>
    )
  }

  // Function to render thirtieth page with highlighted "save"
  const renderThirtiethPageWithHighlight = (text: string) => {
    if (!isThirtiethPage) return text
    
    const parts = text.split(/save/i)
    if (parts.length === 1) return text
    
    return (
      <>
        {parts[0]}
        <motion.span
          className="inline-block text-yellow-300 font-extrabold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {text.match(/save/i)?.[0] || 'save'}
        </motion.span>
        {parts[1]}
      </>
    )
  }

  // Function to render thirty-first page with highlighted "salvation" and "freedom"
  const renderThirtyFirstPageWithHighlight = (text: string) => {
    if (!isThirtyFirstPage) return text
    
    // Split by "salvation" first, then by "freedom" for each part
    const salvationParts = text.split(/salvation/i)
    if (salvationParts.length === 1) return text
    
    return (
      <>
        {salvationParts[0]}
        <motion.span
          className="inline-block text-yellow-300 font-extrabold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {text.match(/salvation/i)?.[0] || 'salvation'}
        </motion.span>
        {salvationParts.slice(1).map((part, index) => {
          const freedomParts = part.split(/freedom/i)
          if (freedomParts.length === 1) return part
          
          return (
            <span key={index}>
              {freedomParts[0]}
              <motion.span
                className="inline-block text-yellow-300 font-extrabold"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                {part.match(/freedom/i)?.[0] || 'freedom'}
              </motion.span>
              {freedomParts[1]}
            </span>
          )
        })}
      </>
    )
  }

  // Function to render thirty-second page with highlighted "grace" and "truth"
  const renderThirtySecondPageWithHighlight = (text: string) => {
    if (!isThirtySecondPage) return text
    
    // Split by "grace" first, then by "truth" for each part
    const graceParts = text.split(/grace/i)
    if (graceParts.length === 1) return text
    
    return (
      <>
        {graceParts[0]}
        <motion.span
          className="inline-block text-yellow-300 font-extrabold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {text.match(/grace/i)?.[0] || 'grace'}
        </motion.span>
        {graceParts.slice(1).map((part, index) => {
          const truthParts = part.split(/truth/i)
          if (truthParts.length === 1) return part
          
          return (
            <span key={index}>
              {truthParts[0]}
              <motion.span
                className="inline-block text-yellow-300 font-extrabold"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                {part.match(/truth/i)?.[0] || 'truth'}
              </motion.span>
              {truthParts[1]}
            </span>
          )
        })}
      </>
    )
  }

  // Function to render thirty-third page with highlighted "don't" and "heart"
  const renderThirtyThirdPageWithHighlight = (text: string) => {
    if (!isThirtyThirdPage) return text
    
    // Split by "don't" first, then by "heart" for each part
    const dontParts = text.split(/don't/i)
    if (dontParts.length === 1) return text
    
    return (
      <>
        {dontParts[0]}
        <motion.span
          className="inline-block text-yellow-300 font-extrabold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {text.match(/don't/i)?.[0] || 'don\'t'}
        </motion.span>
        {dontParts.slice(1).map((part, index) => {
          const heartParts = part.split(/heart/i)
          if (heartParts.length === 1) return part
          
          return (
            <span key={index}>
              {heartParts[0]}
              <motion.span
                className="inline-block text-yellow-300 font-extrabold"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                {part.match(/heart/i)?.[0] || 'heart'}
              </motion.span>
              {heartParts[1]}
            </span>
          )
        })}
      </>
    )
  }

  // Function to render thirty-fourth page with highlighted "new life"
  const renderThirtyFourthPageWithHighlight = (text: string) => {
    if (!isThirtyFourthPage) return text
    
    // Split by "new life" (case insensitive)
    const parts = text.split(/(new life)/i)
    if (parts.length === 1) return text
    
    return (
      <>
        {parts.map((part, index) => {
          if (part.toLowerCase() === 'new life') {
            return (
              <motion.span
                key={index}
                className="inline-block text-yellow-300 font-extrabold"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                {part}
              </motion.span>
            )
          }
          return part
        })}
      </>
    )
  }

  // Function to render thirty-fifth page with highlighted "free"
  const renderThirtyFifthPageWithHighlight = (text: string) => {
    if (!isThirtyFifthPage) return text
    
    // Split by "free" (case insensitive)
    const parts = text.split(/(free)/i)
    if (parts.length === 1) return text
    
    return (
      <>
        {parts.map((part, index) => {
          if (part.toLowerCase() === 'free') {
            return (
              <motion.span
                key={index}
                className="inline-block text-yellow-300 font-extrabold"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                {part}
              </motion.span>
            )
          }
          return part
        })}
      </>
    )
  }

  // Function to render thirty-sixth page with highlighted "prayer"
  const renderThirtySixthPageWithHighlight = (text: string) => {
    if (!isThirtySixthPage) return text
    
    // Split by "prayer" (case insensitive)
    const parts = text.split(/(prayer)/i)
    if (parts.length === 1) return text
    
    return (
      <>
        {parts.map((part, index) => {
          if (part.toLowerCase() === 'prayer') {
            return (
              <motion.span
                key={index}
                className="inline-block text-yellow-300 font-extrabold"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                {part}
              </motion.span>
            )
          }
          return part
        })}
      </>
    )
  }

  // Function to render thirty-seventh page with highlighted "Jesus" and "forgive"
  const renderThirtySeventhPageWithHighlight = (text: string) => {
    if (!isThirtySeventhPage) return text
    
    // Split by "Jesus" first, then by "forgive" for each part
    const jesusParts = text.split(/jesus/i)
    if (jesusParts.length === 1) return text
    
    return (
      <>
        {jesusParts[0]}
        <motion.span
          className="inline-block text-yellow-300 font-extrabold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {text.match(/jesus/i)?.[0] || 'Jesus'}
        </motion.span>
        {jesusParts.slice(1).map((part, index) => {
          const forgiveParts = part.split(/forgive/i)
          if (forgiveParts.length === 1) return part
          
          return (
            <span key={index}>
              {forgiveParts[0]}
              <motion.span
                className="inline-block text-yellow-300 font-extrabold"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                {part.match(/forgive/i)?.[0] || 'forgive'}
              </motion.span>
              {forgiveParts[1]}
            </span>
          )
        })}
      </>
    )
  }

  // Function to render thirty-eighth page with highlighted "died" and "place"
  const renderThirtyEighthPageWithHighlight = (text: string) => {
    if (!isThirtyEighthPage) return text
    
    // Split by "died" first, then by "place" for each part
    const diedParts = text.split(/died/i)
    if (diedParts.length === 1) return text
    
    return (
      <>
        {diedParts[0]}
        <motion.span
          className="inline-block text-yellow-300 font-extrabold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {text.match(/died/i)?.[0] || 'died'}
        </motion.span>
        {diedParts.slice(1).map((part, index) => {
          const placeParts = part.split(/place/i)
          if (placeParts.length === 1) return part
          
          return (
            <span key={index}>
              {placeParts[0]}
              <motion.span
                className="inline-block text-yellow-300 font-extrabold"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                {part.match(/place/i)?.[0] || 'place'}
              </motion.span>
              {placeParts[1]}
            </span>
          )
        })}
      </>
    )
  }

  // Function to render thirty-ninth page with highlighted "burdens" and "worries"
  const renderThirtyNinthPageWithHighlight = (text: string) => {
    if (!isThirtyNinthPage) return text
    
    // Split by "burdens" first, then by "worries" for each part
    const burdensParts = text.split(/burdens/i)
    if (burdensParts.length === 1) return text
    
    return (
      <>
        {burdensParts[0]}
        <motion.span
          className="inline-block text-yellow-300 font-extrabold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {text.match(/burdens/i)?.[0] || 'burdens'}
        </motion.span>
        {burdensParts.slice(1).map((part, index) => {
          const worriesParts = part.split(/worries/i)
          if (worriesParts.length === 1) return part
          
          return (
            <span key={index}>
              {worriesParts[0]}
              <motion.span
                className="inline-block text-yellow-300 font-extrabold"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                {part.match(/worries/i)?.[0] || 'worries'}
              </motion.span>
              {worriesParts[1]}
            </span>
          )
        })}
      </>
    )
  }

  // Function to render fortieth page with highlighted "peace" and "joy"
  const renderFortiethPageWithHighlight = (text: string) => {
    if (!isFortiethPage) return text
    
    // Split by "peace" first, then by "joy" for each part
    const peaceParts = text.split(/peace/i)
    if (peaceParts.length === 1) return text
    
    return (
      <>
        {peaceParts[0]}
        <motion.span
          className="inline-block text-yellow-300 font-extrabold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {text.match(/peace/i)?.[0] || 'peace'}
        </motion.span>
        {peaceParts.slice(1).map((part, index) => {
          const joyParts = part.split(/joy/i)
          if (joyParts.length === 1) return part
          
          return (
            <span key={index}>
              {joyParts[0]}
              <motion.span
                className="inline-block text-yellow-300 font-extrabold"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                {part.match(/joy/i)?.[0] || 'joy'}
              </motion.span>
              {joyParts[1]}
            </span>
          )
        })}
      </>
    )
  }

  // Function to render forty-first page with highlighted "never" (both instances)
  const renderFortyFirstPageWithHighlight = (text: string) => {
    if (!isFortyFirstPage) return text
    
    // Split by "never" (case insensitive) to handle both instances
    const parts = text.split(/(never)/i)
    if (parts.length === 1) return text
    
    return (
      <>
        {parts.map((part, index) => {
          if (part.toLowerCase() === 'never') {
            return (
              <motion.span
                key={index}
                className="inline-block text-yellow-300 font-extrabold"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                {part}
              </motion.span>
            )
          }
          return part
        })}
      </>
    )
  }

  // Function to render forty-second page with highlighted "new life"
  const renderFortySecondPageWithHighlight = (text: string) => {
    if (!isFortySecondPage) return text
    
    // Split by "new life" (case insensitive)
    const parts = text.split(/(new life)/i)
    if (parts.length === 1) return text
    
    return (
      <>
        {parts.map((part, index) => {
          if (part.toLowerCase() === 'new life') {
            return (
              <motion.span
                key={index}
                className="inline-block text-yellow-300 font-extrabold"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                {part}
              </motion.span>
            )
          }
          return part
        })}
      </>
    )
  }

  // Function to render forty-third page with highlighted "keep seeking" and "jesus"
  const renderFortyThirdPageWithHighlight = (text: string) => {
    if (!isFortyThirdPage) return text
    
    // Split by "keep seeking" first, then by "jesus" for each part
    const keepSeekingParts = text.split(/keep seeking/i)
    if (keepSeekingParts.length === 1) return text
    
    return (
      <>
        {keepSeekingParts[0]}
        <motion.span
          className="inline-block text-yellow-300 font-extrabold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {text.match(/keep seeking/i)?.[0] || 'keep seeking'}
        </motion.span>
        {keepSeekingParts.slice(1).map((part, index) => {
          const jesusParts = part.split(/jesus/i)
          if (jesusParts.length === 1) return part
          
          return (
            <span key={index}>
              {jesusParts[0]}
              <motion.span
                className="inline-block text-yellow-300 font-extrabold"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                {part.match(/jesus/i)?.[0] || 'jesus'}
              </motion.span>
              {jesusParts[1]}
            </span>
          )
        })}
      </>
    )
  }

  // Function to render forty-fourth page with highlighted "want help" and "?"
  const renderFortyFourthPageWithHighlight = (text: string) => {
    if (!isFortyFourthPage) return text
    
    // Split by "want help" first, then by "?" for each part
    const wantHelpParts = text.split(/want help/i)
    if (wantHelpParts.length === 1) return text
    
    return (
      <>
        {wantHelpParts[0]}
        <motion.span
          className="inline-block text-yellow-300 font-extrabold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {text.match(/want help/i)?.[0] || 'want help'}
        </motion.span>
        {wantHelpParts.slice(1).map((part, index) => {
          const questionParts = part.split(/\?/)
          if (questionParts.length === 1) return part
          
          return (
            <span key={index}>
              {questionParts[0]}
              <motion.span
                className="inline-block text-yellow-300 font-extrabold"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                ?
              </motion.span>
              {questionParts[1]}
            </span>
          )
        })}
      </>
    )
  }

  // Function to render forty-fifth page with highlighted "email"
  const renderFortyFifthPageWithHighlight = (text: string) => {
    if (!isFortyFifthPage) return text
    
    // Split by "email" (case insensitive)
    const parts = text.split(/(email)/i)
    if (parts.length === 1) return text
    
    return (
      <>
        {parts.map((part, index) => {
          if (part.toLowerCase() === 'email') {
            return (
              <motion.span
                key={index}
                className="inline-block text-yellow-300 font-extrabold"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                {part}
              </motion.span>
            )
          }
          return part
        })}
      </>
    )
  }

  // Function to render forty-sixth page with highlighted "god", "hope", and "love"
  const renderFortySixthPageWithHighlight = (text: string) => {
    if (!isFortySixthPage) return text
    
    // Split by "god" first, then by "hope" for each part, then by "love" for each part
    const godParts = text.split(/god/i)
    if (godParts.length === 1) return text
    
    return (
      <>
        {godParts[0]}
        <motion.span
          className="inline-block text-yellow-300 font-extrabold"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          {text.match(/god/i)?.[0] || 'God'}
        </motion.span>
        {godParts.slice(1).map((part, index) => {
          const hopeParts = part.split(/hope/i)
          if (hopeParts.length === 1) return part
          
          return (
            <span key={index}>
              {hopeParts[0]}
              <motion.span
                className="inline-block text-yellow-300 font-extrabold"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.3
                }}
              >
                {part.match(/hope/i)?.[0] || 'hope'}
              </motion.span>
              {hopeParts.slice(1).map((hopePart, hopeIndex) => {
                const loveParts = hopePart.split(/love/i)
                if (loveParts.length === 1) return hopePart
                
                return (
                  <span key={`hope-${hopeIndex}`}>
                    {loveParts[0]}
                    <motion.span
                      className="inline-block text-yellow-300 font-extrabold"
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ 
                        duration: 2.5, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: 0.6
                      }}
                    >
                      {hopePart.match(/love/i)?.[0] || 'love'}
                    </motion.span>
                    {loveParts[1]}
                  </span>
                )
              })}
            </span>
          )
        })}
      </>
    )
  }

  return (
    <>
      {/* Service Worker Registration */}
      <ServiceWorkerRegistration />
      
      {/* Image Preloader */}
      <ImagePreloader onLoadComplete={() => setImagesLoaded(true)} />
      
      <div 
        ref={containerRef}
        className="relative h-screen w-screen gradient-bg overflow-hidden touch-scroll"
        style={{ 
          background: 'linear-gradient(-45deg, #f8fafc, #f1f5f9, #e2e8f0, #f8fafc)',
          backgroundSize: '400% 400%'
        }}
      >
        {/* Subtle animated gradient overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 animate-gradient" />
        </div>

        {/* Special background for first page */}
        <AnimatePresence mode="wait">
          {isTitle && (
            <motion.div
              key="first-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/one.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for second page */}
        <AnimatePresence mode="wait">
          {currentIndex === 1 && (
            <motion.div
              key="second-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/two.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for third page */}
        <AnimatePresence mode="wait">
          {currentIndex === 2 && (
            <motion.div
              key="third-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/three.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for fourth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 3 && (
            <motion.div
              key="fourth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/four.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for fifth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 4 && (
            <motion.div
              key="fifth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/five.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for sixth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 5 && (
            <motion.div
              key="sixth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/six.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for seventh page */}
        <AnimatePresence mode="wait">
          {currentIndex === 6 && (
            <motion.div
              key="seventh-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/seven.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for eighth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 7 && (
            <motion.div
              key="eighth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/eight.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for ninth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 8 && (
            <motion.div
              key="ninth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/nine.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for tenth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 9 && (
            <motion.div
              key="tenth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/ten.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for eleventh page */}
        <AnimatePresence mode="wait">
          {currentIndex === 10 && (
            <motion.div
              key="eleventh-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/eleven.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for twelfth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 11 && (
            <motion.div
              key="twelfth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/twelve.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for thirteenth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 12 && (
            <motion.div
              key="thirteenth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/thirteen.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for fourteenth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 13 && (
            <motion.div
              key="fourteenth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/fourteen.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for fifteenth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 14 && (
            <motion.div
              key="fifteenth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/fifteen.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for sixteenth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 15 && (
            <motion.div
              key="sixteenth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/sixteen.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

                {/* Special background for seventeenth page */}
          <AnimatePresence mode="wait">
            {currentIndex === 16 && (
              <motion.div
                key="seventeenth-page-bg"
                className="absolute inset-0 z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: 'url(/seventeen.svg)' }}
                />
              </motion.div>
            )}
          </AnimatePresence>

        {/* Special background for eighteenth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 17 && (
            <motion.div
              key="eighteenth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/eighteenth.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for nineteenth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 18 && (
            <motion.div
              key="nineteenth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/nineteen.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for twentieth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 19 && (
            <motion.div
              key="twentieth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/twenty.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for twenty-first page */}
        <AnimatePresence mode="wait">
          {currentIndex === 20 && (
            <motion.div
              key="twenty-first-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/twentyone.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for twenty-second page */}
        <AnimatePresence mode="wait">
          {currentIndex === 21 && (
            <motion.div
              key="twenty-second-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/twentytwo.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for twenty-third page */}
        <AnimatePresence mode="wait">
          {currentIndex === 22 && (
            <motion.div
              key="twenty-third-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/twentythree.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for twenty-fourth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 23 && (
            <motion.div
              key="twenty-fourth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/twentyfour.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for twenty-fifth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 24 && (
            <motion.div
              key="twenty-fifth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/twentyfive.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for twenty-sixth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 25 && (
            <motion.div
              key="twenty-sixth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/twentysix.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for twenty-seventh page */}
        <AnimatePresence mode="wait">
          {currentIndex === 26 && (
            <motion.div
              key="twenty-seventh-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/twentyseven.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for twenty-eighth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 27 && (
            <motion.div
              key="twenty-eighth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/twentyeight.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for twenty-ninth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 28 && (
            <motion.div
              key="twenty-ninth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/twentynine.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for thirtieth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 29 && (
            <motion.div
              key="thirtieth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/thirty.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for thirty-first page */}
        <AnimatePresence mode="wait">
          {currentIndex === 30 && (
            <motion.div
              key="thirty-first-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/thirtyone.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for thirty-second page */}
        <AnimatePresence mode="wait">
          {currentIndex === 31 && (
            <motion.div
              key="thirty-second-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/thirtytwo.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for thirty-third page */}
        <AnimatePresence mode="wait">
          {currentIndex === 32 && (
            <motion.div
              key="thirty-third-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/thirtythree.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for thirty-fourth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 33 && (
            <motion.div
              key="thirty-fourth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/thirtyfour.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for thirty-fifth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 34 && (
            <motion.div
              key="thirty-fifth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/thirtyfive.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for thirty-sixth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 35 && (
            <motion.div
              key="thirty-sixth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/thirtysix.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for thirty-seventh page */}
        <AnimatePresence mode="wait">
          {currentIndex === 36 && (
            <motion.div
              key="thirty-seventh-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/thirtyseven.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for thirty-eighth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 37 && (
            <motion.div
              key="thirty-eighth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/thirtyseven.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for thirty-ninth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 38 && (
            <motion.div
              key="thirty-ninth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/thirtyseven.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for fortieth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 39 && (
            <motion.div
              key="fortieth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/thirtyseven.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for forty-first page */}
        <AnimatePresence mode="wait">
          {currentIndex === 40 && (
            <motion.div
              key="forty-first-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/fourtyone.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for forty-second page */}
        <AnimatePresence mode="wait">
          {currentIndex === 41 && (
            <motion.div
              key="forty-second-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/fourtytwo.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for forty-third page */}
        <AnimatePresence mode="wait">
          {currentIndex === 42 && (
            <motion.div
              key="forty-third-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/fourtythree.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for forty-fourth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 43 && (
            <motion.div
              key="forty-fourth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/fourtyfour.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for forty-fifth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 44 && (
            <motion.div
              key="forty-fifth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/fourtyfive.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special background for forty-sixth page */}
        <AnimatePresence mode="wait">
          {currentIndex === 45 && (
            <motion.div
              key="forty-sixth-page-bg"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/fourtysix.svg)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>



        {/* Main content */}
        <main className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 min-h-screen">
          <AnimatePresence mode="wait">
            <motion.section
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ 
                duration: isSecondPage ? 1.2 : 1.0, 
                ease: "easeInOut",
                scale: { duration: isSecondPage ? 1.0 : 0.8 },
                delay: 0
              }}
              className="text-center max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl mx-auto px-2 sm:px-4 w-full"
            >
              <motion.div
                className={`content-text ${
                  isTitle 
                    ? 'text-7xl md:text-8xl lg:text-9xl font-bold tracking-wider text-white drop-shadow-2xl' 
                    : isSecondPage
                      ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                      : isThirdPage
                        ? 'text-5xl md:text-6xl lg:text-7xl font-bold tracking-wide text-white drop-shadow-2xl'
                        : isFourthPage
                          ? 'text-5xl md:text-6xl lg:text-7xl font-bold tracking-wide text-white drop-shadow-2xl'
                          : isFifthPage
                            ? 'text-5xl md:text-6xl lg:text-7xl font-bold tracking-wide text-white drop-shadow-2xl'
                            : isSixthPage
                              ? 'text-5xl md:text-6xl lg:text-7xl font-bold tracking-wide text-white drop-shadow-2xl'
                              : isSeventhPage
                                ? 'text-5xl md:text-6xl lg:text-7xl font-bold tracking-wide text-white drop-shadow-2xl'
                                : isEighthPage
                                  ? 'text-5xl md:text-6xl lg:text-7xl font-bold tracking-wide text-white drop-shadow-2xl'
                                  : isNinthPage
                                    ? 'text-5xl md:text-6xl lg:text-7xl font-bold tracking-wide text-white drop-shadow-2xl'
                                    : isTenthPage
                                      ? 'text-5xl md:text-6xl lg:text-7xl font-bold tracking-wide text-white drop-shadow-2xl'
                                      : isEleventhPage
                                        ? 'text-5xl md:text-6xl lg:text-7xl font-bold tracking-wide text-white drop-shadow-2xl'
                                        : isTwelfthPage
                                          ? 'text-5xl md:text-6xl lg:text-7xl font-bold tracking-wide text-white drop-shadow-2xl'
                                          : isThirteenthPage
                                            ? 'text-5xl md:text-6xl lg:text-7xl font-bold tracking-wide text-white drop-shadow-2xl'
                                            : isFourteenthPage
                                              ? 'text-5xl md:text-6xl lg:text-7xl font-bold tracking-wide text-white drop-shadow-2xl'
                                              : isFifteenthPage
                                                ? 'text-5xl md:text-6xl lg:text-7xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                : isSixteenthPage
                                                  ? 'text-5xl md:text-6xl lg:text-7xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                  : isSeventeenthPage
                                                    ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                    : isEighteenthPage
                                                      ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                      : isNineteenthPage
                                                        ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                        : isTwentiethPage
                                                          ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                          : isTwentyFirstPage
                                                            ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                            : isTwentySecondPage
                                                              ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                              : isTwentyThirdPage
                                                                ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                                : isTwentyFourthPage
                                                                  ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                                  : isTwentyFifthPage
                                                                    ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                                    : isTwentySixthPage
                                                                      ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                                      : isTwentySeventhPage
                                                                        ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                                        : isTwentyEighthPage
                                                                          ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                                          : isTwentyNinthPage
                                                                            ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                                            : isThirtiethPage
                                                                              ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                                              : isThirtyFirstPage
                                                                                ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                                                : isThirtySecondPage
                                                                                  ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                                                  : isThirtyThirdPage
                                                                                    ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                                                    : isThirtyFourthPage
                                                                                      ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                                                      : isThirtyFifthPage
                                                                                        ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                                                        : isThirtySixthPage
                                                                                          ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                                                                                  : isThirtySeventhPage
                            ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                            : isThirtyEighthPage
                              ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                              : isThirtyNinthPage
                                ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                                : isFortiethPage
                                  ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                                                                : isFortyFirstPage
                                                                                                  ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                                                                  : isFortySecondPage
                                                                                                    ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                                                                    : isFortyThirdPage
                                                                                                      ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                                                                      : isFortyFourthPage
                                                                                                        ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                                                                                                                                                                                                                                                                                                                                                                                                         : isFortyFifthPage
                                                                                                               ? 'text-4xl md:text-5xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                                                                             : isFortySixthPage
                                                                                                               ? 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide text-white drop-shadow-2xl'
                                                                                                               : isContact 
                                                                                                            ? 'text-2xl md:text-3xl font-medium text-soft-gray'
                                                                                                            : 'text-3xl md:text-4xl font-normal leading-relaxed text-soft-gray'
                  } text-balance`}
                style={isTitle ? {
                  textShadow: '0 0 30px rgba(0,0,0,0.8), 0 0 60px rgba(0,0,0,0.6), 0 0 90px rgba(0,0,0,0.4)'
                } : isSecondPage ? {
                  textShadow: '0 0 25px rgba(0,0,0,0.7), 0 0 50px rgba(0,0,0,0.5), 0 0 75px rgba(0,0,0,0.3)'
                } : isThirdPage ? {
                  textShadow: '0 0 20px rgba(0,0,0,0.7), 0 0 40px rgba(0,0,0,0.5), 0 0 60px rgba(0,0,0,0.3)'
                } : isFourthPage ? {
                  textShadow: '0 0 18px rgba(0,0,0,0.7), 0 0 35px rgba(0,0,0,0.5), 0 0 50px rgba(0,0,0,0.3)'
                } : isFifthPage ? {
                  textShadow: '0 0 18px rgba(0,0,0,0.7), 0 0 35px rgba(0,0,0,0.5), 0 0 50px rgba(0,0,0,0.3)'
                } : isSixthPage ? {
                  textShadow: '0 0 18px rgba(0,0,0,0.7), 0 0 35px rgba(0,0,0,0.5), 0 0 50px rgba(0,0,0,0.3)'
                } : isSeventhPage ? {
                  textShadow: '0 0 18px rgba(0,0,0,0.7), 0 0 35px rgba(0,0,0,0.5), 0 0 50px rgba(0,0,0,0.3)'
                } : isEighthPage ? {
                  textShadow: '0 0 18px rgba(0,0,0,0.7), 0 0 35px rgba(0,0,0,0.5), 0 0 50px rgba(0,0,0,0.3)'
                } : isNinthPage ? {
                  textShadow: '0 0 18px rgba(0,0,0,0.7), 0 0 35px rgba(0,0,0,0.5), 0 0 50px rgba(0,0,0,0.3)'
                } : isTenthPage ? {
                  textShadow: '0 0 18px rgba(0,0,0,0.7), 0 0 35px rgba(0,0,0,0.5), 0 0 50px rgba(0,0,0,0.3)'
                } : isEleventhPage ? {
                  textShadow: '0 0 18px rgba(0,0,0,0.7), 0 0 35px rgba(0,0,0,0.5), 0 0 50px rgba(0,0,0,0.3)'
                } : isTwelfthPage ? {
                  textShadow: '0 0 18px rgba(0,0,0,0.7), 0 0 35px rgba(0,0,0,0.5), 0 0 50px rgba(0,0,0,0.3)'
                } : isThirteenthPage ? {
                  textShadow: '0 0 18px rgba(0,0,0,0.7), 0 0 35px rgba(0,0,0,0.5), 0 0 50px rgba(0,0,0,0.3)'
                } : isFourteenthPage ? {
                  textShadow: '0 0 18px rgba(0,0,0,0.7), 0 0 35px rgba(0,0,0,0.5), 0 0 50px rgba(0,0,0,0.3)'
                } : isFifteenthPage ? {
                  textShadow: '0 0 18px rgba(0,0,0,0.7), 0 0 35px rgba(0,0,0,0.5), 0 0 50px rgba(0,0,0,0.3)'
                } : isSixteenthPage ? {
                  textShadow: '0 0 18px rgba(0,0,0,0.7), 0 0 35px rgba(0,0,0,0.5), 0 0 50px rgba(0,0,0,0.3)'
                              } : isSeventeenthPage ? {
                  textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
              } : isEighteenthPage ? {
                textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
              } : isNineteenthPage ? {
                textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
              } : isTwentiethPage ? {
                textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
              } : isTwentyFirstPage ? {
                textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
              } : isTwentySecondPage ? {
                textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
              } : isTwentyThirdPage ? {
                textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
              } : isTwentyFourthPage ? {
                textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
              } : isTwentyFifthPage ? {
                textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
              } : isTwentySixthPage ? {
                textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
              } : isTwentySeventhPage ? {
                textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
              } : isTwentyEighthPage ? {
                textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
              } : isTwentyNinthPage ? {
                textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
              } : isThirtiethPage ? {
                textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
              } : isThirtyFirstPage ? {
                textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
              } : isThirtySecondPage ? {
                textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
              } : isThirtyThirdPage ? {
                textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
              } : isThirtyFourthPage ? {
                textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
              } : isThirtyFifthPage ? {
                textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
              } : isThirtySixthPage ? {
                textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
              } : isThirtySeventhPage ? {
                textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
              } : isThirtyEighthPage ? {
                textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
              } : isThirtyNinthPage ? {
                textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
              } : isFortiethPage ? {
                textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
              } : isFortyFirstPage ? {
                textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
              } : isFortySecondPage ? {
                textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
              } : isFortyThirdPage ? {
                textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
              } : isFortyFourthPage ? {
                textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
                                                           } : isFortyFifthPage ? {
                  textShadow: '0 0 20px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.6), 0 0 60px rgba(0,0,0,0.4)'
                } : isFortySixthPage ? {
                  textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
              } : isContact ? {
                textShadow: '0 0 18px rgba(0,0,0,0.7), 0 0 35px rgba(0,0,0,0.5), 0 0 50px rgba(0,0,0,0.3)'
              } : undefined}
              >
                {isTitle ? renderTitleWithHighlight(currentSentence) : 
                 isThirdPage ? renderThirdPageWithHighlight(currentSentence) : 
                 isFourthPage ? renderFourthPageWithHighlight(currentSentence) :
                 isFifthPage ? renderFifthPageWithHighlight(currentSentence) :
                 isSixthPage ? renderSixthPageWithHighlight(currentSentence) :
                 isSeventhPage ? renderSeventhPageWithHighlight(currentSentence) :
                 isEighthPage ? renderEighthPageWithHighlight(currentSentence) :
                                 isNinthPage ? renderNinthPageWithHighlight(currentSentence) :
                 isTenthPage ? renderTenthPageWithHighlight(currentSentence) :
                 isEleventhPage ? renderEleventhPageWithHighlight(currentSentence) :
                 isTwelfthPage ? renderTwelfthPageWithHighlight(currentSentence) :
                 isThirteenthPage ? renderThirteenthPageWithHighlight(currentSentence) :
                 isFourteenthPage ? renderFourteenthPageWithHighlight(currentSentence) :
                 isFifteenthPage ? renderFifteenthPageWithHighlight(currentSentence) :
                 isSixteenthPage ? renderSixteenthPageWithHighlight(currentSentence) :
                 isSeventeenthPage ? renderSeventeenthPageWithHighlight(currentSentence) :
                 isEighteenthPage ? renderEighteenthPageWithHighlight(currentSentence) :
                 isNineteenthPage ? renderNineteenthPageWithHighlight(currentSentence) :
                 isTwentiethPage ? renderTwentiethPageWithHighlight(currentSentence) :
                 isTwentyFirstPage ? renderTwentyFirstPageWithHighlight(currentSentence) :
                 isTwentySecondPage ? renderTwentySecondPageWithHighlight(currentSentence) :
                 isTwentyThirdPage ? renderTwentyThirdPageWithHighlight(currentSentence) :
                 isTwentyFourthPage ? renderTwentyFourthPageWithHighlight(currentSentence) :
                 isTwentyFifthPage ? renderTwentyFifthPageWithHighlight(currentSentence) :
                 isTwentySixthPage ? renderTwentySixthPageWithHighlight(currentSentence) :
                 isTwentySeventhPage ? renderTwentySeventhPageWithHighlight(currentSentence) :
                 isTwentyEighthPage ? renderTwentyEighthPageWithHighlight(currentSentence) :
                 isTwentyNinthPage ? renderTwentyNinthPageWithHighlight(currentSentence) :
                 isThirtiethPage ? renderThirtiethPageWithHighlight(currentSentence) :
                 isThirtyFirstPage ? renderThirtyFirstPageWithHighlight(currentSentence) :
                 isThirtySecondPage ? renderThirtySecondPageWithHighlight(currentSentence) :
                 isThirtyThirdPage ? renderThirtyThirdPageWithHighlight(currentSentence) :
                 isThirtyFourthPage ? renderThirtyFourthPageWithHighlight(currentSentence) :
                 isThirtyFifthPage ? renderThirtyFifthPageWithHighlight(currentSentence) :
                 isThirtySixthPage ? renderThirtySixthPageWithHighlight(currentSentence) :
                                  isThirtySeventhPage ? currentSentence :
                   isThirtyEighthPage ? currentSentence :
                   isThirtyNinthPage ? currentSentence :
                   isFortiethPage ? currentSentence :
                   isFortyFirstPage ? renderFortyFirstPageWithHighlight(currentSentence) :
                   isFortySecondPage ? renderFortySecondPageWithHighlight(currentSentence) :
                   isFortyThirdPage ? renderFortyThirdPageWithHighlight(currentSentence) :
                                      isFortyFourthPage ? renderFortyFourthPageWithHighlight(currentSentence) :
                     isFortyFifthPage ? renderFortyFifthPageWithHighlight(currentSentence) :
                     isFortySixthPage ? renderFortySixthPageWithHighlight(currentSentence) :
                 currentSentence}
              </motion.div>
              
              {/* Special styling for prayer section - removed duplicate rendering for 37th page */}
            </motion.section>
          </AnimatePresence>

          {/* Navigation hints - REMOVED */}
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

        {/* Bottom controls - Three round buttons */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 sm:gap-4">
          {/* Restart button - Icon only */}
          {!isFirst && (
            <motion.button
              onClick={goToFirst}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 text-gentle-gray hover:bg-white/30 transition-all duration-300 backdrop-blur-sm border border-white/20 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Restart from beginning"
            >
              <svg 
                className="w-4 h-4 sm:w-5 sm:h-5" 
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
            </motion.button>
          )}
          
          {/* Audio control button */}
          <AudioToggle 
            enabled={audioEnabled} 
            onToggle={handleAudioToggle} 
          />
          
          {/* Share button - Always visible */}
          <ShareButton />
        </div>


      </div>
    </>
  )
}

