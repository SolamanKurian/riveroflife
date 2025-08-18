'use client'

import { motion } from 'framer-motion'
import { PageData } from '@/data/pages'

interface PageNavigationProps {
  currentPage: PageData
  totalPages: number
  onNavigate: (direction: 'next' | 'prev') => void
  onGoToFirst: () => void
  className?: string
}

export function PageNavigation({ 
  currentPage, 
  totalPages, 
  onNavigate, 
  onGoToFirst, 
  className = "" 
}: PageNavigationProps) {
  const isFirst = currentPage.id === 0
  const isLast = currentPage.id === totalPages - 1

  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      {/* Down Arrow Navigation Button - Only show when not on last page */}
      {!isLast && (
        <motion.button
          onClick={() => onNavigate('next')}
          className="mt-8 mx-auto w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-300 backdrop-blur-sm border border-white/20 flex items-center justify-center group"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Next page"
        >
          <svg 
            className="w-8 h-8 text-white group-hover:text-yellow-300 transition-colors duration-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 14l-7 7m0 0l-7-7m7 7V3" 
            />
          </svg>
        </motion.button>
      )}

      {/* Bottom controls - Three round buttons */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Restart button - Icon only */}
        {!isFirst && (
          <motion.button
            onClick={onGoToFirst}
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
        
        {/* Audio control button - This will be passed from parent */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 text-gentle-gray hover:bg-white/30 transition-all duration-300 backdrop-blur-sm border border-white/20 flex items-center justify-center">
          {/* Audio toggle will be rendered here */}
        </div>
        
        {/* Share button - Always visible */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 text-gentle-gray hover:bg-white/30 transition-all duration-300 backdrop-blur-sm border border-white/20 flex items-center justify-center">
          {/* Share button will be rendered here */}
        </div>
      </div>
    </div>
  )
}



