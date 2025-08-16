'use client'

import { motion } from 'framer-motion'

interface ProgressIndicatorProps {
  current: number
  total: number
}

export function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
  const progress = (current / total) * 100

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
      <div className="flex items-center gap-2">
        {/* Progress dots */}
        <div className="flex gap-1">
          {Array.from({ length: total }, (_, i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                i < current ? 'bg-soft-gray' : 'bg-gentle-gray opacity-30'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
            />
          ))}
        </div>
        
        {/* Progress text */}
        <motion.div
          className="text-xs text-gentle-gray opacity-60 ml-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.5 }}
        >
          {current} / {total}
        </motion.div>
      </div>
    </div>
  )
}


