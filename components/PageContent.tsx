'use client'

import { motion } from 'framer-motion'
import { PageData } from '@/data/pages'

interface PageContentProps {
  page: PageData
  className?: string
}

export function PageContent({ page, className = "" }: PageContentProps) {
  // Get text size classes
  const getTextSizeClass = (textSize: PageData['textSize']) => {
    switch (textSize) {
      case 'title':
        return 'text-7xl md:text-8xl lg:text-9xl font-bold tracking-wider'
      case 'large':
        return 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide'
      case 'medium':
        return 'text-4xl md:text-5xl font-bold tracking-wide'
      case 'small':
        return 'text-3xl md:text-4xl font-normal leading-relaxed'
      case 'contact':
        return 'text-2xl md:text-3xl font-medium'
      default:
        return 'text-3xl md:text-4xl font-normal leading-relaxed'
    }
  }

  // Get text shadow styles
  const getTextShadowStyle = (textSize: PageData['textSize']) => {
    switch (textSize) {
      case 'title':
        return {
          textShadow: '0 0 30px rgba(0,0,0,0.8), 0 0 60px rgba(0,0,0,0.6), 0 0 90px rgba(0,0,0,0.4)'
        }
      case 'large':
        return {
          textShadow: '0 0 25px rgba(0,0,0,0.8), 0 0 50px rgba(0,0,0,0.6), 0 0 75px rgba(0,0,0,0.4)'
        }
      case 'medium':
        return {
          textShadow: '0 0 20px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.6), 0 0 60px rgba(0,0,0,0.4)'
        }
      default:
        return {
          textShadow: '0 0 18px rgba(0,0,0,0.7), 0 0 35px rgba(0,0,0,0.5), 0 0 50px rgba(0,0,0,0.3)'
        }
    }
  }

  // Render text with highlights
  const renderTextWithHighlights = (text: string, highlightWords?: string[]) => {
    if (!highlightWords || highlightWords.length === 0) {
      return text
    }

    let result = text
    let parts: (string | JSX.Element)[] = [text]

    highlightWords.forEach((word, index) => {
      const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
      parts = parts.map(part => {
        if (typeof part === 'string') {
          const splitParts = part.split(regex)
          return splitParts.map((splitPart, splitIndex) => {
            if (regex.test(splitPart)) {
              return (
                <motion.span
                  key={`${index}-${splitIndex}`}
                  className="inline-block text-yellow-300 font-extrabold"
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: index * 0.2
                  }}
                >
                  {splitPart}
                </motion.span>
              )
            }
            return splitPart
          })
        }
        return part
      }).flat()
    })

    return parts
  }

  // Render question marks with special styling
  const renderQuestionMarks = (text: string) => {
    if (page.specialStyling !== 'question') return text

    const parts = text.split('?')
    if (parts.length === 1) return text

    return (
      <>
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && (
              <motion.span
                className="inline-block text-yellow-400 font-extrabold text-6xl md:text-7xl lg:text-8xl"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                ?
              </motion.span>
            )}
          </span>
        ))}
      </>
    )
  }

  const textSizeClass = getTextSizeClass(page.textSize)
  const textShadowStyle = getTextShadowStyle(page.textSize)
  const isTitle = page.textSize === 'title'
  const isContact = page.textSize === 'contact'

  return (
    <motion.div
      className={`text-center max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-4xl mx-auto px-2 sm:px-4 w-full ${className}`}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ 
        duration: 0.2, 
        ease: "easeOut",
        scale: { duration: 0.15 }
      }}
    >
      <motion.div
        className={`content-text ${textSizeClass} ${
          isTitle ? 'text-white' : isContact ? 'text-soft-gray' : 'text-white'
        } drop-shadow-2xl text-balance`}
        style={textShadowStyle}
      >
        {renderTextWithHighlights(page.text, page.highlightWords)}
      </motion.div>
    </motion.div>
  )
}

