"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  Star,
  Trophy,
  ArrowLeft,
  Eye,
  Home,
  Sparkles,
  Award,
  Medal
} from "lucide-react"

// Import game components
import GameModeSelector from "./components/GameModeSelector"
import NailDesignDisplay from "./components/NailDesignDisplay"
import ScoreCard from "./components/ScoreCard"
import Timer from "./components/Timer"
import LevelSelector from "./components/LevelSelector"
import GameCanvas from "./components/GameCanvas"

// Import styles 
import "../nail-game/styles.css"
import "../nail-game/global.css"
import "./styles.css"
import "./force-scroll.css" // Force scrolling to work at all times

// Import level designs
import { levelDesigns } from "./game-data/levels"

// Game states
type GameState = 
  | "intro" 
  | "mode-select" 
  | "level-select" 
  | "view-design" 
  | "recreate-design" 
  | "score-results" 
  | "game-over"

export default function NailChallengePage() {
  // Game state
  const [gameState, setGameState] = useState<GameState>("intro")
  const [gameMode, setGameMode] = useState<"casual" | "challenge">("casual")
  const [currentLevel, setCurrentLevel] = useState(1)
  const [totalStars, setTotalStars] = useState(0)
  const [levelScore, setLevelScore] = useState(0)
  const [viewTimer, setViewTimer] = useState(5)
  const [gameTimer, setGameTimer] = useState(60)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false) // Track transitions to prevent flicker
  
  // Design state
  const [targetDesign, setTargetDesign] = useState<any>(null)
  const [playerDesign, setPlayerDesign] = useState<any>(null)
  const [completedNails, setCompletedNails] = useState<number>(0) // Track progress

  // Tool state (simplified from original NailGame)  
  const [activeColor, setActiveColor] = useState("#ec4899")
  const [brushSize, setBrushSize] = useState(5)
  const [tool, setTool] = useState<"brush" | "eraser" | "glitter" | "sticker">("brush")
  const [sticker, setSticker] = useState<string | null>("star")
  const [nailShape, setNailShape] = useState<string>("oval")
  const [activeNail, setActiveNail] = useState(0)
  
  const { toast } = useToast()
  const designTimerRef = useRef<NodeJS.Timeout | null>(null)
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Handle starting a new game
  const startNewGame = (mode: "casual" | "challenge") => {
    setGameMode(mode)
    setGameState("level-select")
    toast({
      title: `${mode === "casual" ? "Casual" : "Challenge"} Mode Selected!`,
      description: mode === "casual" 
        ? "Practice your nail art skills with no pressure!" 
        : "Complete challenges to earn rewards and discounts!",
    })
  }

  // Start level selection
  const startLevel = (level: number) => {
    // Prevent rapid state transitions
    if (isTransitioning) return
    setIsTransitioning(true)
    
    // Get level design from our predefined levels
    const design = levelDesigns[level - 1]
    if (!design) {
      toast({
        title: "Level not available",
        description: "Please select a different level",
        variant: "destructive",
      })
      setIsTransitioning(false)
      return
    }

    // Reset game state for new level
    if (designTimerRef.current) clearInterval(designTimerRef.current)
    if (gameTimerRef.current) clearInterval(gameTimerRef.current)
    
    setCurrentLevel(level)
    setTargetDesign(design)
    setCompletedNails(0) // Reset nail completion count
    setPlayerDesign(null) // Clear previous design
    
    // Use setTimeout to prevent state flicker
    setTimeout(() => {
      setGameState("view-design")
      setViewTimer(5)
      setIsTimerRunning(true)
      setIsTransitioning(false)
    }, 200)

    // Use regular setTimeout instead of interval for more reliable timing
    // This ensures the design view timer works consistently
    const startTimers = () => {
      // Clear any existing timers first
      if (designTimerRef.current) clearInterval(designTimerRef.current as NodeJS.Timeout)
      
      // Create a simple 1-second interval for the view timer countdown
      designTimerRef.current = setInterval(() => {
        setViewTimer(prev => {
          const newValue = prev - 1;
          console.log('Timer tick:', newValue);
          
          // When timer reaches 0, transition to game screen
          if (newValue <= 0) {
            console.log('Timer finished, transitioning to game');
            clearInterval(designTimerRef.current as NodeJS.Timeout);
            
            // Force immediate transition to game screen
            setGameState("recreate-design");
            setGameTimer(60);
            setIsTimerRunning(true);
            
            // Start the game countdown timer
            if (gameTimerRef.current) clearInterval(gameTimerRef.current);
            gameTimerRef.current = setInterval(() => {
              setGameTimer(prev => {
                if (prev <= 1) {
                  clearInterval(gameTimerRef.current as NodeJS.Timeout);
                  setIsTimerRunning(false);
                  submitDesign();
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
            
            return 0;
          }
          
          return newValue;
        });
      }, 1000);
    };
    
    // Start the timers with a slight delay to ensure UI is ready
    setTimeout(startTimers, 500);
  }

  // Submit the final design for scoring
  const submitDesign = () => {
    // Clear any existing timers to prevent state conflicts
    if (designTimerRef.current) clearInterval(designTimerRef.current)
    if (gameTimerRef.current) clearInterval(gameTimerRef.current)

    // Strict challenge enforcement
    const requiredNails = targetDesign?.requiredNails || Array(targetDesign?.nails?.length || 5).fill(0).map((_, idx) => idx);
    const playerNails = playerDesign?.nails || [];
    let failReason = '';

    // 1. Check if any non-required nail is painted
    const extraPainted = playerNails.some((nail: any, idx: number) => {
      if (!requiredNails.includes(idx)) {
        // A nail is considered painted if completed or has non-default color/shape
        return nail.completed || nail.baseColor !== '#ec4899' || nail.shape !== 'oval';
      }
      return false;
    });
    if (extraPainted) {
      failReason = 'You painted nails that should have been left blank!';
    }

    // 2. Check all required nails are completed and match the target design
    let requiredMatch = true;
    let shapeScore = 0, colorScore = 0, designScore = 0;
    if (!failReason) {
      for (const idx of requiredNails) {
        const playerNail = playerNails[idx];
        const targetNail = targetDesign.nails[idx];
        if (!playerNail || !playerNail.completed) {
          failReason = 'You did not complete all required nails!';
          requiredMatch = false;
          break;
        }
        // Shape match
        if (playerNail.shape === targetNail.nailShape) shapeScore += 20 / requiredNails.length;
        // Color match
        if (playerNail.baseColor === targetNail.baseColor) colorScore += 30 / requiredNails.length;
        // Pattern/sticker/glitter match (basic)
        if (
          (!targetNail.pattern || playerNail.pattern === targetNail.pattern) &&
          (!targetNail.stickers || JSON.stringify(playerNail.stickers) === JSON.stringify(targetNail.stickers)) &&
          (!targetNail.glitter || playerNail.glitter === targetNail.glitter)
        ) {
          designScore += 30 / requiredNails.length;
        }
      }
    }
    // 3. If failed, show fail message and set score to 0
    if (failReason) {
      setLevelScore(0);
      setTimeout(() => {
        setGameState("score-results");
        toast({
          title: "Challenge Failed!",
          description: failReason,
          variant: "destructive"
        });
      }, 300);
      return;
    }
    // 4. Speed bonus
    const speedScore = gameTimer > 0 ? Math.min(20, Math.floor(gameTimer / 3)) : 0;
    const totalScore = Math.round(shapeScore + colorScore + designScore + speedScore);
    setLevelScore(totalScore);
    // Calculate stars earned
    let starsEarned = 0;
    if (totalScore >= 90) starsEarned = 3;
    else if (totalScore >= 75) starsEarned = 1;
    else starsEarned = 0;
    setTotalStars(prev => prev + starsEarned);
    setTimeout(() => {
      setGameState("score-results");
      toast({
        title: starsEarned > 0 ? "Level Complete!" : "Try Again!",
        description: starsEarned > 0 
          ? `You earned ${starsEarned} stars with a score of ${totalScore}!` 
          : `You scored ${totalScore}. You need 75+ to pass the level.`,
      });
    }, 300);
  }

  // Reset game timers when component unmounts or when game state changes
  useEffect(() => {
    return () => {
      if (designTimerRef.current) clearInterval(designTimerRef.current)
      if (gameTimerRef.current) clearInterval(gameTimerRef.current)
    }
  }, [gameState])
  
  // Prevent accidental state transitions
  // This ensures game states don't conflict and cause flickering
  useEffect(() => {
    // Store the current game state to prevent race conditions
    const currentGameState = gameState
    
    // When transitioning to these states, we want to ensure timers are cleared
    if (currentGameState === "score-results" || currentGameState === "level-select") {
      if (designTimerRef.current) clearInterval(designTimerRef.current)
      if (gameTimerRef.current) clearInterval(gameTimerRef.current)
      setIsTimerRunning(false)
    }
    
    // Special handling for the recreation phase timer
    if (currentGameState === "recreate-design") {
      console.log("Recreate design screen loaded, starting timer")
      
      // Clear any existing timers
      if (gameTimerRef.current) clearInterval(gameTimerRef.current)
      
      // Reset timer state
      setGameTimer(60)
      setIsTimerRunning(true)
      
      // Create a new timer
      gameTimerRef.current = setInterval(() => {
        setGameTimer(prev => {
          const newValue = prev - 1
          console.log("Game timer tick:", newValue)
          
          if (newValue <= 0) {
            console.log("Game time's up!")
            if (gameTimerRef.current) clearInterval(gameTimerRef.current)
            setIsTimerRunning(false)
            submitDesign()
            return 0
          }
          return newValue
        })
      }, 1000)
    }
  }, [gameState])

  // Force scrolling to be enabled on component mount
  useEffect(() => {
    // Remove any classes that might be preventing scrolling
    document.body.classList.remove('body-no-scroll');
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.body.style.position = 'static';
    
    // Force scrollbar to appear
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.overflowY = 'scroll';
    
    return () => {
      // Clean up when component unmounts
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.body.style.position = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.overflowY = '';
    };
  }, []);
  
  // Import fixes script for client-side execution
  useEffect(() => {
    // Create script element
    const script = document.createElement('script');
    script.src = '/nail-challenge/fixes.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up script when component unmounts
      document.body.removeChild(script);
    };
  }, []);

  return (
    <main className="container py-6 md:py-12 relative min-h-screen nail-challenge-container">
      <div className="max-w-4xl mx-auto">
        {/* Game Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-pink-600 mb-2 game-title">
            Nail It! <Sparkles className="inline-block h-6 w-6 text-yellow-500" />
          </h1>
          <p className="text-gray-600">The Ultimate Nail Studio Challenge</p>
        </div>

        {/* Game Content - Different UI based on game state */}
        <Card className="p-6 shadow-lg rounded-xl overflow-visible recreate-design-card" style={{ overflowY: 'visible', maxHeight: 'none', position: 'relative' }}>
          {/* INTRO SCREEN */}
          {gameState === "intro" && (
            <div className="text-center space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-pink-600 mb-4">Welcome to the Nail Challenge!</h2>
                <p className="text-gray-600 mb-4">
                  Test your memory and nail art skills by recreating beautiful nail designs under time pressure.
                </p>
                <div className="flex flex-wrap justify-center gap-4 mt-8">
                  <div className="border rounded-lg p-4 bg-pink-50 w-56">
                    <div className="flex items-center mb-2">
                      <Eye className="h-5 w-5 text-pink-600 mr-2" />
                      <h3 className="font-semibold">Remember the Look</h3>
                    </div>
                    <p className="text-sm text-gray-600">You'll see a design for 5 seconds, then recreate it from memory</p>
                  </div>
                  <div className="border rounded-lg p-4 bg-pink-50 w-56">
                    <div className="flex items-center mb-2">
                      <Clock className="h-5 w-5 text-pink-600 mr-2" />
                      <h3 className="font-semibold">Beat the Clock</h3>
                    </div>
                    <p className="text-sm text-gray-600">Complete your design within 60 seconds</p>
                  </div>
                  <div className="border rounded-lg p-4 bg-pink-50 w-56">
                    <div className="flex items-center mb-2">
                      <Star className="h-5 w-5 text-yellow-500 mr-2" />
                      <h3 className="font-semibold">Earn Stars & Rewards</h3>
                    </div>
                    <p className="text-sm text-gray-600">Score 75+ to pass, 90+ for 3 stars. Win real discounts!</p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => setGameState("mode-select")} 
                className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-4 text-lg"
              >
                Start Playing
              </Button>
              <div className="mt-4">
                <Link href="/nail-game" className="text-pink-600 hover:text-pink-700 flex items-center justify-center">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go to Free Paint Mode
                </Link>
              </div>
            </div>
          )}

          {/* MODE SELECT */}
          {gameState === "mode-select" && (
            <GameModeSelector onSelectMode={startNewGame} />
          )}

          {/* LEVEL SELECT */}
          {gameState === "level-select" && (
            <LevelSelector 
              onSelectLevel={startLevel} 
              currentLevel={currentLevel}
              gameMode={gameMode}
              totalStars={totalStars}
            />
          )}

          {/* VIEW DESIGN */}
          {gameState === "view-design" && (
            <div className="text-center space-y-6">
              <div className="flex justify-center items-center gap-4 mb-4">
                <Badge variant="outline" className="text-lg py-1 px-4 bg-pink-50">
                  <Trophy className="h-4 w-4 mr-2 text-pink-600" />
                  Level {currentLevel}
                </Badge>
                <Timer seconds={viewTimer} isRunning={isTimerRunning} variant="warning" />
              </div>
              
              <h2 className="text-2xl font-bold text-pink-600">
                Remember This Design!
              </h2>
              
              <div className="my-8">
                <NailDesignDisplay design={targetDesign} />
              </div>
              
              <p className="text-gray-600">
                Look carefully! You'll need to recreate this from memory.
              </p>
              
              {/* Manual transition button in case timer fails */}
              <Button 
                onClick={() => {
                  // Force transition to game state
                  clearInterval(designTimerRef.current as NodeJS.Timeout);
                  setGameState("recreate-design");
                  setGameTimer(60);
                  setIsTimerRunning(true);
                  
                  // Start game timer
                  if (gameTimerRef.current) clearInterval(gameTimerRef.current);
                  gameTimerRef.current = setInterval(() => {
                    setGameTimer(prev => {
                      if (prev <= 1) {
                        clearInterval(gameTimerRef.current as NodeJS.Timeout);
                        setIsTimerRunning(false);
                        submitDesign();
                        return 0;
                      }
                      return prev - 1;
                    });
                  }, 1000);
                }}
                className="bg-pink-600 hover:bg-pink-700 mt-4"
              >
                I'm Ready!
              </Button>
            </div>
          )}

          {/* RECREATE DESIGN */}
          {gameState === "recreate-design" && (
            <div className="space-y-4 overflow-visible ensure-scroll force-scroll-container" style={{ overflowY: 'visible', touchAction: 'pan-y', position: 'relative', maxHeight: 'none' }}>
              <div className="flex justify-between items-center mb-4">
                <Badge variant="outline" className="text-lg py-1 px-4 bg-pink-50">
                  <Trophy className="h-4 w-4 mr-2 text-pink-600" />
                  Level {currentLevel}
                </Badge>
                <div className="relative z-10">
                  <Timer seconds={gameTimer} isRunning={isTimerRunning} variant={gameTimer <= 20 ? (gameTimer <= 10 ? "danger" : "warning") : "default"} />
                </div>
                
                <Button 
                  onClick={submitDesign}
                  variant="outline"
                  className="border-pink-500 text-pink-600 hover:bg-pink-50"
                >
                  Submit Early
                </Button>
              </div>
              
              <h2 className="text-2xl font-bold text-pink-600 text-center mb-4">
                Recreate the Design!
              </h2>
              
              <div className="my-4 tool-area force-scroll-container" style={{ overflow: 'visible', position: 'relative' }}>
                <GameCanvas 
                  activeColor={activeColor}
                  brushSize={brushSize}
                  tool={tool}
                  sticker={sticker}
                  nailShape={nailShape}
                  activeNail={activeNail}
                  setActiveNail={setActiveNail}
                  setActiveColor={setActiveColor}
                  setBrushSize={setBrushSize}
                  setTool={setTool}
                  setSticker={setSticker}
                  setNailShape={setNailShape}
                  levelData={targetDesign}
                  onSaveDesign={(design) => {
                    setPlayerDesign(design)
                    // Update completed nails count based on player's progress
                    if (design && design.nails) {
                      const completed = design.nails.filter((n: any) => n.completed).length;
                      setCompletedNails(completed);
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* SCORE RESULTS */}
          {gameState === "score-results" && (
            <ScoreCard 
              score={levelScore}
              level={currentLevel}
              onNextLevel={() => {
                // Important: Add a slight delay before changing states
                // This prevents the flickering between states
                setTimeout(() => {
                  if (levelScore >= 75) {
                    // If they passed, go to next level
                    startLevel(currentLevel + 1)
                  } else {
                    // If they failed, retry the same level
                    startLevel(currentLevel)
                  }
                }, 300)
              }}
              onMainMenu={() => {
                // Add delay before state transition to prevent flickering
                setTimeout(() => {
                  setGameState("level-select")
                }, 300)
              }}
            />
          )}
        </Card>

        {/* Game footer */}
        <div className="mt-10 text-center">
          <div className="flex justify-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              asChild
            >
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              asChild
            >
              <Link href="/nail-game">
                <Sparkles className="h-4 w-4 mr-2" />
                Free Paint
              </Link>
            </Button>
          </div>
          
          {gameState !== "intro" && gameState !== "mode-select" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setGameState("intro")}
              className="mt-4 text-gray-500"
            >
              Reset Game
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}
