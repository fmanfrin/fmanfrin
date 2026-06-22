-- Content Sources Table for Knowledge Base
CREATE TABLE IF NOT EXISTS content_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  type TEXT NOT NULL, -- 'text', 'pdf', 'docx', 'pptx', 'txt', 'markdown', 'url'
  content_text TEXT, -- Extracted text content
  file_path TEXT, -- Path in Supabase Storage
  url TEXT, -- For external URLs
  status TEXT DEFAULT 'published', -- 'draft', 'review', 'published', 'archived'
  version INTEGER DEFAULT 1,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_type CHECK (type IN ('text', 'pdf', 'docx', 'pptx', 'txt', 'markdown', 'url')),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'review', 'published', 'archived'))
);

-- Indexes
CREATE INDEX idx_content_sources_organization_id ON content_sources(organization_id);
CREATE INDEX idx_content_sources_status ON content_sources(status);
CREATE INDEX idx_content_sources_category ON content_sources(category);
CREATE INDEX idx_content_sources_created_at ON content_sources(created_at DESC);

-- RLS Policies
ALTER TABLE content_sources ENABLE ROW LEVEL SECURITY;

-- Users can only see content from their organization
CREATE POLICY "Users see organization content"
  ON content_sources FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships
      WHERE profile_id = auth.uid()
    )
  );

-- Only admin can insert/update/delete content
CREATE POLICY "Only admin can manage content"
  ON content_sources FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM memberships
      WHERE profile_id = auth.uid() AND role = 'admin_company'
    )
  );

CREATE POLICY "Only admin can update content"
  ON content_sources FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships
      WHERE profile_id = auth.uid() AND role = 'admin_company'
    )
  );

CREATE POLICY "Only admin can delete content"
  ON content_sources FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships
      WHERE profile_id = auth.uid() AND role = 'admin_company'
    )
  );
