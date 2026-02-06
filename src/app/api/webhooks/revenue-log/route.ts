import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { RevenueSource } from "@/types/database.types";

const VALID_SOURCES: RevenueSource[] = [
  "tiktok_fund",
  "youtube_adsense",
  "product_sales",
  "affiliate",
];

// ---------------------------------------------------------------------------
// POST - Log revenue entry
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

    const { source, amount, content_id, date } = body as {
      source?: string;
      amount?: number;
      content_id?: string | null;
      date?: string;
    };

    // Validate required fields
    if (!source) {
      return NextResponse.json(
        { error: "source is required" },
        { status: 400 }
      );
    }

    if (!VALID_SOURCES.includes(source as RevenueSource)) {
      return NextResponse.json(
        {
          error: `Invalid source. Must be one of: ${VALID_SOURCES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (amount === undefined || amount === null || typeof amount !== "number") {
      return NextResponse.json(
        { error: "amount is required and must be a number" },
        { status: 400 }
      );
    }

    if (amount < 0) {
      return NextResponse.json(
        { error: "amount must be non-negative" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    const insertPayload = {
      source: source as RevenueSource,
      amount,
      content_id: content_id ?? null,
      date: date ?? new Date().toISOString().split("T")[0],
    };

    const { data, error } = await supabase
      .from("revenue_sources")
      .insert(insertPayload as never)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to log revenue", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Revenue logged successfully",
      record: data,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/webhooks/revenue-log error:", message);
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}
