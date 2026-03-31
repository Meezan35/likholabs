interface PerformanceReasonsProps {
  reasons: string[]
}

export function PerformanceReasons({ reasons }: PerformanceReasonsProps) {
  if (!reasons.length) return null

  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-4">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2.5">
        Why this performs well
      </p>
      <ul className="flex flex-col gap-1.5">
        {reasons.map((reason, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
            <span className="text-emerald-400 shrink-0 mt-0.5" aria-hidden>✔</span>
            {reason}
          </li>
        ))}
      </ul>
    </div>
  )
}
