"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  Trophy, 
  Heart, 
  Gift, 
  Award, 
  ArrowRight,
  Sparkles
} from "lucide-react"

type GameModeSelectorProps = {
  onSelectMode: (mode: "casual" | "challenge") => void
}

export default function GameModeSelector({ onSelectMode }: GameModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<"casual" | "challenge" | null>(null)
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-pink-600 text-center mb-6">
        Choose Your Game Mode
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Casual Mode Card */}
        <Card 
          className={`p-6 mode-card ${selectedMode === "casual" ? "border-pink-500 ring-2 ring-pink-300" : "border-gray-200"}`}
          onClick={() => setSelectedMode("casual")}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <Heart className="h-6 w-6 text-pink-500 mr-2" />
              <h3 className="text-xl font-bold text-gray-800">Casual Mode</h3>
            </div>
            <Badge variant="outline" className="bg-pink-50 text-pink-600 border-pink-200">
              For Fun
            </Badge>
          </div>
          
          <p className="text-gray-600 mb-6">
            Practice your nail art skills with no pressure! Perfect for beginners or just for fun.
          </p>
          
          <div className="space-y-2 mb-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Relaxed time limits</span>
            </div>
            <div className="flex items-center">
              <Trophy className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Track your progress</span>
            </div>
            <div className="flex items-center">
              <Sparkles className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">All designs available</span>
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              variant="outline" 
              className={`w-full ${selectedMode === "casual" ? "border-pink-500 text-pink-600" : ""}`}
              onClick={() => setSelectedMode("casual")}
            >
              Select Casual
            </Button>
          </div>
        </Card>
        
        {/* Challenge Mode Card */}
        <Card 
          className={`p-6 mode-card ${selectedMode === "challenge" ? "border-pink-500 ring-2 ring-pink-300" : "border-gray-200"}`}
          onClick={() => setSelectedMode("challenge")}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
              <Award className="h-6 w-6 text-yellow-500 mr-2" />
              <h3 className="text-xl font-bold text-gray-800">Challenge Mode</h3>
            </div>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
              Win Prizes
            </Badge>
          </div>
          
          <p className="text-gray-600 mb-6">
            Test your skills under pressure! Complete challenges to earn stars and win real discounts.
          </p>
          
          <div className="space-y-2 mb-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Beat the clock challenges</span>
            </div>
            <div className="flex items-center">
              <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Earn stars for rewards</span>
            </div>
            <div className="flex items-center">
              <Gift className="h-4 w-4 text-pink-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Win real discounts!</span>
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              variant="outline" 
              className={`w-full ${selectedMode === "challenge" ? "border-pink-500 text-pink-600" : ""}`}
              onClick={() => setSelectedMode("challenge")}
            >
              Select Challenge
            </Button>
          </div>
        </Card>
      </div>
      
      <div className="flex justify-center mt-8">
        <Button 
          onClick={() => selectedMode && onSelectMode(selectedMode)}
          disabled={!selectedMode}
          className="bg-pink-600 hover:bg-pink-700"
          size="lg"
        >
          {selectedMode ? "Start Game" : "Select a Mode"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
