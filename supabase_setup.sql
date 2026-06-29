-- =====================================================================
-- SUPABASE SCHEMA SETUP FOR PHOTO ALBUM & DIGITAL ASSET PORTAL
-- Paste this script into your Supabase SQL Editor and run it.
-- =====================================================================

-- 1. Create Albums Table
CREATE TABLE IF NOT EXISTS public.albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on Albums
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;

-- Policies for Albums
CREATE POLICY "Allow public read access on albums" 
    ON public.albums FOR SELECT 
    USING (true);

CREATE POLICY "Allow authenticated users full access on albums" 
    ON public.albums FOR ALL 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');


-- 2. Create Media Table
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID REFERENCES public.albums(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('image', 'video')),
    url TEXT NOT NULL,
    name TEXT NOT NULL,
    size BIGINT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on Media
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Policies for Media
CREATE POLICY "Allow public read access on media" 
    ON public.media FOR SELECT 
    USING (true);

CREATE POLICY "Allow authenticated users full access on media" 
    ON public.media FOR ALL 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');


-- 3. Create Pages Table
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    event_date DATE,
    cover_url TEXT,
    media_ids JSONB DEFAULT '[]'::jsonb NOT NULL,
    is_public BOOLEAN DEFAULT true NOT NULL,
    password TEXT,
    no_index BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on Pages
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Policies for Pages
CREATE POLICY "Allow public read access on pages" 
    ON public.pages FOR SELECT 
    USING (true);

CREATE POLICY "Allow authenticated users full access on pages" 
    ON public.pages FOR ALL 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');


-- =====================================================================
-- STORAGE BUCKETS SETUP
-- =====================================================================

-- Insert a public storage bucket named 'assets' if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for Storage Buckets (Objects)
-- Allow public access to read/download objects in 'assets' bucket
CREATE POLICY "Allow public read access on assets bucket" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'assets');

-- Allow authenticated users to upload/insert objects into 'assets' bucket
CREATE POLICY "Allow authenticated upload access on assets bucket" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'assets' AND auth.role() = 'authenticated');

-- Allow authenticated users to update objects in 'assets' bucket
CREATE POLICY "Allow authenticated update access on assets bucket" 
    ON storage.objects FOR UPDATE 
    USING (bucket_id = 'assets' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete objects from 'assets' bucket
CREATE POLICY "Allow authenticated delete access on assets bucket" 
    ON storage.objects FOR DELETE 
    USING (bucket_id = 'assets' AND auth.role() = 'authenticated');
