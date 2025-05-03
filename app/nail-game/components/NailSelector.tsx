"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronRight, ChevronLeft } from "lucide-react"

interface NailSelectorProps {
  activeNail: number
  completedNails: boolean[]
  nailPreviews: string[]
  onSelectNail: (index: number) => void
  onNavigateNext: () => void
  onNavigatePrev: () => void
}

export default function NailSelector({
  activeNail,
  completedNails,
  nailPreviews,
  onSelectNail,
  onNavigateNext,
  onNavigatePrev,
}: NailSelectorProps) {
  const [animationClass, setAnimationClass] = useState<number | null>(null)

  // Apply animation when a nail is completed
  useEffect(() => {
    const newlyCompletedNail = completedNails.findIndex((completed, i) => completed && i === activeNail)
    if (newlyCompletedNail !== -1) {
      setAnimationClass(newlyCompletedNail)
      const timer = setTimeout(() => {
        setAnimationClass(null)
      }, 700)
      return () => clearTimeout(timer)
    }
  }, [completedNails, activeNail])

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-800">Your Nails</h3>
        <Badge variant="outline" className="text-xs bg-pink-50 border-pink-100 text-pink-700">
          {completedNails.filter(Boolean).length}/10 Complete
        </Badge>
      </div>

      <div className="flex flex-wrap gap-1 sm:gap-2 justify-between mb-3">
        <button 
          onClick={onNavigatePrev}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
          aria-label="Previous nail"
        >
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>

        <div className="flex-1 flex justify-center gap-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <button
              key={i}
              className={`nail-selector w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-medium 
                ${i === activeNail ? "active bg-pink-100 text-pink-700" : "bg-gray-50 text-gray-600"} 
                ${completedNails[i] ? "completed" : ""} 
                ${animationClass === i ? "nail-complete-animation" : ""}`}
              onClick={() => onSelectNail(i)}
              aria-label={`Nail ${i + 1}`}
              aria-selected={i === activeNail}
            >
              {completedNails[i] ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                i + 1
              )}
            </button>
          ))}
        </div>

        <button 
          onClick={onNavigateNext}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
          aria-label="Next nail"
        >
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-5 gap-1 sm:gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div 
            key={i} 
            className={`nail-preview aspect-[2/3] rounded-lg overflow-hidden cursor-pointer border transition-all
              ${i === activeNail ? "border-pink-400 shadow-sm transform scale-105" : 
              completedNails[i] ? "border-green-200" : "border-gray-200"}
            `}
            onClick={() => onSelectNail(i)}
          >
            {nailPreviews[i] ? (
              <img 
                src={nailPreviews[i]} 
                alt={`Nail ${i + 1} preview`} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                <span className="text-xs text-gray-400">{i + 1}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
