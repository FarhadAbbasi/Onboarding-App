-- Add missing page_id column to content_blocks table
ALTER TABLE content_blocks 
ADD COLUMN page_id VARCHAR(100);

-- Add comment to document the column
COMMENT ON COLUMN content_blocks.page_id IS 'Links to onboarding_pages.page_id for multi-page flows';

-- Now create the indexes (including the ones that were failing)
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
CREATE INDEX IF NOT EXISTS onboarding_pages_project_id_idx ON onboarding_pages(project_id);
CREATE INDEX IF NOT EXISTS onboarding_pages_order_idx ON onboarding_pages(project_id, order_index);
CREATE INDEX IF NOT EXISTS content_blocks_project_id_idx ON content_blocks(project_id);
CREATE INDEX IF NOT EXISTS content_blocks_page_id_idx ON content_blocks(project_id, page_id);
CREATE INDEX IF NOT EXISTS content_blocks_order_idx ON content_blocks(project_id, page_id, order_index);
CREATE INDEX IF NOT EXISTS published_pages_project_id_idx ON published_pages(project_id);
CREATE INDEX IF NOT EXISTS published_pages_slug_idx ON published_pages(slug); 