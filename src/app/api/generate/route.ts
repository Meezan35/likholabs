import { after } from 'next/server'
import { cookies } from 'next/headers'
import { auth } from '@clerk/nextjs/server'
import { getOpenAIClient, OPENAI_MODEL } from '@/lib/openai'
import { buildGenerateUserPrompt, GENERATE_SYSTEM_PROMPT } from '@/lib/prompts'
import { validateGenerateInput } from '@/lib/validators'
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

  const validation = validateGenerateInput(body)
  if (!validation.valid || !validation.sanitized) {
    return Response.json({ error: validation.reason ?? 'Invalid input' }, { status: 400 })
  }

  const input = validation.sanitized

  // 3. Auth + usage gate
  const { userId } = await auth()
  const cookieStore = await cookies()

  let newAnonUses: number | null = null

  if (!userId) {
    // Anonymous path — cookie gate
    const anonUses = parseInt(cookieStore.get('anon_uses')?.value ?? '0', 10)
    if (anonUses >= ANON_LIMIT) {
      return Response.json(
        { error: 'Sign in to continue generating content.', code: 'SIGN_IN_REQUIRED' },
        { status: 401 },
      )
    }
    newAnonUses = anonUses + 1
  } else {
    // Authenticated path — ensure user row exists, then check plan limits
    const cookieEmail = cookieStore.get('anon_email')?.value
    await ensureUserExists(userId, cookieEmail ?? '')

    const plan = await getUserPlan(userId)
    if (plan === 'free') {
      const month = currentMonth()
      const usage = await getUsage(userId, month)
      if (usage.generations >= FREE_LIMITS.generations) {
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

  // 5. Schedule usage increment (runs after response is sent)
  if (userId) {
    const month = currentMonth()
    after(async () => {
      try {
        await incrementUsage(userId, month, 'generations')
      } catch (err) {
        console.error('Failed to increment generation usage', err)
      }
    })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const openaiStream = await openai.chat.completions.create({
          model: OPENAI_MODEL,
          response_format: { type: 'json_object' },
          stream: true,
          temperature: 0.8,
          max_tokens: 2500,
          messages: [
            { role: 'system', content: GENERATE_SYSTEM_PROMPT },
            { role: 'user', content: buildGenerateUserPrompt(input) },
          ],
        })

        for await (const chunk of openaiStream) {
          const delta = chunk.choices[0]?.delta?.content
          if (delta) {
            controller.enqueue(encoder.encode(delta))
          }
        }
      } catch {
        controller.enqueue(encoder.encode(JSON.stringify({ error: 'Generation failed' })))
      } finally {
        controller.close()
      }
    },
  })

  // Build response headers — set anon cookie here since we can't set it after streaming starts
  const responseHeaders: Record<string, string> = {
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Accel-Buffering': 'no',
    'Cache-Control': 'no-cache, no-store',
    'Transfer-Encoding': 'chunked',
  }

  if (newAnonUses !== null) {
    const maxAge = 365 * 24 * 60 * 60
    responseHeaders[
      'Set-Cookie'
    ] = `anon_uses=${newAnonUses}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`
  }

  return new Response(stream, { headers: responseHeaders })
}
