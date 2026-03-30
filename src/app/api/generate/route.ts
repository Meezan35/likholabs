import { getOpenAIClient, OPENAI_MODEL } from '@/lib/openai'
import { buildGenerateUserPrompt, GENERATE_SYSTEM_PROMPT } from '@/lib/prompts'
import { validateGenerateInput } from '@/lib/validators'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request): Promise<Response> {
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

  let openai: ReturnType<typeof getOpenAIClient>
  try {
    openai = getOpenAIClient()
  } catch {
    return Response.json({ error: 'AI service is not configured' }, { status: 503 })
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

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Accel-Buffering': 'no',
      'Cache-Control': 'no-cache, no-store',
      'Transfer-Encoding': 'chunked',
    },
  })
}
