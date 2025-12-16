// Type definitions only - no hardcoded data
// All data comes from Supabase via API

export type ProductCategory =
  | "all"
  | "ev-charging"
  | "solar-street"
  | "smart-home"
  | "cabinet"
  // | "container"
  ;

export type ProductVariation = {
  name: string;
  value: string;
  description?: string;
  price?: string; // Optional price for this variation
  image?: string; // Optional image for this variation
  specifications?: { label: string; value: string }[]; // Optional specifications for this variation
};

export type Product = {
  id: string;
  name: string;
  subtitle: string;
  category: ProductCategory;
  tag?: string;
  image: string;
  images?: string[]; // Additional images for gallery
  price?: string; // Product price
  description?: string;
  variations?: ProductVariation[];
  specifications?: { label: string; value: string }[];
  features?: string[];
};

