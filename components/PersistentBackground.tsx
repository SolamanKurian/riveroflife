'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { PageData } from '@/data/pages'
import { imagePreloader } from '@/utils/imagePreloader'

interface PersistentBackgroundProps {
  currentPage: PageData
  className?: string
}

export function PersistentBackground({ currentPage, className = "" }: PersistentBackgroundProps) {
  const [currentImage, setCurrentImage] = useState<string>(currentPage.backgroundImage)
  const [nextImage, setNextImage] = useState<string>('')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  // Preload next few images
  useEffect(() => {
    const preloadNextImages = async () => {
      try {
        // Preload current image if not already loaded
        if (!imagePreloader.isPreloaded(currentPage.backgroundImage)) {
          await imagePreloader.preloadImage(currentPage.backgroundImage)
        }

        // Preload next 3 images for smooth navigation
        const nextPages = [1, 2, 3].map(offset => {
          const nextIndex = currentPage.id + offset
          if (nextIndex >= 46) return null
          
          // Map to correct SVG file names
          const svgNames = [
            'one.svg', 'two.svg', 'three.svg', 'four.svg', 'five.svg', 'six.svg', 'seven.svg', 'eight.svg',
            'nine.svg', 'ten.svg', 'eleven.svg', 'twelve.svg', 'thirteen.svg', 'fourteen.svg', 'fifteen.svg',
            'sixteen.svg', 'seventeen.svg', 'eighteen.svg', 'nineteen.svg', 'twenty.svg', 'twentyone.svg',
            'twentytwo.svg', 'twentythree.svg', 'twentyfour.svg', 'twentyfive.svg', 'twentysix.svg',
            'twentyseven.svg', 'twentyeight.svg', 'twentynine.svg', 'thirty.svg', 'thirtyone.svg',
            'thirtytwo.svg', 'thirtythree.svg', 'thirtyfour.svg', 'thirtyfive.svg', 'thirtysix.svg',
            'thirtyseven.svg', 'thirtyeight.svg', 'thirtynine.svg', 'forty.svg', 'fortyone.svg',
            'fortytwo.svg', 'fortythree.svg', 'fortyfour.svg', 'fortyfive.svg', 'fourtysix.svg'
          ]
          
          return svgNames[nextIndex] ? `/${svgNames[nextIndex]}` : null
        }).filter(Boolean) as string[]

        if (nextPages.length > 0) {
          await imagePreloader.preloadImages(nextPages)
        }
      } catch (error) {
        console.warn('Failed to preload some images:', error)
      }
    }

    preloadNextImages()
  }, [currentPage.id, currentPage.backgroundImage])

  // Handle page change with smooth transition
  useEffect(() => {
    if (currentPage.backgroundImage !== currentImage) {
      setIsTransitioning(true)
      setIsImageLoaded(false)
      
      // Set next image
      setNextImage(currentPage.backgroundImage)
      
      // After transition, update current image
      const timer = setTimeout(() => {
        setCurrentImage(currentPage.backgroundImage)
        setNextImage('')
        setIsTransitioning(false)
        setIsImageLoaded(true)
      }, 300) // Match transition duration

      return () => clearTimeout(timer)
    }
  }, [currentPage.backgroundImage, currentImage])

  // Generate blur data URL for placeholder
  const generateBlurDataURL = (imageSrc: string): string => {
    // This is a simple base64 encoded tiny image for blur effect
    // In production, you might want to generate actual blur data URLs
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjY2NjIi8+Cjwvc3ZnPgo='
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Current background image */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 1 }}
        animate={{ opacity: isTransitioning ? 0 : 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Image
          src={currentImage}
          alt={`Background for page ${currentPage.id}`}
          fill
          priority
          placeholder="blur"
          blurDataURL={generateBlurDataURL(currentImage)}
          className="object-cover"
          sizes="100vw"
          quality={90}
          onLoad={() => setIsImageLoaded(true)}
        />
      </motion.div>

      {/* Next background image (for transition) */}
      <AnimatePresence>
        {isTransitioning && nextImage && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Image
              src={nextImage}
              alt={`Next background for page ${currentPage.id + 1}`}
              placeholder="blur"
              blurDataURL={generateBlurDataURL(nextImage)}
              className="object-cover"
              sizes="100vw"
              quality={90}
              fill
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading overlay - only show when image is not loaded */}
      {!isImageLoaded && (
        <motion.div
          className="absolute inset-0 bg-black"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
    </div>
  )
}
