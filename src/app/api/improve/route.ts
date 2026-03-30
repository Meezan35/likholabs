import { getOpenAIClient, OPENAI_MODEL } from '@/lib/openai'
import { buildImproveUserPrompt, IMPROVE_SYSTEM_PROMPT } from '@/lib/prompts'
import { validateImproveInput, safeParseJSON } from '@/lib/validators'
import type { ImproveResult } from '@/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request): Promise<Response> {
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

    return Response.json({ improved: parsed.improved })
  } catch {
    return Response.json({ error: 'Improvement failed' }, { status: 500 })
  }
}
