"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Trophy, ArrowRight, Home, RotateCcw } from "lucide-react"

type ScoreCardProps = {
  score: number
  level: number
  onNextLevel: () => void
  onMainMenu: () => void
}

export default function ScoreCard({ score, level, onNextLevel, onMainMenu }: ScoreCardProps) {
  const [showStars, setShowStars] = useState(false)
  const [animateScore, setAnimateScore] = useState(false)
  
  // Calculate stars earned
  const stars = score >= 90 ? 3 : (score >= 75 ? 1 : 0)
  const isPassing = score >= 75
  
  // Text and styles based on score
  const getScoreText = () => {
    if (score >= 90) return "Perfect!"
    if (score >= 75) return "Good job!"
    return "Try again!"
  }
  
  const getScoreClass = () => {
    if (score >= 90) return "score-perfect"
    if (score >= 75) return "score-good"
    return "score-fail"
  }
  
  // Animate stars and score when component mounts
  useEffect(() => {
    // Start animations with slight delay
    const scoreTimer = setTimeout(() => {
      setAnimateScore(true)
    }, 500)
    
    const starTimer = setTimeout(() => {
      setShowStars(true)
    }, 1000)
    
    // Cleanup timers
    return () => {
      clearTimeout(scoreTimer)
      clearTimeout(starTimer)
    }
  }, [])

  return (
    <div className="score-card text-center py-6">
      {/* Display confetti for high scores */}
      {score >= 90 && (
        <>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: `hsl(${Math.random() * 360}, 80%, 60%)`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </>
      )}
      
      <div className="space-y-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Level {level} {isPassing ? "Complete!" : "Results"}
          </h2>
          
          <div className="flex justify-center mb-4">
            <Trophy className={`h-12 w-12 ${isPassing ? "text-yellow-500" : "text-gray-300"}`} />
          </div>
          
          <div className="star-score mb-6">
            {[1, 2, 3].map((_, i) => (
              <Star
                key={i}
                className={`star ${showStars && i < stars ? "star-active" : "star-inactive"}`}
                style={{ animationDelay: `${i * 0.2 + 1}s` }}
              />
            ))}
          </div>
          
          <div 
            className={`inline-block ${getScoreClass()} score-badge ${animateScore ? "scale-100" : "scale-0"} transition-transform duration-500`}
          >
            <span className="text-lg font-bold mr-1">
              {getScoreText()}
            </span>
            <span className="text-lg font-bold">
              {score}/100
            </span>
          </div>
          
          <div className="mt-6 space-y-2 text-gray-700">
            <div className="flex justify-between px-8 py-1 border-b">
              <span>Shape Match:</span>
              <span className="font-medium">{Math.min(20, Math.floor(score / 5))} / 20</span>
            </div>
            <div className="flex justify-between px-8 py-1 border-b">
              <span>Color Match:</span>
              <span className="font-medium">{Math.min(30, Math.floor(score / 3.33))} / 30</span>
            </div>
            <div className="flex justify-between px-8 py-1 border-b">
              <span>Design Match:</span>
              <span className="font-medium">{Math.min(30, Math.floor(score / 3.33))} / 30</span>
            </div>
            <div className="flex justify-between px-8 py-1 border-b">
              <span>Speed Bonus:</span>
              <span className="font-medium">{Math.min(20, score >= 90 ? 20 : Math.floor(score / 5))} / 20</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          {isPassing ? (
            <Button 
              onClick={onNextLevel} 
              className="bg-pink-600 hover:bg-pink-700 w-full max-w-xs"
            >
              {level < 10 ? "Next Level" : "Play Again"} 
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={onNextLevel}
              className="bg-pink-600 hover:bg-pink-700 w-full max-w-xs"
            >
              Try Again 
              <RotateCcw className="ml-2 h-4 w-4" />
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={onMainMenu}
            className="w-full max-w-xs"
          >
            <Home className="mr-2 h-4 w-4" />
            Level Select
          </Button>
        </div>
      </div>
    </div>
  )
}
