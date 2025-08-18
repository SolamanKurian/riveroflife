'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface ProgressiveBackgroundLoaderProps {
  currentPageIndex: number
  totalPages: number
  className?: string
  onImageReady?: (isReady: boolean) => void
}

// Background image mapping for each page
const BACKGROUND_IMAGES = [
  '/one.svg',      // Page 0
  '/two.svg',      // Page 1
  '/three.svg',    // Page 2
  '/four.svg',     // Page 3
  '/five.svg',     // Page 4
  '/six.svg',      // Page 5
  '/seven.svg',    // Page 6
  '/eight.svg',    // Page 7
  '/nine.svg',     // Page 8
  '/ten.svg',      // Page 9
  '/eleven.svg',   // Page 10
  '/twelve.svg',   // Page 11
  '/thirteen.svg', // Page 12
  '/fourteen.svg', // Page 13
  '/fifteen.svg',  // Page 14
  '/sixteen.svg',  // Page 15
  '/seventeen.svg',// Page 16
  '/eighteenth.svg',// Page 17
  '/nineteen.svg', // Page 18
  '/twenty.svg',   // Page 19
  '/twentyone.svg',// Page 20
  '/twentytwo.svg',// Page 21
  '/twentythree.svg',// Page 22
  '/twentyfour.svg',// Page 23
  '/twentyfive.svg',// Page 24
  '/twentysix.svg',// Page 25
  '/twentyseven.svg',// Page 26
  '/twentyeight.svg',// Page 27
  '/twentynine.svg',// Page 28
  '/thirty.svg',   // Page 29
  '/thirtyone.svg',// Page 30
  '/thirtytwo.svg',// Page 31
  '/thirtythree.svg',// Page 32
  '/thirtyfour.svg',// Page 33
  '/thirtyfive.svg',// Page 34
  '/thirtysix.svg',// Page 35
  '/thirtyseven.svg',// Page 36
  '/thirtyeight.svg',// Page 37
  '/thirtynine.svg',// Page 38
  '/forty.svg',    // Page 39
  '/fourtyone.svg',// Page 40
  '/fourtytwo.svg',// Page 41
  '/fourtythree.svg',// Page 42
  '/fourtyfour.svg',// Page 43
  '/fourtyfive.svg',// Page 44
  '/fourtysix.svg' // Page 45
]

export function ProgressiveBackgroundLoader({ 
  currentPageIndex, 
  totalPages, 
  className = "absolute inset-0 z-0",
  onImageReady
}: ProgressiveBackgroundLoaderProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [currentImage, setCurrentImage] = useState<string>('')
  const [isCurrentImageReady, setIsCurrentImageReady] = useState(false)
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map())
  
  // Get current page background image
  const currentBgImage = BACKGROUND_IMAGES[currentPageIndex] || BACKGROUND_IMAGES[0]

  // Aggressive preload function that caches images
  const preloadImage = useCallback((imageSrc: string) => {
    if (loadedImages.has(imageSrc) || imageCache.current.has(imageSrc)) return

    const img = new Image()
    img.onload = () => {
      setLoadedImages(prev => new Set(prev).add(imageSrc))
      imageCache.current.set(imageSrc, img)
      console.log(`✅ Preloaded and cached: ${imageSrc}`)
      
      // If this is the current image, mark it as ready immediately
      if (imageSrc === currentBgImage) {
        setIsCurrentImageReady(true)
        onImageReady?.(true)
      }
    }
    img.onerror = () => {
      console.warn(`❌ Failed to preload: ${imageSrc}`)
      // Even on error, mark as ready to prevent infinite loading
      if (imageSrc === currentBgImage) {
        setIsCurrentImageReady(true)
        onImageReady?.(true)
      }
    }
    img.src = imageSrc
  }, [loadedImages, currentBgImage, onImageReady])

  // Initialize with first page image and aggressive preloading
  useEffect(() => {
    if (currentPageIndex === 0 && !currentImage) {
      setCurrentImage(currentBgImage)
      setIsCurrentImageReady(false)
      onImageReady?.(false)
      
      // Immediately start loading current image
      preloadImage(currentBgImage)
      
      // Aggressively preload next 8 images
      for (let i = 1; i <= 8; i++) {
        if (i < BACKGROUND_IMAGES.length) {
          preloadImage(BACKGROUND_IMAGES[i])
        }
      }
    }
  }, [currentPageIndex, currentBgImage, currentImage, preloadImage, onImageReady])

  // Handle page changes with instant switching
  useEffect(() => {
    if (currentBgImage !== currentImage) {
      // Reset ready state
      setIsCurrentImageReady(false)
      onImageReady?.(false)
      
      // Set new image immediately
      setCurrentImage(currentBgImage)
      
      // Check if image is already cached/loaded
      if (loadedImages.has(currentBgImage) || imageCache.current.has(currentBgImage)) {
        setIsCurrentImageReady(true)
        onImageReady?.(true)
      } else {
        // Load the new image
        preloadImage(currentBgImage)
      }
      
      // Aggressively preload next 8 images for smooth navigation
      for (let i = 1; i <= 8; i++) {
        const nextIndex = currentPageIndex + i
        if (nextIndex < BACKGROUND_IMAGES.length) {
          const nextImg = BACKGROUND_IMAGES[nextIndex]
          if (nextImg && !loadedImages.has(nextImg) && !imageCache.current.has(nextImg)) {
            preloadImage(nextImg)
          }
        }
      }
    }
  }, [currentPageIndex, currentBgImage, currentImage, loadedImages, preloadImage, onImageReady])

  // Preload all images on mount for instant navigation
  useEffect(() => {
    const preloadAllImages = () => {
      BACKGROUND_IMAGES.forEach(imgSrc => {
        if (!loadedImages.has(imgSrc) && !imageCache.current.has(imgSrc)) {
          preloadImage(imgSrc)
        }
      })
    }
    
    // Start preloading all images after a short delay
    const timer = setTimeout(preloadAllImages, 50) // Reduced from 100ms to 50ms for faster loading
    return () => clearTimeout(timer)
  }, [loadedImages, preloadImage])

  return (
    <div className={className}>
      {/* Current background - show immediately if cached, otherwise show loading */}
      {currentImage && (
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${currentImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: isCurrentImageReady ? 1 : 0.8
          }}
        />
      )}
      
      {/* Subtle loading indicator - only show briefly */}
      {currentPageIndex === 0 && !isCurrentImageReady && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 animate-pulse" />
      )}
    </div>
  )
}
