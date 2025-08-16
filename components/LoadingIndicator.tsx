'use client'

import { motion } from 'framer-motion'

interface LoadingIndicatorProps {
  isLoading: boolean
  progress: number
  total: number
}

export function LoadingIndicator({ isLoading, progress, total }: LoadingIndicatorProps) {
  if (!isLoading) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        {/* Central Icon */}
        <motion.div
          className="w-20 h-20 mx-auto mb-8"
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <svg
            className="w-full h-full text-gray-800"
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
        </motion.div>

        {/* Animated Lines */}
        <div className="flex flex-col items-center space-y-3">
          {/* Line 1 */}
          <motion.div
            className="w-32 h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent"
            animate={{
              scaleX: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0
            }}
          />
          
          {/* Line 2 */}
          <motion.div
            className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gray-600 to-transparent"
            animate={{
              scaleX: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
          
          {/* Line 3 */}
          <motion.div
            className="w-28 h-0.5 bg-gradient-to-r from-transparent via-gray-500 to-transparent"
            animate={{
              scaleX: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>

        {/* Subtle Progress Indicator (Visual Only) */}
        <motion.div
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-200 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="h-full bg-gray-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ 
              duration: 3, 
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
