import { Product, Category } from "./types";

// Aluminum Product Categories
export const CATEGORIES: Category[] = [
  {
    id: "sheets",
    name: "Aluminium Sheets",
    icon: "Layers",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800",
    description:
      "High-quality aluminium sheets in various grades and thicknesses for industrial and commercial applications.",
    isActive: true,
  },
  {
    id: "profiles",
    name: "Aluminium Profiles",
    icon: "Box",
    image:
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800",
    description:
      "Precision-extruded aluminium profiles for construction, furniture, and architectural applications.",
    isActive: true,
  },
  {
    id: "pipes",
    name: "Aluminium Pipes & Tubes",
    icon: "Cylinder",
    image:
      "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&q=80&w=800",
    description:
      "Seamless and welded aluminium pipes and tubes in round, square, and rectangular shapes.",
    isActive: true,
  },
  {
    id: "rods",
    name: "Aluminium Rods & Bars",
    icon: "Minus",
    image:
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&q=80&w=800",
    description:
      "Solid aluminium rods and bars for machining, fabrication, and manufacturing needs.",
    isActive: true,
  },
  {
    id: "coils",
    name: "Aluminium Coils",
    icon: "Circle",
    image:
      "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&q=80&w=800",
    description:
      "Premium aluminium coils in various alloys for roofing, packaging, and industrial use.",
    isActive: true,
  },
];

// Aluminum Products
export const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Aluminium Sheet 6061-T6",
    categoryId: "sheets",
    shortDescription:
      "High-strength aluminium alloy sheet ideal for structural applications.",
    description:
      "The 6061-T6 aluminium sheet offers excellent mechanical properties, good weldability, and superior corrosion resistance. Perfect for aerospace, marine, and automotive applications.",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800",
    ],
    isFeatured: true,
    isActive: true,
    specs: {
      "Alloy Grade": "6061-T6",
      Thickness: "1mm - 100mm",
      Width: "Up to 2000mm",
      Surface: "Mill Finish",
    },
  },
  {
    id: "p2",
    name: "Architectural Aluminium Profile",
    categoryId: "profiles",
    shortDescription:
      "Premium extruded profiles for windows, doors, and curtain walls.",
    description:
      "High-quality architectural aluminium profiles designed for modern construction. Available in anodized and powder-coated finishes with thermal break options.",
    images: [
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800",
    ],
    isFeatured: true,
    isActive: true,
    specs: {
      Alloy: "6063-T5",
      Finish: "Anodized/Powder Coated",
      Length: "Custom Cutting",
      Application: "Windows & Doors",
    },
  },
  {
    id: "p3",
    name: "Seamless Aluminium Pipe",
    categoryId: "pipes",
    shortDescription:
      "Precision seamless pipes for high-pressure and structural applications.",
    description:
      "Seamless aluminium pipes manufactured to strict tolerances. Ideal for hydraulic systems, structural frameworks, and industrial machinery.",
    images: [
      "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&q=80&w=800",
    ],
    isFeatured: true,
    isActive: true,
    specs: {
      Type: "Seamless",
      "Outer Diameter": "10mm - 300mm",
      "Wall Thickness": "1mm - 20mm",
      Alloy: "6061/6063",
    },
  },
  {
    id: "p4",
    name: "Aluminium Round Bar",
    categoryId: "rods",
    shortDescription:
      "Solid aluminium bars for precision machining and fabrication.",
    description:
      "High-quality aluminium round bars with excellent machinability. Available in various alloy grades suitable for CNC machining and manufacturing.",
    images: [
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&q=80&w=800",
    ],
    isFeatured: false,
    isActive: true,
    specs: {
      Diameter: "5mm - 250mm",
      Length: "Up to 6000mm",
      Alloy: "2024/6061/7075",
      Tolerance: "H9/H11",
    },
  },
  {
    id: "p5",
    name: "Aluminium Coil 1100",
    categoryId: "coils",
    shortDescription:
      "Commercial grade aluminium coil for general purpose applications.",
    description:
      "Versatile aluminium coil with excellent formability and corrosion resistance. Widely used in roofing, cladding, packaging, and heat exchangers.",
    images: [
      "https://images.unsplash.com/photo-1567789884554-0b844b597180?auto=format&fit=crop&q=80&w=800",
    ],
    isFeatured: false,
    isActive: true,
    specs: {
      Alloy: "1100/3003/5052",
      Thickness: "0.2mm - 3mm",
      Width: "Up to 1500mm",
      Temper: "H14/H24/O",
    },
  },
];
