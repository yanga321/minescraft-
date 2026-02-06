import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// POST - Analytics data update webhook
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const secret = request.headers.get("x-webhook-secret");
    const expectedSecret = process.env.N8N_WEBHOOK_SECRET;

    if (!expectedSecret) {
      console.error("N8N_WEBHOOK_SECRET is not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured on server" },
        { status: 500 }
      );
    }

    if (secret !== expectedSecret) {
      return NextResponse.json(
        { error: "Invalid webhook secret" },
        { status: 401 }
      );
    }

    // Parse body
    const body = await request.json();

    const { content_id, platform, views, likes, shares, comments, completion_rate } =
      body as {
        content_id?: string;
        platform?: string;
        views?: number;
        likes?: number;
        shares?: number;
        comments?: number;
        completion_rate?: number;
      };

    if (!content_id) {
      return NextResponse.json(
        { error: "content_id is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Calculate engagement rate
    const safeViews = views ?? 0;
    const safeLikes = likes ?? 0;
    const safeShares = shares ?? 0;
    const safeComments = comments ?? 0;

    const engagementRate =
      safeViews > 0
        ? Number(
            (((safeLikes + safeShares + safeComments) / safeViews) * 100).toFixed(2)
          )
        : 0;

    // Build update object
    const updateData: Record<string, unknown> = {
      last_updated: new Date().toISOString(),
      engagement_rate: engagementRate,
    };

    if (views !== undefined) updateData.views = views;
    if (likes !== undefined) updateData.likes = likes;
    if (shares !== undefined) updateData.shares = shares;
    if (comments !== undefined) updateData.comments = comments;
    if (completion_rate !== undefined)
      updateData.completion_rate = completion_rate;

    // Update published_content by content_queue_id
    // Also filter by platform if provided to handle multi-platform posts
    let query = supabase
      .from("published_content")
      .update(updateData as never)
      .eq("content_queue_id", content_id);

    if (platform) {
      query = query.eq("platform", platform);
    }

    const { data, error } = await query.select();

    if (error) {
      return NextResponse.json(
        {
          error: "Failed to update analytics",
          details: error.message,
        },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          error: "No published content found for the given content_id",
          content_id,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Analytics updated successfully",
      updated_count: data.length,
      engagement_rate: engagementRate,
      records: data,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/webhooks/analytics-update error:", message);
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}
