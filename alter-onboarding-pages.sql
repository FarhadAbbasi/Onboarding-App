-- Add html_content column to onboarding_pages table
ALTER TABLE onboarding_pages 
ADD COLUMN html_content TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN onboarding_pages.html_content IS 'Complete HTML content for the page generated by GPT-4o'; 