"use client"

import Link from "next/link"
import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import {
  Download,
  Trash2,
  Undo2,
  Save,
  Share2,
  Palette,
  Sparkles,
  Brush,
  Eraser,
  Star,
  Heart,
  Flower2,
  ArrowLeft,
  ArrowRight,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function NailGamePage() {
  const [activeColor, setActiveColor] = useState("#ec4899")
  const [brushSize, setBrushSize] = useState(5)
  const [tool, setTool] = useState<"brush" | "eraser" | "glitter" | "sticker">("brush")
  const [activeNail, setActiveNail] = useState(0)
  const [isDrawing, setIsDrawing] = useState(false)
  const [completedNails, setCompletedNails] = useState<boolean[]>(Array(10).fill(false))
  const [sticker, setSticker] = useState<string | null>(null)
  const [isEnlarged, setIsEnlarged] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [allNailsPreview, setAllNailsPreview] = useState<string[]>(Array(10).fill(""))

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const enlargedCanvasRef = useRef<HTMLCanvasElement>(null)
  const canvasHistoryRef = useRef<ImageData[][]>(Array(10).fill([]))
  const canvasHistoryIndexRef = useRef<number[]>(Array(10).fill(-1))
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 768px)")

  const colors = [
    "#ec4899", // pink
    "#f43f5e", // rose
    "#ef4444", // red
    "#f97316", // orange
    "#eab308", // yellow
    "#84cc16", // lime
    "#22c55e", // green
    "#06b6d4", // cyan
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#d946ef", // fuchsia
    "#ffffff", // white
    "#000000", // black
    "#6b7280", // gray
  ]

  const glitterColors = [
    "rgba(255, 215, 0, 0.7)", // gold
    "rgba(192, 192, 192, 0.7)", // silver
    "rgba(236, 72, 153, 0.7)", // pink
    "rgba(59, 130, 246, 0.7)", // blue
    "rgba(139, 92, 246, 0.7)", // purple
    "rgba(255, 255, 255, 0.7)", // white
  ]

  const stickers = [
    { name: "Star", icon: <Star className="h-5 w-5" /> },
    { name: "Heart", icon: <Heart className="h-5 w-5" /> },
    { name: "Flower", icon: <Flower2 className="h-5 w-5" /> },
  ]

  const nailPositions = [
    { top: 60, left: 20, width: 40, height: 60, rotation: -5 }, // thumb
    { top: 20, left: 70, width: 30, height: 50, rotation: -2 }, // index
    { top: 10, left: 110, width: 28, height: 55, rotation: 0 }, // middle
    { top: 15, left: 145, width: 26, height: 50, rotation: 2 }, // ring
    { top: 30, left: 180, width: 22, height: 40, rotation: 5 }, // pinky
    { top: 60, left: 260, width: 40, height: 60, rotation: 5 }, // thumb
    { top: 20, left: 310, width: 30, height: 50, rotation: 2 }, // index
    { top: 10, left: 350, width: 28, height: 55, rotation: 0 }, // middle
    { top: 15, left: 385, width: 26, height: 50, rotation: -2 }, // ring
    { top: 30, left: 420, width: 22, height: 40, rotation: -5 }, // pinky
  ]

  // Initialize canvas history for each nail
  useEffect(() => {
    canvasHistoryRef.current = Array(10)
      .fill(null)
      .map(() => [])
    canvasHistoryIndexRef.current = Array(10).fill(-1)
  }, [])

  // Setup canvas when active nail changes or enlarged state changes
  useEffect(() => {
    const canvas = isEnlarged ? enlargedCanvasRef.current : canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw nail shape
    drawNailShape(ctx, activeNail, isEnlarged)

    // Restore previous drawing for this nail if it exists
    const historyIndex = canvasHistoryIndexRef.current[activeNail]
    if (historyIndex >= 0) {
      const imageData = canvasHistoryRef.current[activeNail][historyIndex]
      if (imageData) {
        // If we're in enlarged mode, we need to scale the image data
        if (isEnlarged) {
          // First draw the original image data to a temporary canvas
          const tempCanvas = document.createElement("canvas")
          tempCanvas.width = 500
          tempCanvas.height = 300
          const tempCtx = tempCanvas.getContext("2d")
          if (tempCtx) {
            tempCtx.putImageData(imageData, 0, 0)

            // Then draw the scaled version to our enlarged canvas
            ctx.drawImage(tempCanvas, 0, 0, 500, 300, 0, 0, canvas.width, canvas.height)
          }
        } else {
          ctx.putImageData(imageData, 0, 0)
        }
      }
    }
  }, [activeNail, isEnlarged])

  // Generate preview images for all nails when showing preview
  useEffect(() => {
    if (showPreview) {
      const previewImages = Array(10).fill("")

      // Create a temporary canvas to generate preview images
      const tempCanvas = document.createElement("canvas")
      tempCanvas.width = 100
      tempCanvas.height = 150
      const tempCtx = tempCanvas.getContext("2d")

      if (tempCtx) {
        for (let i = 0; i < 10; i++) {
          // Draw nail shape
          drawNailShape(tempCtx, i, false, 100, 150)

          // Add nail design if available
          const historyIndex = canvasHistoryIndexRef.current[i]
          if (historyIndex >= 0) {
            const imageData = canvasHistoryRef.current[i][historyIndex]
            if (imageData) {
              // First draw to another temp canvas at original size
              const originalCanvas = document.createElement("canvas")
              originalCanvas.width = 500
              originalCanvas.height = 300
              const originalCtx = originalCanvas.getContext("2d")
              if (originalCtx) {
                originalCtx.putImageData(imageData, 0, 0)

                // Then scale down to our preview size
                tempCtx.drawImage(originalCanvas, 0, 0, 500, 300, 0, 0, 100, 150)
              }
            }
          }

          // Convert to data URL
          previewImages[i] = tempCanvas.toDataURL("image/png")

          // Clear for next nail
          tempCtx.clearRect(0, 0, 100, 150)
        }

        setAllNailsPreview(previewImages)
      }
    }
  }, [showPreview])

  const drawNailShape = (ctx: CanvasRenderingContext2D, nailIndex: number, enlarged = false, width = 0, height = 0) => {
    const position = { ...nailPositions[nailIndex] }

    // If enlarged or custom dimensions provided, adjust the position and size
    if (enlarged) {
      // Center the nail in the enlarged canvas
      position.left = ctx.canvas.width / 2 - position.width
      position.top = ctx.canvas.height / 2 - position.height

      // Make it bigger
      position.width *= 3
      position.height *= 3
    } else if (width && height) {
      // For preview thumbnails with custom dimensions
      position.left = width / 2 - position.width / 4
      position.top = height / 2 - position.height / 4
      position.width = position.width / 2
      position.height = position.height / 2
    }

    // Save the current context state
    ctx.save()

    // Clear the canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // Translate to the center of where the nail will be
    ctx.translate(position.left + position.width / 2, position.top + position.height / 2)

    // Rotate
    ctx.rotate((position.rotation * Math.PI) / 180)

    // Draw the nail shape (rounded rectangle)
    ctx.beginPath()
    const radius = enlarged ? 45 : 15
    ctx.moveTo(-position.width / 2 + radius, -position.height / 2)
    ctx.lineTo(position.width / 2 - radius, -position.height / 2)
    ctx.arcTo(position.width / 2, -position.height / 2, position.width / 2, -position.height / 2 + radius, radius)
    ctx.lineTo(position.width / 2, position.height / 2 - radius)
    ctx.arcTo(position.width / 2, position.height / 2, position.width / 2 - radius, position.height / 2, radius)
    ctx.lineTo(-position.width / 2 + radius, position.height / 2)
    ctx.arcTo(-position.width / 2, position.height / 2, -position.width / 2, position.height / 2 - radius, radius)
    ctx.lineTo(-position.width / 2, -position.height / 2 + radius)
    ctx.arcTo(-position.width / 2, -position.height / 2, -position.width / 2 + radius, -position.height / 2, radius)
    ctx.closePath()

    // Fill with a base color (light beige/nude)
    ctx.fillStyle = "#f5e1d0"
    ctx.fill()

    // Add a subtle gradient for dimension
    const gradient = ctx.createLinearGradient(
      -position.width / 2,
      -position.height / 2,
      position.width / 2,
      position.height / 2,
    )
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.2)")
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.1)")
    ctx.fillStyle = gradient
    ctx.fill()

    // Add a subtle border
    ctx.strokeStyle = "#e5d1c0"
    ctx.lineWidth = enlarged ? 3 : 1
    ctx.stroke()

    // Restore the context state
    ctx.restore()
  }

  const saveToHistory = (canvas: HTMLCanvasElement) => {
    // If we're in enlarged mode, we need to save back to the original canvas
    if (isEnlarged && canvasRef.current) {
      const originalCanvas = canvasRef.current
      const originalCtx = originalCanvas.getContext("2d")
      if (!originalCtx) return

      // Clear the original canvas
      originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height)

      // Draw the nail shape
      drawNailShape(originalCtx, activeNail)

      // Draw the enlarged canvas content scaled down to the original canvas
      originalCtx.drawImage(
        canvas,
        0,
        0,
        canvas.width,
        canvas.height,
        0,
        0,
        originalCanvas.width,
        originalCanvas.height,
      )

      // Now save the original canvas state
      canvas = originalCanvas
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height)

    // Get the current history for this nail
    const nailHistory = [...canvasHistoryRef.current[activeNail]]
    const currentIndex = canvasHistoryIndexRef.current[activeNail]

    // If we're not at the end of the history, remove everything after current index
    if (currentIndex < nailHistory.length - 1) {
      nailHistory.splice(currentIndex + 1)
    }

    // Add the new state
    nailHistory.push(currentState)

    // Update the history and index
    const newHistory = [...canvasHistoryRef.current]
    newHistory[activeNail] = nailHistory
    canvasHistoryRef.current = newHistory

    const newIndices = [...canvasHistoryIndexRef.current]
    newIndices[activeNail] = nailHistory.length - 1
    canvasHistoryIndexRef.current = newIndices
  }

  const handleUndo = () => {
    const canvas = isEnlarged ? enlargedCanvasRef.current : canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const currentIndex = canvasHistoryIndexRef.current[activeNail]
    if (currentIndex <= 0) {
      // If at the beginning, just redraw the nail shape
      drawNailShape(ctx, activeNail, isEnlarged)

      // Update the index
      const newIndices = [...canvasHistoryIndexRef.current]
      newIndices[activeNail] = -1
      canvasHistoryIndexRef.current = newIndices
      return
    }

    // Go back one step
    const newIndex = currentIndex - 1
    const imageData = canvasHistoryRef.current[activeNail][newIndex]

    // Clear and redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawNailShape(ctx, activeNail, isEnlarged)

    if (isEnlarged) {
      // Draw scaled version for enlarged mode
      const tempCanvas = document.createElement("canvas")
      tempCanvas.width = 500
      tempCanvas.height = 300
      const tempCtx = tempCanvas.getContext("2d")
      if (tempCtx) {
        tempCtx.putImageData(imageData, 0, 0)
        ctx.drawImage(tempCanvas, 0, 0, 500, 300, 0, 0, canvas.width, canvas.height)
      }
    } else {
      ctx.putImageData(imageData, 0, 0)
    }

    // Update the index
    const newIndices = [...canvasHistoryIndexRef.current]
    newIndices[activeNail] = newIndex
    canvasHistoryIndexRef.current = newIndices
  }

  const handleClear = () => {
    const canvas = isEnlarged ? enlargedCanvasRef.current : canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear and redraw the nail shape
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawNailShape(ctx, activeNail, isEnlarged)

    // Reset history for this nail
    const newHistory = [...canvasHistoryRef.current]
    newHistory[activeNail] = []
    canvasHistoryRef.current = newHistory

    const newIndices = [...canvasHistoryIndexRef.current]
    newIndices[activeNail] = -1
    canvasHistoryIndexRef.current = newIndices

    // Update completed status
    const newCompleted = [...completedNails]
    newCompleted[activeNail] = false
    setCompletedNails(newCompleted)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = isEnlarged ? enlargedCanvasRef.current : canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (tool === "brush" || tool === "eraser") {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.lineWidth = isEnlarged ? brushSize * 3 : brushSize

      if (tool === "brush") {
        ctx.strokeStyle = activeColor
      } else {
        // For eraser, we need to "erase" by redrawing the nail shape at that point
        ctx.globalCompositeOperation = "destination-out"
      }
    } else if (tool === "glitter") {
      addGlitter(ctx, x, y)
    } else if (tool === "sticker" && sticker) {
      addSticker(ctx, x, y, sticker)
    }
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault() // Prevent scrolling while drawing
    setIsDrawing(true)
    const canvas = isEnlarged ? enlargedCanvasRef.current : canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    if (tool === "brush" || tool === "eraser") {
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.lineWidth = isEnlarged ? brushSize * 3 : brushSize

      if (tool === "brush") {
        ctx.strokeStyle = activeColor
      } else {
        ctx.globalCompositeOperation = "destination-out"
      }
    } else if (tool === "glitter") {
      addGlitter(ctx, x, y)
    } else if (tool === "sticker" && sticker) {
      addSticker(ctx, x, y, sticker)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = isEnlarged ? enlargedCanvasRef.current : canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (tool === "brush" || tool === "eraser") {
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (tool === "glitter") {
      addGlitter(ctx, x, y)
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    e.preventDefault() // Prevent scrolling while drawing

    const canvas = isEnlarged ? enlargedCanvasRef.current : canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    if (tool === "brush" || tool === "eraser") {
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (tool === "glitter") {
      addGlitter(ctx, x, y)
    }
  }

  const handleMouseUp = () => {
    if (!isDrawing) return

    setIsDrawing(false)

    const canvas = isEnlarged ? enlargedCanvasRef.current : canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Reset composite operation if we were erasing
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "source-over"
    }

    // Save the current state to history
    saveToHistory(canvas)

    // Mark this nail as completed
    const newCompleted = [...completedNails]
    newCompleted[activeNail] = true
    setCompletedNails(newCompleted)
  }

  const handleTouchEnd = () => {
    handleMouseUp()
  }

  const handleMouseLeave = () => {
    if (isDrawing) {
      handleMouseUp()
    }
  }

  const addGlitter = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Add multiple small circles with random glitter colors
    const scaleFactor = isEnlarged ? 3 : 1
    for (let i = 0; i < 10; i++) {
      const offsetX = (Math.random() - 0.5) * brushSize * 2 * scaleFactor
      const offsetY = (Math.random() - 0.5) * brushSize * 2 * scaleFactor
      const radius = Math.random() * (brushSize / 3) * scaleFactor + 1
      const glitterColor = glitterColors[Math.floor(Math.random() * glitterColors.length)]

      ctx.beginPath()
      ctx.arc(x + offsetX, y + offsetY, radius, 0, Math.PI * 2)
      ctx.fillStyle = glitterColor
      ctx.fill()
    }
  }

  const addSticker = (ctx: CanvasRenderingContext2D, x: number, y: number, stickerType: string) => {
    ctx.save()
    ctx.translate(x, y)

    const scaleFactor = isEnlarged ? 3 : 1
    const size = brushSize * 3 * scaleFactor

    switch (stickerType) {
      case "Star":
        drawStar(ctx, 0, 0, 5, size / 2, size / 4)
        break
      case "Heart":
        drawHeart(ctx, 0, 0, size)
        break
      case "Flower":
        drawFlower(ctx, 0, 0, size)
        break
    }

    ctx.restore()
  }

  const drawStar = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number,
  ) => {
    let rot = (Math.PI / 2) * 3
    let x = cx
    let y = cy
    const step = Math.PI / spikes

    ctx.beginPath()
    ctx.moveTo(cx, cy - outerRadius)

    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius
      y = cy + Math.sin(rot) * outerRadius
      ctx.lineTo(x, y)
      rot += step

      x = cx + Math.cos(rot) * innerRadius
      y = cy + Math.sin(rot) * innerRadius
      ctx.lineTo(x, y)
      rot += step
    }

    ctx.lineTo(cx, cy - outerRadius)
    ctx.closePath()
    ctx.fillStyle = activeColor
    ctx.fill()
  }

  const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.beginPath()
    ctx.moveTo(x, y + size / 4)

    // Left curve
    ctx.bezierCurveTo(x - size / 2, y - size / 2, x - size, y, x, y + size / 1.5)

    // Right curve
    ctx.bezierCurveTo(x + size, y, x + size / 2, y - size / 2, x, y + size / 4)

    ctx.fillStyle = activeColor
    ctx.fill()
  }

  const drawFlower = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    const petals = 6
    const petalSize = size / 2

    // Draw petals
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2
      const dx = Math.cos(angle) * petalSize
      const dy = Math.sin(angle) * petalSize

      ctx.beginPath()
      ctx.ellipse(x + dx / 2, y + dy / 2, petalSize / 2, petalSize / 1.5, angle, 0, Math.PI * 2)
      ctx.fillStyle = activeColor
      ctx.fill()
    }

    // Draw center
    ctx.beginPath()
    ctx.arc(x, y, size / 6, 0, Math.PI * 2)
    ctx.fillStyle = "#ffdd00"
    ctx.fill()
  }

  const handleSaveDesign = () => {
    toast({
      title: "Design Saved!",
      description: "Your nail design has been saved to your account.",
    })
  }

  const handleShareDesign = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "My Pearl4nails Design",
          text: "Check out my nail design created with Pearl4nails!",
          url: window.location.href,
        })
        .catch((error) => console.log("Error sharing", error))
    } else {
      toast({
        title: "Share Link Generated",
        description: "You can now share your design with friends!",
      })
    }
  }

  const handleDownloadDesign = () => {
    const canvas = document.createElement("canvas")
    canvas.width = 500
    canvas.height = 300
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Draw hand background
    ctx.fillStyle = "#f8f8f8"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw all nails
    for (let i = 0; i < 10; i++) {
      const position = nailPositions[i]

      // Draw the nail shape
      ctx.save()
      ctx.translate(position.left + position.width / 2, position.top + position.height / 2)
      ctx.rotate((position.rotation * Math.PI) / 180)

      // Draw the nail
      ctx.beginPath()
      const radius = 15
      ctx.moveTo(-position.width / 2 + radius, -position.height / 2)
      ctx.lineTo(position.width / 2 - radius, -position.height / 2)
      ctx.arcTo(position.width / 2, -position.height / 2, position.width / 2, -position.height / 2 + radius, radius)
      ctx.lineTo(position.width / 2, position.height / 2 - radius)
      ctx.arcTo(position.width / 2, position.height / 2, position.width / 2 - radius, position.height / 2, radius)
      ctx.lineTo(-position.width / 2 + radius, position.height / 2)
      ctx.arcTo(-position.width / 2, position.height / 2, -position.width / 2, position.height / 2 - radius, radius)
      ctx.lineTo(-position.width / 2, -position.height / 2 + radius)
      ctx.arcTo(-position.width / 2, -position.height / 2, -position.width / 2 + radius, -position.height / 2, radius)
      ctx.closePath()

      // Fill with base color
      ctx.fillStyle = "#f5e1d0"
      ctx.fill()

      // If this nail has been painted, draw the design
      if (completedNails[i] && canvasHistoryIndexRef.current[i] >= 0) {
        const historyIndex = canvasHistoryIndexRef.current[i]
        const imageData = canvasHistoryRef.current[i][historyIndex]

        if (imageData) {
          // Create a temporary canvas to hold the nail design
          const tempCanvas = document.createElement("canvas")
          tempCanvas.width = 500
          tempCanvas.height = 300
          const tempCtx = tempCanvas.getContext("2d")

          if (tempCtx) {
            tempCtx.putImageData(imageData, 0, 0)

            // Draw just the nail area
            ctx.drawImage(
              tempCanvas,
              0,
              0,
              500,
              300,
              -position.width / 2,
              -position.height / 2,
              position.width,
              position.height,
            )
          }
        }
      }

      // Add a subtle border
      ctx.strokeStyle = "#e5d1c0"
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.restore()
    }

    // Create download link
    const link = document.createElement("a")
    link.download = "my-nail-design.png"
    link.href = canvas.toDataURL("image/png")
    link.click()

    toast({
      title: "Design Downloaded!",
      description: "Your nail design has been saved to your device.",
    })
  }

  const toggleEnlargedMode = () => {
    setIsEnlarged(!isEnlarged)
  }

  const navigateToNextNail = () => {
    if (activeNail < 9) {
      setActiveNail(activeNail + 1)
    }
  }

  const navigateToPrevNail = () => {
    if (activeNail > 0) {
      setActiveNail(activeNail - 1)
    }
  }

  const allNailsCompleted = completedNails.every(Boolean)

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <Badge className="mb-2 bg-pink-100 text-pink-500 hover:bg-pink-200">Interactive</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-pink-500 mb-2">Nail Art Studio</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Unleash your creativity and practice your nail art skills! Paint each nail with your own unique designs.
          </p>
        </div>

        {!isEnlarged && !showPreview && (
          <Card className="p-4 mb-6 bg-gradient-to-r from-pink-50 to-white md:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-800 mb-2">How to Play</h2>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                  <li>Select a nail to work on</li>
                  <li>Choose your tools, colors, and brush size</li>
                  <li>Paint each nail with your own unique design</li>
                  <li>Complete all ten nails to finish your design</li>
                </ol>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-800 mb-2">Tools</h2>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>
                    <span className="font-medium">Brush:</span> Paint with your selected color
                  </li>
                  <li>
                    <span className="font-medium">Eraser:</span> Remove parts of your design
                  </li>
                  <li>
                    <span className="font-medium">Glitter:</span> Add sparkly effects
                  </li>
                  <li>
                    <span className="font-medium">Stickers:</span> Add decorative elements
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        )}

        {!showPreview ? (
          <div className="grid grid-cols-1 gap-4">
            {isEnlarged ? (
              <div className="relative">
                <div className="bg-white rounded-xl border border-gray-200 p-4 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={navigateToPrevNail} disabled={activeNail === 0}>
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium">Nail {activeNail + 1} of 10</span>
                      <Button variant="outline" size="sm" onClick={navigateToNextNail} disabled={activeNail === 9}>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleEnlargedMode}
                      className="flex items-center gap-1"
                    >
                      <Minimize2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Exit Fullscreen</span>
                    </Button>
                  </div>

                  <canvas
                    ref={enlargedCanvasRef}
                    width={isMobile ? 320 : 600}
                    height={isMobile ? 400 : 600}
                    className="mx-auto border rounded-lg touch-none"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{ cursor: tool === "brush" ? "crosshair" : tool === "eraser" ? "not-allowed" : "pointer" }}
                  />

                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <Button variant="outline" size="sm" onClick={handleUndo} className="flex items-center gap-1">
                      <Undo2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Undo</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleClear} className="flex items-center gap-1">
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Clear</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTool("brush")}
                      className={`flex items-center gap-1 ${tool === "brush" ? "bg-pink-100 border-pink-300" : ""}`}
                    >
                      <Brush className="h-4 w-4" />
                      <span className="hidden sm:inline">Brush</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTool("eraser")}
                      className={`flex items-center gap-1 ${tool === "eraser" ? "bg-pink-100 border-pink-300" : ""}`}
                    >
                      <Eraser className="h-4 w-4" />
                      <span className="hidden sm:inline">Eraser</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTool("glitter")}
                      className={`flex items-center gap-1 ${tool === "glitter" ? "bg-pink-100 border-pink-300" : ""}`}
                    >
                      <Sparkles className="h-4 w-4" />
                      <span className="hidden sm:inline">Glitter</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTool("sticker")}
                      className={`flex items-center gap-1 ${tool === "sticker" ? "bg-pink-100 border-pink-300" : ""}`}
                    >
                      <Star className="h-4 w-4" />
                      <span className="hidden sm:inline">Sticker</span>
                    </Button>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brush Size: {brushSize}px</label>
                    <Slider
                      value={[brushSize]}
                      min={1}
                      max={20}
                      step={1}
                      onValueChange={(value) => setBrushSize(value[0])}
                      className="w-full"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color:</label>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {colors.map((color) => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full border ${
                            activeColor === color ? "ring-2 ring-offset-2 ring-pink-500" : ""
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setActiveColor(color)}
                          aria-label={`Select ${color} color`}
                        />
                      ))}
                    </div>
                  </div>

                  {tool === "sticker" && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Choose Sticker:</label>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {stickers.map((s) => (
                          <Button
                            key={s.name}
                            variant={sticker === s.name ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSticker(s.name)}
                            className={sticker === s.name ? "bg-pink-500 hover:bg-pink-600" : ""}
                          >
                            {s.icon} <span className="ml-1">{s.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 h-[350px] relative overflow-hidden">
                      {/* Hand background with nail positions */}
                      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=350&width=500&text=Hand+Background')] bg-contain bg-center bg-no-repeat opacity-10"></div>

                      {/* Nail selection indicators */}
                      {nailPositions.map((position, index) => (
                        <div
                          key={index}
                          className={`absolute cursor-pointer transition-all duration-200 ${
                            completedNails[index] ? "border-green-500" : "border-pink-300"
                          } ${
                            activeNail === index
                              ? "border-2 shadow-lg scale-105"
                              : "border border-dashed opacity-70 hover:opacity-100"
                          }`}
                          style={{
                            top: `${position.top}px`,
                            left: `${position.left}px`,
                            width: `${position.width}px`,
                            height: `${position.height}px`,
                            borderRadius: "40% 40% 50% 50%",
                            transform: `rotate(${position.rotation}deg)`,
                          }}
                          onClick={() => setActiveNail(index)}
                        >
                          {completedNails[index] && (
                            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-3 h-3"></div>
                          )}
                        </div>
                      ))}

                      {/* Canvas for drawing */}
                      <canvas
                        ref={canvasRef}
                        width={500}
                        height={300}
                        className="absolute inset-0 w-full h-full touch-none"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        style={{
                          cursor: tool === "brush" ? "crosshair" : tool === "eraser" ? "not-allowed" : "pointer",
                        }}
                      />
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="icon" onClick={handleUndo}>
                                <Undo2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Undo</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="icon" onClick={handleClear}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Clear nail</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="icon" onClick={toggleEnlargedMode}>
                                <Maximize2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Enlarge nail</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <div className="text-sm text-gray-500">
                        Nail {activeNail + 1} of 10 {completedNails[activeNail] && "✓"}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs" onClick={handleSaveDesign}>
                          <Save className="h-3 w-3 mr-1" /> Save
                        </Button>

                        <Button variant="outline" size="sm" className="text-xs" onClick={handleShareDesign}>
                          <Share2 className="h-3 w-3 mr-1" /> Share
                        </Button>

                        <Button variant="outline" size="sm" className="text-xs" onClick={handleDownloadDesign}>
                          <Download className="h-3 w-3 mr-1" /> Download
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <Tabs defaultValue="tools">
                      <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger
                          value="tools"
                          className="data-[state=active]:bg-pink-500 data-[state=active]:text-white"
                        >
                          <Brush className="h-4 w-4 mr-1" /> Tools
                        </TabsTrigger>
                        <TabsTrigger
                          value="colors"
                          className="data-[state=active]:bg-pink-500 data-[state=active]:text-white"
                        >
                          <Palette className="h-4 w-4 mr-1" /> Colors
                        </TabsTrigger>
                        <TabsTrigger
                          value="effects"
                          className="data-[state=active]:bg-pink-500 data-[state=active]:text-white"
                        >
                          <Sparkles className="h-4 w-4 mr-1" /> Effects
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="tools" className="mt-0">
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant={tool === "brush" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setTool("brush")}
                              className={tool === "brush" ? "bg-pink-500 hover:bg-pink-600" : ""}
                            >
                              <Brush className="h-4 w-4 mr-1" /> Brush
                            </Button>

                            <Button
                              variant={tool === "eraser" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setTool("eraser")}
                              className={tool === "eraser" ? "bg-pink-500 hover:bg-pink-600" : ""}
                            >
                              <Eraser className="h-4 w-4 mr-1" /> Eraser
                            </Button>

                            <Button
                              variant={tool === "glitter" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setTool("glitter")}
                              className={tool === "glitter" ? "bg-pink-500 hover:bg-pink-600" : ""}
                            >
                              <Sparkles className="h-4 w-4 mr-1" /> Glitter
                            </Button>

                            <Button
                              variant={tool === "sticker" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setTool("sticker")}
                              className={tool === "sticker" ? "bg-pink-500 hover:bg-pink-600" : ""}
                            >
                              <Star className="h-4 w-4 mr-1" /> Sticker
                            </Button>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Brush Size: {brushSize}px
                            </label>
                            <Slider
                              value={[brushSize]}
                              min={1}
                              max={20}
                              step={1}
                              onValueChange={(value) => setBrushSize(value[0])}
                              className="w-full"
                            />
                          </div>

                          {tool === "sticker" && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Choose Sticker:</label>
                              <div className="flex flex-wrap gap-2">
                                {stickers.map((s) => (
                                  <Button
                                    key={s.name}
                                    variant={sticker === s.name ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSticker(s.name)}
                                    className={sticker === s.name ? "bg-pink-500 hover:bg-pink-600" : ""}
                                  >
                                    {s.icon} <span className="ml-1">{s.name}</span>
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="colors" className="mt-0">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Choose Color:</label>
                          <div className="grid grid-cols-7 gap-2">
                            {colors.map((color) => (
                              <button
                                key={color}
                                className={`w-8 h-8 rounded-full border ${
                                  activeColor === color ? "ring-2 ring-offset-2 ring-pink-500" : ""
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => setActiveColor(color)}
                                aria-label={`Select ${color} color`}
                              />
                            ))}
                          </div>

                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Custom Color:</label>
                            <input
                              type="color"
                              value={activeColor}
                              onChange={(e) => setActiveColor(e.target.value)}
                              className="w-full h-10 cursor-pointer rounded-md"
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="effects" className="mt-0">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Glitter Colors:</label>
                            <div className="grid grid-cols-3 gap-2">
                              {glitterColors.map((color, index) => (
                                <div
                                  key={index}
                                  className="h-10 rounded-md border flex items-center justify-center"
                                  style={{
                                    background: `linear-gradient(45deg, ${color}, ${color.replace("0.7", "0.3")})`,
                                  }}
                                >
                                  <Sparkles className="h-4 w-4 text-white drop-shadow-sm" />
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Glitter colors are randomly applied when using the glitter tool
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Stickers:</label>
                            <div className="grid grid-cols-3 gap-2">
                              {stickers.map((s) => (
                                <div
                                  key={s.name}
                                  className="h-10 rounded-md border flex items-center justify-center cursor-pointer hover:bg-pink-50"
                                  onClick={() => {
                                    setTool("sticker")
                                    setSticker(s.name)
                                  }}
                                >
                                  {s.icon}
                                  <span className="ml-1 text-xs">{s.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="mt-6 pt-4 border-t">
                      <h3 className="font-medium text-gray-800 mb-2">Current Design</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">
                            {completedNails.filter(Boolean).length} of 10 nails completed
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                            <div
                              className="bg-pink-500 h-2.5 rounded-full"
                              style={{ width: `${(completedNails.filter(Boolean).length / 10) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        <Button
                          onClick={() => setShowPreview(true)}
                          disabled={!allNailsCompleted}
                          className="bg-pink-500 hover:bg-pink-600"
                        >
                          {allNailsCompleted ? "Preview Design" : "Finish All Nails"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-pink-500">Your Completed Design</h2>
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                <X className="h-4 w-4 mr-1" /> Close Preview
              </Button>
            </div>

            <div className="grid grid-cols-5 gap-4 mb-8">
              {allNailsPreview.map((previewUrl, index) => (
                <div key={index} className="relative">
                  <div className="aspect-square rounded-lg overflow-hidden border border-pink-100">
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

            <div className="flex flex-wrap justify-center gap-4">
              <Button onClick={handleSaveDesign} className="bg-pink-500 hover:bg-pink-600">
                <Save className="h-4 w-4 mr-2" /> Save Design
              </Button>
              <Button onClick={handleShareDesign} variant="outline">
                <Share2 className="h-4 w-4 mr-2" /> Share Design
              </Button>
              <Button onClick={handleDownloadDesign} variant="outline">
                <Download className="h-4 w-4 mr-2" /> Download Design
              </Button>
            </div>
          </div>
        )}

        <div className="bg-pink-50 rounded-xl p-6 text-center mt-8">
          <h2 className="text-2xl font-bold text-pink-500 mb-4">Ready to Try It For Real?</h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Now that you've practiced your nail art skills, book an appointment with Pearl4nails and let our
            professionals bring your designs to life!
          </p>
          <Button asChild size="lg" className="bg-pink-500 hover:bg-pink-600">
            <Link href="/booking">Book an Appointment</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

