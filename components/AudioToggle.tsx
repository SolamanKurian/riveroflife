'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface AudioToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
}

export function AudioToggle({ enabled, onToggle }: AudioToggleProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    onToggle(!enabled)
  }

  return (
    <motion.button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center
        ${enabled 
          ? 'bg-soft-gray text-white shadow-lg' 
          : 'bg-white/20 text-gentle-gray hover:bg-white/30'
        }
        backdrop-blur-sm border border-white/20
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={enabled ? 'Disable ambient audio' : 'Enable ambient audio'}
    >
      {/* Speaker icon */}
      <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        {enabled ? (
          // Speaker on
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" 
          />
        ) : (
          // Speaker off
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" 
          />
        )}
      </svg>

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


