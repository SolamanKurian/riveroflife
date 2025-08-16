'use client'

import { useEffect, useState } from 'react'
import { LoadingIndicator } from './LoadingIndicator'

// All SVG images used in the application (only existing files)
const IMAGE_LIST = [
  '/one.svg',
  '/two.svg',
  '/three.svg',
  '/four.svg',
  '/five.svg',
  '/six.svg',
  '/seven.svg',
  '/eight.svg',
  '/nine.svg',
  '/ten.svg',
  '/eleven.svg',
  '/twelve.svg',
  '/thirteen.svg',
  '/fourteen.svg',
  '/fifteen.svg',
  '/sixteen.svg',
  '/seventeen.svg',
  '/eighteenth.svg',
  '/nineteen.svg',
  '/twenty.svg',
  '/twentyone.svg',
  '/twentytwo.svg',
  '/twentythree.svg',
  '/twentyfour.svg',
  '/twentyfive.svg',
  '/twentysix.svg',
  '/twentyseven.svg',
  '/twentyeight.svg',
  '/twentynine.svg',
  '/thirty.svg',
  '/thirtyone.svg',
  '/thirtytwo.svg',
  '/thirtythree.svg',
  '/thirtyfour.svg',
  '/thirtyfive.svg',
  '/thirtysix.svg',
  '/thirtyseven.svg',
  // '/thirtyeight.svg', // ❌ Missing file
  // '/thirtynine.svg',  // ❌ Missing file  
  // '/forty.svg',       // ❌ Missing file
  '/fourtyone.svg',
  '/fourtytwo.svg',
  '/fourtythree.svg',
  '/fourtyfour.svg',
  '/fourtyfive.svg',
  '/fourtysix.svg'
]

interface ImagePreloaderProps {
  onLoadComplete?: () => void
}

export function ImagePreloader({ onLoadComplete }: ImagePreloaderProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = IMAGE_LIST.map((src) => {
        return new Promise<void>((resolve) => {
          const img = new Image()
          
          img.onload = () => {
            setLoadedImages(prev => new Set([...prev, src]))
            resolve()
          }
          
          img.onerror = () => {
            console.warn(`Failed to preload image: ${src}`)
            resolve() // Continue even if one image fails
          }
          
          // Set crossOrigin for better caching
          img.crossOrigin = 'anonymous'
          
          // Start loading
          img.src = src
        })
      })

      try {
        await Promise.all(imagePromises)
        setIsLoading(false)
        onLoadComplete?.()
      } catch (error) {
        console.error('Error preloading images:', error)
        setIsLoading(false)
        onLoadComplete?.()
      }
    }

    preloadImages()
  }, [onLoadComplete])

  // Preload with high priority hints
  useEffect(() => {
    IMAGE_LIST.forEach((src) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = src
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    })

    // Cleanup function
    return () => {
      const links = document.querySelectorAll('link[rel="preload"]')
      links.forEach(link => link.remove())
    }
  }, [])

  return (
    <>
      <LoadingIndicator 
        isLoading={isLoading} 
        progress={loadedImages.size} 
        total={IMAGE_LIST.length} 
      />
      <div className="sr-only">
        {/* Hidden loading indicator for screen readers */}
        {isLoading && <span>Loading images...</span>}
        <span>Loaded {loadedImages.size} of {IMAGE_LIST.length} images</span>
      </div>
    </>
  )
}

// Export the image list for use in other components
export { IMAGE_LIST }
