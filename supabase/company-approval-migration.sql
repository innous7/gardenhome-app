-- Add business_license_url column to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS business_license_url TEXT;

-- Create storage bucket for business licenses (run in Supabase Dashboard > Storage)
-- Bucket name: business-licenses
-- Public: true
