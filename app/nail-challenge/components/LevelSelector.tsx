"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Star, 
  Trophy, 
  Lock, 
  Clock, 
  ArrowLeft,
  Gift
} from "lucide-react"

// Import level data
import { levelDesigns } from "../game-data/levels"

type LevelSelectorProps = {
  onSelectLevel: (level: number) => void
  currentLevel: number
  gameMode: "casual" | "challenge"
  totalStars: number
}

export default function LevelSelector({ 
  onSelectLevel, 
  currentLevel, 
  gameMode,
  totalStars 
}: LevelSelectorProps) {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  
  // Determine if a level is locked based on requirements
  const isLevelLocked = (levelId: number) => {
    if (gameMode === "casual") {
      // In casual mode, only first 3 levels are initially unlocked
      return levelId > 3 && totalStars < (levelId - 3) * 3
    } else {
      // In challenge mode, levels unlock based on previous level completion
      const level = levelDesigns.find(l => l.id === levelId)
      if (!level) return true
      
      return levelId !== 1 && (
        currentLevel < level.unlockRequirement.level || 
        totalStars < level.unlockRequirement.stars
      )
    }
  }
  
  // Group levels by difficulty
  const easyLevels = levelDesigns.filter(level => level.difficulty === 1)
  const mediumLevels = levelDesigns.filter(level => level.difficulty === 2)
  const hardLevels = levelDesigns.filter(level => level.difficulty === 3)
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-pink-600">
          Select a Level
        </h2>
        <Badge variant="outline" className="px-3 py-1">
          <Star className="h-4 w-4 text-yellow-500 mr-2" />
          <span>{totalStars} stars earned</span>
        </Badge>
      </div>
      
      {/* Level difficulty sections */}
      <div className="space-y-6">
        {/* Easy Levels */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <Badge className="bg-green-100 text-green-700 mr-2">Easy</Badge>
            Getting Started
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {easyLevels.map((level) => (
              <LevelCard 
                key={level.id}
                level={level}
                isLocked={isLevelLocked(level.id)}
                isSelected={selectedLevel === level.id}
                onSelect={() => !isLevelLocked(level.id) && setSelectedLevel(level.id)}
                gameMode={gameMode}
              />
            ))}
          </div>
        </div>
        
        {/* Medium Levels */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <Badge className="bg-amber-100 text-amber-700 mr-2">Medium</Badge>
            Step It Up
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {mediumLevels.map((level) => (
              <LevelCard 
                key={level.id}
                level={level}
                isLocked={isLevelLocked(level.id)}
                isSelected={selectedLevel === level.id}
                onSelect={() => !isLevelLocked(level.id) && setSelectedLevel(level.id)}
                gameMode={gameMode}
              />
            ))}
          </div>
        </div>
        
        {/* Hard Levels */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <Badge className="bg-red-100 text-red-700 mr-2">Hard</Badge>
            Nail Master Challenges
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {hardLevels.map((level) => (
              <LevelCard 
                key={level.id}
                level={level}
                isLocked={isLevelLocked(level.id)}
                isSelected={selectedLevel === level.id}
                onSelect={() => !isLevelLocked(level.id) && setSelectedLevel(level.id)}
                gameMode={gameMode}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <Button 
          onClick={() => selectedLevel && onSelectLevel(selectedLevel)}
          disabled={!selectedLevel}
          className="bg-pink-600 hover:bg-pink-700"
        >
          {selectedLevel ? "Start Level" : "Select a Level"}
        </Button>
      </div>
    </div>
  )
}

// Individual level card component
function LevelCard({ 
  level, 
  isLocked, 
  isSelected, 
  onSelect,
  gameMode
}: { 
  level: typeof levelDesigns[0]
  isLocked: boolean
  isSelected: boolean
  onSelect: () => void
  gameMode: "casual" | "challenge"
}) {
  return (
    <Card 
      className={`
        level-card p-3 text-center cursor-pointer relative overflow-hidden
        ${isLocked ? 'level-locked' : ''}
        ${isSelected ? 'ring-2 ring-pink-400 border-pink-500' : ''}
      `}
      onClick={onSelect}
    >
      {/* Level number */}
      <div className="text-lg font-bold">
        Level {level.id}
      </div>
      
      {/* Level name */}
      <div className="text-sm font-medium text-gray-700 mb-2">
        {level.name}
      </div>
      
      {/* Level info icons */}
      <div className="flex justify-center items-center gap-2 text-xs">
        <div className="flex items-center">
          <Clock className="h-3 w-3 text-gray-500 mr-1" />
          <span>{level.timeLimit}s</span>
        </div>
        
        {level.handCount === 2 ? (
          <Badge variant="outline" className="text-xs py-0 px-1">
            Both Hands
          </Badge>
        ) : null}
        
        {level.reward && gameMode === "challenge" && (
          <div className="text-pink-600">
            <Gift className="h-3 w-3" />
          </div>
        )}
      </div>
      
      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-gray-100/80 flex items-center justify-center">
          <Lock className="h-6 w-6 text-gray-400" />
        </div>
      )}
    </Card>
  )
}
