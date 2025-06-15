
-- Add an 'image_url' column to the 'menu' table to store image links
ALTER TABLE public.menu ADD COLUMN image_url TEXT;

-- Create a new, public storage bucket for menu images
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

-- Add a policy to allow anyone to view the images in the bucket
CREATE POLICY "Allow public read access on menu images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'menu-images' );

-- Add a policy that allows chefs (moms) to upload images to their own folder
CREATE POLICY "Allow moms to upload menu images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'menu-images' AND (storage.foldername(name))[1] = auth.uid()::text );

-- Add a policy that allows chefs to update their own images
CREATE POLICY "Allow moms to update their own menu images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'menu-images' AND (storage.foldername(name))[1] = auth.uid()::text );

-- Add a policy that allows chefs to delete their own images
CREATE POLICY "Allow moms to delete their own menu images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'menu-images' AND (storage.foldername(name))[1] = auth.uid()::text );
