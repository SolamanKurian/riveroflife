'use client'

import { useEffect, useState, useCallback } from 'react'

interface AudioControllerProps {
  onAudioStateChange: (enabled: boolean, isPlaying: boolean) => void
}

export const AudioController = ({ onAudioStateChange }: AudioControllerProps) => {
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)

  // Initialize audio
  useEffect(() => {
    const audio = new Audio('/track.mp3')
    audio.loop = true
    audio.volume = 0.3
    audio.preload = 'auto'
    
    audio.addEventListener('canplaythrough', () => {
      console.log('🎵 Audio ready to play')
      audio.play().then(() => {
        console.log('✅ Audio started playing automatically')
        setIsAudioPlaying(true)
        onAudioStateChange(audioEnabled, true)
      }).catch((error) => {
        console.log('❌ Auto-play failed:', error)
        setIsAudioPlaying(false)
        onAudioStateChange(audioEnabled, false)
      })
    })

    audio.addEventListener('play', () => {
      console.log('▶️ Audio started playing')
      setIsAudioPlaying(true)
      onAudioStateChange(audioEnabled, true)
    })

    audio.addEventListener('pause', () => {
      console.log('⏸️ Audio paused')
      setIsAudioPlaying(false)
      onAudioStateChange(audioEnabled, false)
    })

    audio.addEventListener('ended', () => {
      console.log('🔚 Audio ended')
      setIsAudioPlaying(false)
      onAudioStateChange(audioEnabled, false)
    })

    setAudioElement(audio)

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [onAudioStateChange])

  // Load audio preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('audioEnabled')
    if (saved !== null) {
      const enabled = JSON.parse(saved)
      setAudioEnabled(enabled)
      
      if (enabled && audioElement && audioElement.paused) {
        audioElement.play().catch(console.error)
      }
    }
  }, [audioElement, audioEnabled])

  // Save audio preference to localStorage
  useEffect(() => {
    localStorage.setItem('audioEnabled', JSON.stringify(audioEnabled))
  }, [audioEnabled])

  // Handle audio toggle
  const handleAudioToggle = useCallback((enabled: boolean) => {
    if (audioElement) {
      if (enabled) {
        audioElement.play().then(() => {
          setIsAudioPlaying(true)
          console.log('✅ Audio unmuted and playing')
          onAudioStateChange(enabled, true)
        }).catch((error) => {
          console.log('❌ Failed to resume audio:', error)
          setIsAudioPlaying(false)
          onAudioStateChange(enabled, false)
        })
      } else {
        audioElement.pause()
        setIsAudioPlaying(false)
        console.log('🔇 Audio muted')
        onAudioStateChange(enabled, false)
      }
    }
    
    setAudioEnabled(enabled)
  }, [audioElement, onAudioStateChange])

  // User interaction listener for audio
  useEffect(() => {
    const handleUserInteraction = async () => {
      if (audioElement && audioElement.paused && audioEnabled) {
        try {
          await audioElement.play()
          console.log('✅ Audio started on user interaction')
          setIsAudioPlaying(true)
          onAudioStateChange(audioEnabled, true)
        } catch (error) {
          console.log('❌ Failed to start audio on user interaction:', error)
        }
      }
    }

    const events = ['click', 'mousedown', 'touchstart', 'keydown']
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true, passive: true })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction)
      })
    }
  }, [audioElement, audioEnabled, onAudioStateChange])

  return {
    audioEnabled,
    isAudioPlaying,
    handleAudioToggle
  }
}
