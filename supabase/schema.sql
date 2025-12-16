-- VoltHub Database Schema
-- Run this in your Supabase SQL Editor after creating your project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY, -- Using TEXT to match existing product IDs like "ev-charging-53"
  name TEXT NOT NULL,
  subtitle TEXT,
  category TEXT NOT NULL CHECK (category IN ('ev-charging', 'solar-street', 'smart-home', 'cabinet')),
  tag TEXT,
  image TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
  price TEXT,
  description TEXT,
  variations JSONB DEFAULT '[]'::jsonb, -- Array of ProductVariation objects
  specifications JSONB DEFAULT '[]'::jsonb, -- Array of {label, value} objects
  features JSONB DEFAULT '[]'::jsonb, -- Array of feature strings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster category filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(subtitle, '')));

-- Contact Submissions Table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Keep UUID for new submissions
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  region TEXT,
  province TEXT,
  city TEXT,
  interest TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE
);

-- Create index for contact submissions
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);

-- Category Banners Table (optional - for dynamic category management)
CREATE TABLE IF NOT EXISTS category_banners (
  category TEXT PRIMARY KEY CHECK (category IN ('ev-charging', 'solar-street', 'smart-home', 'cabinet')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  video TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_banners_updated_at BEFORE UPDATE ON category_banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_banners ENABLE ROW LEVEL SECURITY;

-- Policies: Allow public read access to products and category banners
CREATE POLICY "Public can read products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Public can read category banners" ON category_banners
  FOR SELECT USING (true);

-- Policy: Allow public to insert contact submissions
CREATE POLICY "Public can insert contact submissions" ON contact_submissions
  FOR INSERT WITH CHECK (true);

-- Policy: Only authenticated users can read contact submissions (optional)
-- Uncomment if you want to restrict access to contact submissions
-- CREATE POLICY "Authenticated users can read contact submissions" ON contact_submissions
--   FOR SELECT USING (auth.role() = 'authenticated');


