'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { InputSection } from './InputSection'
import type { GenerateInput, Tone } from '@/types'
import { useGenerate } from '@/hooks/useGenerate'
import { Modal } from '@/components/ui/Modal'

const ContentSection = dynamic(
  () => import('./ContentSection').then((m) => m.ContentSection),
  { ssr: false }
)

export function GeneratorClient() {
  const { status, result, error, errorCode, streamBuffer, generationSyncTick, generate, reset } =
    useGenerate()
  const [lastTone, setLastTone] = useState<Tone>('professional')
  const [lastInput, setLastInput] = useState<GenerateInput | null>(null)
  const [upgradeLoading, setUpgradeLoading] = useState(false)
  const [upgradeNotice, setUpgradeNotice] = useState<string | null>(null)
  const billingEnabled = process.env.NEXT_PUBLIC_BILLING_ENABLED === 'true'
  const router = useRouter()
  const searchParams = useSearchParams()
  const didConfirmRef = useRef(false)

  useEffect(() => {
    const upgrade = searchParams.get('upgrade')
    const sessionId = searchParams.get('session_id')

    if (upgrade !== 'success' || !sessionId || didConfirmRef.current) {
      return
    }

    didConfirmRef.current = true

    ;(async () => {
      try {
        const res = await fetch('/api/stripe/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })
        if (res.ok) {
          setUpgradeNotice('Upgrade successful. Your Pro plan is now active.')
        } else {
          setUpgradeNotice('Checkout completed, but plan sync is still pending. Refresh in a few seconds.')
        }
      } finally {
        router.replace('/')
        router.refresh()
      }
    })()
  }, [searchParams, router])

  useEffect(() => {
    if (generationSyncTick > 0) {
      router.refresh()
    }
  }, [generationSyncTick, router])

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

  const handleUpgrade = useCallback(async () => {
    if (!billingEnabled) {
      setUpgradeNotice('Billing is temporarily unavailable. Please try again later.')
      return
    }

    setUpgradeLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = (await res.json()) as { url?: string; error?: string }
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      // silently fail — user stays on page
    } finally {
      setUpgradeLoading(false)
    }
  }, [billingEnabled])

  const showSignInModal = errorCode === 'SIGN_IN_REQUIRED'
  const showUpgradeModal = errorCode === 'UPGRADE_REQUIRED'

  return (
    <>
      <div className="flex flex-col gap-6">
        {upgradeNotice && (
          <div
            role="status"
            className="flex items-start justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3"
          >
            <p className="text-sm text-emerald-300">{upgradeNotice}</p>
            <button
              onClick={() => setUpgradeNotice(null)}
              className="text-xs text-emerald-300/90 hover:text-emerald-200 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        <InputSection onGenerate={handleGenerate} status={status} />

        {error && !showSignInModal && !showUpgradeModal && (
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

      {/* Sign In Required Modal */}
      <Modal open={showSignInModal} onClose={reset}>
        <div className="p-6 flex flex-col gap-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-accent-muted flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-accent" aria-hidden>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">Free limit reached</h2>
            <p className="text-sm text-text-secondary">
              You&apos;ve used your 3 free generations. Create a free account to get 15 generations per month.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => router.push('/sign-up')}
              className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
            >
              Create free account
            </button>
            <button
              onClick={() => router.push('/sign-in')}
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-surface transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={reset}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors mt-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      </Modal>

      {/* Upgrade Required Modal */}
      <Modal open={showUpgradeModal} onClose={reset}>
        <div className="p-6 flex flex-col gap-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400" aria-hidden>
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">Monthly limit reached</h2>
            <p className="text-sm text-text-secondary">
              You&apos;ve used all 15 free generations this month. Upgrade to Pro for unlimited access.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleUpgrade}
              disabled={upgradeLoading || !billingEnabled}
              className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {!billingEnabled ? 'Billing coming soon' : upgradeLoading ? 'Redirecting...' : 'Upgrade to Pro'}
            </button>
            <button
              onClick={reset}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors mt-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
