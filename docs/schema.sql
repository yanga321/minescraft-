-- Minecraft Horror Factory Database Schema
-- Run this in Supabase SQL Editor

-- Content Queue Table
CREATE TABLE IF NOT EXISTS content_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  concept text NOT NULL,
  veo_prompt text NOT NULL,
  caption text NOT NULL,
  scene_description text NOT NULL,
  scene_type text NOT NULL CHECK (scene_type IN ('liminal', 'entity', 'glitch', 'build')),
  validation_score numeric(3,1),
  brand_score numeric(3,1),
  viral_score numeric(3,1),
  prompt_score numeric(3,1),
  approved boolean DEFAULT false,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'generated', 'posted', 'rejected')),
  veo_video_url text,
  drive_file_id text,
  scheduled_post_time timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Published Content Table
CREATE TABLE IF NOT EXISTS published_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_queue_id uuid REFERENCES content_queue(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('tiktok', 'youtube')),
  post_url text NOT NULL,
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  shares integer DEFAULT 0,
  comments integer DEFAULT 0,
  completion_rate numeric(5,2),
  engagement_rate numeric(5,2),
  posted_date timestamptz NOT NULL,
  last_updated timestamptz DEFAULT now()
);

-- Viral Patterns Table
CREATE TABLE IF NOT EXISTS viral_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_type text UNIQUE NOT NULL,
  scene_type text NOT NULL,
  avg_engagement numeric(5,2),
  avg_shares integer,
  performance_score numeric(3,1),
  example_prompt text NOT NULL,
  example_caption text NOT NULL,
  discovered_date timestamptz DEFAULT now()
);

-- Revenue Sources Table
CREATE TABLE IF NOT EXISTS revenue_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL CHECK (source IN ('tiktok_fund', 'youtube_adsense', 'product_sales', 'affiliate')),
  amount numeric(10,2) NOT NULL,
  content_id uuid REFERENCES published_content(id) ON DELETE SET NULL,
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Brand Guidelines Table
CREATE TABLE IF NOT EXISTS brand_guidelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('tone', 'visual', 'caption', 'forbidden')),
  rule text NOT NULL,
  examples jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_queue_status ON content_queue(status);
CREATE INDEX IF NOT EXISTS idx_content_queue_scheduled ON content_queue(scheduled_post_time);
CREATE INDEX IF NOT EXISTS idx_published_platform ON published_content(platform);
CREATE INDEX IF NOT EXISTS idx_published_date ON published_content(posted_date);
CREATE INDEX IF NOT EXISTS idx_revenue_date ON revenue_sources(date);

-- Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply Trigger
DROP TRIGGER IF EXISTS update_content_queue_updated_at ON content_queue;
CREATE TRIGGER update_content_queue_updated_at
  BEFORE UPDATE ON content_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (optional - disable for development)
-- ALTER TABLE content_queue ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE published_content ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE viral_patterns ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE revenue_sources ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE brand_guidelines ENABLE ROW LEVEL SECURITY;
