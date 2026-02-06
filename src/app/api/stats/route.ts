import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// In-memory cache (2-minute TTL)
// ---------------------------------------------------------------------------
interface CacheEntry {
  data: Record<string, unknown>;
  expiresAt: number;
}

let statsCache: CacheEntry | null = null;
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

// ---------------------------------------------------------------------------
// Row shapes for type assertions (mirrors select projections)
// ---------------------------------------------------------------------------
interface PublishedRow {
  id: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  engagement_rate: number | null;
}

interface QueueRow {
  id: string;
  validation_score: number | null;
  status: string;
}

interface RevenueRow {
  amount: number;
}

interface WeeklyRow {
  posted_date: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  engagement_rate: number | null;
}

interface PlatformRow {
  platform: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  engagement_rate: number | null;
}

interface SceneTypeRow {
  id: string;
  scene_type: string;
  status: string;
}

// ---------------------------------------------------------------------------
// GET - Dashboard stats
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get("refresh") === "true";

    // Check cache
    if (!refresh && statsCache && Date.now() < statsCache.expiresAt) {
      return NextResponse.json({ ...statsCache.data, cached: true });
    }

    const supabase = createServiceRoleClient();

    // Run all queries in parallel
    const [
      publishedResult,
      queueResult,
      revenueResult,
      recentPostsResult,
      upcomingQueueResult,
      weeklyResult,
      platformResult,
      sceneTypeResult,
    ] = await Promise.all([
      // Total posted + aggregated views
      supabase
        .from("published_content")
        .select("id, views, likes, shares, comments, engagement_rate"),

      // Content in queue (pending / approved / generated statuses)
      supabase
        .from("content_queue")
        .select("id, validation_score, status")
        .in("status", ["pending", "approved", "generated"]),

      // Total revenue
      supabase.from("revenue_sources").select("amount"),

      // Recent 5 posts
      supabase
        .from("published_content")
        .select(
          "id, content_queue_id, platform, post_url, views, likes, shares, comments, engagement_rate, posted_date"
        )
        .order("posted_date", { ascending: false })
        .limit(5),

      // Upcoming 3 scheduled items
      supabase
        .from("content_queue")
        .select(
          "id, concept, caption, scene_type, status, scheduled_post_time, validation_score"
        )
        .in("status", ["approved", "generated"])
        .order("scheduled_post_time", { ascending: true })
        .limit(3),

      // Weekly stats (last 7 days of published content)
      supabase
        .from("published_content")
        .select("posted_date, views, likes, shares, comments, engagement_rate")
        .gte(
          "posted_date",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        )
        .order("posted_date", { ascending: true }),

      // Performance by platform
      supabase
        .from("published_content")
        .select("platform, views, likes, shares, comments, engagement_rate"),

      // Content queue for scene-type analysis
      supabase.from("content_queue").select("id, scene_type, status"),
    ]);

    // Check for errors
    const errors: string[] = [];
    if (publishedResult.error)
      errors.push(`published: ${publishedResult.error.message}`);
    if (queueResult.error)
      errors.push(`queue: ${queueResult.error.message}`);
    if (revenueResult.error)
      errors.push(`revenue: ${revenueResult.error.message}`);
    if (recentPostsResult.error)
      errors.push(`recent_posts: ${recentPostsResult.error.message}`);
    if (upcomingQueueResult.error)
      errors.push(`upcoming: ${upcomingQueueResult.error.message}`);

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Failed to fetch some stats", details: errors },
        { status: 500 }
      );
    }

    // Type-assert query results
    const published = ((publishedResult.data ?? []) as unknown) as PublishedRow[];
    const queue = ((queueResult.data ?? []) as unknown) as QueueRow[];
    const revenue = ((revenueResult.data ?? []) as unknown) as RevenueRow[];
    const weekly = ((weeklyResult.data ?? []) as unknown) as WeeklyRow[];
    const platformData =
      ((platformResult.data ?? []) as unknown) as PlatformRow[];
    const sceneTypeData =
      ((sceneTypeResult.data ?? []) as unknown) as SceneTypeRow[];

    // --- Overview ---
    const totalPosted = published.length;
    const totalViews = published.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalRevenue = revenue.reduce((sum, r) => sum + (r.amount || 0), 0);
    const contentInQueue = queue.length;

    const scoresWithValues = queue
      .map((q) => q.validation_score)
      .filter((s): s is number => s !== null && s !== undefined);
    const avgQualityScore =
      scoresWithValues.length > 0
        ? Number(
            (
              scoresWithValues.reduce((a, b) => a + b, 0) /
              scoresWithValues.length
            ).toFixed(2)
          )
        : 0;

    const overview = {
      total_posted: totalPosted,
      total_views: totalViews,
      total_revenue: Number(totalRevenue.toFixed(2)),
      content_in_queue: contentInQueue,
      avg_quality_score: avgQualityScore,
    };

    // --- Weekly stats ---
    const weeklyStats = weekly.map((w) => ({
      date: w.posted_date,
      views: w.views,
      likes: w.likes,
      shares: w.shares,
      comments: w.comments,
      engagement_rate: w.engagement_rate,
    }));

    // --- Performance by platform ---
    const platformGroups: Record<
      string,
      {
        views: number;
        likes: number;
        shares: number;
        comments: number;
        count: number;
      }
    > = {};

    for (const p of platformData) {
      const key = p.platform;
      if (!platformGroups[key]) {
        platformGroups[key] = {
          views: 0,
          likes: 0,
          shares: 0,
          comments: 0,
          count: 0,
        };
      }
      platformGroups[key].views += p.views || 0;
      platformGroups[key].likes += p.likes || 0;
      platformGroups[key].shares += p.shares || 0;
      platformGroups[key].comments += p.comments || 0;
      platformGroups[key].count += 1;
    }

    const performanceByPlatform = Object.entries(platformGroups).map(
      ([platform, stats]) => ({
        platform,
        total_views: stats.views,
        total_likes: stats.likes,
        total_shares: stats.shares,
        total_comments: stats.comments,
        post_count: stats.count,
        avg_views:
          stats.count > 0 ? Math.round(stats.views / stats.count) : 0,
      })
    );

    // --- Performance by scene type ---
    const sceneGroups: Record<string, { count: number }> = {};
    for (const item of sceneTypeData) {
      const key = item.scene_type || "unknown";
      if (!sceneGroups[key]) {
        sceneGroups[key] = { count: 0 };
      }
      if (item.status === "posted") {
        sceneGroups[key].count += 1;
      }
    }

    const performanceBySceneType = Object.entries(sceneGroups).map(
      ([sceneType, stats]) => ({
        scene_type: sceneType,
        post_count: stats.count,
      })
    );

    // --- Build response ---
    const responseData = {
      overview,
      weekly_stats: weeklyStats,
      recent_posts: recentPostsResult.data ?? [],
      upcoming_queue: upcomingQueueResult.data ?? [],
      performance_by_platform: performanceByPlatform,
      performance_by_scene_type: performanceBySceneType,
      generated_at: new Date().toISOString(),
    };

    // Update cache
    statsCache = {
      data: responseData,
      expiresAt: Date.now() + CACHE_TTL_MS,
    };

    return NextResponse.json({ ...responseData, cached: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("GET /api/stats error:", message);
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}
