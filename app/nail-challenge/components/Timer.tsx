"use client"

import { useEffect, useState, useRef } from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

type TimerProps = {
  seconds: number
  isRunning: boolean
  className?: string
  variant?: "default" | "warning" | "danger"
}

export default function Timer({ 
  seconds, 
  isRunning, 
  className,
  variant = "default" 
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds)
  // Add interval ref to handle cleanup properly
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Update timer based on seconds prop with console logging
  useEffect(() => {
    console.log("Timer seconds updated:", seconds)
    setTimeLeft(seconds)
  }, [seconds])
  
  // Handle the countdown timer with proper cleanup
  useEffect(() => {
    console.log("Timer running state:", isRunning, "with", timeLeft, "seconds left")
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    // Only start a new interval if the timer is running
    if (isRunning && timeLeft > 0) {
      console.log("Starting timer interval")
      
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newValue = prev - 1
          console.log("Timer tick:", newValue)
          
          if (newValue <= 0) {
            // Clean up when timer reaches zero
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
            }
            return 0
          }
          
          return newValue
        })
      }, 1000)
    }
    
    // Cleanup function
    return () => {
      if (intervalRef.current) {
        console.log("Cleaning up timer interval")
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, seconds])
  
  // Color styling based on time remaining
  const getTimerStyle = () => {
    if (variant === "danger" || timeLeft <= 10) {
      return "animate-pulse bg-red-500 text-white"
    }
    
    if (variant === "warning" || timeLeft <= 20) {
      return "bg-amber-500 text-white"
    }
    
    if (variant === "default") {
      return "bg-pink-500 text-white"
    }
  }
  
  return (
    <div className={cn("flex items-center", className)}>
      <div className={cn(
        "countdown-timer flex items-center justify-center",
        getTimerStyle()
      )}>
        {timeLeft}
      </div>
      <div className="ml-2 flex flex-col items-start">
        <div className="flex items-center text-gray-700">
          <Clock className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">
            {timeLeft <= 10 ? "Hurry!" : "Time Left"}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {isRunning ? "Clock is ticking!" : "Timer paused"}
        </span>
      </div>
    </div>
  )
}
