'use client'

import { useState, useCallback } from 'react'

interface UseClipboardReturn {
  copy: (text: string) => Promise<void>
  copiedId: string | null
}

export function useClipboard(resetDelay = 2000): UseClipboardReturn {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopiedId(text.slice(0, 40))
        setTimeout(() => setCopiedId(null), resetDelay)
      } catch {
        // Fallback for non-secure contexts
        const el = document.createElement('textarea')
        el.value = text
        el.style.position = 'fixed'
        el.style.opacity = '0'
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
        setCopiedId(text.slice(0, 40))
        setTimeout(() => setCopiedId(null), resetDelay)
      }
    },
    [resetDelay]
  )

  return { copy, copiedId }
}
