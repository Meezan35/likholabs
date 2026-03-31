'use client'

import { useState, useCallback, useRef } from 'react'
import type { GenerateInput, GenerateResult, GenerateStatus } from '@/types'
import { safeParseJSON } from '@/lib/client-utils'

interface UseGenerateReturn {
  status: GenerateStatus
  result: GenerateResult | null
  error: string | null
  streamBuffer: string
  generate: (input: GenerateInput, skipCache?: boolean) => Promise<void>
  reset: () => void
}

function getCacheKey(input: GenerateInput): string {
  return `likholabs:${input.idea.trim().toLowerCase()}:${input.tone}:${input.audience}`
}

function readCache(key: string): GenerateResult | null {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { data: GenerateResult; ts: number }
    if (Date.now() - parsed.ts > 10 * 60 * 1000) {
      sessionStorage.removeItem(key)
      return null
    }
    return parsed.data
  } catch {
    return null
  }
}

function writeCache(key: string, data: GenerateResult): void {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }))
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export function useGenerate(): UseGenerateReturn {
  const [status, setStatus] = useState<GenerateStatus>('idle')
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [streamBuffer, setStreamBuffer] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setStatus('idle')
    setResult(null)
    setError(null)
    setStreamBuffer('')
  }, [])

  const generate = useCallback(async (input: GenerateInput, skipCache = false) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const cacheKey = getCacheKey(input)
    if (!skipCache) {
      const cached = readCache(cacheKey)
      if (cached) {
        setResult(cached)
        setStatus('success')
        setError(null)
        return
      }
    }

    setStatus('loading')
    setError(null)
    setStreamBuffer('')
    setResult(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: controller.signal,
      })

      if (!response.ok) {
        const errData = (await response.json()) as { error?: string }
        throw new Error(errData.error ?? `Request failed (${response.status})`)
      }

      if (!response.body) {
        throw new Error('No response stream available')
      }

      setStatus('streaming')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      let lastUpdate = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        accumulated += chunk
        const now = Date.now()
        if (now - lastUpdate >= 50) {
          setStreamBuffer(accumulated)
          lastUpdate = now
        }
      }
      setStreamBuffer(accumulated)

      const parsed = safeParseJSON<GenerateResult>(accumulated)
      if (!parsed) {
        throw new Error('Failed to parse AI response. Please try again.')
      }

      writeCache(cacheKey, parsed)
      setResult(parsed)
      setStatus('success')
      setStreamBuffer('')
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      setStatus('error')
      setStreamBuffer('')
    }
  }, [])

  return { status, result, error, streamBuffer, generate, reset }
}
