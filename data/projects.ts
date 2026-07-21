import { Project } from "../types";

/**
 * Seed showcase of completed/past work. Used only as the offline/local
 * fallback dataset — the live list is managed from the admin panel
 * (Admin → Projects) and served from the database via `db.getProjects()`.
 */
export const PROJECTS: Project[] = [
  {
    id: "p1",
    title: "Industrial Warehouse Cladding",
    category: "Aluminium Sheets",
    location: "Vadodara, Gujarat",
    year: "2025",
    images: [
      "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=1200",
    ],
    description:
      "Supplied and installed 12,000 sq. ft. of corrosion-resistant aluminium cladding for a logistics warehouse.",
    isFeatured: true,
    isActive: true,
  },
  {
    id: "p2",
    title: "Commercial Facade Profiles",
    category: "Extruded Profiles",
    location: "Ahmedabad, Gujarat",
    year: "2025",
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200",
    ],
    description:
      "Custom-extruded aluminium profiles for a modern glass-and-metal office facade spanning eight floors.",
    isFeatured: true,
    isActive: true,
  },
  {
    id: "p3",
    title: "Precision Pipe Assembly",
    category: "Aluminium Pipes",
    location: "Surat, Gujarat",
    year: "2024",
    images: [
      "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=1200",
    ],
    description:
      "Delivered high-tolerance aluminium piping for a chemical processing plant's cooling infrastructure.",
    isFeatured: true,
    isActive: true,
  },
  {
    id: "p4",
    title: "Modular Interior Framework",
    category: "Aluminium Rods",
    location: "Rajkot, Gujarat",
    year: "2024",
    images: [
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=1200",
    ],
    description:
      "Lightweight rod framework for a large-scale retail interior fit-out with a two-week turnaround.",
    isFeatured: false,
    isActive: true,
  },
  {
    id: "p5",
    title: "Coil Supply for Roofing",
    category: "Aluminium Coils",
    location: "Bharuch, Gujarat",
    year: "2023",
    images: [
      "https://images.unsplash.com/photo-1516216628859-9bccecab13ca?auto=format&fit=crop&q=80&w=1200",
    ],
    description:
      "Bulk coil supply for a factory roofing project, meeting tight thermal and weight specifications.",
    isFeatured: false,
    isActive: true,
  },
  {
    id: "p6",
    title: "Structural Beam Fabrication",
    category: "Extruded Profiles",
    location: "Anand, Gujarat",
    year: "2023",
    images: [
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=1200",
    ],
    description:
      "Engineered aluminium structural beams for a lightweight mezzanine expansion.",
    isFeatured: false,
    isActive: true,
  },
];
