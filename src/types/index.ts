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
  engagement_score: number
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
}
