export interface Product {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  shortDescription: string;
  images: string[]; // Support for multiple images
  specs: Record<string, string>;
  isFeatured: boolean;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  isActive: boolean;
  icon: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  location: string;
  year: string;
  images: string[];
  description: string;
  isFeatured: boolean;
  isActive: boolean;
}

export type InquiryStatus = "NEW" | "CONTACTED" | "CLOSED";

export interface Inquiry {
  id: string;
  productId?: string;
  productName?: string;
  customerName: string;
  phone: string;
  state: string;
  city: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
}

export interface InquiryFormData {
  name: string;
  phone: string;
  state: string;
  city: string;
  message: string;
  productId?: string;
  productName?: string;
}

export interface ImageAsset {
  id: string;
  url: string;
  publicId: string;
  name: string;
  categoryId?: string;
  uploadedAt: string;
}
