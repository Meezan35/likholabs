import type { ImproveInput, ValidationResult, Tone, Audience, Platform } from '@/types'
export { safeParseJSON } from '@/lib/client-utils'

const VALID_TONES: Tone[] = ['professional', 'casual', 'funny', 'sales']
const VALID_AUDIENCES: Audience[] = ['developers', 'founders', 'general']
const VALID_PLATFORMS: Platform[] = ['linkedin', 'twitter', 'instagram']

const MAX_IDEA_LENGTH = 500
const MAX_CONTENT_LENGTH = 3000
const MAX_INSTRUCTION_LENGTH = 200

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim()
}

function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return ''
  return stripHtml(input).slice(0, MAX_IDEA_LENGTH * 2)
}

export function validateGenerateInput(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return { valid: false, reason: 'Invalid request body' }
  }

  const raw = body as Record<string, unknown>

  const idea = sanitizeString(raw.idea)
  if (!idea) {
    return { valid: false, reason: 'Idea is required' }
  }
  if (idea.length > MAX_IDEA_LENGTH) {
    return { valid: false, reason: `Idea must be ${MAX_IDEA_LENGTH} characters or fewer` }
  }

  const tone = raw.tone as string
  if (!VALID_TONES.includes(tone as Tone)) {
    return { valid: false, reason: 'Invalid tone value' }
  }

  const audience = raw.audience as string
  if (!VALID_AUDIENCES.includes(audience as Audience)) {
    return { valid: false, reason: 'Invalid audience value' }
  }

  return {
    valid: true,
    sanitized: { idea, tone: tone as Tone, audience: audience as Audience },
  }
}

export function validateImproveInput(body: unknown): { valid: boolean; reason?: string; sanitized?: ImproveInput } {
  if (!body || typeof body !== 'object') {
    return { valid: false, reason: 'Invalid request body' }
  }

  const raw = body as Record<string, unknown>

  const content = sanitizeString(raw.content)
  if (!content) {
    return { valid: false, reason: 'Content is required' }
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return { valid: false, reason: `Content must be ${MAX_CONTENT_LENGTH} characters or fewer` }
  }

  const platform = raw.platform as string
  if (!VALID_PLATFORMS.includes(platform as Platform)) {
    return { valid: false, reason: 'Invalid platform value' }
  }

  const tone = raw.tone as string
  if (!VALID_TONES.includes(tone as Tone)) {
    return { valid: false, reason: 'Invalid tone value' }
  }

  let instruction: string | undefined
  if (raw.instruction !== undefined) {
    instruction = sanitizeString(raw.instruction).slice(0, MAX_INSTRUCTION_LENGTH) || undefined
  }

  return {
    valid: true,
    sanitized: {
      content,
      platform: platform as Platform,
      tone: tone as Tone,
      instruction,
    },
  }
}

