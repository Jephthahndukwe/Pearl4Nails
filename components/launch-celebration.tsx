'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWindowSize } from 'react-use'

export default function LaunchCelebration() {
  const [showCelebration, setShowCelebration] = useState(true)
  const { width, height } = useWindowSize()
  const [confettiLoaded, setConfettiLoaded] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('canvas-confetti').then((module) => {
        const confetti = module.default
        setConfettiLoaded(true)

        const duration = 4 * 1000
        const end = Date.now() + duration

        const interval = setInterval(() => {
          if (Date.now() > end) {
            clearInterval(interval)
            return
          }

          confetti({
            particleCount: 7,
            origin: {
              x: Math.random(),
              y: Math.random() * 0.2, // More varied top starting points
            },
            spread: 160,
            startVelocity: 40,
            gravity: 0.8,
            ticks: 300,
            zIndex: 9999,
          })
        }, 100)
      })
    }

    const celebrationTimeout = setTimeout(() => {
      setShowCelebration(false)
    }, 6000)

    return () => {
      clearTimeout(celebrationTimeout)
    }
  }, [])

  const balloonColors = ['#FF69B4', '#9370DB', '#FFD700', '#40E0D0', '#FF6347']

  const generateBalloons = () => {
    return Array.from({ length: 15 }, (_, i) => {
      const x = Math.random() * 90 + '%'
      const delay = Math.random() * 1.5
      const color = balloonColors[Math.floor(Math.random() * balloonColors.length)]
  
      return (
        <motion.div
          key={i}
          className="absolute bottom-[-150px]"
          style={{ left: x }}
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: -height, opacity: 0 }}
          transition={{ duration: 6, delay }}
        >
          <div className="flex flex-col items-center space-y-[-4px]">
            {/* Balloon Body */}
            <div
              className="w-14 h-14 rounded-full shadow-lg relative z-10"
              style={{ backgroundColor: color }}
            >
              {/* Knot */}
              <div
                className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rotate-45 z-20"
                style={{
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                }}
              />
            </div>
  
            {/* String */}
            <div className="w-[1px] h-16 bg-gray-400 opacity-70" />
          </div>
        </motion.div>
      )
    })
  }

  return (
    <AnimatePresence>
      {showCelebration && confettiLoaded && (
        <motion.div
          className="fixed inset-0 z-[9999] backdrop-blur-2xl bg-white/30 flex items-center justify-center overflow-hidden px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          {/* Balloons */}
          <div className="absolute inset-0 pointer-events-none">{generateBalloons()}</div>

          {/* Celebration Box */}
          <motion.div
            className="bg-white/70 border border-white/40 backdrop-blur-2xl shadow-2xl rounded-3xl px-6 py-10 w-full max-w-xl text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 120 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-pink-600 mb-4 animate-bounce">
              🎉 We’re Live! 🎉
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-pink-800 font-medium">
              Welcome to the all-new <span className="font-bold text-pink-700">Pearl4Nails</span> experience 💅✨
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
