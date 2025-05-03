"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Download, Save, Share2 } from "lucide-react"
import Link from "next/link"
import { generateConfetti } from "../utils"

interface DesignPreviewProps {
  nailPreviews: string[]
  onClose: () => void
  onSave: () => void
  onShare: () => void
  onDownload: () => void
}

export default function DesignPreview({
  nailPreviews,
  onClose,
  onSave,
  onShare,
  onDownload,
}: DesignPreviewProps) {
  const [confetti, setConfetti] = useState<Array<{
    x: number;
    y: number;
    size: number;
    color: string;
    speed: number;
    rotation: number;
    rotationSpeed: number;
  }>>([])

  // Generate confetti effect when showing preview
  useEffect(() => {
    setConfetti(generateConfetti(50))
    
    // Cleanup on unmount
    return () => {
      setConfetti([])
    }
  }, [])

  return (
    <div className="relative">
      {/* Confetti animation */}
      {confetti.map((particle, index) => (
        <div
          key={index}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            borderRadius: '50%',
            transform: `rotate(${particle.rotation}deg)`,
            animation: `confetti-fall ${3 + Math.random() * 2}s linear forwards`,
            animationDelay: `${Math.random() * 0.5}s`
          }}
        />
      ))}

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-pink-500">Your Completed Design</h2>
          <Button variant="outline" onClick={onClose} size="sm">
            <X className="h-4 w-4 mr-1" /> Close Preview
          </Button>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-8">
          {nailPreviews.map((previewUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border border-pink-100 transition-all group-hover:shadow-md">
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt={`Nail ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute -top-2 -right-2 bg-pink-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                {index + 1}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button onClick={onSave} className="bg-pink-500 hover:bg-pink-600">
            <Save className="h-4 w-4 mr-2" /> Save Design
          </Button>
          <Button onClick={onShare} variant="outline">
            <Share2 className="h-4 w-4 mr-2" /> Share Design
          </Button>
          <Button onClick={onDownload} variant="outline">
            <Download className="h-4 w-4 mr-2" /> Download Design
          </Button>
        </div>

        <div className="bg-pink-50 rounded-xl p-6 text-center mt-8">
          <h3 className="text-xl font-bold text-pink-500 mb-3">Ready to Try It For Real?</h3>
          <p className="text-gray-700 mb-5 max-w-2xl mx-auto">
            Love your virtual nail design? Book an appointment with Pearl4nails and let our
            professionals bring your creativity to life!
          </p>
          <Button asChild size="lg" className="bg-pink-500 hover:bg-pink-600">
            <Link href="/booking">Book an Appointment</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
