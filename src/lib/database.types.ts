/**
 * Database Types for Supabase
 * 
 * These types match your database schema.
 * You can also generate these automatically using Supabase CLI:
 * npx supabase gen types typescript --project-id your-project-id > src/lib/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ProductCategory = 'ev-charging' | 'solar-street' | 'smart-home' | 'cabinet';

export interface ProductVariation {
  name: string;
  value: string;
  description?: string;
  price?: string;
  image?: string;
  specifications?: { label: string; value: string }[];
}

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          subtitle: string | null;
          category: ProductCategory;
          tag: string | null;
          image: string;
          images: Json;
          price: string | null;
          description: string | null;
          variations: Json;
          specifications: Json;
          features: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          subtitle?: string | null;
          category: ProductCategory;
          tag?: string | null;
          image: string;
          images?: Json;
          price?: string | null;
          description?: string | null;
          variations?: Json;
          specifications?: Json;
          features?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          subtitle?: string | null;
          category?: ProductCategory;
          tag?: string | null;
          image?: string;
          images?: Json;
          price?: string | null;
          description?: string | null;
          variations?: Json;
          specifications?: Json;
          features?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      contact_submissions: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          region: string | null;
          province: string | null;
          city: string | null;
          interest: string;
          details: string | null;
          created_at: string;
          email_sent: boolean;
          email_sent_at: string | null;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          region?: string | null;
          province?: string | null;
          city?: string | null;
          interest: string;
          details?: string | null;
          created_at?: string;
          email_sent?: boolean;
          email_sent_at?: string | null;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          region?: string | null;
          province?: string | null;
          city?: string | null;
          interest?: string;
          details?: string | null;
          created_at?: string;
          email_sent?: boolean;
          email_sent_at?: string | null;
        };
      };
      category_banners: {
        Row: {
          category: ProductCategory;
          title: string;
          description: string;
          image: string;
          video: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          category: ProductCategory;
          title: string;
          description: string;
          image: string;
          video?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category?: ProductCategory;
          title?: string;
          description?: string;
          image?: string;
          video?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}


