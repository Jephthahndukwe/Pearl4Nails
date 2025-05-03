// Utility functions for the Nail Game

// Generate a unique ID for saved designs
export function generateDesignId(): string {
  return `design_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

// Advanced glitter generation
export function generateGlitterParticles(
  x: number, 
  y: number, 
  color: string = 'rgba(255, 215, 0, 0.7)', 
  count: number = 10
): Array<{x: number; y: number; size: number; opacity: number; color: string}> {
  const particles = [];
  
  for (let i = 0; i < count; i++) {
    // Random position within a small radius of the cursor
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 10;
    const particleX = x + Math.cos(angle) * distance;
    const particleY = y + Math.sin(angle) * distance;
    
    // Random size and opacity for variety
    const size = 1 + Math.random() * 3;
    const opacity = 0.3 + Math.random() * 0.7;
    
    // Slight color variation
    const adjustedColor = color.replace(
      /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/,
      (_, r, g, b, a) => {
        const variation = 20;
        const newR = Math.min(255, Math.max(0, Number(r) + (Math.random() * variation - variation/2)));
        const newG = Math.min(255, Math.max(0, Number(g) + (Math.random() * variation - variation/2)));
        const newB = Math.min(255, Math.max(0, Number(b) + (Math.random() * variation - variation/2)));
        return `rgba(${newR.toFixed(0)}, ${newG.toFixed(0)}, ${newB.toFixed(0)}, ${opacity})`;
      }
    );
    
    particles.push({
      x: particleX,
      y: particleY,
      size,
      opacity,
      color: adjustedColor
    });
  }
  
  return particles;
}

// Predefined nail shapes with realistic curvature
export const nailShapes = {
  square: (ctx: CanvasRenderingContext2D, width: number, height: number, widthScale: number = 1, heightScale: number = 1) => {
    const w = width * widthScale;
    const h = height * heightScale;
    const centerOffsetX = (width - w) / 2;
    const centerOffsetY = (height - h) / 2;
    
    ctx.beginPath();
    ctx.moveTo(centerOffsetX + w * 0.2, centerOffsetY + h * 0.1);
    ctx.quadraticCurveTo(centerOffsetX + w * 0.1, centerOffsetY + h * 0.1, centerOffsetX + w * 0.1, centerOffsetY + h * 0.2);
    ctx.lineTo(centerOffsetX + w * 0.1, centerOffsetY + h * 0.8);
    ctx.lineTo(centerOffsetX + w * 0.3, centerOffsetY + h * 0.95);
    ctx.lineTo(centerOffsetX + w * 0.7, centerOffsetY + h * 0.95);
    ctx.lineTo(centerOffsetX + w * 0.9, centerOffsetY + h * 0.8);
    ctx.lineTo(centerOffsetX + w * 0.9, centerOffsetY + h * 0.2);
    ctx.quadraticCurveTo(centerOffsetX + w * 0.9, centerOffsetY + h * 0.1, centerOffsetX + w * 0.8, centerOffsetY + h * 0.1);
    ctx.closePath();
  },
  
  oval: (ctx: CanvasRenderingContext2D, width: number, height: number, widthScale: number = 1, heightScale: number = 1) => {
    const w = width * widthScale;
    const h = height * heightScale;
    const centerOffsetX = (width - w) / 2;
    const centerOffsetY = (height - h) / 2;
    
    ctx.beginPath();
    ctx.moveTo(centerOffsetX + w * 0.2, centerOffsetY + h * 0.1);
    ctx.quadraticCurveTo(centerOffsetX + w * 0.1, centerOffsetY + h * 0.1, centerOffsetX + w * 0.1, centerOffsetY + h * 0.2);
    ctx.lineTo(centerOffsetX + w * 0.1, centerOffsetY + h * 0.7);
    ctx.quadraticCurveTo(centerOffsetX + w * 0.1, centerOffsetY + h * 0.85, centerOffsetX + w * 0.5, centerOffsetY + h * 0.95);
    ctx.quadraticCurveTo(centerOffsetX + w * 0.9, centerOffsetY + h * 0.85, centerOffsetX + w * 0.9, centerOffsetY + h * 0.7);
    ctx.lineTo(centerOffsetX + w * 0.9, centerOffsetY + h * 0.2);
    ctx.quadraticCurveTo(centerOffsetX + w * 0.9, centerOffsetY + h * 0.1, centerOffsetX + w * 0.8, centerOffsetY + h * 0.1);
    ctx.closePath();
  },
  
  almond: (ctx: CanvasRenderingContext2D, width: number, height: number, widthScale: number = 1, heightScale: number = 1) => {
    const w = width * widthScale;
    const h = height * heightScale;
    const centerOffsetX = (width - w) / 2;
    const centerOffsetY = (height - h) / 2;
    
    ctx.beginPath();
    ctx.moveTo(centerOffsetX + w * 0.2, centerOffsetY + h * 0.1);
    ctx.quadraticCurveTo(centerOffsetX + w * 0.1, centerOffsetY + h * 0.1, centerOffsetX + w * 0.1, centerOffsetY + h * 0.2);
    ctx.lineTo(centerOffsetX + w * 0.1, centerOffsetY + h * 0.7);
    ctx.quadraticCurveTo(centerOffsetX + w * 0.2, centerOffsetY + h * 0.9, centerOffsetX + w * 0.5, centerOffsetY + h * 0.95);
    ctx.quadraticCurveTo(centerOffsetX + w * 0.8, centerOffsetY + h * 0.9, centerOffsetX + w * 0.9, centerOffsetY + h * 0.7);
    ctx.lineTo(centerOffsetX + w * 0.9, centerOffsetY + h * 0.2);
    ctx.quadraticCurveTo(centerOffsetX + w * 0.9, centerOffsetY + h * 0.1, centerOffsetX + w * 0.8, centerOffsetY + h * 0.1);
    ctx.closePath();
  },
  
  stiletto: (ctx: CanvasRenderingContext2D, width: number, height: number, widthScale: number = 1, heightScale: number = 1) => {
    const w = width * widthScale;
    const h = height * heightScale;
    const centerOffsetX = (width - w) / 2;
    const centerOffsetY = (height - h) / 2;
    
    ctx.beginPath();
    ctx.moveTo(centerOffsetX + w * 0.2, centerOffsetY + h * 0.1);
    ctx.quadraticCurveTo(centerOffsetX + w * 0.1, centerOffsetY + h * 0.1, centerOffsetX + w * 0.1, centerOffsetY + h * 0.2);
    ctx.lineTo(centerOffsetX + w * 0.1, centerOffsetY + h * 0.6);
    ctx.quadraticCurveTo(centerOffsetX + w * 0.2, centerOffsetY + h * 0.8, centerOffsetX + w * 0.5, centerOffsetY + h * 0.95);
    ctx.quadraticCurveTo(centerOffsetX + w * 0.8, centerOffsetY + h * 0.8, centerOffsetX + w * 0.9, centerOffsetY + h * 0.6);
    ctx.lineTo(centerOffsetX + w * 0.9, centerOffsetY + h * 0.2);
    ctx.quadraticCurveTo(centerOffsetX + w * 0.9, centerOffsetY + h * 0.1, centerOffsetX + w * 0.8, centerOffsetY + h * 0.1);
    ctx.closePath();
  },
  
  coffin: (ctx: CanvasRenderingContext2D, width: number, height: number, widthScale: number = 1, heightScale: number = 1) => {
    const w = width * widthScale;
    const h = height * heightScale;
    const centerOffsetX = (width - w) / 2;
    const centerOffsetY = (height - h) / 2;
    
    ctx.beginPath();
    ctx.moveTo(centerOffsetX + w * 0.2, centerOffsetY + h * 0.1);
    ctx.quadraticCurveTo(centerOffsetX + w * 0.1, centerOffsetY + h * 0.1, centerOffsetX + w * 0.1, centerOffsetY + h * 0.2);
    ctx.lineTo(centerOffsetX + w * 0.1, centerOffsetY + h * 0.7);
    ctx.lineTo(centerOffsetX + w * 0.3, centerOffsetY + h * 0.95);
    ctx.lineTo(centerOffsetX + w * 0.7, centerOffsetY + h * 0.95);
    ctx.lineTo(centerOffsetX + w * 0.9, centerOffsetY + h * 0.7);
    ctx.lineTo(centerOffsetX + w * 0.9, centerOffsetY + h * 0.2);
    ctx.quadraticCurveTo(centerOffsetX + w * 0.9, centerOffsetY + h * 0.1, centerOffsetX + w * 0.8, centerOffsetY + h * 0.1);
    ctx.closePath();
  }
};

// Create a "realistic" nail base color gradient
export function createNailBaseGradient(
  ctx: CanvasRenderingContext2D, 
  width: number, 
  height: number
): CanvasGradient {
  const gradient = ctx.createRadialGradient(
    width * 0.5, 
    height * 0.4, 
    width * 0.1,
    width * 0.5, 
    height * 0.6, 
    width * 0.8
  );
  
  gradient.addColorStop(0, 'rgba(255, 245, 247, 0.9)');
  gradient.addColorStop(0.5, 'rgba(255, 235, 238, 0.8)');
  gradient.addColorStop(1, 'rgba(255, 225, 230, 0.7)');
  
  return gradient;
}

// Add 3D effect to a drawn nail
export function addNail3DEffect(
  ctx: CanvasRenderingContext2D, 
  width: number, 
  height: number
): void {
  // Add a subtle shadow at the edges
  ctx.save();
  
  // Create shadow gradient along the edges
  const shadowGradient = ctx.createLinearGradient(0, 0, width, height);
  shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
  shadowGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
  shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
  
  ctx.strokeStyle = shadowGradient;
  ctx.lineWidth = 6;
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.3;
  ctx.stroke();
  
  // Add a highlight at the top of the nail
  ctx.globalCompositeOperation = 'lighten';
  ctx.globalAlpha = 0.5;
  
  const highlightGradient = ctx.createLinearGradient(0, 0, 0, height * 0.3);
  highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = highlightGradient;
  ctx.fill();
  
  ctx.restore();
}

// Add gel effect to a drawn nail
export function addGelEffect(
  ctx: CanvasRenderingContext2D, 
  width: number, 
  height: number
): void {
  ctx.save();
  
  // Create gel highlight effect
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.3;
  
  const gelGradient = ctx.createRadialGradient(
    width * 0.4, 
    height * 0.3, 
    width * 0.1,
    width * 0.5, 
    height * 0.5, 
    width
  );
  
  gelGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  gelGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
  gelGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = gelGradient;
  ctx.fill();
  
  ctx.restore();
}

// Advanced sticker designs
export const stickerDesigns = {
  flower: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    const petalCount = 5;
    const innerRadius = size * 0.2;
    const outerRadius = size;
    
    // Draw petals
    ctx.fillStyle = "#ec4899"; // Pink
    
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petalX = x + Math.cos(angle) * outerRadius * 0.7;
      const petalY = y + Math.sin(angle) * outerRadius * 0.7;
      
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
    }
    
    // Draw center
    ctx.fillStyle = "#facc15"; // Yellow
    ctx.beginPath();
    ctx.arc(x, y, innerRadius, 0, Math.PI * 2);
    ctx.fill();
  },
  
  heart: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.fillStyle = "#ec4899"; // Pink
    
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.3);
    ctx.bezierCurveTo(
      x, y, 
      x - size, y, 
      x - size, y + size * 0.7
    );
    ctx.bezierCurveTo(
      x - size, y + size * 1.1, 
      x - size * 0.5, y + size * 1.4, 
      x, y + size
    );
    ctx.bezierCurveTo(
      x + size * 0.5, y + size * 1.4, 
      x + size, y + size * 1.1, 
      x + size, y + size * 0.7
    );
    ctx.bezierCurveTo(
      x + size, y, 
      x, y, 
      x, y + size * 0.3
    );
    ctx.fill();
    
    // Add highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.beginPath();
    ctx.ellipse(
      x - size * 0.5, 
      y + size * 0.5, 
      size * 0.3, 
      size * 0.2, 
      -Math.PI / 4, 
      0, 
      Math.PI * 2
    );
    ctx.fill();
  },
  
  star: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.4;
    
    ctx.fillStyle = "#facc15"; // Yellow
    
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
      
      const pointX = x + Math.cos(angle) * radius;
      const pointY = y + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(pointX, pointY);
      } else {
        ctx.lineTo(pointX, pointY);
      }
    }
    ctx.closePath();
    ctx.fill();
    
    // Add highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.arc(x - size * 0.2, y - size * 0.2, size * 0.2, 0, Math.PI * 2);
    ctx.fill();
  },
  
  diamond: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.fillStyle = "#3b82f6"; // Blue
    
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size, y);
    ctx.closePath();
    ctx.fill();
    
    // Add highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.6);
    ctx.lineTo(x + size * 0.4, y - size * 0.2);
    ctx.lineTo(x, y + size * 0.2);
    ctx.lineTo(x - size * 0.4, y - size * 0.2);
    ctx.closePath();
    ctx.fill();
  },
  
  butterfly: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    // Butterfly wings
    ctx.fillStyle = "#8b5cf6"; // Purple
    
    // Top left wing
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(
      x - size * 0.5, y - size * 0.5,
      x - size * 1.2, y - size * 0.8,
      x - size * 0.7, y - size * 0.1
    );
    ctx.bezierCurveTo(
      x - size * 0.6, y,
      x - size * 0.3, y,
      x, y
    );
    ctx.fill();
    
    // Bottom left wing
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(
      x - size * 0.5, y + size * 0.5,
      x - size * 1.2, y + size * 0.8,
      x - size * 0.7, y + size * 0.1
    );
    ctx.bezierCurveTo(
      x - size * 0.6, y,
      x - size * 0.3, y,
      x, y
    );
    ctx.fill();
    
    // Top right wing
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(
      x + size * 0.5, y - size * 0.5,
      x + size * 1.2, y - size * 0.8,
      x + size * 0.7, y - size * 0.1
    );
    ctx.bezierCurveTo(
      x + size * 0.6, y,
      x + size * 0.3, y,
      x, y
    );
    ctx.fill();
    
    // Bottom right wing
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(
      x + size * 0.5, y + size * 0.5,
      x + size * 1.2, y + size * 0.8,
      x + size * 0.7, y + size * 0.1
    );
    ctx.bezierCurveTo(
      x + size * 0.6, y,
      x + size * 0.3, y,
      x, y
    );
    ctx.fill();
    
    // Butterfly body
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.1, size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Antennae
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = size * 0.05;
    
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.3);
    ctx.quadraticCurveTo(
      x - size * 0.2, y - size * 0.6,
      x - size * 0.3, y - size * 0.7
    );
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.3);
    ctx.quadraticCurveTo(
      x + size * 0.2, y - size * 0.6,
      x + size * 0.3, y - size * 0.7
    );
    ctx.stroke();
  },
  
  rhinestone: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    // Base sparkly rhinestone
    const gradient = ctx.createRadialGradient(
      x - size * 0.2, y - size * 0.2, size * 0.1,
      x, y, size
    );
    
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.2, 'rgba(220, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(200, 220, 255, 0.7)');
    gradient.addColorStop(0.8, 'rgba(180, 180, 220, 0.6)');
    gradient.addColorStop(1, 'rgba(140, 140, 210, 0.4)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
    ctx.fill();
    
    // Outer edge
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = size * 0.05;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
    ctx.stroke();
    
    // Highlight/sparkle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    
    // Main highlight
    ctx.beginPath();
    ctx.arc(x - size * 0.2, y - size * 0.2, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Small sparkles
    for (let i = 0; i < 4; i++) {
      const angle = i * Math.PI / 2;
      const distance = size * 0.6;
      const sparkSize = size * 0.1;
      
      ctx.beginPath();
      ctx.arc(
        x + Math.cos(angle) * distance,
        y + Math.sin(angle) * distance,
        sparkSize,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    
    // Cross-shaped shine in the center
    ctx.beginPath();
    ctx.moveTo(x - size * 0.1, y);
    ctx.lineTo(x + size * 0.1, y);
    ctx.moveTo(x, y - size * 0.1);
    ctx.lineTo(x, y + size * 0.1);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = size * 0.1;
    ctx.stroke();
  }
};

// Generate confetti particles for animations
export function generateConfetti(count: number = 100) {
  const confetti = [];
  const colors = ['#ec4899', '#3b82f6', '#facc15', '#22c55e', '#8b5cf6'];
  
  for (let i = 0; i < count; i++) {
    confetti.push({
      x: Math.random() * 100,
      y: -10 - Math.random() * 100,
      size: 5 + Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: 1 + Math.random() * 3,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10
    });
  }
  
  return confetti;
}

// Filter effects for the nail canvas
export const canvasFilters = {
  none: 'none',
  sepia: 'sepia(50%)',
  grayscale: 'grayscale(70%)',
  saturate: 'saturate(150%)',
  contrast: 'contrast(130%)',
  vintage: 'sepia(30%) saturate(120%) contrast(120%) brightness(90%)',
  warm: 'saturate(120%) brightness(105%) contrast(110%) sepia(20%)',
  cool: 'saturate(110%) brightness(105%) contrast(110%) hue-rotate(10deg)',
  dramatic: 'contrast(140%) brightness(95%) saturate(130%)'
};

// Textures for nail designs
export const nailTextures = {
  marble: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Create a marble-like texture
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.3, 'rgba(220, 220, 220, 0.8)');
    gradient.addColorStop(0.7, 'rgba(240, 240, 240, 0.9)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.9)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add veins
    ctx.strokeStyle = 'rgba(180, 180, 180, 0.3)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 20; i++) {
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      
      let currX = startX;
      let currY = startY;
      
      for (let j = 0; j < 5; j++) {
        const nextX = currX + (Math.random() - 0.5) * 50;
        const nextY = currY + (Math.random() - 0.5) * 50;
        
        ctx.quadraticCurveTo(
          currX + (Math.random() - 0.5) * 20,
          currY + (Math.random() - 0.5) * 20,
          nextX, nextY
        );
        
        currX = nextX;
        currY = nextY;
      }
      
      ctx.stroke();
    }
  },
  
  shimmer: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Create a shimmer texture with diagonal lines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw diagonal lines for shimmer effect
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    
    for (let i = -width; i < width * 2; i += 6) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + width, height);
      ctx.stroke();
    }
  },
  
  glitter: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Add glitter spots
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 0.5 + Math.random() * 2;
      const opacity = 0.3 + Math.random() * 0.7;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};
