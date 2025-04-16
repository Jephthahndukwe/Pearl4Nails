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
        price: "₦2,000"
      },
      {
        id: "gel-stick-nails",
        name: "GEL STICK ON NAILS",
        description: "Double tipped stick on plain single colored set in your preferred length (Short, medium or long) Matte or glossy finish",
        duration: "1 h",
        price: "₦4,000-₦6,000"
      },
      {
        id: "plain-acrylic-overlay",
        name: "PLAIN ACRYLIC OVERLAY",
        description: "A dry manicure with plain acrylic overlay on your natural nails in any color of your choosing. Glossy or matte gel topcoat included. Short length",
        duration: "1 h",
        price: "₦6,000"
      },
      {
        id: "short-fullset-acrylic",
        name: "SHORT FULLSET PLAIN ACRYLIC",
        description: "A dry manicure with plain acrylic extensions in any color & shape of your choice. Short length",
        duration: "1 h 30 min",
        price: "₦8,000"
      },
      {
        id: "medium-fullset-acrylic",
        name: "MEDIUM FULLSET PLAIN ACRYLIC",
        description: "A dry manicure with plain acrylic extensions in any color & shape of your choice. Medium length",
        duration: "1 h 45 min",
        price: "₦10,000"
      },
      {
        id: "long-fullset-acrylic",
        name: "LONG FULLSET PLAIN ACRYLIC",
        description: "A dry manicure with plain acrylic extensions in any color & shape of your choice. Long length",
        duration: "2 h",
        price: "₦12,000"
      },
      {
        id: "xl-fullset-acrylic",
        name: "XL FULLSET PLAIN ACRYLIC",
        description: "A dry manicure with plain acrylic extensions in any color & shape of your choice. Extra Long length",
        duration: "2 h 30 min",
        price: "₦14,000"
      },
      {
        id: "acrylic-refill",
        name: "ACRYLIC SET REFILL & DESIGN CHANGE",
        description: "For existing acrylic sets to change the color without taking the whole set off",
        duration: "1 h 30 min",
        price: "₦6,000"
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
        description: "Builder gel application for stronger natural nails",
        duration: "1 h",
        price: "₦4,500"
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
        price: "₦4,000"
      },
      // Add more lash extension types here
    ]
  },
  {
    id: "microblading",
    name: "Microblading",
    types: [
      {
        id: "basic-microblading",
        name: "Basic Microblading",
        description: "Semi-permanent technique for natural looking eyebrows",
        duration: "2 h",
        price: "₦12,000"
      }
      // Add more microblading types here
    ]
  },
  {
    id: "makeup",
    name: "Makeup",
    types: [
      {
        id: "basic-makeup",
        name: "Basic Makeup",
        description: "Natural makeup for everyday occasions",
        duration: "1 h",
        price: "₦6,000"
      },
      {
        id: "glamour-makeup",
        name: "Glamour Makeup",
        description: "Full glamour makeup for special occasions",
        duration: "1 h 30 min",
        price: "₦10,000"
      }
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
        id: "pedicure",
        name: "PEDICURE",
        description: "Relaxing foot soak, exfoliation, gentle massage, and toe nail care. With colored gel polish +₦3K",
        duration: "1 h",
        price: "₦7,000"
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
        id: "ear-piercing",
        name: "Ear Piercing",
        description: "Professional ear piercing service",
        duration: "30 min",
        price: "₦3,000"
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
        name: "Basic Tooth Gem",
        description: "Single crystal tooth gem application",
        duration: "30 min",
        price: "₦2,500"
      }
      // Add more tooth gem types here
    ]
  },
  {
    id: "brow",
    name: "Brow Trimming",
    types: [
      {
        id: "brow-shaping",
        name: "Brow Shaping",
        description: "Professional brow shaping and trimming",
        duration: "20 min",
        price: "₦2,000"
      }
      // Add more brow service types here
    ]
  },
  {
    id: "hair",
    name: "Hair Revamping",
    types: [
      {
        id: "hair-styling",
        name: "Hair Styling",
        description: "Hair styling and treatment",
        duration: "1 h",
        price: "₦7,000"
      }
      // Add more hair service types here
    ]
  },
  {
    id: "tattoo",
    name: "Tattoo",
    types: [
      {
        id: "small-tattoo",
        name: "Small Tattoo",
        description: "Small sized tattoo design",
        duration: "1 h",
        price: "₦15,000"
      },
      {
        id: "medium-tattoo",
        name: "Medium Tattoo",
        description: "Medium sized tattoo design",
        duration: "2 h",
        price: "₦25,000"
      }
      // Add more tattoo types here
    ]
  }
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
