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
  nailShape?: "square" | "oval" | "almond" | "stiletto" | "coffin" | "squoval" | "round"
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
  
  // Track points for continuous stroke
  const pointsRef = useRef<Array<{x: number, y: number}>>([])
  
  // Add forced rerender to ensure drawing works
  const [forceUpdate, setForceUpdate] = useState(0)
  
  // Store the base nail image (without any paint)
  const baseNailRef = useRef<ImageData | null>(null)

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

    // Enable high-quality lines - crucial for smooth strokes
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
      
    // Clear canvas
    ctx.clearRect(0, 0, containerWidth, containerHeight)

    // Draw nail shape with realistic base specific to the finger
    drawNailShape(ctx, nailShape)
    
    // Save the base nail state (with gradient and effects, but no paint)
    baseNailRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height)

    // Restore saved image data if available
    if (savedImageData) {
      ctx.putImageData(savedImageData, 0, 0)
    }
    
    // In sticker mode, we want to always be in 'drawing' state
    // so the overlay never appears and users can directly place stickers
    if (tool === "sticker") {
      setIsDrawing(true);
    }
    
    // Force rerender to ensure everything is drawn correctly
    setForceUpdate(prev => prev + 1)
  }, [width, height, activeNail, nailShape, savedImageData, isEnlarged, tool])

  // Helper function to create a pretty base gradient for the nail
  const createNailBaseGradient = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, '#fee0e3')
    gradient.addColorStop(1, '#ffe9ec')
    return gradient
  }
  
  // Helper function to add 3D-like effects to the nail
  const addNail3DEffect = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Add the 3D effects for a realistic gel nail look
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.lineWidth = 3
    ctx.stroke()
  }
  
  // Add a gel-like shine effect to the nail
  const addGelEffect = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Add a highlight effect for gel appearance
    const highlightGradient = ctx.createLinearGradient(0, 0, width, height/3)
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)')
    highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)')
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    
    ctx.fillStyle = highlightGradient
    ctx.fillRect(0, 0, width, height/2)
  }
  
  // Create a path for the nail shape (used for clipping during drawing)
  const drawNailShapePath = (ctx: CanvasRenderingContext2D) => {
    // Get actual canvas dimensions
    const actualWidth = ctx.canvas.width
    const actualHeight = ctx.canvas.height
    
    // Set default size and shape
    let nailWidthMM = 11 // Default width in mm
    let nailLengthMM = 15 // Default length in mm
    let naturalShape = nailShape // Use the provided shape or default
    let curvature = 0
    
    // Based on real human women's nail dimensions
    // Customize nail size and shape based on finger
    switch(activeNail) {
      case 0: // Left thumb
      case 5: // Right thumb
        nailWidthMM = 13
        nailLengthMM = 18
        curvature = activeNail === 0 ? -3 : 3 // Slight curvature based on hand
        if (nailShape === "oval") naturalShape = "squoval" // Thumbs are commonly squoval
        break
      
      case 1: // Left index
      case 6: // Right index
        nailWidthMM = 11
        nailLengthMM = 16
        curvature = activeNail === 1 ? -2 : 2
        if (nailShape === "oval") naturalShape = "oval" // Index fingers are commonly oval
        break
      
      case 2: // Left middle
      case 7: // Right middle
        nailWidthMM = 12
        nailLengthMM = 17
        curvature = 0 // Middle fingers typically straight
        if (nailShape === "oval") naturalShape = "squoval" // Middle fingers are commonly squoval
        break
      
      case 3: // Left ring
      case 8: // Right ring
        nailWidthMM = 11
        nailLengthMM = 16
        curvature = activeNail === 3 ? 2 : -2
        if (nailShape === "oval") naturalShape = "almond" // Ring fingers often have almond shape
        break
      
      case 4: // Left pinky
      case 9: // Right pinky
        nailWidthMM = 8
        nailLengthMM = 12
        curvature = activeNail === 4 ? 3 : -3
        if (nailShape === "oval") naturalShape = "round" // Pinkies are commonly round
        break
    }
    
    // Convert mm to pixels using reasonable scaling factor adjusted for visibility
    // Increase size for better visibility on small screens
    const pixelsPerMM = 10 // Increased from 8 to make nails more visible
    
    // Calculate dimensions based on finger-specific measurements
    const width = nailWidthMM * pixelsPerMM
    const height = nailLengthMM * pixelsPerMM
    
    // Center the nail on the canvas
    const offsetX = (actualWidth - width) / 2
    // Center nail vertically for better visibility on small screens
    const offsetY = (actualHeight - height) / 2
    
    // Map custom shapes to ones that exist in the utility
    let shapeKey = naturalShape;
    // If the shape doesn't exist in our utilities, map to closest match
    if (naturalShape === "squoval") shapeKey = "square";
    if (naturalShape === "round") shapeKey = "oval";
    
    // Get shape function based on the mapped shape
    const shapeFunction = nailShapes[shapeKey as keyof typeof nailShapes] || nailShapes.oval
    
    // Create a rotation transform for curvature if needed
    if (curvature !== 0) {
      ctx.save()
      ctx.translate(actualWidth/2, actualHeight/2)
      ctx.rotate(curvature * Math.PI / 180)
      ctx.translate(-actualWidth/2, -actualHeight/2)
    }
    
    // Draw the shape path with proper position and size
    ctx.beginPath()
    // Call with the correct 5 parameters (ctx, width, height, widthScale, heightScale)
    shapeFunction(ctx, actualWidth, actualHeight, width/actualWidth, height/actualHeight)
    
    // Restore transform if we applied rotation
    if (curvature !== 0) {
      ctx.restore()
    }
  }
  
  // Draw the nail shape for the current nail
  const drawNailShape = (ctx: CanvasRenderingContext2D, shape: string) => {
    const width = ctx.canvas.width
    const height = ctx.canvas.height
    
    // Create clip path for the nail shape
    drawNailShapePath(ctx)
    
    // Fill with gradient
    const gradient = createNailBaseGradient(ctx, width, height)
    ctx.fillStyle = gradient
    ctx.fill()
    
    // Add 3D effect
    addNail3DEffect(ctx, width, height)
    
    // Add gel effect
    addGelEffect(ctx, width, height)
  }

  // Main drawing function - handle continuous painting with brush strokes
  const handleMove = (x: number, y: number) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    // Add current point to stroke tracking
    pointsRef.current.push({x, y})
    
    // IMPORTANT: Do NOT clear the canvas - this was causing drawings to disappear
    // We only need to draw the new line segment
    
    // Set up clipping to stay within nail shape
    ctx.save()
    drawNailShapePath(ctx)
    ctx.clip()
    
    // Set up drawing style for continuous stroke
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = brushSize
    
    // Draw just the new line segment from the previous point to current point
    if (tool === "brush") {
      const len = pointsRef.current.length;
      if (len >= 2) {
        const prevPoint = pointsRef.current[len - 2];
        const currPoint = pointsRef.current[len - 1];
        
        ctx.save();
        drawNailShapePath(ctx);
        ctx.clip();
        
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Just draw the new segment
        ctx.beginPath();
        ctx.moveTo(prevPoint.x, prevPoint.y);
        ctx.lineTo(currPoint.x, currPoint.y);
        ctx.stroke();
        
        ctx.restore();
      }
    } else if (tool === "eraser") {
      // Only erase if we have points and have stored the base nail
      const len = pointsRef.current.length;
      if (len >= 2 && baseNailRef.current) {
        const prevPoint = pointsRef.current[len - 2];
        const currPoint = pointsRef.current[len - 1];
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // First, save the current painted nail state
        const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Create a temporary canvas for the paint only (without the base)
        const paintCanvas = document.createElement('canvas');
        paintCanvas.width = canvas.width;
        paintCanvas.height = canvas.height;
        const paintCtx = paintCanvas.getContext('2d');
        if (!paintCtx) return;
        
        // Put current state on paint canvas
        paintCtx.putImageData(currentState, 0, 0);
        
        // Create another canvas for the base nail only
        const baseCanvas = document.createElement('canvas');
        baseCanvas.width = canvas.width;
        baseCanvas.height = canvas.height;
        const baseCtx = baseCanvas.getContext('2d');
        if (!baseCtx) return;
        
        // Put base nail on base canvas
        baseCtx.putImageData(baseNailRef.current, 0, 0);
        
        // Now erase from the paint canvas only
        paintCtx.save();
        paintCtx.globalCompositeOperation = "destination-out";
        paintCtx.lineWidth = brushSize * 1.5;
        paintCtx.lineCap = 'round';
        paintCtx.lineJoin = 'round';
        
        // Draw eraser stroke
        paintCtx.beginPath();
        paintCtx.moveTo(prevPoint.x, prevPoint.y);
        paintCtx.lineTo(currPoint.x, currPoint.y);
        paintCtx.stroke();
        
        // Add circle at current position for better erasing
        paintCtx.beginPath();
        paintCtx.arc(currPoint.x, currPoint.y, brushSize * 0.75, 0, Math.PI * 2);
        paintCtx.fill();
        paintCtx.restore();
        
        // Clear main canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // First draw the base nail
        ctx.drawImage(baseCanvas, 0, 0);
        
        // Then draw the remaining paint on top
        ctx.drawImage(paintCanvas, 0, 0);
      }
    } else if (tool === "glitter") {
      // Glitter should only add new particles for the new segment
      const len = pointsRef.current.length;
      if (len >= 2) {
        ctx.save();
        drawNailShapePath(ctx);
        ctx.clip();
        
        // Use "lighter" blend mode for more shiny glitter effect
        ctx.globalCompositeOperation = "source-over";
        
        // Only draw glitter for the latest segment
        const prev = pointsRef.current[len-2];
        const curr = pointsRef.current[len-1];
        
        const dist = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));
        const steps = Math.max(8, Math.floor(dist));
        
        // Draw more particles for better glitter effect
        const particleCount = Math.max(20, Math.floor(brushSize * 2));
        
        for (let j = 0; j <= steps; j++) {
          const ratio = j / steps;
          const pointX = prev.x + (curr.x - prev.x) * ratio;
          const pointY = prev.y + (curr.y - prev.y) * ratio;
          
          // Add variation to position for more natural glitter spread
          const spreadFactor = brushSize * 0.75;
          const randomOffsetX = (Math.random() - 0.5) * spreadFactor;
          const randomOffsetY = (Math.random() - 0.5) * spreadFactor;
          
          // Generate more glitter particles with the active color
          const baseColor = activeColor;
          const particles = generateGlitterParticles(
            pointX + randomOffsetX, 
            pointY + randomOffsetY, 
            baseColor, 
            particleCount
          );
          
          particles.forEach(particle => {
            // Make particles more visible
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Add highlight to each particle
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.beginPath();
            ctx.arc(particle.x - particle.size/3, particle.y - particle.size/3, particle.size/2, 0, Math.PI * 2);
            ctx.fill();
          });
        }
        
        ctx.restore();
      }
    } else if (tool === "sticker" && sticker) {
      // For sticker tool, we place it at the current mouse/touch position
      const len = pointsRef.current.length;
      if (len > 0) {
        // Use the current position for placement
        const currPoint = pointsRef.current[len - 1];
        const posX = currPoint.x;
        const posY = currPoint.y;
        
        // Track sticker position for saving later
        lastPositionRef.current = { x: posX, y: posY };
        
        // Get the current state before placing sticker
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Clear before redrawing with sticker
        if (baseNailRef.current) {
          // First restore the nail base state
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.putImageData(baseNailRef.current, 0, 0);
          
          // Then overlay the saved image data (painted parts only)
          if (savedImageData) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            if (tempCtx) {
              // Draw saved image data to temp canvas
              tempCtx.putImageData(savedImageData, 0, 0);
              
              // Overlay the saved data onto main canvas
              ctx.drawImage(tempCanvas, 0, 0);
            }
          }
        }
        
        // Now place the sticker on top
        ctx.save();
        drawNailShapePath(ctx);
        ctx.clip();
        
        // Make stickers brighter and more visible
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = "source-over";
        
        // Draw the appropriate sticker
        if (sticker === "star") {
          drawStar(ctx, posX, posY, brushSize * 2);
        } else if (sticker === "heart") {
          drawHeart(ctx, posX, posY, brushSize * 1.5);
        } else if (sticker === "flower") {
          drawFlower(ctx, posX, posY, brushSize * 2);
        }
        
        ctx.restore();
        
        // Immediately save the canvas with sticker
        saveCanvasState();
      }
    }
    
    // Update last position
    lastPositionRef.current = { x, y }
    
    // Notify that drawing has occurred
    if (typeof onDrawingStateChange === "function") {
      onDrawingStateChange(true)
    }
  }

  // Function to save current canvas state
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
    }
  }

  // Stop drawing and save final state
  const stopDrawing = (leaveDrawingState = false) => {
    if (!isDrawing) return
    
    // Save final canvas state
    saveCanvasState()
    
    // Reset drawing state, but optionally keep isDrawing true
    if (!leaveDrawingState) {
      setIsDrawing(false)
    }
    lastPositionRef.current = null
    pointsRef.current = []
    
    // Always re-enable scrolling when drawing stops, regardless of leaveDrawingState
    document.body.classList.remove('body-no-scroll')
  }

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Always set the drawing state to true first to prevent tap overlay
    setIsDrawing(true)
    
    // Get current state before new drawing
    const ctx = canvas.getContext("2d")
    if (ctx) {
      // Save the current canvas state before starting a new stroke
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      if (savedImageData === null) {
        onSave(imgData)
      }
      
      // Special handling for sticker tool
      if (tool === "sticker" && sticker) {
        console.log("Placing sticker at", x, y);
        // We handle stickers differently - directly place them without drawing
        pointsRef.current = [{x, y}]
        lastPositionRef.current = { x, y }
        
        // First restore base nail state if needed
        if (baseNailRef.current) {
          // Get the current state with any existing paint
          const currentState = imgData;

          // Create a temporary canvas for the existing paint
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          const tempCtx = tempCanvas.getContext('2d');
          
          if (tempCtx && savedImageData) {
            // Put existing paint on temp canvas
            tempCtx.putImageData(savedImageData, 0, 0);
          }

          // Redraw everything with sticker
          // First clear and draw the base nail
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.putImageData(baseNailRef.current, 0, 0);
          
          // Then restore any existing paint
          if (tempCtx && savedImageData) {
            ctx.drawImage(tempCanvas, 0, 0);
          }
        }
        
        // Now draw the sticker on top
        ctx.save();
        drawNailShapePath(ctx);
        ctx.clip();
        
        if (sticker === "star") {
          drawStar(ctx, x, y, brushSize * 2);
        } else if (sticker === "heart") {
          drawHeart(ctx, x, y, brushSize * 1.5);
        } else if (sticker === "flower") {
          drawFlower(ctx, x, y, brushSize * 2);
        }
        
        ctx.restore();
        
        // Save canvas state immediately with the sticker
        saveCanvasState();
        return; // Exit early after placing sticker
      }
      // Draw initial dot to start the stroke for brush tool
      else if (tool === "brush") {
        ctx.save();
        drawNailShapePath(ctx);
        ctx.clip();
        
        ctx.fillStyle = activeColor;
        ctx.beginPath();
        ctx.arc(x, y, brushSize/2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }
    }
    
    // Only setup points tracking for non-sticker tools
    if (tool !== "sticker") {
      // Reset points array and add first point
      pointsRef.current = [{x, y}];
      lastPositionRef.current = { x, y };
    }
    
    // Prevent scrolling while drawing
    document.body.classList.add('body-no-scroll');
    
    // Notify of drawing state change
    if (typeof onDrawingStateChange === "function") {
      onDrawingStateChange(true);
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    e.preventDefault()
    e.stopPropagation()

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Use requestAnimationFrame for smoother drawing
    requestAnimationFrame(() => {
      handleMove(x, y)
    })
  }

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    // Don't prevent default on the entire document
    // Just stop propagation to parent elements
    e.stopPropagation()
    
    // Don't add any body-no-scroll class as it prevents page scrolling
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top
    
    // Get current state before new drawing
    const ctx = canvas.getContext("2d")
    if (ctx) {
      // Save the current canvas state before starting a new stroke
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      if (savedImageData === null) {
        onSave(imgData)
      }
      
      // Draw initial dot to start the stroke
      if (tool === "brush") {
        ctx.save()
        drawNailShapePath(ctx)
        ctx.clip()
        
        ctx.fillStyle = activeColor
        ctx.beginPath()
        ctx.arc(x, y, brushSize/2, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.restore()
      }
    }
    
    // Start new drawing stroke
    setIsDrawing(true)
    
    // Reset points array and add first point
    pointsRef.current = [{x, y}]
    lastPositionRef.current = { x, y }
    
    // Notify of drawing state change
    if (typeof onDrawingStateChange === "function") {
      onDrawingStateChange(true)
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    // Only prevent default for the canvas itself, not the whole page
    e.stopPropagation()
    e.stopPropagation()

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top
    
    // Use requestAnimationFrame for smoother drawing
    requestAnimationFrame(() => {
      handleMove(x, y)
    })
  }

  // Sticker drawing functions
  const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) => {
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.4;
    
    // Add a gradient to make the star more vibrant
    const gradient = ctx.createRadialGradient(
      cx - size * 0.2, cy - size * 0.2, size * 0.1,
      cx, cy, size
    );
    
    gradient.addColorStop(0, '#fef08a'); // Light yellow
    gradient.addColorStop(0.7, '#facc15'); // Yellow
    gradient.addColorStop(1, '#ca8a04'); // Darker edge
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i / (spikes * 2)) * Math.PI * 2;
      
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
    
    // Add a highlight for 3D effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(cx - size * 0.15, cy - size * 0.15, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    // Make hearts more visible with bright pink and add highlight
    const gradient = ctx.createRadialGradient(
      x - size * 0.2, y + size * 0.3, size * 0.1,
      x, y + size * 0.6, size * 1.5
    );
    
    gradient.addColorStop(0, '#ff4da6'); // Bright center
    gradient.addColorStop(0.6, '#ec4899'); // Pink
    gradient.addColorStop(1, '#be185d'); // Darker edge
    
    ctx.fillStyle = gradient;
    
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
    ctx.fill();
    
    // Add a highlight for 3D effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.ellipse(x - size * 0.3, y + size * 0.4, size * 0.2, size * 0.3, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  }

  const drawFlower = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    const petalCount = 6; // Add one more petal for fuller look
    const innerRadius = size * 0.3; // Larger center
    const outerRadius = size;
    
    // Draw petals with gradient for each petal
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petalX = x + Math.cos(angle) * outerRadius * 0.7;
      const petalY = y + Math.sin(angle) * outerRadius * 0.7;
      
      // Create gradient for petal
      const petalGradient = ctx.createRadialGradient(
        petalX - Math.cos(angle) * outerRadius * 0.2,
        petalY - Math.sin(angle) * outerRadius * 0.2,
        outerRadius * 0.1,
        petalX,
        petalY,
        outerRadius * 0.5
      );
      
      petalGradient.addColorStop(0, '#fbcfe8'); // Light pink
      petalGradient.addColorStop(0.7, '#ec4899'); // Pink
      petalGradient.addColorStop(1, '#be185d'); // Darker edge
      
      ctx.fillStyle = petalGradient;
      ctx.beginPath();
      ctx.ellipse(
        petalX, 
        petalY, 
        outerRadius * 0.5, 
        outerRadius * 0.3, 
        angle, 
        0, 
        Math.PI * 2
      );
      ctx.fill();
      
      // Add highlight to each petal
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.ellipse(
        petalX - Math.cos(angle) * outerRadius * 0.15, 
        petalY - Math.sin(angle) * outerRadius * 0.15, 
        outerRadius * 0.15, 
        outerRadius * 0.08, 
        angle, 
        0, 
        Math.PI * 2
      );
      ctx.fill();
    }
    
    // Draw center with gradient
    const centerGradient = ctx.createRadialGradient(
      x - innerRadius * 0.3, y - innerRadius * 0.3, innerRadius * 0.1,
      x, y, innerRadius
    );
    
    centerGradient.addColorStop(0, '#fef08a'); // Light yellow
    centerGradient.addColorStop(0.6, '#facc15'); // Yellow
    centerGradient.addColorStop(1, '#ca8a04'); // Darker edge
    
    ctx.fillStyle = centerGradient;
    ctx.beginPath();
    ctx.arc(x, y, innerRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add highlight to center
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(x - innerRadius * 0.3, y - innerRadius * 0.3, innerRadius * 0.3, 0, Math.PI * 2);
    ctx.fill();
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
        className={`nail-canvas w-full h-full ${tool === "sticker" ? "cursor-cell" : "cursor-crosshair"}`}
        onClick={(e) => {
          // Special direct click handler for stickers
          if (tool === "sticker" && sticker) {
            // Explicitly handle sticker placement
            e.preventDefault();
            e.stopPropagation();
            
            const canvas = canvasRef.current;
            if (!canvas) return;
            
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Draw sticker at click position
            const ctx = canvas.getContext("2d");
            if (ctx) {
              // If we have a base nail reference, use it to recompose the nail
              if (baseNailRef.current) {
                // First save current state with paint
                const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                // Reset canvas and draw base nail
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.putImageData(baseNailRef.current, 0, 0);
                
                // Re-apply existing paint and drawing
                if (savedImageData) {
                  // Use a temporary canvas to handle the paint layers
                  const tempCanvas = document.createElement('canvas');
                  tempCanvas.width = canvas.width;
                  tempCanvas.height = canvas.height;
                  const tempCtx = tempCanvas.getContext('2d');
                  
                  if (tempCtx) {
                    // Draw saved painting to temp canvas
                    tempCtx.putImageData(savedImageData, 0, 0);
                    
                    // Overlay existing paint onto main canvas
                    ctx.drawImage(tempCanvas, 0, 0);
                  }
                }
              }
              
              // Now draw the sticker on top
              ctx.save();
              drawNailShapePath(ctx);
              ctx.clip();
              
              if (sticker === "star") {
                drawStar(ctx, x, y, brushSize * 2);
              } else if (sticker === "heart") {
                drawHeart(ctx, x, y, brushSize * 1.5);
              } else if (sticker === "flower") {
                drawFlower(ctx, x, y, brushSize * 2);
              }
              
              ctx.restore();
              
              // Save the canvas state with the new sticker
              saveCanvasState();
            }
          }
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={() => stopDrawing()}
        onMouseLeave={() => {
          // Call stop drawing
          stopDrawing(true);
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => {
          // Keep drawing state as true on touch end to prevent the overlay from reappearing
          setIsDrawing(true);
          stopDrawing(true);
        }}
        onTouchCancel={() => {
          // Explicitly maintain drawing state
          setIsDrawing(true);
          stopDrawing(true);
        }}
        style={{ 
          touchAction: 'manipulation', /* Allow scrolling elsewhere on the page */
          WebkitTouchCallout: 'none', 
          WebkitUserSelect: 'none', 
          userSelect: 'none'
        }}
      />
      {!isEnlarged && (
        <div className="absolute top-2 left-2 text-xs font-medium px-2 py-1 rounded bg-pink-500 text-white">
          Finger {activeNail + 1}
        </div>
      )}
      {!isDrawing && !isEnlarged && tool !== "sticker" && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/5 transition-opacity cursor-crosshair"
          onClick={(e) => {
            // Do NOT prevent default here as it blocks scrolling
            e.stopPropagation();
            
            // CRITICAL: Make sure the page stays scrollable
            setTimeout(() => {
              // Force enable scrolling immediately after click
              document.body.style.overflow = 'auto';
              document.body.style.height = 'auto';
              document.body.style.position = 'static';
              document.documentElement.style.overflow = 'auto';
              document.documentElement.style.overflowY = 'auto';
            }, 0);
            
            const canvas = canvasRef.current;
            if (!canvas) return;
            
            const rect = canvas.getBoundingClientRect();
            // Get the exact coordinates where the user clicked
            const clientX = e.clientX;
            const clientY = e.clientY;
            
            // Calculate exact position on canvas
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            
            // Explicitly set drawing state to prevent overlay from reappearing
            setIsDrawing(true);
            
            // Start drawing for brush/eraser/glitter
            handleMouseDown({
              preventDefault: () => {},
              stopPropagation: () => {},
              clientX: clientX,
              clientY: clientY
            } as unknown as React.MouseEvent<HTMLCanvasElement>);
          }}
        >
          <span className="text-white text-sm font-bold px-4 py-2 rounded-lg bg-pink-500 backdrop-blur-sm tap-prompt">
            Tap to draw
          </span>
        </div>
      )}
    </div>
  )
}
