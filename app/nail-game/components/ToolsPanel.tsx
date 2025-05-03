"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Brush,
  Eraser,
  Sparkles,
  Star,
  Heart,
  Flower2,
  Palette,
  Trash2,
  Undo2,
  Download,
  SquareIcon,
  CircleIcon,
  Triangle,
  Diamond,
  Plus,
  Minus,
  Save
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ToolsPanelProps {
  activeColor: string
  brushSize: number
  tool: "brush" | "eraser" | "glitter" | "sticker"
  sticker: string | null
  nailShape: string
  onColorChange: (color: string) => void
  onBrushSizeChange: (size: number) => void
  onToolChange: (tool: "brush" | "eraser" | "glitter" | "sticker") => void
  onStickerChange: (sticker: string) => void
  onNailShapeChange: (shape: string) => void
  onClear: () => void
  onUndo: () => void
  onSave: () => void
  onDownload: () => void
}

export default function ToolsPanel({
  tool,
  activeColor,
  brushSize,
  sticker,
  nailShape,
  onToolChange,
  onColorChange,
  onBrushSizeChange,
  onStickerChange,
  onNailShapeChange,
  onClear,
  onUndo,
  onSave,
  onDownload,
}: ToolsPanelProps) {
  const [activeTab, setActiveTab] = useState("tools")

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
    { name: "Diamond", icon: <Diamond className="h-5 w-5" /> },
    { name: "Butterfly", icon: <span className="h-5 w-5 flex items-center justify-center text-sm">🦋</span> },
    { name: "Rhinestone", icon: <span className="h-5 w-5 flex items-center justify-center text-sm">💎</span> },
  ]

  const nailShapes = [
    { name: "square", icon: <SquareIcon className="h-5 w-5" /> },
    { name: "oval", icon: <CircleIcon className="h-5 w-5" /> },
    { name: "almond", icon: <Triangle className="h-5 w-5 rotate-180" /> },
    { name: "stiletto", icon: <Triangle className="h-5 w-5 rotate-180" /> },
    { name: "coffin", icon: <SquareIcon className="h-5 w-5" /> },
  ]

  return (
    <div className="tools-panel flex flex-col space-y-4 bg-white rounded-lg p-4 shadow-md">
      <div className="tool-buttons grid grid-cols-4 gap-2">
        <button
          className={`tool-btn flex flex-col items-center justify-center p-3 rounded-md transition-all ${tool === 'brush' ? 'bg-pink-100 text-pink-500 shadow-md scale-105' : 'hover:bg-pink-50'}`}
          onClick={() => onToolChange('brush')}
        >
          <Brush size={24} />
          <span className="text-xs font-medium mt-1">Brush</span>
        </button>
        <button
          className={`tool-btn flex flex-col items-center justify-center p-3 rounded-md transition-all ${tool === 'eraser' ? 'bg-pink-100 text-pink-500 shadow-md scale-105' : 'hover:bg-pink-50'}`}
          onClick={() => onToolChange('eraser')}
        >
          <Eraser size={24} />
          <span className="text-xs font-medium mt-1">Eraser</span>
        </button>
        <button
          className={`tool-btn flex flex-col items-center justify-center p-3 rounded-md transition-all ${tool === 'glitter' ? 'bg-pink-100 text-pink-500 shadow-md scale-105' : 'hover:bg-pink-50'}`}
          onClick={() => onToolChange('glitter')}
        >
          <Sparkles size={24} />
          <span className="text-xs font-medium mt-1">Glitter</span>
        </button>
        <button
          className={`tool-btn flex flex-col items-center justify-center p-3 rounded-md transition-all ${tool === 'sticker' ? 'bg-pink-100 text-pink-500 shadow-md scale-105' : 'hover:bg-pink-50'}`}
          onClick={() => onToolChange('sticker')}
        >
          <Star size={24} />
          <span className="text-xs font-medium mt-1">Sticker</span>
        </button>
      </div>

      {(tool === 'brush' || tool === 'eraser' || tool === 'glitter') && (
        <div className="brush-size-control mt-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Brush Size</label>
            <span className="text-sm font-medium bg-pink-100 px-2 py-1 rounded-full">{brushSize}px</span>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => onBrushSizeChange(Math.max(1, brushSize - 1))}
              className="p-1 rounded-full bg-gray-100 hover:bg-pink-100 text-gray-700"
            >
              <Minus size={16} />
            </button>
            <input 
              type="range" 
              min="1" 
              max="20" 
              value={brushSize} 
              onChange={(e) => onBrushSizeChange(parseInt(e.target.value))} 
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <button 
              onClick={() => onBrushSizeChange(Math.min(20, brushSize + 1))}
              className="p-1 rounded-full bg-gray-100 hover:bg-pink-100 text-gray-700"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="mt-2 flex justify-center">
            <div 
              className="brush-preview rounded-full border border-gray-300" 
              style={{ 
                width: brushSize * 2, 
                height: brushSize * 2, 
                backgroundColor: tool === 'eraser' ? '#ffffff' : activeColor,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            />
          </div>
        </div>
      )}

      {(tool === 'brush' || tool === 'glitter') && (
        <div className="color-picker mt-3">
          <label className="text-sm font-medium text-gray-700 block mb-2">Color</label>
          <div className="color-grid grid grid-cols-6 gap-3">
            {[
              "#FF0000", "#FF9900", "#FFFF00", "#00FF00", "#0099FF", "#6633FF",
              "#FF00FF", "#FF6666", "#FFCC99", "#CCFF99", "#99FFFF", "#9999FF",
              "#000000", "#333333", "#666666", "#999999", "#CCCCCC", "#FFFFFF"
            ].map((color) => (
              <button
                key={color}
                className={`color-swatch w-8 h-8 rounded-full transition-transform ${activeColor === color ? 'ring-2 ring-offset-2 ring-pink-500 transform scale-110' : 'hover:scale-105'}`}
                style={{ backgroundColor: color, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                onClick={() => onColorChange(color)}
              />
            ))}
          </div>
        </div>
      )}

      {tool === 'sticker' && (
        <div className="sticker-picker mt-3">
          <label className="text-sm font-medium text-gray-700 block mb-2">Stickers</label>
          <div className="sticker-grid grid grid-cols-3 gap-3">
            {[
              "Star", "Heart", "Flower", "Diamond", "Butterfly", "Rhinestone"
            ].map((stickerType) => (
              <button
                key={stickerType}
                className={`sticker-btn py-3 text-sm rounded-lg border ${sticker === stickerType ? 'bg-pink-100 border-pink-300 text-pink-500 font-medium shadow-sm' : 'border-gray-200 hover:bg-pink-50'}`}
                onClick={() => onStickerChange(stickerType)}
              >
                {stickerType}
              </button>
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="tools" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-3 bg-pink-50">
          <TabsTrigger value="tools" className="text-sm font-medium">
            Tools
          </TabsTrigger>
          <TabsTrigger value="colors" className="text-sm font-medium">
            Colors
          </TabsTrigger>
          <TabsTrigger value="options" className="text-sm font-medium">
            Options
          </TabsTrigger>
        </TabsList>

        <div className="p-4 bg-white">
          <TabsContent value="tools" className="mt-0">
            <div className="flex justify-between gap-2 mt-6">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={onUndo}>
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
                    <Button variant="outline" size="icon" onClick={onClear}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clear</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={onSave}>
                      <Save className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Save</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={onDownload}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </TabsContent>

          <TabsContent value="colors" className="mt-0">
            {tool !== "eraser" && (
              <>
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2 text-gray-700">Color Palette</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {colors.map((color) => (
                      <button
                        key={color}
                        className={`color-swatch ${activeColor === color ? "active" : ""}`}
                        style={{ backgroundColor: color }}
                        onClick={() => onColorChange(color)}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </div>

                {tool === "glitter" && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2 text-gray-700">Glitter Effects</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {glitterColors.map((color) => (
                        <button
                          key={color}
                          className={`color-swatch ${activeColor === color ? "active" : ""}`}
                          style={{ backgroundColor: color }}
                          onClick={() => onColorChange(color)}
                          aria-label={`Select glitter color ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2 text-gray-700">Current Color</h3>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full border border-gray-200"
                      style={{ backgroundColor: activeColor }}
                    ></div>
                    <div className="text-sm text-gray-600">{activeColor}</div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="options" className="mt-0">
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2 text-gray-700">Nail Shape</h3>
              <div className="grid grid-cols-3 gap-2">
                {nailShapes.map((shape) => (
                  <button
                    key={shape.name}
                    className={`sticker-button flex flex-col items-center justify-center p-2 rounded-md ${
                      nailShape === shape.name ? "bg-pink-100 shadow-sm" : ""
                    }`}
                    onClick={() => onNailShapeChange(shape.name)}
                  >
                    {shape.icon}
                    <span className="text-xs mt-1 capitalize">{shape.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2 text-gray-700">Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={onSave} className="text-xs w-full">
                  <Save className="h-4 w-4 mr-1" />
                  Save Design
                </Button>
                <Button variant="outline" size="sm" onClick={onDownload} className="text-xs w-full">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
