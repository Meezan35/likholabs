'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface UpgradeButtonProps {
  isSignedIn: boolean
  billingEnabled: boolean
}

export function UpgradeButton({ isSignedIn, billingEnabled }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleClick = async () => {
    if (!billingEnabled) {
      return
    }

    if (!isSignedIn) {
      router.push('/sign-up')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = (await res.json()) as { url?: string; error?: string }
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading || !billingEnabled}
      className="w-full rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {!billingEnabled
        ? 'Billing coming soon'
        : loading
          ? 'Redirecting to checkout...'
          : isSignedIn
            ? 'Upgrade to Pro'
            : 'Get started'}
    </button>
  )
}
