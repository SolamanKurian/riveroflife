'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'

interface OptimizedBackgroundProps {
  imageSrc: string
  isVisible: boolean
  className?: string
}

export function OptimizedBackground({ 
  imageSrc, 
  isVisible, 
  className = "absolute inset-0 z-0" 
}: OptimizedBackgroundProps) {
  
  // Memoize the background style to prevent unnecessary re-renders
  const backgroundStyle = useMemo(() => ({
    backgroundImage: `url(${imageSrc})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }), [imageSrc])

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={`bg-${imageSrc}`}
          className={className}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 0.6, 
            ease: "easeInOut",
            // Slightly faster transition for better performance
            type: "tween"
          }}
        >
          <div 
            className="absolute inset-0"
            style={backgroundStyle}
            // Add loading="eager" for critical images
            loading="eager"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Optimized background for multiple pages with same image
export function SharedBackground({ 
  imageSrc, 
  isVisible, 
  className = "absolute inset-0 z-0" 
}: OptimizedBackgroundProps) {
  
  const backgroundStyle = useMemo(() => ({
    backgroundImage: `url(${imageSrc})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }), [imageSrc])

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key={`shared-bg-${imageSrc}`}
          className={className}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 0.4, // Faster for shared backgrounds
            ease: "easeInOut"
          }}
        >
          <div 
            className="absolute inset-0"
            style={backgroundStyle}
            loading="eager"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
