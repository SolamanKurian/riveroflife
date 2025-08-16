'use client'

import { motion } from 'framer-motion'

interface AudioStatusIndicatorProps {
  isEnabled: boolean
  isPlaying: boolean
}

export function AudioStatusIndicator({ isEnabled, isPlaying }: AudioStatusIndicatorProps) {
  if (!isEnabled) return null

  return (
    <motion.div
      className="fixed top-4 right-4 z-30"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {isPlaying ? (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 backdrop-blur-sm rounded-full border border-green-500/30">
          <motion.div
            className="w-2 h-2 bg-green-400 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-xs text-green-400 font-medium">Audio Playing</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/20 backdrop-blur-sm rounded-full border border-yellow-500/30">
          <motion.div
            className="w-2 h-2 bg-yellow-400 rounded-full"
            animate={{ pulse: true }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-xs text-yellow-400 font-medium">Click to Start Audio</span>
        </div>
      )}
    </motion.div>
  )
}
