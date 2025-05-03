"use client"

import { useState, useRef, useEffect } from "react"
import { 
  nailShapes, 
  createNailBaseGradient, 
  addNail3DEffect, 
  addGelEffect,
  generateGlitterParticles,
  stickerDesigns 
} from "../utils"

interface NailCanvasProps {
  width: number
  height: number
  activeNail: number
  isEnlarged: boolean
  tool: "brush" | "eraser" | "glitter" | "sticker"
  activeColor: string
  brushSize: number
  sticker: string | null
  onSave: (imageData: ImageData) => void
  onDrawingStateChange: (isDrawing: boolean) => void
  savedImageData?: ImageData | null
  nailShape?: "square" | "oval" | "almond" | "stiletto" | "coffin"
}

export default function NailCanvas({
  width,
  height,
  activeNail,
  isEnlarged,
  tool,
  activeColor,
  brushSize,
  sticker,
  onSave,
  onDrawingStateChange,
  savedImageData = null,
  nailShape = "oval"
}: NailCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null)
  
  // Track all points in current stroke for smooth drawing
  const pointsRef = useRef<Array<{x: number, y: number}>>([]);
  
  // Add forced rerender to ensure drawing works
  const [forceUpdate, setForceUpdate] = useState(0)

  // Setup canvas when active nail changes or enlarged state changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Adjust canvas size to fit container
    const containerWidth = canvas.clientWidth
    const containerHeight = canvas.clientHeight
    canvas.width = containerWidth
    canvas.height = containerHeight

    // Enable high-quality lines - IMPORTANT FIX
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
      
    // Clear canvas
    ctx.clearRect(0, 0, containerWidth, containerHeight)

    // Draw nail shape with realistic base specific to the finger
    drawNailShape(ctx, nailShape)

    // Restore saved image data if available
    if (savedImageData) {
      ctx.putImageData(savedImageData, 0, 0)
    }
    
    // Force rerender to ensure everything is drawn correctly
    setForceUpdate(prev => prev + 1)
  }, [width, height, activeNail, nailShape, savedImageData, isEnlarged])

  // Helper function to create a pretty base gradient for the nail
  const createNailBaseGradient = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#fee0e3');
    gradient.addColorStop(1, '#ffe9ec');
    return gradient;
  }
  
  // Helper function to add 3D-like effects to the nail
  const addNail3DEffect = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Add the 3D effects for a realistic gel nail look
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  
  // Add a gel-like shine effect to the nail
  const addGelEffect = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Add a highlight effect for gel appearance
    const highlightGradient = ctx.createLinearGradient(0, 0, width, height/3);
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = highlightGradient;
    ctx.fillRect(0, 0, width, height/2);
  }
  
  // Create a path for the nail shape (used for clipping during drawing)
  const drawNailShapePath = (ctx: CanvasRenderingContext2D) => {
    // Get actual canvas dimensions
    const actualWidth = ctx.canvas.width
    const actualHeight = ctx.canvas.height
    
    // Each nail has different sizes and shapes based on the finger
    // Using smaller scale factors to fit within container
    let widthScale = 0.7;
    let heightScale = 0.7;
    let curvature = 0;
    
    // Adjust size and shape based on active nail (finger)
    switch(activeNail) {
      case 0: // Left thumb
        widthScale = 0.8;
        heightScale = 0.7;
        curvature = -5;
        break;
      case 1: // Left index
        widthScale = 0.6;
        heightScale = 0.65;
        curvature = -2;
        break;
      case 2: // Left middle
        widthScale = 0.65;
        heightScale = 0.7;
        curvature = 0;
        break;
      case 3: // Left ring
        widthScale = 0.58;
        heightScale = 0.65;
        curvature = 2;
        break;
      case 4: // Left pinky
        widthScale = 0.5;
        heightScale = 0.55;
        curvature = 5;
        break;
      case 5: // Right thumb
        widthScale = 0.8;
        heightScale = 0.7;
        curvature = 5;
        break;
      case 6: // Right index
        widthScale = 0.6;
        heightScale = 0.65;
        curvature = 2;
        break;
      case 7: // Right middle
        widthScale = 0.65;
        heightScale = 0.7;
        curvature = 0;
        break;
      case 8: // Right ring
        widthScale = 0.58;
        heightScale = 0.65;
        curvature = -2;
        break;
      case 9: // Right pinky
        widthScale = 0.5;
        heightScale = 0.55;
        curvature = -5;
        break;
    }
    
    // Apply rotation for natural finger angle
    if (curvature !== 0) {
      const centerX = actualWidth / 2;
      const centerY = actualHeight / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((curvature * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);
    }
    
    // Create the proper nail shape with appropriate sizing
    const shapeFunction = nailShapes[nailShape as keyof typeof nailShapes] || nailShapes.oval;
    shapeFunction(ctx, actualWidth, actualHeight, widthScale, heightScale);
  }

  // Draw the nail shape for the current nail
  const drawNailShape = (ctx: CanvasRenderingContext2D, shape: string) => {
    // Set clip path for the nail shape
    ctx.save()
    
    // Draw the nail shape path
    drawNailShapePath(ctx);
    
    // Fill with gradient base coat
    ctx.fillStyle = createNailBaseGradient(ctx, ctx.canvas.width, ctx.canvas.height);
    ctx.fill();

    // Add 3D effect
    addNail3DEffect(ctx, ctx.canvas.width, ctx.canvas.height);
    
    // Add gel effect
    addGelEffect(ctx, ctx.canvas.width, ctx.canvas.height);
    
    // Add explicit console log for debugging
    console.log('Drew nail shape for nail', activeNail, 'with shape', nailShape);
    
    ctx.restore();
  }

  const startDrawing = (x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)
    lastPositionRef.current = { x, y }
    
    // Save canvas context and create clip path
    ctx.save()
    drawNailShapePath(ctx)
    ctx.clip()
    
    // Draw a point at the starting position
    drawPoint(ctx, x, y)
    
    // Restore context
    ctx.restore()
    
    if (typeof onDrawingStateChange === "function") {
      onDrawingStateChange(true)
    }
    
    // For single-touch tools like stickers, apply immediately
    if (tool === "sticker" && sticker) {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return
      
      // Save the current canvas state after applying sticker
      setTimeout(() => {
        if (canvas) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          onSave(imageData)
          setIsDrawing(false)
          onDrawingStateChange(false)
          lastPositionRef.current = null
        }
      }, 50)
    }
  }

  // This tracks all points in the current stroke for smoother drawing
  const pointsRef = useRef<Array<{x: number, y: number}>>([]);

  const handleMove = (x: number, y: number) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    // Add current point to points array
    pointsRef.current.push({x, y});
    
    // Set up clipping to stay within nail shape
    ctx.save()
    
    // Clear the previous drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the nail base
    drawNailShape(ctx, nailShape);
    
    // Restore saved image data if available
    if (savedImageData) {
      ctx.putImageData(savedImageData, 0, 0);
    }
    
    // Create a clip path for the nail shape
    ctx.beginPath();
    drawNailShapePath(ctx);
    ctx.clip();
    
    // Prepare general drawing styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (tool === "brush") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = brushSize;
      
      // Only draw if we have at least 2 points
      if (pointsRef.current.length > 1) {
        ctx.beginPath();
        ctx.moveTo(pointsRef.current[0].x, pointsRef.current[0].y);
        
        // Draw a smooth curve through all points
        for (let i = 1; i < pointsRef.current.length; i++) {
          const pt = pointsRef.current[i];
          ctx.lineTo(pt.x, pt.y);
        }
        
        ctx.stroke();
      }
    } else if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = brushSize;
      
      if (pointsRef.current.length > 1) {
        ctx.beginPath();
        ctx.moveTo(pointsRef.current[0].x, pointsRef.current[0].y);
        
        for (let i = 1; i < pointsRef.current.length; i++) {
          const pt = pointsRef.current[i];
          ctx.lineTo(pt.x, pt.y);
        }
        
        ctx.stroke();
      }
    } else if (tool === "glitter") {
      ctx.globalCompositeOperation = "source-over";
      
      for (let i = 1; i < pointsRef.current.length; i++) {
        const prev = pointsRef.current[i-1];
        const curr = pointsRef.current[i];
        
        const dist = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));
        const steps = Math.max(5, Math.floor(dist / 2));
        
        for (let j = 0; j <= steps; j++) {
          const ratio = j / steps;
          const pointX = prev.x + (curr.x - prev.x) * ratio;
          const pointY = prev.y + (curr.y - prev.y) * ratio;
          const particles = generateGlitterParticles(pointX, pointY, activeColor, brushSize);
          
          particles.forEach(particle => {
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }
    }
    
    // Restore context after drawing
    ctx.restore();
    
    // Update that drawing has occurred
    if (typeof onDrawingStateChange === "function") {
      onDrawingStateChange(true);
    }
  }

  // Handle direct drawing instead of using a separate drawLine function
  const drawLine = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) => {
    // Draw a smooth line between two points
    if (tool === "brush") {
      ctx.globalCompositeOperation = "source-over"
      ctx.strokeStyle = activeColor
      ctx.lineWidth = brushSize
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      // Create a smooth stroke
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    } else if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out"
      ctx.lineWidth = brushSize
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    } else if (tool === "glitter") {
      ctx.globalCompositeOperation = "source-over"
      const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
      const steps = Math.max(5, Math.floor(distance / 3))
      
      // Draw glitter particles along the path
      for (let i = 0; i <= steps; i++) {
        const ratio = i / steps
        const x = x1 + (x2 - x1) * ratio
        const y = y1 + (y2 - y1) * ratio
        
        // Generate random glitter particles
        const particles = generateGlitterParticles(x, y, activeColor, brushSize)
        
        // Draw each particle
        particles.forEach(particle => {
          ctx.fillStyle = particle.color
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fill()
        })
      }
    }
  }

  const drawPoint = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    if (tool === "brush") {
      // Draw with a brush using the selected color
      ctx.globalCompositeOperation = "source-over"
      ctx.fillStyle = activeColor
      ctx.beginPath()
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2)
      ctx.fill()
    } else if (tool === "eraser") {
      // Erase with a circular eraser
      ctx.globalCompositeOperation = "destination-out"
      ctx.beginPath()
      ctx.arc(x, y, brushSize, 0, Math.PI * 2)
      ctx.fill()
    } else if (tool === "glitter") {
      // Add glitter effect at the current position
      ctx.globalCompositeOperation = "source-over"
      
      // Generate glitter particles
      const particles = generateGlitterParticles(x, y, activeColor, brushSize * 2)
      
      // Draw each glitter particle
      particles.forEach(particle => {
        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
      })
    }
  }

  // Function to save the current canvas state
  const saveCanvasState = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Get the current image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    
    // Save it using the provided onSave function
    if (typeof onSave === "function") {
      onSave(imageData)

  // Get final canvas state
  const canvas = canvasRef.current
  if (canvas) {
    
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Start drawing at this point
    setIsDrawing(true)
    
    // Reset points array and add the first point
    pointsRef.current = [{x, y}];
    
    // Save the current position
    lastPositionRef.current = { x, y }
    
    // Store the current canvas state
    const ctx = canvas.getContext("2d")
    if (ctx) {
      // Save current canvas state before starting new drawing
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      if (savedImageData === null) {
        onSave(imgData);
      }
    }
    
    // Notify of drawing state change
    if (typeof onDrawingStateChange === "function") {
      onDrawingStateChange(true)
    }
    
    // Prevent page scrolling
    document.body.classList.add('body-no-scroll')
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    e.preventDefault(); // Prevent browser default behavior
    e.stopPropagation(); // Stop event propagation

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Handle mouse movement - draw line from last position to current
    // Use requestAnimationFrame for smoother drawing
    requestAnimationFrame(() => {
      handleMove(x, y)
    })
  }

  // Function to handle touch events
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event bubbling
    
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top
    
    // Start drawing at this point
    setIsDrawing(true)
    
    // Reset points array and add the first point
    pointsRef.current = [{x, y}];
    
    // Save the current position
    lastPositionRef.current = { x, y }
    
    // Store the current canvas state
    const ctx = canvas.getContext("2d")
    if (ctx) {
      // Save current canvas state before starting new drawing
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      if (savedImageData === null) {
        onSave(imgData);
      }
    }
    
    // Notify of drawing state change
    if (typeof onDrawingStateChange === "function") {
      onDrawingStateChange(true)
    }
    
    // Prevent page scrolling
    document.body.classList.add('body-no-scroll')
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    e.preventDefault()
    e.stopPropagation() // Stop event bubbling

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top
    
    // Handle touch movement - use requestAnimationFrame for smoother painting 
    requestAnimationFrame(() => {
      handleMove(x, y)
    })
  }

  // Draw star sticker
  const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) => {
    const spikes = 5
    const outerRadius = size
    const innerRadius = size * 0.4
    
    ctx.fillStyle = "#facc15" // Yellow
    
    ctx.beginPath()
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2
      
      const x = cx + Math.cos(angle) * radius
      const y = cy + Math.sin(angle) * radius
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.fill()
  }

  // Draw heart sticker
  const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.fillStyle = "#ec4899" // Pink
    
    ctx.beginPath()
    ctx.moveTo(x, y + size * 0.3)
    ctx.bezierCurveTo(
      x, y, 
      x - size, y, 
      x - size, y + size * 0.7
    )
    ctx.bezierCurveTo(
      x - size, y + size * 1.1, 
      x - size * 0.5, y + size * 1.4, 
      x, y + size
    )
    ctx.bezierCurveTo(
      x + size * 0.5, y + size * 1.4, 
      x + size, y + size * 1.1, 
      x + size, y + size * 0.7
    )
    ctx.bezierCurveTo(
      x + size, y, 
      x, y, 
      x, y + size * 0.3
    )
    ctx.fill()
  }

  // Draw flower sticker
  const drawFlower = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    const petalCount = 5
    const innerRadius = size * 0.2
    const outerRadius = size
    
    // Draw petals
    ctx.fillStyle = "#ec4899" // Pink
    
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2
      const petalX = x + Math.cos(angle) * outerRadius * 0.7
      const petalY = y + Math.sin(angle) * outerRadius * 0.7
      
      ctx.beginPath()
      ctx.ellipse(
        petalX, 
        petalY, 
        outerRadius * 0.5, 
        outerRadius * 0.3, 
        angle, 
        0, 
        Math.PI * 2
      )
      ctx.fill()
    }
    
    // Draw center
    ctx.fillStyle = "#facc15" // Yellow
    ctx.beginPath()
    ctx.arc(x, y, innerRadius, 0, Math.PI * 2)
    ctx.fill()
  }

  return (
    <div className="nail-canvas-container relative w-full h-full overflow-hidden border border-pink-200 rounded-lg prevent-scroll">
      {isEnlarged && (
        <div className="absolute inset-0 canvas-pattern-dots pointer-events-none"></div>
      )}
      <canvas
        ref={canvasRef}
        width="300"
        height="300"
        className="nail-canvas w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={stopDrawing}
        style={{ touchAction: 'none', WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
      />
      {!isEnlarged && (
        <div className="absolute top-2 left-2 text-xs font-medium px-2 py-1 rounded bg-pink-500 text-white">
          Finger {activeNail + 1}
        </div>
      )}
      <button 
        className="absolute inset-0 w-full h-full cursor-crosshair z-10 opacity-0"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const canvas = canvasRef.current;
          if (!canvas) return;
          
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          console.log('Button clicked at', x, y);
          setIsDrawing(true);
          startDrawing(x, y);
        }}
      />
      {!isDrawing && !isEnlarged && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 transition-opacity">
          <span className="text-white text-sm font-bold px-4 py-2 rounded-lg bg-pink-500 backdrop-blur-sm tap-prompt">
            Tap to draw
          </span>
        </div>
      )}
    </div>
  )
}
