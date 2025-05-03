"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LevelDesign } from "../game-data/levels"

type NailDesignDisplayProps = {
  design: LevelDesign
}

export default function NailDesignDisplay({ design }: NailDesignDisplayProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Animate in the design display
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [])
  
  // Early return if no design is provided yet
  if (!design) {
    return (
      <div className="flex justify-center items-center h-60">
        <p className="text-gray-500">Loading design...</p>
      </div>
    )
  }

  // Determine if the level uses one or both hands
  const handCount = design.nails[0].handCount || 1
  const isDoubleHand = handCount === 2
  
  // Split nails into left and right hand if needed
  const leftHandNails = isDoubleHand 
    ? design.nails.slice(0, 5) 
    : design.nails
  
  const rightHandNails = isDoubleHand 
    ? design.nails.slice(5, 10) 
    : []
  
  return (
    <div className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex flex-col items-center">
        <Badge variant="outline" className="mb-4">
          {isDoubleHand ? "Both Hands Design" : "One Hand Design"}
        </Badge>
        
        <div className={`grid ${isDoubleHand ? 'grid-cols-2 gap-8' : 'grid-cols-1'} max-w-3xl mx-auto`}>
          {/* Left Hand */}
          <div className="hand-display relative">
            <div className="relative hand-bg p-4 bg-gray-50 rounded-lg">
              <div className="flex gap-2 justify-center">
                {leftHandNails.map((nail, index) => (
                  <NailPreview key={index} nail={nail} fingerIndex={index} />
                ))}
              </div>
              {!isDoubleHand && (
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                  <Badge variant="outline" className="bg-white">Left Hand</Badge>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Hand (if applicable) */}
          {isDoubleHand && (
            <div className="hand-display relative">
              <div className="relative hand-bg p-4 bg-gray-50 rounded-lg">
                <div className="flex gap-2 justify-center">
                  {rightHandNails.map((nail, index) => (
                    <NailPreview key={index} nail={nail} fingerIndex={index + 5} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Key instructions for memorizing */}
        <div className="mt-6 text-sm text-gray-600 bg-pink-50 p-3 rounded-lg">
          <p className="font-medium">Remember these details!</p>
          <ul className="list-disc pl-4 mt-1 text-xs">
            <li>Nail shapes: {(() => {
              const indices = design.requiredNails && design.requiredNails.length > 0
                ? design.requiredNails
                : design.nails.map((_, idx) => idx);
              const shapes = indices.map(idx => design.nails[idx]?.nailShape).filter(Boolean);
              return Array.from(new Set(shapes)).join(', ');
            })()}</li>
            <li>Color scheme: {design.nails.some(n => n.glitter) ? 'includes glitter' : 'solid colors'}</li>
            <li>{design.nails.some(n => n.stickers) ? 'Has sticker decorations' : 'No stickers'}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Individual nail preview component
function NailPreview({ nail, fingerIndex }: { nail: any, fingerIndex: number }) {
  // Define nail width based on finger size (pinky is smallest, thumb is largest)
  const getNailWidth = () => {
    // For a hand, we have fingers: thumb, index, middle, ring, pinky (or reverse order)
    const fingerWidths = [32, 26, 28, 26, 22]
    return fingerWidths[fingerIndex % 5]
  }
  
  // Calculate height based on nail shape and width
  const getNailHeight = () => {
    const width = getNailWidth()
    switch(nail.nailShape) {
      case 'square': return width * 1.2
      case 'coffin': return width * 1.5
      case 'stiletto': return width * 1.6
      case 'almond': return width * 1.4
      default: return width * 1.3 // oval is default
    }
  }
  
  const width = getNailWidth()
  const height = getNailHeight()
  
  // Get base color with fallback
  const baseColor = nail.baseColor || '#ec4899'
  
  return (
    <div 
      className="nail-preview relative"
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
      }}
    >
      <div 
        className="absolute inset-0 rounded-t-full" 
        style={{ 
          backgroundColor: baseColor,
          borderRadius: nail.nailShape === 'square' ? '6px 6px 0 0' : '50% 50% 0 0',
          clipPath: getNailShapePath(nail.nailShape),
        }}
      >
        {/* Add glitter effect if needed */}
        {nail.glitter && (
          <div 
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle, transparent 40%, ${nail.glitterColor || '#ffffff80'} 60%, transparent 70%),
                          radial-gradient(circle at 30% 40%, ${nail.glitterColor || '#ffffff80'} 5%, transparent 10%),
                          radial-gradient(circle at 70% 30%, ${nail.glitterColor || '#ffffff80'} 5%, transparent 10%),
                          radial-gradient(circle at 40% 70%, ${nail.glitterColor || '#ffffff80'} 5%, transparent 10%)`,
              opacity: 0.7,
              mixBlendMode: 'overlay',
            }}
          />
        )}
        
        {/* Add stickers if needed */}
        {nail.stickers && nail.stickers.map((sticker: any, i: number) => (
          <div 
            key={i} 
            className="absolute"
            style={{
              top: `${sticker.position.y}%`,
              left: `${sticker.position.x}%`,
              width: `${sticker.size}px`,
              height: `${sticker.size}px`,
              backgroundColor: sticker.type === 'star' ? '#fcd34d' : 
                              sticker.type === 'heart' ? '#f43f5e' : 
                              '#22d3ee',
              clipPath: sticker.type === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' :
                        sticker.type === 'heart' ? 'path("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z")' :
                        'circle(50% at 50% 50%)',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Helper function to get CSS clip-path for different nail shapes
function getNailShapePath(shape: string) {
  switch(shape) {
    case 'square':
      return 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
    case 'almond':
      return 'polygon(0% 0%, 100% 0%, 85% 85%, 50% 100%, 15% 85%)';
    case 'stiletto':
      return 'polygon(0% 0%, 100% 0%, 75% 75%, 50% 100%, 25% 75%)';
    case 'coffin':
      return 'polygon(0% 0%, 100% 0%, 80% 100%, 20% 100%)';
    default: // oval
      return 'ellipse(50% 50% at 50% 50%)';
  }
}
