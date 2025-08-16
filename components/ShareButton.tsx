'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

export function ShareButton() {
  const [isHovered, setIsHovered] = useState(false)
  const [showCopied, setShowCopied] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'There Is Still Hope',
          text: 'A message of hope, love, and redemption. Discover the way forward through faith in Jesus Christ.',
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled sharing
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy URL to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        setShowCopied(true)
        setTimeout(() => setShowCopied(false), 2000)
      } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = window.location.href
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setShowCopied(true)
        setTimeout(() => setShowCopied(false), 2000)
      }
    }
  }

  return (
    <motion.button
      onClick={handleShare}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-12 h-12 rounded-full bg-white/20 text-gentle-gray hover:bg-white/30 transition-all duration-300 backdrop-blur-sm border border-white/20 flex items-center justify-center"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title="Share this experience"
    >
      {/* Share icon */}
      <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" 
        />
      </svg>

      {/* Copied notification */}
      {showCopied && (
        <motion.div
          className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-soft-gray text-white text-sm rounded-md whitespace-nowrap"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          URL copied!
        </motion.div>
      )}

      {/* Ripple effect */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 rounded-full bg-white/20"
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}
    </motion.button>
  )
}


