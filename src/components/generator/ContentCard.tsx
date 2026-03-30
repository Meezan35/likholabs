'use client'

import { memo, useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useClipboard } from '@/hooks/useClipboard'
import type { Platform, Tone } from '@/types'

interface ContentCardProps {
  index: number
  content: string
  platform: Platform
  tone: Tone
}

const CHAR_LIMITS: Record<Platform, number> = {
  linkedin: 3000,
  twitter: 280,
  instagram: 2200,
}

const VARIANT_LABELS = ['Variation A', 'Variation B', 'Variation C']

function getEngagementColor(ratio: number): string {
  if (ratio > 0.9) return 'text-red-400'
  if (ratio > 0.75) return 'text-amber-400'
  return 'text-text-muted'
}

export const ContentCard = memo(function ContentCard({
  index,
  content: initialContent,
  platform,
  tone,
}: ContentCardProps) {
  const [content, setContent] = useState(initialContent)
  const [isImproving, setIsImproving] = useState(false)
  const [improveError, setImproveError] = useState('')
  const { copy, copiedId } = useClipboard()

  const limit = CHAR_LIMITS[platform]
  const charRatio = content.length / limit
  const isCopied = copiedId === content.slice(0, 40)

  const handleCopy = useCallback(() => {
    copy(content)
  }, [content, copy])

  const handleImprove = useCallback(async () => {
    setIsImproving(true)
    setImproveError('')
    try {
      const res = await fetch('/api/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, platform, tone }),
      })
      const data = (await res.json()) as { improved?: string; error?: string }
      if (!res.ok || !data.improved) {
        throw new Error(data.error ?? 'Improvement failed')
      }
      setContent(data.improved)
    } catch (err) {
      setImproveError(err instanceof Error ? err.message : 'Failed to improve')
    } finally {
      setIsImproving(false)
    }
  }, [content, platform, tone])

  return (
    <article className="rounded-2xl border border-border bg-card hover:bg-card-hover transition-colors duration-150 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] flex flex-col">
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border-subtle">
        <Badge variant="default">{VARIANT_LABELS[index] ?? `Variation ${index + 1}`}</Badge>
        <button
          onClick={handleCopy}
          className={[
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium',
            'border transition-all duration-150 cursor-pointer',
            isCopied
              ? 'bg-accent-muted text-text-accent border-accent/30'
              : 'bg-surface text-text-secondary border-border hover:text-text-primary hover:border-border',
          ].join(' ')}
          aria-label="Copy to clipboard"
        >
          {isCopied ? (
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
              Copy
            </>
          )}
        </button>
      </div>

      <div className="px-5 py-4 flex-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-transparent text-sm text-text-primary leading-relaxed resize-none focus:outline-none placeholder:text-text-muted"
          rows={Math.max(4, content.split('\n').length + 1)}
          spellCheck
          aria-label={`${VARIANT_LABELS[index]} content`}
        />
      </div>

      <div className="flex items-center justify-between px-5 pb-4 pt-2 border-t border-border-subtle">
        <span className={['text-xs tabular-nums font-mono', getEngagementColor(charRatio)].join(' ')}>
          {content.length}/{limit}
          {charRatio > 1 && (
            <span className="ml-1.5 text-red-400 font-sans normal-nums font-normal">over limit</span>
          )}
        </span>

        <div className="flex items-center gap-2">
          {improveError && (
            <span className="text-xs text-red-400 max-w-[180px] truncate" title={improveError}>
              {improveError}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleImprove}
            loading={isImproving}
            disabled={isImproving}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Improve
          </Button>
        </div>
      </div>
    </article>
  )
})
