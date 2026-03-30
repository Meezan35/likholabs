import 'server-only'
import type { GenerateInput, ImproveInput } from '@/types'

export const GENERATE_SYSTEM_PROMPT = `You are an expert social media strategist and copywriter with 10+ years of experience crafting viral, platform-optimized content for SaaS companies and tech brands.

Your output MUST be a single valid JSON object — no markdown, no prose, no code fences.`

export function buildGenerateUserPrompt(input: GenerateInput): string {
  return `Create social media content for the following:

Idea: ${input.idea}
Tone: ${input.tone}
Target audience: ${input.audience}

Return a JSON object matching EXACTLY this schema (no extra keys, no markdown):
{
  "linkedin": {
    "variations": [
      "<variation 1 — 1200–1500 chars, storytelling format with line breaks>",
      "<variation 2 — 800–1000 chars, insight-driven>",
      "<variation 3 — 600–800 chars, direct and punchy>"
    ]
  },
  "twitter": {
    "variations": [
      "<variation 1 — max 280 chars, hook-driven>",
      "<variation 2 — max 280 chars, question or stat-led>",
      "<variation 3 — max 280 chars, contrarian take>"
    ]
  },
  "instagram": {
    "variations": [
      "<variation 1 — 150–300 chars caption + emojis, inspirational>",
      "<variation 2 — 100–200 chars, bold statement>",
      "<variation 3 — 200–300 chars, behind-the-scenes feel>"
    ]
  },
  "hooks": [
    "<attention-grabbing opening line 1>",
    "<attention-grabbing opening line 2>",
    "<attention-grabbing opening line 3>"
  ],
  "hashtags": [
    "#tag1", "#tag2", "#tag3", "#tag4", "#tag5",
    "#tag6", "#tag7", "#tag8", "#tag9", "#tag10"
  ],
  "engagement_score": <integer 0–100 reflecting predicted virality>
}

Tailor all content to the "${input.tone}" tone and "${input.audience}" audience. Be specific, original, and platform-native.`
}

export const IMPROVE_SYSTEM_PROMPT = `You are a world-class social media editor. You receive content and improve it based on the user's instruction while preserving its core message and platform constraints.

Return only a JSON object — no markdown, no prose.`

export function buildImproveUserPrompt(input: ImproveInput): string {
  const platformGuide: Record<string, string> = {
    linkedin: 'LinkedIn (professional, up to 3000 chars)',
    twitter: 'Twitter/X (max 280 chars)',
    instagram: 'Instagram (caption, 150–300 chars, emojis welcome)',
  }

  const guide = platformGuide[input.platform] ?? input.platform

  return `Improve the following ${guide} content.
Tone: ${input.tone}
${input.instruction ? `Specific instruction: ${input.instruction}` : 'Make it more engaging, clearer, and impactful.'}

Original content:
"""
${input.content}
"""

Return exactly: { "improved": "<improved content string>" }`
}
