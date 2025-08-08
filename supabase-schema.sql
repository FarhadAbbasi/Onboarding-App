-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    category VARCHAR(100) NOT NULL,
    notes TEXT,
    tone VARCHAR(50) DEFAULT 'friendly',
    feature_focus TEXT,
    flow_plan JSONB, -- Stores the complete flow plan
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create onboarding_pages table for the multi-page flow
CREATE TABLE IF NOT EXISTS onboarding_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    page_id VARCHAR(100) NOT NULL, -- The logical page ID from the flow plan
    title VARCHAR(255) NOT NULL,
    purpose TEXT,
    html_content TEXT, -- Complete HTML content for the page
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, page_id)
);

-- Create content_blocks table
CREATE TABLE IF NOT EXISTS content_blocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    page_id VARCHAR(100), -- Links to onboarding_pages.page_id
    block_id VARCHAR(100) NOT NULL, -- The logical block ID
    type VARCHAR(50) NOT NULL CHECK (type IN ('hero', 'feature-list', 'form', 'cta', 'testimonial', 'permissions', 'profile-setup')),
    content JSONB NOT NULL, -- Structured content based on block type
    order_index INTEGER NOT NULL DEFAULT 0,
    styles JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, page_id, block_id)
);

-- Create published_pages table
CREATE TABLE IF NOT EXISTS published_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    file_url VARCHAR(500) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    analytics_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
CREATE INDEX IF NOT EXISTS onboarding_pages_project_id_idx ON onboarding_pages(project_id);
CREATE INDEX IF NOT EXISTS onboarding_pages_order_idx ON onboarding_pages(project_id, order_index);
CREATE INDEX IF NOT EXISTS content_blocks_project_id_idx ON content_blocks(project_id);
CREATE INDEX IF NOT EXISTS content_blocks_page_id_idx ON content_blocks(project_id, page_id);
CREATE INDEX IF NOT EXISTS content_blocks_order_idx ON content_blocks(project_id, page_id, order_index);
CREATE INDEX IF NOT EXISTS published_pages_project_id_idx ON published_pages(project_id);
CREATE INDEX IF NOT EXISTS published_pages_slug_idx ON published_pages(slug);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_pages ENABLE ROW LEVEL SECURITY;

-- Create policies for projects table
CREATE POLICY "Users can view their own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for onboarding_pages table
CREATE POLICY "Users can view pages of their projects" ON onboarding_pages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = onboarding_pages.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create pages for their projects" ON onboarding_pages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = onboarding_pages.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update pages of their projects" ON onboarding_pages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = onboarding_pages.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete pages of their projects" ON onboarding_pages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = onboarding_pages.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Create policies for content_blocks table
CREATE POLICY "Users can view content blocks of their projects" ON content_blocks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = content_blocks.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create content blocks for their projects" ON content_blocks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = content_blocks.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update content blocks of their projects" ON content_blocks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = content_blocks.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete content blocks of their projects" ON content_blocks
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = content_blocks.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Create policies for published_pages table
CREATE POLICY "Users can view published pages of their projects" ON published_pages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = published_pages.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create published pages for their projects" ON published_pages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = published_pages.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update published pages of their projects" ON published_pages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = published_pages.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete published pages of their projects" ON published_pages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = published_pages.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Create storage bucket for public pages
INSERT INTO storage.buckets (id, name, public) 
VALUES ('public_pages', 'public_pages', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for public pages bucket
CREATE POLICY "Public pages are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'public_pages');

CREATE POLICY "Users can upload to public pages bucket" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'public_pages' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update their uploads in public pages bucket" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'public_pages' 
        AND auth.role() = 'authenticated'
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_pages_updated_at 
    BEFORE UPDATE ON onboarding_pages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_blocks_updated_at 
    BEFORE UPDATE ON content_blocks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_published_pages_updated_at 
    BEFORE UPDATE ON published_pages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 