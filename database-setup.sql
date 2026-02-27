-- ============================================
-- SPANDANA PHOTO HOUSE — Database Setup
-- ============================================
-- Run this in Supabase SQL Editor: Dashboard > SQL Editor > New Query

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
    client_name TEXT,
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to INSERT new ratings (for public rating form)
CREATE POLICY "Allow public insert" ON ratings
    FOR INSERT WITH CHECK (true);

-- Allow anyone to SELECT ratings (for displaying on website)
CREATE POLICY "Allow public read" ON ratings
    FOR SELECT USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON ratings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ratings_stars ON ratings(stars);

-- Optional: Create contact_submissions table for contact form
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert contact" ON contact_submissions
    FOR INSERT WITH CHECK (true);
