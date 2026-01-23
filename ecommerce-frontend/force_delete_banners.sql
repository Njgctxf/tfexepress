-- Force clean banners table
TRUNCATE TABLE public.banners RESTART IDENTITY;

-- Verify it's empty
SELECT * FROM public.banners;
