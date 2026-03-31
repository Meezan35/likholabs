'use client'

import { useState, useCallback, useMemo } from 'react'
import { PlatformTabs } from './PlatformTabs'
import { ContentCard } from './ContentCard'
import { ScoreBreakdown } from './ScoreBreakdown'
import { PerformanceReasons } from './PerformanceReasons'
import { StreamingPreview } from './StreamingPreview'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ResultsSkeleton } from '@/components/ui/Skeleton'
import { useClipboard } from '@/hooks/useClipboard'
import type { GenerateResult, GenerateStatus, Platform, Tone } from '@/types'

interface ContentSectionProps {
  result: GenerateResult | null
  status: GenerateStatus
  tone: Tone
  streamBuffer?: string
  onRegenerateAll: () => void
}

export function ContentSection({ result, status, tone, streamBuffer, onRegenerateAll }: ContentSectionProps) {
  const [activePlatform, setActivePlatform] = useState<Platform>('linkedin')
  const { copy, copiedId } = useClipboard()

  const activeVariations = useMemo(() => {
    if (!result) return []
    return result[activePlatform].variations
  }, [result, activePlatform])

  const allContent = useMemo(() => {
    if (!result) return ''
    return result[activePlatform].variations.join('\n\n---\n\n')
  }, [result, activePlatform])

  const isCopiedAll = copiedId === allContent.slice(0, 40)

  const handleCopyAll = useCallback(() => {
    if (!allContent) return
    copy(allContent)
  }, [allContent, copy])

  if (status === 'loading') return <ResultsSkeleton />
  if (status === 'streaming') return <StreamingPreview buffer={streamBuffer ?? ''} />
  if (!result) return null

  const score = result.engagement_score

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-text-primary">Generated Content</h2>
          <Badge
            variant={score >= 75 ? 'success' : score >= 50 ? 'accent' : 'warning'}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            {score}/100 engagement
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopyAll}>
            {isCopiedAll ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy All
              </>
            )}
          </Button>
          <Button variant="secondary" size="sm" onClick={onRegenerateAll}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Regenerate All
          </Button>
        </div>
      </div>

      {result.score_breakdown && (
        <ScoreBreakdown score={score} breakdown={result.score_breakdown} />
      )}

      <PlatformTabs active={activePlatform} onChange={setActivePlatform} />

      {result.hooks.length > 0 && (
        <div className="rounded-xl border border-border-subtle bg-surface p-4">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2.5">Suggested Hooks</p>
          <ul className="flex flex-col gap-1.5">
            {result.hooks.map((hook, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="text-accent shrink-0 mt-0.5">›</span>
                {hook}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {activeVariations.map((content, i) => (
          <ContentCard
            key={`${activePlatform}-${i}`}
            index={i}
            content={content}
            platform={activePlatform}
            tone={tone}
          />
        ))}
      </div>

      {result.performance_reasons?.length > 0 && (
        <PerformanceReasons reasons={result.performance_reasons} />
      )}

      {result.hashtags.length > 0 && (
        <div className="rounded-xl border border-border-subtle bg-surface p-4">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2.5">Suggested Hashtags</p>
          <div className="flex flex-wrap gap-1.5">
            {result.hashtags.map((tag, i) => (
              <button
                key={i}
                onClick={() => copy(tag)}
                className="px-2.5 py-1 text-xs rounded-lg bg-card border border-border text-text-accent hover:bg-card-hover hover:border-accent/30 transition-colors duration-150 cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
