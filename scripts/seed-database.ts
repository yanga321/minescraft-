/**
 * Seed Database Script
 *
 * Populates brand_guidelines, viral_patterns, and content_queue tables
 * with initial data for the Minecraft Horror Factory.
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed-database.ts
 *
 * Or with a .env file loaded via dotenv:
 *   npx tsx -r dotenv/config scripts/seed-database.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ---------------------------------------------------------------------------
// Brand Guidelines
// ---------------------------------------------------------------------------

const brandGuidelines = [
  {
    category: "tone" as const,
    rule: "Cryptic and unexplained - never over-explain the horror",
    examples: [
      "Let the visuals carry the dread; captions only hint at what happened",
      "Use sentence fragments that imply something is wrong without saying what",
      "Treat the audience as if they already know the lore",
    ],
    active: true,
  },
  {
    category: "visual" as const,
    rule: "Analog horror aesthetic with VHS grain and desaturation",
    examples: [
      "Apply VHS scan-line overlay and slight tracking wobble",
      "Desaturate colors to muted earth tones with one accent color",
      "Use static-flash transitions between shots",
      "Simulate low-resolution security camera framing",
    ],
    active: true,
  },
  {
    category: "caption" as const,
    rule: "Question-based or POV format, max 100 characters, cryptic tone",
    examples: [
      "POV: you hear digging under your base at 3 AM",
      "Day 47: the villagers stopped sleeping",
      "Why does my world have a second sun now?",
      "Has anyone else seen this biome before?",
    ],
    active: true,
  },
  {
    category: "forbidden" as const,
    rule: "Never use these words in captions",
    examples: [
      "scary",
      "creepy",
      "jumpscare",
      "horror",
      "terrifying",
      "spooky",
    ],
    active: true,
  },
];

// ---------------------------------------------------------------------------
// Viral Patterns
// ---------------------------------------------------------------------------

const viralPatterns = [
  {
    pattern_type: "empty_liminal_space",
    scene_type: "liminal",
    avg_engagement: 8.2,
    avg_shares: 4500,
    performance_score: 8.5,
    example_prompt:
      "POV first-person Minecraft footage walking through an impossibly long abandoned mineshaft. Torch light flickers on wet stone walls. Vanilla Minecraft 1.20 textures. VHS grain overlay, desaturated color grading with amber torch glow. Slow forward dolly movement, slight camera bob. Distant ambient cave sounds implied by dark fog ahead. 4K quality, photorealistic lighting, cinematic composition.",
    example_caption: "POV: this mineshaft has been loading for 20 minutes",
  },
  {
    pattern_type: "entity_watching",
    scene_type: "entity",
    avg_engagement: 9.1,
    avg_shares: 6200,
    performance_score: 9.3,
    example_prompt:
      "Third-person Minecraft footage of a player standing in a sunflower plains biome at sunset. In the distant tree line, a tall dark figure stands motionless between two oak trees. Vanilla Minecraft 1.20. Grainy VHS filter, heavy film grain, muted warm tones shifting to cold blue near the tree line. Slow zoom toward the figure. Analog horror aesthetic. 4K render, volumetric fog, depth of field blur on foreground flowers.",
    example_caption: "Day 112: it followed me to a new world",
  },
  {
    pattern_type: "world_glitch",
    scene_type: "glitch",
    avg_engagement: 7.8,
    avg_shares: 5100,
    performance_score: 8.0,
    example_prompt:
      "Screen-recorded Minecraft gameplay showing a plains biome where chunks are loading incorrectly. Floating grass blocks, water suspended in mid-air, trees growing sideways. Vanilla Minecraft 1.20 textures. VHS tracking distortion, color banding artifacts, slight horizontal tearing. Slow pan across the corrupted landscape. CRT monitor curvature overlay. 4K resolution with intentional compression artifacts.",
    example_caption: "Why does my world look like this after the update?",
  },
  {
    pattern_type: "impossible_structure",
    scene_type: "build",
    avg_engagement: 7.5,
    avg_shares: 3800,
    performance_score: 7.8,
    example_prompt:
      "First-person Minecraft footage discovering a massive obsidian structure in a deep ocean monument that should not exist. The structure has impossible geometry — staircases that loop into themselves, windows showing different biomes. Vanilla Minecraft 1.20. Heavy desaturation, dark teal color grading, underwater caustic lighting. Slow upward tilt revealing the full scale. VHS timestamp overlay in corner. 4K cinematic, volumetric underwater rays.",
    example_caption: "Has anyone else found this structure at Y=-64?",
  },
];

// ---------------------------------------------------------------------------
// Sample Content Queue Items
// ---------------------------------------------------------------------------

const contentQueueItems = [
  {
    concept:
      "An empty village where all the doors have been replaced with obsidian blocks. Beds are still occupied by invisible entities that produce snoring particles.",
    veo_prompt:
      "POV first-person Minecraft footage walking through a village at dusk. Every wooden door has been replaced with obsidian. Inside each house, beds show sleeping particle effects but no villagers are visible. Vanilla Minecraft 1.20 textures. VHS grain overlay, desaturated twilight palette with deep purple sky. Slow walking pace with head-turn camera movement scanning each doorway. Distant wolf howl ambiance. 4K photorealistic lighting, long shadows, volumetric dust motes.",
    caption: "Day 7: the villagers are still here. I can hear them breathing.",
    scene_description:
      "A hauntingly empty village at dusk where obsidian has replaced all doors. Beds show particle effects as if occupied, but no entities are visible. The player walks through scanning each house, finding the same pattern repeated. The atmosphere shifts from curious to unsettling as the scope of the replacement becomes clear.",
    scene_type: "liminal" as const,
    validation_score: 8.5,
    brand_score: 9.0,
    viral_score: 8.8,
    prompt_score: 8.2,
    approved: true,
    status: "approved" as const,
  },
  {
    concept:
      "A player finds their own username on a gravestone in a jungle temple, but the death date is tomorrow.",
    veo_prompt:
      "First-person Minecraft footage entering a jungle temple. The player discovers a sign on a stone brick structure that reads a player name and a date. Close-up on the sign. Shaky handheld camera. Dark interior with single torch light source.",
    caption: "this is so scary and creepy lol jumpscare warning!!",
    scene_description:
      "A player enters a jungle temple and finds a gravestone with their own name. The date of death is set to tomorrow. Generic horror approach with over-explained concept.",
    scene_type: "build" as const,
    validation_score: 3.2,
    brand_score: 2.0,
    viral_score: 4.1,
    prompt_score: 3.5,
    approved: false,
    status: "rejected" as const,
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function seed() {
  console.log("Starting database seed...\n");

  // --- Brand Guidelines ---
  console.log("Inserting brand guidelines...");
  const { data: guidelinesData, error: guidelinesError } = await supabase
    .from("brand_guidelines")
    .insert(brandGuidelines)
    .select();

  if (guidelinesError) {
    console.error("  ERROR inserting brand guidelines:", guidelinesError.message);
  } else {
    console.log(`  Inserted ${guidelinesData.length} brand guidelines`);
    for (const g of guidelinesData) {
      console.log(`    - [${g.category}] ${g.rule.slice(0, 60)}...`);
    }
  }

  // --- Viral Patterns ---
  console.log("\nInserting viral patterns...");
  const { data: patternsData, error: patternsError } = await supabase
    .from("viral_patterns")
    .insert(viralPatterns)
    .select();

  if (patternsError) {
    console.error("  ERROR inserting viral patterns:", patternsError.message);
  } else {
    console.log(`  Inserted ${patternsData.length} viral patterns`);
    for (const p of patternsData) {
      console.log(
        `    - [${p.pattern_type}] score=${p.performance_score} shares=${p.avg_shares}`
      );
    }
  }

  // --- Content Queue ---
  console.log("\nInserting sample content queue items...");
  const { data: contentData, error: contentError } = await supabase
    .from("content_queue")
    .insert(contentQueueItems)
    .select();

  if (contentError) {
    console.error(
      "  ERROR inserting content queue items:",
      contentError.message
    );
  } else {
    console.log(`  Inserted ${contentData.length} content queue items`);
    for (const c of contentData) {
      const label = c.approved ? "APPROVED" : "REJECTED";
      console.log(
        `    - [${label}] brand=${c.brand_score} viral=${c.viral_score} "${c.caption.slice(0, 50)}..."`
      );
    }
  }

  // --- Summary ---
  console.log("\n--- Seed Summary ---");
  console.log(
    `Brand guidelines: ${guidelinesError ? "FAILED" : `${guidelinesData!.length} inserted`}`
  );
  console.log(
    `Viral patterns:   ${patternsError ? "FAILED" : `${patternsData!.length} inserted`}`
  );
  console.log(
    `Content queue:    ${contentError ? "FAILED" : `${contentData!.length} inserted`}`
  );

  const hasErrors = guidelinesError || patternsError || contentError;
  if (hasErrors) {
    console.error("\nSeed completed with errors.");
    process.exit(1);
  } else {
    console.log("\nSeed completed successfully.");
  }
}

seed().catch((err) => {
  console.error("Unexpected error during seed:", err);
  process.exit(1);
});
