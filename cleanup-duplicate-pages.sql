-- Clean up duplicate onboarding pages
-- This script removes duplicate pages while keeping the most recent one

WITH ranked_pages AS (
  SELECT 
    id,
    project_id,
    page_id,
    title,
    ROW_NUMBER() OVER (
      PARTITION BY project_id, page_id 
      ORDER BY updated_at DESC, created_at DESC
    ) as rn
  FROM onboarding_pages
)
DELETE FROM onboarding_pages 
WHERE id IN (
  SELECT id 
  FROM ranked_pages 
  WHERE rn > 1
);

-- Also clean up orphaned content blocks that reference deleted pages
DELETE FROM content_blocks 
WHERE NOT EXISTS (
  SELECT 1 
  FROM onboarding_pages 
  WHERE onboarding_pages.project_id = content_blocks.project_id 
  AND onboarding_pages.page_id = content_blocks.page_id
);

-- Verify the unique constraint exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'onboarding_pages_project_id_page_id_key'
  ) THEN
    ALTER TABLE onboarding_pages 
    ADD CONSTRAINT onboarding_pages_project_id_page_id_key 
    UNIQUE (project_id, page_id);
  END IF;
END $$;

-- Show cleanup results
SELECT 
  project_id,
  COUNT(*) as page_count,
  array_agg(DISTINCT page_id ORDER BY page_id) as page_ids
FROM onboarding_pages 
GROUP BY project_id
ORDER BY project_id; 