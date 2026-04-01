import { after } from 'next/server'
import { cookies } from 'next/headers'
import { auth } from '@clerk/nextjs/server'
import { getOpenAIClient, OPENAI_MODEL } from '@/lib/openai'
import { buildImproveUserPrompt, IMPROVE_SYSTEM_PROMPT } from '@/lib/prompts'
import { validateImproveInput, safeParseJSON } from '@/lib/validators'
import { ratelimit } from '@/lib/ratelimit'
import {
  getUserPlan,
  getUsage,
  incrementUsage,
  ensureUserExists,
  FREE_LIMITS,
  ANON_LIMIT,
  currentMonth,
} from '@/lib/usage'
import type { ImproveResult } from '@/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request): Promise<Response> {
  // 1. Rate limit by IP
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  const { success: rateLimitOk } = await ratelimit.limit(ip)
  if (!rateLimitOk) {
    return Response.json(
      { error: 'Too many requests. Please slow down.', code: 'RATE_LIMITED' },
      { status: 429 },
    )
  }

  // 2. Validate body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const validation = validateImproveInput(body)
  if (!validation.valid || !validation.sanitized) {
    return Response.json({ error: validation.reason ?? 'Invalid input' }, { status: 400 })
  }

  const input = validation.sanitized

  // 3. Auth + usage gate
  const { userId } = await auth()
  const cookieStore = await cookies()

  if (!userId) {
    // Anonymous path — reuse the same anon_uses counter as generate
    const anonUses = parseInt(cookieStore.get('anon_uses')?.value ?? '0', 10)
    if (anonUses >= ANON_LIMIT) {
      return Response.json(
        { error: 'Sign in to continue improving content.', code: 'SIGN_IN_REQUIRED' },
        { status: 401 },
      )
    }
  } else {
    // Authenticated path
    const cookieEmail = cookieStore.get('anon_email')?.value
    await ensureUserExists(userId, cookieEmail ?? '')

    const plan = await getUserPlan(userId)
    if (plan === 'free') {
      const month = currentMonth()
      const usage = await getUsage(userId, month)
      if (usage.improves >= FREE_LIMITS.improves) {
        return Response.json(
          { error: 'Monthly limit reached. Upgrade to Pro to continue.', code: 'UPGRADE_REQUIRED' },
          { status: 402 },
        )
      }
    }
  }

  // 4. Get OpenAI client
  let openai: ReturnType<typeof getOpenAIClient>
  try {
    openai = getOpenAIClient()
  } catch {
    return Response.json({ error: 'AI service is not configured' }, { status: 503 })
  }

  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 800,
      messages: [
        { role: 'system', content: IMPROVE_SYSTEM_PROMPT },
        { role: 'user', content: buildImproveUserPrompt(input) },
      ],
    })

    const rawText = completion.choices[0]?.message?.content ?? ''
    const parsed = safeParseJSON<ImproveResult>(rawText)

    if (!parsed?.improved) {
      return Response.json({ error: 'Failed to improve content' }, { status: 500 })
    }

    // Schedule usage increment after response
    if (userId) {
      const month = currentMonth()
      after(async () => {
        try {
          await incrementUsage(userId, month, 'improves')
        } catch (err) {
          console.error('Failed to increment improve usage', err)
        }
      })
    }

    return Response.json({ improved: parsed.improved })
  } catch {
    return Response.json({ error: 'Improvement failed' }, { status: 500 })
  }
}
