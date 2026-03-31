'use client'

import { useState, useCallback, useId } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import type { GenerateInput, Tone, Audience, GenerateStatus } from '@/types'

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'funny', label: 'Funny' },
  { value: 'sales', label: 'Sales' },
]

const AUDIENCE_OPTIONS = [
  { value: 'general', label: 'General Audience' },
  { value: 'developers', label: 'Developers' },
  { value: 'founders', label: 'Founders' },
]

const MAX_IDEA_LENGTH = 500

interface InputSectionProps {
  onGenerate: (input: GenerateInput) => void
  status: GenerateStatus
}

export function InputSection({ onGenerate, status }: InputSectionProps) {
  const [idea, setIdea] = useState('')
  const [tone, setTone] = useState<Tone>('professional')
  const [audience, setAudience] = useState<Audience>('general')
  const [ideaError, setIdeaError] = useState('')
  const ideaId = useId()

  const isLoading = status === 'loading' || status === 'streaming'

  const handleSubmit = useCallback(() => {
    const trimmed = idea.trim()
    if (!trimmed) {
      setIdeaError('Please describe what you want to post about.')
      return
    }
    if (trimmed.length > MAX_IDEA_LENGTH) {
      setIdeaError(`Keep it under ${MAX_IDEA_LENGTH} characters.`)
      return
    }
    setIdeaError('')
    onGenerate({ idea: trimmed, tone, audience })
  }, [idea, tone, audience, onGenerate])

  const handleIdeaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIdea(e.target.value)
    if (ideaError) setIdeaError('')
  }, [ideaError])

  return (
    <section className="relative overflow-hidden w-full rounded-2xl border border-border bg-card p-6 flex flex-col gap-5 shadow-[var(--shadow-card)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/25 to-transparent" aria-hidden />
      <div>
        <h2 className="text-base font-semibold text-text-primary mb-0.5">What do you want to post about?</h2>
        <p className="text-sm text-text-muted">Describe your idea and we&apos;ll generate platform-optimized content.</p>
      </div>

      <Textarea
        id={ideaId}
        placeholder="e.g. We just launched a new AI feature that helps developers write better documentation automatically..."
        value={idea}
        onChange={handleIdeaChange}
        rows={5}
        maxLength={MAX_IDEA_LENGTH}
        currentLength={idea.length}
        error={ideaError}
        disabled={isLoading}
        className="text-sm leading-relaxed"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Tone"
          options={TONE_OPTIONS}
          value={tone}
          onChange={(e) => setTone(e.target.value as Tone)}
          disabled={isLoading}
        />
        <Select
          label="Target Audience"
          options={AUDIENCE_OPTIONS}
          value={audience}
          onChange={(e) => setAudience(e.target.value as Audience)}
          disabled={isLoading}
        />
      </div>

      <Button
        onClick={handleSubmit}
        loading={isLoading}
        size="lg"
        fullWidth
        disabled={isLoading || !idea.trim()}
        className="font-semibold tracking-wide"
      >
        {isLoading ? (
          status === 'streaming' ? 'Generating content…' : 'Preparing…'
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Generate Content
          </>
        )}
      </Button>
    </section>
  )
}
