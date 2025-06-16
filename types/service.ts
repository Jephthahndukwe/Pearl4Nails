export interface ServiceType {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: string;
  popular?: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  types: ServiceType[];
}

// Main service categories with detailed sub-types
export const serviceCategories: ServiceCategory[] = [
  {
    id: "nails",
    name: "Nails",
    types: [
      {
        id: "gel-polish-toes",
        name: "GEL POLISH ON TOES",
        description: "A dry pedicure with gel polish on your toes in any color with a matte or glossy topcoat",
        duration: "20 min",
        price: "₦1500-₦2500",
        popular: true
      },
      {
        id: "soak-off",
        name: "SOAK OFF/ PRODUCT TAKE OFF",
        description: "Healthy soak off for nail extensions and enhancement or product take off for a design change",
        duration: "45 min",
        price: "₦1,000-₦2,500"
      },
      {
        id: "gel-stick-nails",
        name: "GEL STICK ON NAILS",
        description: "Double tipped stick on plain single colored set in your preferred length (Short, medium or long) Matte or glossy finish. (Additional length and designs will attract extra charges",
        duration: "1 h",
        price: "₦4,000-₦8,000"
      },
      {
        id: "plain-acrylic-overlay",
        name: "PLAIN ACRYLIC OVERLAY",
        description: "A dry manicure with plain acrylic overlay on your natural nails in any color of your choosing. Glossy or matte gel topcoat included. Short length. (Additional length and designs will attract extra charges)",
        duration: "1 h",
        price: "₦7,000"
      },
      {
        id: "short-fullset-acrylic",
        name: "SHORT FULLSET PLAIN ACRYLIC",
        description: "A dry manicure with plain acrylic extensions in any color & shape of your choice. Short length. (Additional length and designs will attract extra charges)",
        duration: "1 h 30 min",
        price: "₦10,000"
      },
      {
        id: "medium-fullset-acrylic",
        name: "MEDIUM FULLSET PLAIN ACRYLIC",
        description: "A dry manicure with plain acrylic extensions in any color & shape of your choice. Medium length. (Additional length and designs will attract extra charges)",
        duration: "1 h 45 min",
        price: "₦12,000"
      },
      {
        id: "long-fullset-acrylic",
        name: "LONG FULLSET PLAIN ACRYLIC",
        description: "A dry manicure with plain acrylic extensions in any color & shape of your choice. Long length. (Additional length and designs will attract extra charges)",
        duration: "2 h",
        price: "₦15,000"
      },
      {
        id: "xl-fullset-acrylic",
        name: "XL FULLSET PLAIN ACRYLIC",
        description: "A dry manicure with plain acrylic extensions in any color & shape of your choice. Extra Long length. (Additional length and designs will attract extra charges)",
        duration: "2 h 30 min",
        price: "₦16,000"
      },
      {
        id: "acrylic-refill",
        name: "ACRYLIC SET REFILL & DESIGN CHANGE",
        description: "For existing acrylic sets to change the color without taking the whole set off. (60% of the initial price of the nails set)",
        duration: "1 h 30 min",
        price: "60% of the initial nails set price"
      },
      {
        id: "acrylic-toes",
        name: "ACRYLIC TOES (Plain)",
        description: "A dry pedicure with sculptured acrylic in your preferred color (No nail tips). Matte or glossy topcoat",
        duration: "1 h",
        price: "₦6,000"
      },
      {
        id: "acrylic-big-toe",
        name: "ACRYLIC BIG TOE + GEL POLISH",
        description: "Acrylic overlay on just the big toe and gel polish on the other toes.",
        duration: "1 h",
        price: "₦7,000"
      },
      {
        id: "acrylic-french-toes",
        name: "ACRYLIC FRENCH TOES",
        description: "A dry pedicure with acrylic overlay on your natural nails in any color of your choice with hand drawn French tips",
        duration: "1 h 20 min",
        price: "₦7,000"
      },
      {
        id: "biab",
        name: "BIAB (Builder in a Bottle)",
        description: "Builder gel application for stronger natural nails (Additional length and designs will attract extra charges)",
        duration: "1 h",
        price: "₦4,500"
      },
      {
        id: "biab-extension",
        name: "BIAB (Builder in a Bottle) Nail Extensions",
        description: "Builder gel applied over false nail tips to create strong, lightweight extensions. Great for adding length while keeping a natural look and feel. (Additional length and designs will attract extra charges)",
        duration: "2 h",
        price: "₦6,000-₦12,000"
      }
    ]
  },
  {
    id: "lashes",
    name: "Lash Extensions",
    types: [
      {
        id: "cat-eye-cluster",
        name: "CAT-EYE CLUSTER LASHES",
        description: "Cat eye style lash extensions using cluster technique",
        duration: "30 min",
        price: "₦5,000"
      },
      {
        id: "classic-set-lash",
        name: "CLASSIC SET",
        description: "A natural-looking lash extension where one extension is applied to each natural lash. Perfect for everyday elegance.",
        duration: "2 h",
        price: "₦10,000"
      },
      {
        id: "hybrid-set-lash",
        name: "HYBRID SET",
        description: "A mix of classic and volume lashes for a textured, fuller look. Ideal for those who want a bit more drama without going full volume.",
        duration: "2 h",
        price: "₦15,000"
      },
      {
        id: "volume-set-lash",
        name: "VOLUME SET",
        description: "Multiple lightweight lashes are fanned and applied to each natural lash for a bold, fluffy look.",
        duration: "2 h 30 min",
        price: "₦18,000"
      },
      {
        id: "mega-volume-set-lash",
        name: "MEGA VOLUME SET",
        description: "Ultra-dramatic and full lashes created using ultra-fine extensions for maximum density and intensity.",
        duration: "3 h",
        price: "₦22,000"
      },
      {
        id: "wispy-set-add-on",
        name: "WISPY SET (Add-on)",
        description: "Add wispy spikes to any lash set for a trendy, textured look. (Only available as an add-on)",
        duration: "10 min",
        price: "₦4,000"
      },
      {
        id: "under-eye-lash",
        name: "UNDER EYE LASH",
        description: "Soft and subtle lower lash extensions to complete your lash look. Enhances the eyes beautifully.",
        duration: "15 min",
        price: "₦4,000"
      },
      {
        id: "lash-removal",
        name: "LASH REMOVAL",
        description: "Professional and gentle removal of lash extensions to protect your natural lashes.",
        duration: "10 min",
        price: "₦3,000"
      },
      {
        id: "lash-refill",
        name: "LASH REFILL (60%)",
        description: "For clients with 60% of their lash extensions remaining. Fills in gaps and maintains your lash look.",
        duration: "1 h 30 min",
        price: "60% of the original lash set price"
      }
      
      // Add more lash extension types here
    ]
  },
  {
    id: "microblading",
    name: "Microblading",
    types: [
      {
        id: "microblading-basic",
        name: "MICROBLADING",
        description: "Semi-permanent eyebrow enhancement with precise hair-like strokes",
        duration: "2 h",
        price: "₦25,000"
      },
      {
        id: "microshading-brows",
        name: "MICROSHADING BROWS",
        description: "Semi-permanent shading technique for fuller, more natural-looking eyebrows",
        duration: "2 h 30 mins",
        price: "₦30,000"
      },
      {
        id: "ombre-brows",
        name: "OMBRÉ-BROWS",
        description: "Gradient effect eyebrow enhancement with smooth color transition",
        duration: "3 h",
        price: "₦30,000"
      },
      {
        id: "combination-brows",
        name: "COMBINATION BROWS",
        description: "Combination of microblading and microshading techniques for the perfect brow shape",
        duration: "3 h",
        price: "₦35,000"
      }
    ]
  },
  {
    id: "makeup",
    name: "Makeup",
    types: [
      {
        id: "basic-makeup",
        name: "BASIC MAKEUP",
        description: "Natural makeup for everyday occasions",
        duration: "45 min",
        price: "₦10,000"
      },
      {
        id: "glamour-makeup",
        name: "GLAMOUR MAKEUP",
        description: "Full glamour makeup for special occasions",
        duration: "1 h",
        price: "₦15,000"
      },
      {
        id: "bridal-make-up",
        name: "BRIDAL MAKE UP",
        description: "Full bridal makeup for a traditional bridal makeup look, opt for rich, warm tones like gold, bronze, or deep browns.",
        duration: "1 h 30 min",
        price: "₦30,000"
      },
      // Add more makeup types here
    ]
  },
  {
    id: "manicure",
    name: "Manicure & Pedicure",
    types: [
      {
        id: "manicure",
        name: "MANICURE",
        description: "Detailed dry manicure with exfoliating scrub (No polish painting included)",
        duration: "1 h",
        price: "₦3,000"
      },
      {
        id: "pedicure-women",
        name: "PEDICURE FOR WOMEN",
        description: "Relaxing foot soak, exfoliation, gentle massage, and toe nail care. With colored gel polish +₦2K",
        duration: "1 h",
        price: "₦7,000"
      },
      {
        id: "pedicure-men",
        name: "PEDICURE FOR MEN",
        description: "Relaxing foot soak, exfoliation, gentle massage, and toe nail care",
        duration: "1 h",
        price: "₦10,000"
      },
      {
        id: "gel-manicure",
        name: "GEL MANICURE",
        description: "Detailed dry manicure with exfoliating scrub and plain gel polish on your natural nails",
        duration: "45 min",
        price: "₦5,000"
      }
      // Add more manicure/pedicure types here
    ]
  },
  {
    id: "piercing",
    name: "Piercing",
    types: [
  {
    id: "earlobe-piercing",
    name: "EARLOBE PIERCING",
    description: "Professional earlobe piercing service",
    duration: "30 min",
    price: "₦5,000"
  },
  {
    id: "nose-piercing",
    name: "NOSE PIERCING",
    description: "Professional nose piercing service",
    duration: "30 min",
    price: "₦7,000"
  },
  {
    id: "helix-piercing",
    name: "HELIX PIERCING",
    description: "Professional helix piercing service",
    duration: "40 min",
    price: "₦10,000"
  },
  {
    id: "tragus-piercing",
    name: "TRAGUS PIERCING",
    description: "Professional tragus piercing service",
    duration: "40 min",
    price: "₦10,000"
  }
      // Add more piercing types here
    ]
  },
  {
    id: "tooth-gems",
    name: "Tooth Gems",
    types: [
      {
        id: "basic-tooth-gem",
        name: "BASIC TOOTH GEM",
        description: "A single high-quality tooth gem placed for a subtle, stylish sparkle. Available in various shapes and colors.",
        duration: "30 min",
        price: "₦3,000"
      },
      {
        id: "butterfly-tooth-gem",
        name: "BUTTERFLY TOOTH GEM",
        description: "A unique butterfly-shaped gem design applied to the tooth for a bold and elegant look. Available in different gem colors.",
        duration: "30 min",
        price: "₦5,000"
      },
      {
        id: "grillz-tooth-gem",
        name: "GRILLZ TOOTH GEM",
        description: "A statement grillz-inspired gem design across multiple teeth. Bold, luxurious, and fully customized.",
        duration: "40 min",
        price: "₦10,000"
      }      
      // Add more tooth gem types here
    ]
  },
  {
    id: "brow",
    name: "Brow Trimming",
    types: [
       {
        id: "brow-trimming",
        name: "BROW TRIMMING",
        description: "Professional brow trimming",
        duration: "20 min",
        price: "₦1,000"
      }, 
      {
        id: "brow-shaping",
        name: "BROW SHAPING",
        description: "Professional brow shaping",
        duration: "30 min",
        price: "₦2,000"
      }
      // Add more brow service types here
    ]
  },
  // {
  //   id: "hair",
  //   name: "Hair Revamping",
  //   types: [
  //     {
  //       id: "hair-styling",
  //       name: "HAIR STYLING",
  //       description: "Hair styling and treatment",
  //       duration: "1 h",
  //       price: "₦7,000"
  //     }
  //     // Add more hair service types here
  //   ]
  // },
  // {
  //   id: "tattoo",
  //   name: "Tattoo",
  //   types: [
  //     {
  //       id: "small-tattoo",
  //       name: "Small Tattoo",
  //       description: "Small sized tattoo design",
  //       duration: "1 h",
  //       price: "₦15,000"
  //     },
  //     {
  //       id: "medium-tattoo",
  //       name: "Medium Tattoo",
  //       description: "Medium sized tattoo design",
  //       duration: "2 h",
  //       price: "₦25,000"
  //     }
  //     // Add more tattoo types here
  //   ]
  // }
];

// Helper function to find a service by ID
export function findServiceById(serviceId: string): ServiceCategory | undefined {
  return serviceCategories.find(category => category.id === serviceId);
}

// Helper function to find a service type by ID
export function findServiceTypeById(serviceId: string, typeId: string): ServiceType | undefined {
  const category = findServiceById(serviceId);
  if (!category) return undefined;
  return category.types.find(type => type.id === typeId);
}
