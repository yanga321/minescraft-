import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function validateBrandCompliance(
  concept: string,
  caption: string
): Promise<{ score: number; feedback: string }> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are evaluating Minecraft horror content for brand compliance.

BRAND RULES:
- Cryptic, mysterious tone
- No over-explaining
- Forbidden words: scary, creepy, jumpscare, horror, terrifying, spooky
- Analog horror aesthetic
- POV or Day X caption format

Rate 1-10 how well the content follows brand rules.
Return ONLY a JSON object: { "score": number, "feedback": "brief explanation" }`,
      },
      {
        role: "user",
        content: `Concept: ${concept}\nCaption: ${caption}`,
      },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  return JSON.parse(content || '{"score": 0, "feedback": "Failed to parse"}');
}

export async function validateViralPotential(
  sceneDescription: string
): Promise<{ score: number; feedback: string }> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a TikTok/YouTube Shorts viral content analyst.

Evaluate viral potential based on:
- Hook strength (first 2 seconds)
- Scroll-stopping power
- Shareability factor
- Creates curiosity/unease
- Watch completion likelihood

Rate 1-10 for viral potential.
Return ONLY a JSON object: { "score": number, "feedback": "brief explanation" }`,
      },
      {
        role: "user",
        content: `Scene: ${sceneDescription}`,
      },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  return JSON.parse(content || '{"score": 0, "feedback": "Failed to parse"}');
}

export async function generateConcepts(
  viralPatterns: Array<{ pattern_type: string; example_prompt: string; example_caption: string }>
): Promise<
  Array<{
    concept: string;
    veo_prompt: string;
    caption: string;
    scene_description: string;
    scene_type: string;
  }>
> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You generate Minecraft horror content concepts inspired by viral patterns.

Each concept must include:
- concept: A brief description
- veo_prompt: A detailed video generation prompt (60+ words, include POV/camera, Minecraft version, lighting, color grading, camera movement, visual effects, quality modifier)
- caption: Cryptic caption under 100 characters (POV: or Day X: format)
- scene_description: Detailed scene description
- scene_type: One of "liminal", "entity", "glitch", "build"

Return a JSON array of 2 concepts.`,
      },
      {
        role: "user",
        content: `Generate concepts inspired by these patterns:\n${JSON.stringify(viralPatterns, null, 2)}`,
      },
    ],
    temperature: 0.8,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  const parsed = JSON.parse(content || '{"concepts": []}');
  return parsed.concepts || parsed;
}

export default openai;
