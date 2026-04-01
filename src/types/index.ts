export type Tone = 'professional' | 'casual' | 'funny' | 'sales'
export type Audience = 'developers' | 'founders' | 'general'
export type Platform = 'linkedin' | 'twitter' | 'instagram'

export type GenerateStatus = 'idle' | 'loading' | 'streaming' | 'success' | 'error'

export interface GenerateInput {
  idea: string
  tone: Tone
  audience: Audience
}

export interface PlatformVariations {
  variations: string[]
}

export interface ScoreBreakdown {
  hook: number
  clarity: number
  readability: number
}

export interface GenerateResult {
  linkedin: PlatformVariations
  twitter: PlatformVariations
  instagram: PlatformVariations
  hooks: string[]
  hashtags: string[]
  score_breakdown: ScoreBreakdown
  performance_reasons: string[]
}

export interface ImproveInput {
  content: string
  platform: Platform
  tone: Tone
  instruction?: string
}

export interface ImproveResult {
  improved: string
}

export interface ValidationResult {
  valid: boolean
  reason?: string
  sanitized?: GenerateInput
}

export interface ApiError {
  error: string
  code?: 'SIGN_IN_REQUIRED' | 'UPGRADE_REQUIRED' | 'RATE_LIMITED'
}

export type Plan = 'free' | 'pro'

export interface UserRecord {
  id: string
  email: string
  plan: Plan
  stripe_customer_id: string | null
  created_at: string
}

export interface UsageRecord {
  generations: number
  improves: number
}
