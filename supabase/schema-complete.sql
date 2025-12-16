-- Complete Schema Setup - Run this after creating the products table
-- This adds indexes, triggers, and RLS policies

-- Create indexes for products (if not already created)
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(subtitle, '')));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at for products
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists, then create new one
DROP POLICY IF EXISTS "Public can read products" ON products;
CREATE POLICY "Public can read products" ON products
  FOR SELECT USING (true);

-- Ensure contact_submissions table exists (if not already created)
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Create indexes for contact submissions
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);

-- Enable RLS on contact_submissions
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy for contact submissions
DROP POLICY IF EXISTS "Public can insert contact submissions" ON contact_submissions;
CREATE POLICY "Public can insert contact submissions" ON contact_submissions
  FOR INSERT WITH CHECK (true);

-- Ensure category_banners table exists (if not already created)
CREATE TABLE IF NOT EXISTS category_banners (
  category TEXT PRIMARY KEY CHECK (category IN ('ev-charging', 'solar-street', 'smart-home', 'cabinet')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  video TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for category_banners
DROP TRIGGER IF EXISTS update_category_banners_updated_at ON category_banners;
CREATE TRIGGER update_category_banners_updated_at BEFORE UPDATE ON category_banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on category_banners
ALTER TABLE category_banners ENABLE ROW LEVEL SECURITY;

-- Policy for category_banners
DROP POLICY IF EXISTS "Public can read category banners" ON category_banners;
CREATE POLICY "Public can read category banners" ON category_banners
  FOR SELECT USING (true);

