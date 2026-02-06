import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type {
  ViralPattern,
  PublishedContent,
  ContentQueue,
} from "@/types/database.types";

// ---------------------------------------------------------------------------
// GET - Retrieve top viral patterns
// ---------------------------------------------------------------------------
export async function GET() {
  try {
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from("viral_patterns")
      .select("*")
      .order("performance_score", { ascending: false })
      .limit(5);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch patterns", details: error.message },
        { status: 500 }
      );
    }

    const patterns = (data ?? []) as unknown as ViralPattern[];

    return NextResponse.json({
      patterns,
      count: patterns.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("GET /api/patterns error:", message);
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// POST - Discover new patterns from high-performing content
// ---------------------------------------------------------------------------
export async function POST() {
  try {
    const supabase = createServiceRoleClient();

    // Fetch high-performing published content to analyze
    const { data: rawHighPerformers, error: fetchError } = await supabase
      .from("published_content")
      .select(
        "id, content_queue_id, platform, views, likes, shares, comments, engagement_rate, completion_rate"
      )
      .order("views", { ascending: false })
      .limit(20);

    if (fetchError) {
      return NextResponse.json(
        {
          error: "Failed to fetch high-performing content",
          details: fetchError.message,
        },
        { status: 500 }
      );
    }

    const highPerformers =
      (rawHighPerformers as unknown as Pick<
        PublishedContent,
        | "id"
        | "content_queue_id"
        | "platform"
        | "views"
        | "likes"
        | "shares"
        | "comments"
        | "engagement_rate"
        | "completion_rate"
      >[]) ?? [];

    if (highPerformers.length === 0) {
      return NextResponse.json({
        message: "No published content found to analyze",
        patterns_discovered: 0,
      });
    }

    // Fetch associated content queue data for context
    const queueIds = highPerformers
      .map((c) => c.content_queue_id)
      .filter(Boolean);

    const { data: rawQueueItems, error: queueError } = await supabase
      .from("content_queue")
      .select("id, concept, veo_prompt, caption, scene_type, scene_description")
      .in("id", queueIds);

    if (queueError) {
      return NextResponse.json(
        {
          error: "Failed to fetch content details",
          details: queueError.message,
        },
        { status: 500 }
      );
    }

    const queueItems =
      (rawQueueItems as unknown as Pick<
        ContentQueue,
        "id" | "concept" | "veo_prompt" | "caption" | "scene_type" | "scene_description"
      >[]) ?? [];

    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "OpenAI API key is not configured. Pattern discovery requires GPT-4o.",
        },
        { status: 503 }
      );
    }

    // Dynamic import to avoid issues when key is missing
    const { default: openai } = await import("@/lib/api/openai");

    // Combine data for analysis
    const contentForAnalysis = highPerformers.map((hp) => {
      const queue = queueItems.find((q) => q.id === hp.content_queue_id);
      return {
        views: hp.views,
        likes: hp.likes,
        shares: hp.shares,
        engagement_rate: hp.engagement_rate,
        concept: queue?.concept ?? "unknown",
        scene_type: queue?.scene_type ?? "unknown",
        caption: queue?.caption ?? "",
        veo_prompt: queue?.veo_prompt ?? "",
      };
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You analyze high-performing Minecraft horror content to discover viral patterns.

For each pattern, provide:
- pattern_type: A short name (e.g. "liminal_hallway", "entity_reveal")
- scene_type: One of "liminal", "entity", "glitch", "build"
- avg_engagement: Estimated average engagement rate (0-20)
- avg_shares: Estimated average shares (number)
- performance_score: Overall pattern strength 1-10
- example_prompt: A sample veo prompt using this pattern
- example_caption: A sample caption using this pattern

Return a JSON object: { "patterns": [...] } with 1-3 discovered patterns.`,
        },
        {
          role: "user",
          content: `Analyze this high-performing content and discover viral patterns:\n${JSON.stringify(contentForAnalysis, null, 2)}`,
        },
      ],
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content || '{"patterns": []}');
    const discoveredPatterns: Array<{
      pattern_type: string;
      scene_type: string;
      avg_engagement: number;
      avg_shares: number;
      performance_score: number;
      example_prompt: string;
      example_caption: string;
    }> = parsed.patterns || [];

    // Insert discovered patterns into database
    if (discoveredPatterns.length > 0) {
      const insertPayload = discoveredPatterns.map((p) => ({
        pattern_type: p.pattern_type,
        scene_type: p.scene_type,
        avg_engagement: p.avg_engagement,
        avg_shares: p.avg_shares,
        performance_score: p.performance_score,
        example_prompt: p.example_prompt,
        example_caption: p.example_caption,
      }));

      const { error: insertError } = await supabase
        .from("viral_patterns")
        .insert(insertPayload as never[]);

      if (insertError) {
        console.error("Failed to insert patterns:", insertError.message);
        return NextResponse.json(
          {
            error: "Patterns discovered but failed to save",
            patterns: discoveredPatterns,
            details: insertError.message,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      message: "Patterns discovered successfully",
      patterns_discovered: discoveredPatterns.length,
      patterns: discoveredPatterns,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/patterns error:", message);
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}
