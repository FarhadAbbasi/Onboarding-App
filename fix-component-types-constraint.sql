-- Update content_blocks table to allow all AI-generated component types
-- Run this in your Supabase SQL Editor

-- First, drop the existing constraint
ALTER TABLE content_blocks DROP CONSTRAINT IF EXISTS content_blocks_type_check;

-- Add the new constraint with all supported component types
ALTER TABLE content_blocks ADD CONSTRAINT content_blocks_type_check 
CHECK (type IN (
  -- Original types
  'hero', 'feature-list', 'form', 'cta', 'testimonial', 'permissions', 'profile-setup',
  
  -- AI-generated component types
  'headline', 'subheadline', 'paragraph', 'text-input', 'alert', 'link', 
  'permission-request', 'spacer', 'icon', 'footer'
));

-- Verify the constraint was updated
SELECT 
    conname as constraint_name,
    consrc as constraint_definition
FROM pg_constraint 
WHERE conname = 'content_blocks_type_check'; 