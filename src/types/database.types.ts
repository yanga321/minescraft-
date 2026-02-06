export type SceneType = "liminal" | "entity" | "glitch" | "build";
export type ContentStatus =
  | "pending"
  | "approved"
  | "generated"
  | "posted"
  | "rejected";
export type Platform = "tiktok" | "youtube";
export type RevenueSource =
  | "tiktok_fund"
  | "youtube_adsense"
  | "product_sales"
  | "affiliate";
export type GuidelineCategory = "tone" | "visual" | "caption" | "forbidden";

export interface ContentQueue {
  id: string;
  concept: string;
  veo_prompt: string;
  caption: string;
  scene_description: string;
  scene_type: SceneType;
  validation_score: number | null;
  brand_score: number | null;
  viral_score: number | null;
  prompt_score: number | null;
  approved: boolean;
  status: ContentStatus;
  veo_video_url: string | null;
  drive_file_id: string | null;
  scheduled_post_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublishedContent {
  id: string;
  content_queue_id: string;
  platform: Platform;
  post_url: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  completion_rate: number | null;
  engagement_rate: number | null;
  posted_date: string;
  last_updated: string;
}

export interface ViralPattern {
  id: string;
  pattern_type: string;
  scene_type: string;
  avg_engagement: number;
  avg_shares: number;
  performance_score: number;
  example_prompt: string;
  example_caption: string;
  discovered_date: string;
}

export interface RevenueRecord {
  id: string;
  source: RevenueSource;
  amount: number;
  content_id: string | null;
  date: string;
  created_at: string;
}

export interface BrandGuideline {
  id: string;
  category: GuidelineCategory;
  rule: string;
  examples: string[] | null;
  active: boolean;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      content_queue: {
        Row: ContentQueue;
        Insert: Omit<ContentQueue, "id" | "created_at" | "updated_at"> &
          Partial<Pick<ContentQueue, "id" | "created_at" | "updated_at">>;
        Update: Partial<ContentQueue>;
      };
      published_content: {
        Row: PublishedContent;
        Insert: Omit<PublishedContent, "id" | "last_updated"> &
          Partial<Pick<PublishedContent, "id" | "last_updated">>;
        Update: Partial<PublishedContent>;
      };
      viral_patterns: {
        Row: ViralPattern;
        Insert: Omit<ViralPattern, "id" | "discovered_date"> &
          Partial<Pick<ViralPattern, "id" | "discovered_date">>;
        Update: Partial<ViralPattern>;
      };
      revenue_sources: {
        Row: RevenueRecord;
        Insert: Omit<RevenueRecord, "id" | "created_at"> &
          Partial<Pick<RevenueRecord, "id" | "created_at">>;
        Update: Partial<RevenueRecord>;
      };
      brand_guidelines: {
        Row: BrandGuideline;
        Insert: Omit<BrandGuideline, "id" | "created_at"> &
          Partial<Pick<BrandGuideline, "id" | "created_at">>;
        Update: Partial<BrandGuideline>;
      };
    };
  };
}
