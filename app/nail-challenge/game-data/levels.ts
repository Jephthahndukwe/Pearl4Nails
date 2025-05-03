// Predefined level designs for the nail challenge game
// Each level has increasing difficulty

export type NailDesign = {
  nailShape: string;
  baseColor: string;
  pattern?: string;
  stickers?: Array<{
    type: string;
    position: { x: number; y: number };
    size: number;
  }>;
  glitter?: boolean;
  glitterColor?: string;
  glitterDensity?: number;
  difficulty: number;
  handCount: 1 | 2; // 1 = one hand, 2 = both hands
}

export type LevelDesign = {
  /**
   * Array of nail indexes (0-based) that must be painted for the challenge.
   * e.g., [0, 2, 4] means only Thumb, Middle, and Pinky must be painted.
   */
  requiredNails?: number[];
  id: number;
  name: string;
  description: string;
  difficulty: 1 | 2 | 3; // 1 = easy, 2 = medium, 3 = hard
  timeLimit: number;
  nails: NailDesign[];
  unlockRequirement: {
    level: number;
    stars: number;
  };
  reward?: {
    type: "discount" | "item";
    value: string;
  };
}

// Create 10 progressively harder levels
export const levelDesigns: LevelDesign[] = [
  // Level 1: Simple solid color, one hand only
  {
    id: 1,
    name: "Basic Beauty",
    description: "Start with a simple solid color design.",
    difficulty: 1,
    timeLimit: 60,
    nails: Array(5).fill({
      nailShape: "oval",
      baseColor: "#ec4899", // pink
      difficulty: 1,
      handCount: 1
    }),
    unlockRequirement: {
      level: 0,
      stars: 0
    }
  },
  
  // Level 2: Memory stripes challenge - only paint Index, Middle, and Ring (nails 1, 2, 3)
  {
    id: 2,
    name: "Memory Stripes",
    description: "Paint only the Index, Middle, and Ring fingers with the correct stripes and colors. Thumb and Pinky must remain blank!",
    difficulty: 2,
    timeLimit: 40, // less time
    requiredNails: [1, 2, 3],
    nails: [
      // Thumb (should be left blank)
      {
        nailShape: "oval",
        baseColor: "#ffffff", // blank
        pattern: "none",
        difficulty: 2,
        handCount: 1
      },
      // Index
      {
        nailShape: "stiletto",
        baseColor: "#f43f5e", // rose
        pattern: "stripes",
        stripeColors: ["#f43f5e", "#ffffff", "#fbbf24"],
        difficulty: 2,
        handCount: 1
      },
      // Middle
      {
        nailShape: "almond",
        baseColor: "#fbbf24", // yellow
        pattern: "dots",
        dotColor: "#f43f5e",
        difficulty: 2,
        handCount: 1
      },
      // Ring
      {
        nailShape: "coffin",
        baseColor: "#a5b4fc", // lavender
        pattern: "gradient",
        gradientColors: ["#a5b4fc", "#f43f5e"],
        difficulty: 2,
        handCount: 1
      },
      // Pinky (should be left blank)
      {
        nailShape: "oval",
        baseColor: "#ffffff", // blank
        pattern: "none",
        difficulty: 2,
        handCount: 1
      }
    ],
    unlockRequirement: {
      level: 1,
      stars: 1
    }
  },
  

  // Level 3: Different nail shapes with basic colors
  {
    id: 3,
    name: "Shape Shifter",
    description: "Try different nail shapes with matching colors.",
    difficulty: 1,
    timeLimit: 60,
    nails: [
      {
        nailShape: "square",
        baseColor: "#bae6fd", // light blue
        difficulty: 1,
        handCount: 1
      },
      {
        nailShape: "almond",
        baseColor: "#a5b4fc", // lavender
        difficulty: 1,
        handCount: 1
      },
      {
        nailShape: "stiletto",
        baseColor: "#f9a8d4", // light pink
        difficulty: 1,
        handCount: 1
      },
      {
        nailShape: "almond",
        baseColor: "#a5b4fc", // lavender
        difficulty: 1,
        handCount: 1
      },
      {
        nailShape: "square",
        baseColor: "#bae6fd", // light blue
        difficulty: 1,
        handCount: 1
      }
    ],
    unlockRequirement: {
      level: 2,
      stars: 2
    }
  },
  
  // Level 4: One hand with glitter accents
  {
    id: 4,
    name: "Glitter Glam",
    description: "Add some sparkle with glitter accents.",
    difficulty: 2,
    timeLimit: 60,
    nails: [
      {
        nailShape: "oval",
        baseColor: "#f9a8d4", // light pink
        glitter: true,
        glitterColor: "#f43f5e", // rose
        glitterDensity: 50,
        difficulty: 2,
        handCount: 1
      },
      {
        nailShape: "oval",
        baseColor: "#f43f5e", // rose
        difficulty: 2,
        handCount: 1
      },
      {
        nailShape: "oval",
        baseColor: "#ffffff", // white
        glitter: true,
        glitterColor: "#f43f5e", // rose
        glitterDensity: 80,
        difficulty: 2,
        handCount: 1
      },
      {
        nailShape: "oval",
        baseColor: "#f43f5e", // rose
        difficulty: 2,
        handCount: 1
      },
      {
        nailShape: "oval",
        baseColor: "#f9a8d4", // light pink
        glitter: true,
        glitterColor: "#f43f5e", // rose
        glitterDensity: 50,
        difficulty: 2,
        handCount: 1
      }
    ],
    unlockRequirement: {
      level: 3,
      stars: 3
    }
  },
  
  // Level 5: Both hands with matching designs
  {
    id: 5,
    name: "Double Trouble",
    description: "Create matching designs on both hands.",
    difficulty: 2,
    timeLimit: 60,
    nails: [
      // First hand
      {
        nailShape: "oval",
        baseColor: "#fef08a", // light yellow
        difficulty: 2,
        handCount: 2
      },
      {
        nailShape: "oval",
        baseColor: "#fcd34d", // yellow
        difficulty: 2,
        handCount: 2
      },
      {
        nailShape: "oval",
        baseColor: "#fbbf24", // amber
        difficulty: 2,
        handCount: 2
      },
      {
        nailShape: "oval",
        baseColor: "#fcd34d", // yellow
        difficulty: 2,
        handCount: 2
      },
      {
        nailShape: "oval",
        baseColor: "#fef08a", // light yellow
        difficulty: 2,
        handCount: 2
      },
      // Second hand (same as first for symmetry)
      {
        nailShape: "oval",
        baseColor: "#fef08a", // light yellow
        difficulty: 2,
        handCount: 2
      },
      {
        nailShape: "oval",
        baseColor: "#fcd34d", // yellow
        difficulty: 2,
        handCount: 2
      },
      {
        nailShape: "oval",
        baseColor: "#fbbf24", // amber
        difficulty: 2,
        handCount: 2
      },
      {
        nailShape: "oval",
        baseColor: "#fcd34d", // yellow
        difficulty: 2,
        handCount: 2
      },
      {
        nailShape: "oval",
        baseColor: "#fef08a", // light yellow
        difficulty: 2,
        handCount: 2
      }
    ],
    unlockRequirement: {
      level: 4,
      stars: 4
    }
  },
  
  // Level 6: Basic sticker patterns
  {
    id: 6,
    name: "Stick with It",
    description: "Add fun stickers to create eye-catching designs.",
    difficulty: 2,
    timeLimit: 60,
    nails: [
      {
        nailShape: "square",
        baseColor: "#a5f3fc", // cyan
        stickers: [
          { type: "star", position: { x: 50, y: 50 }, size: 10 }
        ],
        difficulty: 2,
        handCount: 1
      },
      {
        nailShape: "square",
        baseColor: "#67e8f9", // darker cyan
        stickers: [
          { type: "heart", position: { x: 50, y: 50 }, size: 10 }
        ],
        difficulty: 2,
        handCount: 1
      },
      {
        nailShape: "square",
        baseColor: "#22d3ee", // teal
        stickers: [
          { type: "flower", position: { x: 50, y: 50 }, size: 10 }
        ],
        difficulty: 2,
        handCount: 1
      },
      {
        nailShape: "square",
        baseColor: "#67e8f9", // darker cyan
        stickers: [
          { type: "heart", position: { x: 50, y: 50 }, size: 10 }
        ],
        difficulty: 2,
        handCount: 1
      },
      {
        nailShape: "square",
        baseColor: "#a5f3fc", // cyan
        stickers: [
          { type: "star", position: { x: 50, y: 50 }, size: 10 }
        ],
        difficulty: 2,
        handCount: 1
      }
    ],
    unlockRequirement: {
      level: 5,
      stars: 5
    }
  },
  
  // Level 7: Mixed stickers and glitter
  {
    id: 7,
    name: "Party Nails",
    description: "Combine stickers and glitter for a festive look.",
    difficulty: 3,
    timeLimit: 60,
    nails: [
      {
        nailShape: "almond",
        baseColor: "#c4b5fd", // lavender
        glitter: true,
        glitterColor: "#8b5cf6", // purple
        glitterDensity: 30,
        difficulty: 3,
        handCount: 1
      },
      {
        nailShape: "almond",
        baseColor: "#8b5cf6", // purple
        stickers: [
          { type: "star", position: { x: 30, y: 30 }, size: 8 },
          { type: "star", position: { x: 70, y: 70 }, size: 8 }
        ],
        difficulty: 3,
        handCount: 1
      },
      {
        nailShape: "almond",
        baseColor: "#c4b5fd", // lavender
        glitter: true,
        glitterColor: "#8b5cf6", // purple
        glitterDensity: 80,
        stickers: [
          { type: "heart", position: { x: 50, y: 50 }, size: 12 }
        ],
        difficulty: 3,
        handCount: 1
      },
      {
        nailShape: "almond",
        baseColor: "#8b5cf6", // purple
        stickers: [
          { type: "star", position: { x: 30, y: 70 }, size: 8 },
          { type: "star", position: { x: 70, y: 30 }, size: 8 }
        ],
        difficulty: 3,
        handCount: 1
      },
      {
        nailShape: "almond",
        baseColor: "#c4b5fd", // lavender
        glitter: true,
        glitterColor: "#8b5cf6", // purple
        glitterDensity: 30,
        difficulty: 3,
        handCount: 1
      }
    ],
    unlockRequirement: {
      level: 6,
      stars: 6
    },
    reward: {
      type: "discount",
      value: "5% off next appointment"
    }
  },
  
  // Level 8: Complex pattern with both hands
  {
    id: 8,
    name: "Pattern Play",
    description: "Create a complex pattern across all fingers.",
    difficulty: 3,
    timeLimit: 60,
    nails: [
      // First hand - alternating colors with accents
      {
        nailShape: "coffin",
        baseColor: "#fda4af", // light pink
        stickers: [
          { type: "flower", position: { x: 50, y: 30 }, size: 10 }
        ],
        difficulty: 3,
        handCount: 2
      },
      {
        nailShape: "coffin",
        baseColor: "#f43f5e", // rose
        glitter: true,
        glitterColor: "#fda4af", // light pink
        glitterDensity: 40,
        difficulty: 3,
        handCount: 2
      },
      {
        nailShape: "coffin",
        baseColor: "#fda4af", // light pink
        stickers: [
          { type: "flower", position: { x: 50, y: 30 }, size: 10 }
        ],
        difficulty: 3,
        handCount: 2
      },
      {
        nailShape: "coffin",
        baseColor: "#f43f5e", // rose
        glitter: true,
        glitterColor: "#fda4af", // light pink
        glitterDensity: 40,
        difficulty: 3,
        handCount: 2
      },
      {
        nailShape: "coffin",
        baseColor: "#fda4af", // light pink
        stickers: [
          { type: "flower", position: { x: 50, y: 30 }, size: 10 }
        ],
        difficulty: 3,
        handCount: 2
      },
      // Second hand - mirror pattern
      {
        nailShape: "coffin",
        baseColor: "#fda4af", // light pink
        stickers: [
          { type: "flower", position: { x: 50, y: 30 }, size: 10 }
        ],
        difficulty: 3,
        handCount: 2
      },
      {
        nailShape: "coffin",
        baseColor: "#f43f5e", // rose
        glitter: true,
        glitterColor: "#fda4af", // light pink
        glitterDensity: 40,
        difficulty: 3,
        handCount: 2
      },
      {
        nailShape: "coffin",
        baseColor: "#fda4af", // light pink
        stickers: [
          { type: "flower", position: { x: 50, y: 30 }, size: 10 }
        ],
        difficulty: 3,
        handCount: 2
      },
      {
        nailShape: "coffin",
        baseColor: "#f43f5e", // rose
        glitter: true,
        glitterColor: "#fda4af", // light pink
        glitterDensity: 40,
        difficulty: 3,
        handCount: 2
      },
      {
        nailShape: "coffin",
        baseColor: "#fda4af", // light pink
        stickers: [
          { type: "flower", position: { x: 50, y: 30 }, size: 10 }
        ],
        difficulty: 3,
        handCount: 2
      }
    ],
    unlockRequirement: {
      level: 7,
      stars: 7
    }
  },
  
  // Level 9: Advanced sticker placement
  {
    id: 9,
    name: "Sticker Symphony",
    description: "Master precise sticker placement for a beautiful composition.",
    difficulty: 3,
    timeLimit: 50, // Less time for added challenge
    nails: [
      {
        nailShape: "stiletto",
        baseColor: "#a5b4fc", // lavender
        stickers: [
          { type: "star", position: { x: 20, y: 20 }, size: 6 },
          { type: "star", position: { x: 50, y: 40 }, size: 8 },
          { type: "star", position: { x: 80, y: 20 }, size: 6 }
        ],
        difficulty: 3,
        handCount: 1
      },
      {
        nailShape: "stiletto",
        baseColor: "#818cf8", // indigo
        stickers: [
          { type: "heart", position: { x: 30, y: 30 }, size: 8 },
          { type: "heart", position: { x: 70, y: 30 }, size: 8 }
        ],
        difficulty: 3,
        handCount: 1
      },
      {
        nailShape: "stiletto",
        baseColor: "#6366f1", // darker indigo
        stickers: [
          { type: "flower", position: { x: 50, y: 30 }, size: 10 },
          { type: "star", position: { x: 30, y: 60 }, size: 6 },
          { type: "star", position: { x: 70, y: 60 }, size: 6 }
        ],
        difficulty: 3,
        handCount: 1
      },
      {
        nailShape: "stiletto",
        baseColor: "#818cf8", // indigo
        stickers: [
          { type: "heart", position: { x: 30, y: 30 }, size: 8 },
          { type: "heart", position: { x: 70, y: 30 }, size: 8 }
        ],
        difficulty: 3,
        handCount: 1
      },
      {
        nailShape: "stiletto",
        baseColor: "#a5b4fc", // lavender
        stickers: [
          { type: "star", position: { x: 20, y: 20 }, size: 6 },
          { type: "star", position: { x: 50, y: 40 }, size: 8 },
          { type: "star", position: { x: 80, y: 20 }, size: 6 }
        ],
        difficulty: 3,
        handCount: 1
      }
    ],
    unlockRequirement: {
      level: 8,
      stars: 8
    },
    reward: {
      type: "discount",
      value: "10% off next appointment"
    }
  },
  
  // Level 10: Master Challenge
  {
    id: 10,
    name: "Nail Master",
    description: "The ultimate nail challenge - complex patterns on both hands!",
    difficulty: 3,
    timeLimit: 45, // Even less time for final challenge
    nails: [
      // First hand - complex gradient pattern
      {
        nailShape: "coffin",
        baseColor: "#f0abfc", // fuchsia
        glitter: true,
        glitterColor: "#c026d3", // purple
        glitterDensity: 60,
        stickers: [
          { type: "star", position: { x: 20, y: 20 }, size: 5 }
        ],
        difficulty: 3,
        handCount: 2
      },
      {
        nailShape: "coffin",
        baseColor: "#e879f9", // pink
        glitter: true,
        glitterColor: "#c026d3", // purple
        glitterDensity: 50,
        stickers: [
          { type: "heart", position: { x: 50, y: 30 }, size: 6 }
        ],
        difficulty: 3,
        handCount: 2
      },
      {
        nailShape: "coffin",
        baseColor: "#d946ef", // magenta
        glitter: true,
        glitterColor: "#c026d3", // purple
        glitterDensity: 70,
        stickers: [
          { type: "flower", position: { x: 50, y: 30 }, size: 8 }
        ],
        difficulty: 3,
        handCount: 2
      },
      {
        nailShape: "coffin",
        baseColor: "#c026d3", // purple
        glitter: true,
        glitterColor: "#a21caf", // dark purple
        glitterDensity: 50,
        stickers: [
          { type: "heart", position: { x: 50, y: 30 }, size: 6 }
        ],
        difficulty: 3,
        handCount: 2
      },
      {
        nailShape: "coffin",
        baseColor: "#a21caf", // dark purple
        glitter: true,
        glitterColor: "#86198f", // deep purple
        glitterDensity: 40,
        stickers: [
          { type: "star", position: { x: 20, y: 20 }, size: 5 }
        ],
        difficulty: 3,
        handCount: 2
      },
      // Second hand - mirror pattern but with different base colors
      {
        nailShape: "coffin",
        baseColor: "#a21caf", // dark purple
        glitter: true,
        glitterColor: "#86198f", // deep purple
        glitterDensity: 40,
        stickers: [
          { type: "star", position: { x: 20, y: 20 }, size: 5 }
        ],
        difficulty: 3,
        handCount: 2
      },
      {
        nailShape: "coffin",
        baseColor: "#c026d3", // purple
        glitter: true,
        glitterColor: "#a21caf", // dark purple
        glitterDensity: 50,
        stickers: [
          { type: "heart", position: { x: 50, y: 30 }, size: 6 }
        ],
        difficulty: 3,
        handCount: 2
      },
      {
        nailShape: "coffin",
        baseColor: "#d946ef", // magenta
        glitter: true,
        glitterColor: "#c026d3", // purple
        glitterDensity: 70,
        stickers: [
          { type: "flower", position: { x: 50, y: 30 }, size: 8 }
        ],
        difficulty: 3,
        handCount: 2
      },
      {
        nailShape: "coffin",
        baseColor: "#e879f9", // pink
        glitter: true,
        glitterColor: "#c026d3", // purple
        glitterDensity: 50,
        stickers: [
          { type: "heart", position: { x: 50, y: 30 }, size: 6 }
        ],
        difficulty: 3,
        handCount: 2
      },
      {
        nailShape: "coffin",
        baseColor: "#f0abfc", // fuchsia
        glitter: true,
        glitterColor: "#c026d3", // purple
        glitterDensity: 60,
        stickers: [
          { type: "star", position: { x: 20, y: 20 }, size: 5 }
        ],
        difficulty: 3,
        handCount: 2
      }
    ],
    unlockRequirement: {
      level: 9,
      stars: 9
    },
    reward: {
      type: "item",
      value: "Free Nail Care Kit"
    }
  }
];
