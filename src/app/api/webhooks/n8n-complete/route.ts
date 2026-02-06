import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// POST - n8n workflow completion webhook
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

    const {
      content_id,
      veo_video_url,
      drive_file_id,
      status,
      scheduled_post_time,
    } = body as {
      content_id?: string;
      veo_video_url?: string;
      drive_file_id?: string;
      status?: string;
      scheduled_post_time?: string;
    };

    if (!content_id) {
      return NextResponse.json(
        { error: "content_id is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (veo_video_url !== undefined) updateData.veo_video_url = veo_video_url;
    if (drive_file_id !== undefined) updateData.drive_file_id = drive_file_id;
    if (status !== undefined) updateData.status = status;
    if (scheduled_post_time !== undefined)
      updateData.scheduled_post_time = scheduled_post_time;

    const { data, error } = await supabase
      .from("content_queue")
      .update(updateData as never)
      .eq("id", content_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update content", details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Content not found", content_id },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Content updated successfully",
      content: data,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/webhooks/n8n-complete error:", message);
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}
