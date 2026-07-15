-- Create social_links table for storing required follow URLs
CREATE TABLE IF NOT EXISTS public.social_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL UNIQUE, -- e.g., 'Instagram', 'TikTok', 'YouTube'
    url TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

-- Allow public read access (so students can see the links during verification)
CREATE POLICY "Allow public read access on social_links" 
    ON public.social_links FOR SELECT 
    USING (true);

-- Allow authenticated users to insert/update (ideally restricted to admins in your actual policies, but for simplicity here authenticated users)
CREATE POLICY "Allow authenticated full access on social_links" 
    ON public.social_links FOR ALL 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Insert default placeholder links
INSERT INTO public.social_links (platform, url, is_active) VALUES
    ('Instagram', 'https://instagram.com/quantimlabz', true),
    ('TikTok', 'https://tiktok.com/@quantimlabz', true),
    ('YouTube', 'https://youtube.com/@quantimlabz', true),
    ('LinkedIn', 'https://linkedin.com/company/quantimlabz', true)
ON CONFLICT (platform) DO NOTHING;
