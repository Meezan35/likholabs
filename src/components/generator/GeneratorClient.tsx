'use client'

import dynamic from 'next/dynamic'
import { useCallback, useState } from 'react'
import { InputSection } from './InputSection'
import type { GenerateInput, Tone } from '@/types'
import { useGenerate } from '@/hooks/useGenerate'

const ContentSection = dynamic(
  () => import('./ContentSection').then((m) => m.ContentSection),
  { ssr: false }
)

export function GeneratorClient() {
  const { status, result, error, streamBuffer, generate, reset } = useGenerate()
  const [lastTone, setLastTone] = useState<Tone>('professional')
  const [lastInput, setLastInput] = useState<GenerateInput | null>(null)

  const handleGenerate = useCallback(
    (input: GenerateInput) => {
      setLastTone(input.tone)
      setLastInput(input)
      generate(input)
    },
    [generate]
  )

  const handleRegenerateAll = useCallback(() => {
    if (lastInput) {
      reset()
      generate(lastInput, true)
    }
  }, [lastInput, generate, reset])

  return (
    <div className="flex flex-col gap-6">
      <InputSection onGenerate={handleGenerate} status={status} />

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-red-400 shrink-0 mt-0.5"
            aria-hidden
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <ContentSection
        result={result}
        status={status}
        tone={lastTone}
        streamBuffer={streamBuffer}
        onRegenerateAll={handleRegenerateAll}
      />
    </div>
  )
}
