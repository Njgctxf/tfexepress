-- Fix RLS Policies for Banners table
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Access
DROP POLICY IF EXISTS "Public banners are viewable by everyone" ON public.banners;
CREATE POLICY "Public banners are viewable by everyone" ON public.banners
    FOR SELECT
    USING (true);

-- 2. Authenticated Full Access (Insert/Update/Delete)
DROP POLICY IF EXISTS "Authenticated can manage banners" ON public.banners;
CREATE POLICY "Authenticated can manage banners" ON public.banners
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
