import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  validateBrandCompliance,
  validateViralPotential,
} from "@/lib/api/openai";

// ---------------------------------------------------------------------------
// Rate limiting (simple in-memory map)
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // max requests per window

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }

  return false;
}

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------
const validateContentSchema = z.object({
  concept: z.string().min(1, "Concept is required"),
  veo_prompt: z
    .string()
    .min(50, "Veo prompt must be at least 50 characters"),
  caption: z
    .string()
    .max(100, "Caption must be 100 characters or fewer"),
  scene_description: z.string().min(1, "Scene description is required"),
});

// ---------------------------------------------------------------------------
// Prompt quality scorer (pure code logic, no AI)
// ---------------------------------------------------------------------------
function scorePromptQuality(veoPrompt: string): {
  score: number;
  feedback: string;
} {
  const lower = veoPrompt.toLowerCase();

  // Count commas (target: 8+)
  const commaCount = (veoPrompt.match(/,/g) || []).length;

  // Check for required keywords / concepts
  const keywordChecks: { label: string; pattern: RegExp }[] = [
    { label: "POV/camera perspective", pattern: /\b(pov|first[- ]person|camera)\b/i },
    { label: "Minecraft reference", pattern: /\bminecraft\b/i },
    { label: "Lighting description", pattern: /\b(light|lighting|lit|glow|shadow|dark|dim|torch|ambient)\b/i },
    { label: "Color grading", pattern: /\b(color grad|colour grad|desaturated|muted|warm tone|cold tone|cinematic color|monochrome)\b/i },
    { label: "Camera movement", pattern: /\b(pan|tilt|dolly|tracking|zoom|steadicam|handheld|slow push|pull back|crane)\b/i },
    { label: "Visual effects", pattern: /\b(fog|mist|particle|grain|noise|distort|glitch|vhs|static|blur|aberration)\b/i },
    { label: "Quality modifier", pattern: /\b(ultra|high quality|4k|8k|cinematic|photorealistic|hyper[- ]?realistic|detailed|hd)\b/i },
  ];

  const keywordsFound = keywordChecks.filter((k) => k.pattern.test(lower));
  const keywordsFoundCount = keywordsFound.length;
  const totalKeywords = keywordChecks.length; // 7

  // Formula: (commas/10 * 5) + (keywords_found/7 * 5), max 10
  const commaScore = Math.min(commaCount / 10, 1) * 5;
  const keywordScore = (keywordsFoundCount / totalKeywords) * 5;
  const raw = commaScore + keywordScore;
  const score = Math.min(Number(raw.toFixed(1)), 10);

  const missingKeywords = keywordChecks
    .filter((k) => !k.pattern.test(lower))
    .map((k) => k.label);

  const feedbackParts: string[] = [];
  if (commaCount < 8) {
    feedbackParts.push(
      `Prompt has ${commaCount} commas (target: 8+). Add more descriptive clauses.`
    );
  }
  if (missingKeywords.length > 0) {
    feedbackParts.push(`Missing: ${missingKeywords.join(", ")}.`);
  }
  if (feedbackParts.length === 0) {
    feedbackParts.push("Prompt structure is excellent.");
  }

  return { score, feedback: feedbackParts.join(" ") };
}

// ---------------------------------------------------------------------------
// Check whether OpenAI is configured
// ---------------------------------------------------------------------------
function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Parse body
    const body = await request.json();

    // Validate with Zod
    const parseResult = validateContentSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { concept, veo_prompt, caption, scene_description } =
      parseResult.data;

    // 1. Prompt quality (always code-based)
    const promptResult = scorePromptQuality(veo_prompt);

    // 2 & 3. Brand compliance + viral potential (AI or mock)
    let brandResult: { score: number; feedback: string };
    let viralResult: { score: number; feedback: string };

    if (isOpenAIConfigured()) {
      try {
        [brandResult, viralResult] = await Promise.all([
          validateBrandCompliance(concept, caption),
          validateViralPotential(scene_description),
        ]);
      } catch (aiError) {
        const message =
          aiError instanceof Error ? aiError.message : "OpenAI call failed";
        console.error("OpenAI validation error, using mock scores:", message);
        brandResult = {
          score: 7.5,
          feedback: `Mock score (OpenAI error: ${message}). Review manually.`,
        };
        viralResult = {
          score: 7.0,
          feedback: `Mock score (OpenAI error: ${message}). Review manually.`,
        };
      }
    } else {
      brandResult = {
        score: 7.5,
        feedback:
          "Mock score (OpenAI not configured). Set OPENAI_API_KEY for real analysis.",
      };
      viralResult = {
        score: 7.0,
        feedback:
          "Mock score (OpenAI not configured). Set OPENAI_API_KEY for real analysis.",
      };
    }

    // Calculate overall score
    const overallScore = Number(
      (
        brandResult.score * 0.4 +
        viralResult.score * 0.35 +
        promptResult.score * 0.25
      ).toFixed(2)
    );

    // Approval logic
    const approved =
      overallScore >= 7.5 &&
      brandResult.score >= 7.5 &&
      promptResult.score >= 7.0;

    return NextResponse.json({
      approved,
      overall_score: overallScore,
      scores: {
        brand: {
          score: brandResult.score,
          weight: 0.4,
          feedback: brandResult.feedback,
        },
        viral: {
          score: viralResult.score,
          weight: 0.35,
          feedback: viralResult.feedback,
        },
        prompt: {
          score: promptResult.score,
          weight: 0.25,
          feedback: promptResult.feedback,
        },
      },
      openai_configured: isOpenAIConfigured(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("validate-content error:", message);
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}
