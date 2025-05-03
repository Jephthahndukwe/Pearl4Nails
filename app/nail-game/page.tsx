"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Download,
  Trash2,
  Undo2,
  Save,
  Share2,
  Palette,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  X,
  Maximize2,
  Minimize2,
  Star,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useMediaQuery } from "@/hooks/use-media-query"

// Import our custom components
import NailCanvas from "./components/NailCanvas"
import ToolsPanel from "./components/ToolsPanel"
import NailSelector from "./components/NailSelector"
import DesignPreview from "./components/DesignPreview"

// Import styles
import "./styles.css"
import "./global.css"

export default function NailGamePage() {
  const [activeColor, setActiveColor] = useState("#ec4899")
  const [brushSize, setBrushSize] = useState(5)
  const [tool, setTool] = useState<"brush" | "eraser" | "glitter" | "sticker">("brush")
  const [activeNail, setActiveNail] = useState(0)
  const [isDrawing, setIsDrawing] = useState(false)
  const [completedNails, setCompletedNails] = useState<boolean[]>(Array(10).fill(false))
  const [sticker, setSticker] = useState<string | null>("Star")
  const [isEnlarged, setIsEnlarged] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [allNailsPreview, setAllNailsPreview] = useState<string[]>(Array(10).fill(""))
  const [nailShape, setNailShape] = useState<string>("oval")
  const [introScreen, setIntroScreen] = useState(true)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const enlargedCanvasRef = useRef<HTMLCanvasElement>(null)
  const canvasHistoryRef = useRef<ImageData[][]>(Array(10).fill(null).map(() => []))
  const canvasHistoryIndexRef = useRef<number[]>(Array(10).fill(-1))
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 768px)")

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

    // Restore previous drawing for this nail if it exists
    const imageData = canvasHistoryRef.current[activeNail][canvasHistoryIndexRef.current[activeNail]]
    if (imageData) {
      ctx.putImageData(imageData, 0, 0)
    }
  }, [activeNail, isEnlarged])

  // Generate preview images for all nails when showing preview
  useEffect(() => {
    if (showPreview) {
      generateNailPreviews()
    }
  }, [showPreview])

  // Save to history when drawing stops
  const saveToHistory = (imageData: ImageData) => {
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
    }
  }

  // Handle undo
  const handleUndo = () => {
    const currentIndex = canvasHistoryIndexRef.current[activeNail]
    if (currentIndex <= 0) {
      toast({
        title: "Nothing to undo",
        description: "This nail has no previous states.",
      })
      return
    }

    // Update index
    const indexCopy = [...canvasHistoryIndexRef.current]
    indexCopy[activeNail] = currentIndex - 1
    canvasHistoryIndexRef.current = indexCopy

    // Redraw canvas with previous state
    const canvas = isEnlarged ? enlargedCanvasRef.current : canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const previousImageData = canvasHistoryRef.current[activeNail][currentIndex - 1]
    if (previousImageData) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.putImageData(previousImageData, 0, 0)
    }

    toast({
      title: "Undo successful",
      description: "Previous step has been restored.",
    })
  }

  // Handle clear
  const handleClear = () => {
    const canvas = isEnlarged ? enlargedCanvasRef.current : canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Reset history for this nail
    const historyCopy = [...canvasHistoryRef.current]
    historyCopy[activeNail] = []
    canvasHistoryRef.current = historyCopy

    // Reset index
    const indexCopy = [...canvasHistoryIndexRef.current]
    indexCopy[activeNail] = -1
    canvasHistoryIndexRef.current = indexCopy

    // Mark as not completed
    const newCompletedNails = [...completedNails]
    newCompletedNails[activeNail] = false
    setCompletedNails(newCompletedNails)

    toast({
      title: "Nail cleared",
      description: "Start fresh with a new design!",
    })
  }

  // Handle drawing state changes
  const handleDrawingStateChange = (drawing: boolean) => {
    setIsDrawing(drawing)
  }

  // Generate nail previews for the final display
  const generateNailPreviews = () => {
    const previewImages = Array(10).fill("")

    // For each nail, generate a preview image
    for (let i = 0; i < 10; i++) {
      const lastImageData = canvasHistoryRef.current[i][canvasHistoryIndexRef.current[i]]
      
      if (lastImageData) {
        // Create a temporary canvas to generate the preview
        const tempCanvas = document.createElement("canvas")
        tempCanvas.width = 100
        tempCanvas.height = 150
        const tempCtx = tempCanvas.getContext("2d")
        
        if (tempCtx) {
          tempCtx.putImageData(lastImageData, 0, 0)
          previewImages[i] = tempCanvas.toDataURL("image/png")
        }
      }
    }

    setAllNailsPreview(previewImages)
  }

  // Toggle enlarged mode
  const toggleEnlargedMode = () => {
    setIsEnlarged(!isEnlarged)
  }

  // Navigate to next nail
  const navigateToNextNail = () => {
    setActiveNail((prev) => (prev === 9 ? 0 : prev + 1))
  }

  // Navigate to previous nail
  const navigateToPrevNail = () => {
    setActiveNail((prev) => (prev === 0 ? 9 : prev - 1))
  }

  // Handle save design
  const handleSaveDesign = () => {
    toast({
      title: "Design Saved!",
      description: "Your nail design has been saved to your account.",
    })
  }

  // Handle share design
  const handleShareDesign = () => {
    // In a real app, we would implement sharing functionality
    toast({
      title: "Share Feature",
      description: "This would allow you to share your design on social media.",
    })
  }

  // Handle download design
  const handleDownloadDesign = () => {
    const downloadCanvas = document.createElement("canvas")
    downloadCanvas.width = 500
    downloadCanvas.height = 300
    const ctx = downloadCanvas.getContext("2d")
    
    if (!ctx) return
    
    // White background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, 500, 300)
    
    // Title
    ctx.fillStyle = "#ec4899"
    ctx.font = "bold 20px Arial"
    ctx.textAlign = "center"
    ctx.fillText("My Pearl4nails Design", 250, 30)
    
    // Draw all nails
    const positions = [
      { x: 50, y: 80 }, { x: 120, y: 70 }, { x: 190, y: 60 }, { x: 260, y: 70 }, { x: 330, y: 80 },
      { x: 50, y: 180 }, { x: 120, y: 170 }, { x: 190, y: 160 }, { x: 260, y: 170 }, { x: 330, y: 180 }
    ]
    
    for (let i = 0; i < 10; i++) {
      // Add nail index
      ctx.fillStyle = "#666666"
      ctx.font = "bold 12px Arial"
      ctx.textAlign = "center"
      ctx.fillText(`${i + 1}`, positions[i].x + 20, positions[i].y - 5)
      
      // Draw nail preview
      if (allNailsPreview[i]) {
        const img = new Image()
        img.src = allNailsPreview[i]
        ctx.drawImage(img, positions[i].x, positions[i].y, 40, 60)
      } else {
        // Empty nail
        ctx.strokeStyle = "#dddddd"
        ctx.strokeRect(positions[i].x, positions[i].y, 40, 60)
        ctx.fillStyle = "#eeeeee"
        ctx.fillRect(positions[i].x, positions[i].y, 40, 60)
      }
    }
    
    // Add logo
    ctx.fillStyle = "#ec4899"
    ctx.font = "bold 14px Arial"
    ctx.textAlign = "center"
    ctx.fillText("Pearl4nails", 250, 280)
    
    // Convert to data URL and download
    const dataUrl = downloadCanvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.download = "pearl4nails-design.png"
    link.href = dataUrl
    link.click()
    
    toast({
      title: "Design Downloaded!",
      description: "Your nail design has been downloaded as an image.",
    })
  }
  
  // Function to handle starting the nail game (closing intro screen)
  const handleStartGame = () => {
    setIntroScreen(false)
    toast({
      title: "Welcome to the Nail Art Studio!",
      description: "Design your perfect nails before your appointment.",
    })
  }

  const allNailsCompleted = completedNails.every(Boolean)

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {introScreen ? (
          <div className="bg-white rounded-xl p-8 shadow-lg border border-pink-100">
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">
              Welcome to the <span className="text-pink-500">Nail Art Studio</span>
            </h1>
            <div className="w-24 h-1 bg-pink-500 mx-auto mb-8"></div>
            
            <div className="flex flex-col md:flex-row gap-8 mb-10">
              <div className="md:w-1/2">
                <img 
                  src="/images/BlueNailPolish.jpeg" 
                  alt="Nail Art Example" 
                  className="rounded-xl shadow-md w-full h-[350px] object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "https://placehold.co/600x400/fdf2f8/ec4899?text=Nail+Art+Studio"
                  }}
                />
              </div>
              
              <div className="md:w-1/2">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Design Your Dream Nails</h2>
                <p className="text-gray-700 mb-4">
                  Get creative with our virtual nail design studio! Try different colors, add glitter, 
                  apply stickers, and create the perfect nail art design before your next appointment.
                </p>
                
                <div className="lg:grid grid-cols-2 gap-4 mb-6 xs:flex flex-wrap">
                  <div className="flex items-start">
                    <div className="bg-pink-100 p-2 rounded-full mr-3">
                      <Palette className="h-5 w-5 text-pink-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">Creative Tools</h3>
                      <p className="text-sm text-gray-600">Brushes, colors, glitter, and stickers</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-pink-100 p-2 rounded-full mr-3">
                      <Sparkles className="h-5 w-5 text-pink-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">Special Effects</h3>
                      <p className="text-sm text-gray-600">Add glitter and decorative elements</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-pink-100 p-2 rounded-full mr-3">
                      <Save className="h-5 w-5 text-pink-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">Save Designs</h3>
                      <p className="text-sm text-gray-600">Save and share your creations</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-pink-100 p-2 rounded-full mr-3">
                      <Download className="h-5 w-5 text-pink-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">Download</h3>
                      <p className="text-sm text-gray-600">Get your designs as images</p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleStartGame}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-lg text-lg font-medium"
                >
                  Start Designing
                </Button>
              </div>
            </div>
            
            <div className="text-center text-sm text-gray-500">
              Create your design virtually, then book an appointment to get these exact nails in real life!
            </div>
          </div>
        ) : showPreview ? (
          <DesignPreview 
            nailPreviews={allNailsPreview}
            onClose={() => setShowPreview(false)}
            onSave={handleSaveDesign}
            onShare={handleShareDesign}
            onDownload={handleDownloadDesign}
          />
        ) : (
          <>
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Nail Art Studio</h1>
            <p className="text-center text-gray-600 mb-6">
              Design your perfect nails virtually before your appointment!
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main canvas and tools area */}
              <div className="lg:col-span-2">
                <Card className="p-4 md:p-6 bg-white shadow-md rounded-xl border border-gray-100 mb-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-pink-50 text-pink-600 border-pink-200">
                        Nail {activeNail + 1}
                      </Badge>
                      <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                        {completedNails.filter(Boolean).length}/10 Complete
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={navigateToPrevNail}
                        className="h-8 w-8 p-0"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={navigateToNextNail}
                        className="h-8 w-8 p-0"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={toggleEnlargedMode}
                        className="h-8 w-8 p-0"
                      >
                        {isEnlarged ? (
                          <Minimize2 className="h-4 w-4" />
                        ) : (
                          <Maximize2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className={`nail-container relative ${isEnlarged ? 'h-[500px]' : 'h-[300px]'} mb-4 bg-white shadow-sm rounded-xl p-2`}>
                    <div className="hand-outline"></div>
                    <div className="relative h-full flex items-center justify-center">
                      <NailCanvas 
                        width={isEnlarged ? 300 : 200}
                        height={isEnlarged ? 450 : 300}
                        activeNail={activeNail}
                        isEnlarged={isEnlarged}
                        tool={tool}
                        activeColor={activeColor}
                        brushSize={brushSize}
                        sticker={sticker}
                        onSave={saveToHistory}
                        onDrawingStateChange={handleDrawingStateChange}
                        savedImageData={canvasHistoryRef.current[activeNail][canvasHistoryIndexRef.current[activeNail]]}
                        nailShape={nailShape as any}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-center mt-4">
                    <Button 
                      onClick={() => setShowPreview(true)}
                      disabled={!allNailsCompleted}
                      className="bg-pink-500 hover:bg-pink-600"
                    >
                      {allNailsCompleted ? "Preview Complete Design" : `Complete All Nails (${completedNails.filter(Boolean).length}/10)`}
                    </Button>
                  </div>
                </Card>
              </div>
              
              {/* Tools sidebar */}
              <div className="space-y-6">
                <ToolsPanel 
                  activeColor={activeColor}
                  brushSize={brushSize}
                  tool={tool}
                  sticker={sticker}
                  nailShape={nailShape}
                  onColorChange={setActiveColor}
                  onBrushSizeChange={setBrushSize}
                  onToolChange={setTool}
                  onStickerChange={setSticker}
                  onNailShapeChange={setNailShape}
                  onClear={handleClear}
                  onUndo={handleUndo}
                  onSave={handleSaveDesign}
                  onDownload={handleDownloadDesign}
                />
                
                <NailSelector 
                  activeNail={activeNail}
                  completedNails={completedNails}
                  nailPreviews={allNailsPreview}
                  onSelectNail={setActiveNail}
                  onNavigateNext={navigateToNextNail}
                  onNavigatePrev={navigateToPrevNail}
                />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl p-6 text-center mt-10 text-white relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-40 h-40 transform translate-x-20 -translate-y-10 opacity-10">
                <Sparkles className="w-full h-full" />
              </div>
              <div className="absolute bottom-0 left-0 w-40 h-40 transform -translate-x-20 translate-y-10 opacity-10">
                <Star className="w-full h-full" />
              </div>
              
              <h2 className="text-3xl font-bold mb-4">New! Play "Nail It!" Challenge</h2>
              <p className="text-white/80 mb-6 max-w-2xl mx-auto">
                Ready for more excitement? Try our new memory-based nail challenge game! 
                Memorize designs, recreate them under time pressure, and win rewards!
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <Button asChild size="lg" className="bg-white text-pink-600 hover:bg-pink-100 border border-white">
                  <Link href="/nail-challenge">Play Nail Challenge</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                  <Link href="/booking">Book Appointment</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
