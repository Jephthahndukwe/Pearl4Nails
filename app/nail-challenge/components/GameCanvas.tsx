"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Palette, 
  Droplet, 
  Eraser, 
  Sparkles, 
  Sticker,
  SquareAsterisk,
  Heart,
  Flower2,
  ArrowLeftRight
} from "lucide-react"

// Import NailCanvas (we'll adapt the existing one from the original game)
import NailCanvas from "../../nail-game/components/NailCanvas"
import { LevelDesign } from "../game-data/levels"

// Define shape options
const shapeOptions = [
  { id: "oval", label: "Oval" },
  { id: "square", label: "Square" },
  { id: "almond", label: "Almond" },
  { id: "stiletto", label: "Stiletto" },
  { id: "coffin", label: "Coffin" },
]

// Define color options (pre-selected palette for the game)
const colorOptions = [
  { id: "#ec4899", name: "Pink" },
  { id: "#f43f5e", name: "Rose" },
  { id: "#ef4444", name: "Red" },
  { id: "#f97316", name: "Orange" },
  { id: "#eab308", name: "Yellow" },
  { id: "#84cc16", name: "Lime" },
  { id: "#22c55e", name: "Green" },
  { id: "#06b6d4", name: "Cyan" },
  { id: "#3b82f6", name: "Blue" },
  { id: "#8b5cf6", name: "Purple" },
  { id: "#d946ef", name: "Magenta" },
  { id: "#ffffff", name: "White" },
  { id: "#000000", name: "Black" },
]

// Define tool options
const toolOptions = [
  { id: "brush", label: "Brush", icon: Droplet },
  { id: "eraser", label: "Eraser", icon: Eraser },
  { id: "glitter", label: "Glitter", icon: Sparkles },
  { id: "sticker", label: "Sticker", icon: Sticker },
]

// Define sticker options
const stickerOptions = [
  { id: "star", label: "Star", icon: SquareAsterisk },
  { id: "heart", label: "Heart", icon: Heart },
  { id: "flower", label: "Flower", icon: Flower2 },
]

type GameCanvasProps = {
  activeColor: string
  brushSize: number
  tool: "brush" | "eraser" | "glitter" | "sticker"
  sticker: string | null
  nailShape: string
  activeNail: number
  setActiveNail: (nail: number) => void
  setActiveColor: (color: string) => void
  setBrushSize: (size: number) => void
  setTool: (tool: "brush" | "eraser" | "glitter" | "sticker") => void
  setSticker: (sticker: string | null) => void
  setNailShape: (shape: string) => void
  levelData: LevelDesign | null
  onSaveDesign: (designData: any) => void
}

export default function GameCanvas({
  activeColor,
  brushSize,
  tool,
  sticker,
  nailShape,
  activeNail,
  setActiveNail,
  setActiveColor,
  setBrushSize,
  setTool,
  setSticker,
  setNailShape,
  levelData,
  onSaveDesign
}: GameCanvasProps) {
  // Track canvas history for each nail 
  const [handMode, setHandMode] = useState<"left" | "right">("left")
  const [completedNails, setCompletedNails] = useState<boolean[]>(Array(10).fill(false))
  const [nailShapes, setNailShapes] = useState<string[]>(Array(10).fill('oval'));
  const [nailColors, setNailColors] = useState<string[]>(Array(10).fill('#ec4899'));
  const [allNailsPreview, setAllNailsPreview] = useState<string[]>(Array(10).fill(""))
  const [enlargedView, setEnlargedView] = useState(false)
  
  const canvasHistoryRef = useRef<ImageData[][]>(Array(10).fill(null).map(() => []))
  const canvasHistoryIndexRef = useRef<number[]>(Array(10).fill(-1))
  
  // Initialize canvas history for each nail
  useEffect(() => {
    canvasHistoryRef.current = Array(10)
      .fill(null)
      .map(() => [])
    canvasHistoryIndexRef.current = Array(10).fill(-1)
  }, [])
  
  // Determine how many nails to display based on level data
  const handCount = levelData?.nails[0]?.handCount || 1
  const nailCount = handCount === 1 ? 5 : 10
  
  // Calculate if all required nails are completed
  const requiredNails = levelData?.requiredNails || Array(handCount === 1 ? 5 : 10).fill(0).map((_, idx) => idx);
  const requiredNailsCompleted = requiredNails.every(nail => completedNails[nail])
  
  // Save to history when drawing stops
  const saveToHistory = (imageData: ImageData) => {
    // Only allow saving if this nail is required for the challenge
    if (!requiredNails.includes(activeNail)) {
      // Optionally, show a warning or ignore silently
      return;
    }
    const historyCopy = [...canvasHistoryRef.current]
    const currentHistory = [...historyCopy[activeNail]]
    const currentIndex = canvasHistoryIndexRef.current[activeNail]
    
    // Remove any redo states
    const newHistory = currentHistory.slice(0, currentIndex + 1)
    newHistory.push(imageData)
    
    historyCopy[activeNail] = newHistory
    canvasHistoryRef.current = historyCopy
    
    // Update index
    const indexCopy = [...canvasHistoryIndexRef.current]
    indexCopy[activeNail] = newHistory.length - 1
    canvasHistoryIndexRef.current = indexCopy
    
    // Mark this nail as completed
    if (!completedNails[activeNail]) {
      const newCompletedNails = [...completedNails]
      newCompletedNails[activeNail] = true
      setCompletedNails(newCompletedNails)
      
      console.log(`Marked nail ${activeNail} as completed`);
    }
    
    // Track which nails have been worked on
    const completedNailsCount = completedNails.filter(Boolean).length;
    console.log(`Total completed nails: ${completedNailsCount}`);
    
    // After saving, call onSaveDesign to update parent state with detailed information
    // Update persistent shape/color for this nail
    const newNailShapes = [...nailShapes];
    const newNailColors = [...nailColors];
    newNailShapes[activeNail] = nailShape;
    newNailColors[activeNail] = activeColor;
    setNailShapes(newNailShapes);
    setNailColors(newNailColors);

    onSaveDesign({
      nails: Array(10).fill(null).map((_, i) => ({
        completed: completedNails[i],
        shape: newNailShapes[i],
        baseColor: newNailColors[i],
        handMode: handMode,
        activeNail: activeNail,
        totalCompleted: completedNailsCount
      })),
      handMode,
    })
    
    // Remove any scroll locks when interaction ends
    const canvasContainer = document.querySelector('.game-canvas-container');
    if (canvasContainer) {
      canvasContainer.classList.remove('drawing-active');
    }
  }
  
  // Handle undo
  const handleUndo = () => {
    const currentIndex = canvasHistoryIndexRef.current[activeNail]
    if (currentIndex <= 0) return
    
    const indexCopy = [...canvasHistoryIndexRef.current]
    indexCopy[activeNail] = currentIndex - 1
    canvasHistoryIndexRef.current = indexCopy
  }
  
  // Handle clear
  const handleClear = () => {
    // Reset history for current nail
    const historyCopy = [...canvasHistoryRef.current]
    historyCopy[activeNail] = []
    canvasHistoryRef.current = historyCopy
    
    const indexCopy = [...canvasHistoryIndexRef.current]
    indexCopy[activeNail] = -1
    canvasHistoryIndexRef.current = indexCopy
    
    // Mark nail as not completed
    const newCompletedNails = [...completedNails]
    newCompletedNails[activeNail] = false
    setCompletedNails(newCompletedNails)
    
    // Reset shape and color for this nail to defaults
    const newNailShapes = [...nailShapes];
    const newNailColors = [...nailColors];
    newNailShapes[activeNail] = 'oval';
    newNailColors[activeNail] = '#ec4899';
    setNailShapes(newNailShapes);
    setNailColors(newNailColors);
  }
  
  // Handle drawing state changes
  const handleDrawingStateChange = (drawing: boolean) => {
    // This is used to update UI elements based on drawing state and manage scroll behavior
    console.log('Drawing state changed:', drawing);
    
    // Only limit scroll behavior when actively drawing on the canvas
    // Don't completely prevent scrolling of the whole page
    const canvasElement = document.querySelector('.nail-canvas');
    if (canvasElement) {
      if (drawing) {
        // Only prevent default on the canvas element, not the whole page
        canvasElement.addEventListener('touchmove', preventDefaultOnCanvas, { passive: false });
      } else {
        // Remove the event listener when not drawing
        canvasElement.removeEventListener('touchmove', preventDefaultOnCanvas);
      }
    }
  }
  
  // Function to handle canvas touch events without blocking page scrolling
  const preventDefaultOnCanvas = (e: Event) => {
    // Only stop propagation to prevent event bubbling
    // Do NOT prevent default as it blocks scrolling
    e.stopPropagation();
  }
  
  // Switch between hands (only applicable in levels with two hands)
  const switchHand = () => {
    setHandMode(handMode === "left" ? "right" : "left")
    // Set active nail to the corresponding finger on the other hand
    if (activeNail < 5) {
      setActiveNail(activeNail + 5)
    } else {
      setActiveNail(activeNail - 5)
    }
  }
  
  // Determine if this is a left or right hand nail
  const getNailSelection = () => {
    if (handCount === 1 || (handMode === "left" && activeNail < 5) || (handMode === "right" && activeNail >= 5)) {
      return activeNail % 5
    }
    return (activeNail + 5) % 10
  }
  
  // Ensure scrolling is enabled and stays enabled
  useEffect(() => {
    console.log('GameCanvas mounted - ensuring scrolling stays enabled');
    
    // Remove scroll blocking class and force scroll enabled
    const enableScrolling = () => {
      document.body.classList.remove('body-no-scroll');
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      document.body.style.position = 'static';
      document.documentElement.style.overflow = 'auto';
    };
    
    // Run immediately
    enableScrolling();
    
    // Also run periodically to ensure scroll is maintained
    const scrollInterval = setInterval(enableScrolling, 1000);
    return () => {
      // Clean up when component unmounts
      clearInterval(scrollInterval);
      const canvasElement = document.querySelector('.nail-canvas');
      if (canvasElement) {
        canvasElement.removeEventListener('touchmove', preventDefaultOnCanvas);
      }
    };
  }, []);
  
  return (
    <div className="game-canvas relative bg-white rounded-xl game-canvas-container" style={{ touchAction: 'pan-y', overflow: 'visible', position: 'relative' }}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Canvas Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Hand Selection (for levels with two hands) */}
          {handCount === 2 && (
            <div className="flex justify-center mb-4">
              <Button
                size="sm"
                variant={handMode === "left" ? "default" : "outline"}
                onClick={() => setHandMode("left")}
                className="rounded-l-md"
              >
                Left Hand
              </Button>
              <Button
                size="sm"
                variant={handMode === "right" ? "default" : "outline"}
                onClick={() => setHandMode("right")}
                className="rounded-r-md"
              >
                Right Hand
              </Button>
            </div>
          )}
          
          {/* Nail Selection */}
          <div className="flex justify-center gap-1 md:gap-2">
            {Array(handCount === 1 ? 5 : 10)
              .fill(null)
              .map((_, i) => {
                // Only show nails for current hand
                if ((handMode === "left" && i >= 5) || (handMode === "right" && i < 5)) {
                  return null;
                }
                // Determine if this nail is required
                const isRequired = requiredNails.includes(i);
                return (
                  <button
                    key={i}
                    className={`nail-selector p-1 border ${
                      activeNail === i ? "border-pink-500 bg-pink-50" : "border-gray-200"
                    } rounded-md transition-colors w-14 ${!isRequired ? "opacity-40 cursor-not-allowed" : ""}`}
                    onClick={() => isRequired && setActiveNail(i)}
                    disabled={!isRequired}
                    title={isRequired ? undefined : "This nail is locked for this challenge"}
                  >
                    <div className="flex flex-col items-center">
                      <div 
                        className="w-8 h-10 rounded-t-full bg-gray-100"
                        style={{
                          backgroundColor: completedNails[i] ? "#f9a8d4" : "#f3f4f6",
                          filter: !isRequired ? "grayscale(80%)" : undefined,
                        }}
                      />
                      <span className="text-xs mt-1">{i % 5 === 0 ? "Thumb" : 
                                                    i % 5 === 1 ? "Index" : 
                                                    i % 5 === 2 ? "Middle" : 
                                                    i % 5 === 3 ? "Ring" : "Pinky"}</span>
                      {!isRequired && (
                        <span className="text-[10px] text-gray-400">Locked</span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
          
          {/* Canvas with Nail */}
          <div className={`nail-container relative ${enlargedView ? 'h-[400px]' : 'h-[300px]'} bg-white shadow-sm rounded-xl p-2 border border-pink-100`}>
            <div className="hand-outline"></div>
            <div className="relative h-full flex items-center justify-center">
              <NailCanvas 
                width={enlargedView ? 300 : 200}
                height={enlargedView ? 450 : 300}
                activeNail={getNailSelection()}
                isEnlarged={enlargedView}
                tool={tool}
                activeColor={activeColor}
                brushSize={brushSize}
                sticker={sticker?.toLowerCase() ?? null}
                onSave={saveToHistory}
                onDrawingStateChange={handleDrawingStateChange}
                savedImageData={canvasHistoryRef.current[activeNail][canvasHistoryIndexRef.current[activeNail]]}
                nailShape={nailShape as any}
              />
            </div>
          </div>
          
          {/* Controls under canvas */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleUndo}
                disabled={canvasHistoryIndexRef.current[activeNail] <= 0}
              >
                Undo
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleClear}
              >
                Clear
              </Button>
            </div>
            
            <div className="flex gap-2">
              {handCount === 2 && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={switchHand}
                >
                  <ArrowLeftRight className="h-4 w-4 mr-1" />
                  Switch Hand
                </Button>
              )}
              
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setEnlargedView(!enlargedView)}
              >
                {enlargedView ? "Smaller View" : "Larger View"}
              </Button>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress:</span>
              <Badge variant="outline" className="bg-pink-50 text-pink-700">
                {completedNails.filter(Boolean).slice(0, nailCount).length}/{nailCount} Nails
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
              <div 
                className="bg-pink-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${(completedNails.filter(Boolean).slice(0, nailCount).length / nailCount) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Tools Panel */}
        <div className="space-y-6 bg-gray-50 p-4 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Nail Shape</h3>
            <div className="grid grid-cols-3 gap-2">
              {shapeOptions.map((shape) => (
                <button
                  key={shape.id}
                  className={`p-2 text-xs border rounded-md ${
                    nailShape === shape.id 
                      ? "bg-pink-500 text-white border-pink-600" 
                      : "bg-white border-gray-200 text-gray-700"
                  }`}
                  onClick={() => setNailShape(shape.id)}
                >
                  {shape.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Color</h3>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.id}
                  className={`w-8 h-8 rounded-full ${
                    activeColor === color.id ? "ring-2 ring-offset-2 ring-pink-500" : ""
                  }`}
                  style={{ backgroundColor: color.id }}
                  onClick={() => setActiveColor(color.id)}
                  title={color.name}
                />
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Tools</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2">
              {toolOptions.map((toolOption) => (
                <button
                  key={toolOption.id}
                  className={`p-2 border rounded-md flex flex-col items-center ${
                    tool === toolOption.id
                      ? "bg-pink-500 text-white border-pink-600"
                      : "bg-white border-gray-200 text-gray-700"
                  }`}
                  onClick={() => setTool(toolOption.id as any)}
                >
                  <toolOption.icon className="h-5 w-5 mb-1" />
                  <span className="text-xs">{toolOption.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {tool === "sticker" && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Stickers</h3>
              <div className="grid grid-cols-3 gap-2">
                {stickerOptions.map((stickerOption) => (
                  <button
                    key={stickerOption.id}
                    className={`p-2 border rounded-md flex flex-col items-center ${
                      sticker === stickerOption.id
                        ? "bg-pink-500 text-white border-pink-600"
                        : "bg-white border-gray-200 text-gray-700"
                    }`}
                    onClick={() => setSticker(stickerOption.id)}
                  >
                    <stickerOption.icon className="h-5 w-5 mb-1" />
                    <span className="text-xs">{stickerOption.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Brush Size</h3>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-full accent-pink-500"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Small</span>
              <span>Medium</span>
              <span>Large</span>
            </div>
          </div>
          
          {/* Tips Section */}
          <div className="mt-6 bg-pink-50 p-3 rounded-lg text-sm">
            <h3 className="font-medium text-pink-700 mb-1">Quick Tips:</h3>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• Use the correct nail shape for each finger</li>
              <li>• Match colors exactly as shown in the example</li>
              <li>• Place stickers in the same positions</li>
              <li>• Complete all nails before time runs out!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
