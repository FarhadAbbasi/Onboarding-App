-- Add themes table for storing AI-generated themes
CREATE TABLE IF NOT EXISTS project_themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  theme_name VARCHAR(255) NOT NULL,
  theme_data JSONB NOT NULL,
  mood VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id)
);

-- Add component customizations table
CREATE TABLE IF NOT EXISTS component_customizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  page_id VARCHAR(255),
  component_type VARCHAR(100) NOT NULL,
  customization_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_themes_project_id ON project_themes(project_id);
CREATE INDEX IF NOT EXISTS idx_component_customizations_project_id ON component_customizations(project_id);
CREATE INDEX IF NOT EXISTS idx_component_customizations_page_id ON component_customizations(page_id);
CREATE INDEX IF NOT EXISTS idx_component_customizations_type ON component_customizations(component_type);

-- Add RLS policies for themes
ALTER TABLE project_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own project themes"
  ON project_themes FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM projects WHERE id = project_id));

CREATE POLICY "Users can insert their own project themes"
  ON project_themes FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM projects WHERE id = project_id));

CREATE POLICY "Users can update their own project themes"
  ON project_themes FOR UPDATE
  USING (auth.uid() = (SELECT user_id FROM projects WHERE id = project_id));

CREATE POLICY "Users can delete their own project themes"
  ON project_themes FOR DELETE
  USING (auth.uid() = (SELECT user_id FROM projects WHERE id = project_id));

-- Add RLS policies for component customizations
ALTER TABLE component_customizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own component customizations"
  ON component_customizations FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM projects WHERE id = project_id));

CREATE POLICY "Users can insert their own component customizations"
  ON component_customizations FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM projects WHERE id = project_id));

CREATE POLICY "Users can update their own component customizations"
  ON component_customizations FOR UPDATE
  USING (auth.uid() = (SELECT user_id FROM projects WHERE id = project_id));

CREATE POLICY "Users can delete their own component customizations"
  ON component_customizations FOR DELETE
  USING (auth.uid() = (SELECT user_id FROM projects WHERE id = project_id)); 