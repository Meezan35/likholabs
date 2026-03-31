import type { ScoreBreakdown as ScoreBreakdownType } from '@/types'

interface ScoreBreakdownProps {
  score: number
  breakdown: ScoreBreakdownType
}

const metrics: { key: keyof ScoreBreakdownType; label: string }[] = [
  { key: 'hook', label: 'Hook' },
  { key: 'clarity', label: 'Clarity' },
  { key: 'readability', label: 'Readability' },
]

function getBarStyle(value: number): React.CSSProperties {
  if (value >= 75)
    return { background: 'linear-gradient(90deg, #14b8a6, #10b981)', width: `${value}%` }
  if (value >= 50)
    return { background: 'linear-gradient(90deg, #f59e0b, #14b8a6)', width: `${value}%` }
  return { background: 'linear-gradient(90deg, #ef4444, #f59e0b)', width: `${value}%` }
}

function getLabelColor(value: number): string {
  if (value >= 75) return 'text-emerald-400'
  if (value >= 50) return 'text-text-accent'
  return 'text-amber-400'
}

export function ScoreBreakdown({ score, breakdown }: ScoreBreakdownProps) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Score Breakdown</p>
        <span className={`text-sm font-semibold tabular-nums ${getLabelColor(score)}`}>
          {score}/100
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        {metrics.map(({ key, label }) => {
          const value = breakdown[key]
          return (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xs text-text-secondary w-20 shrink-0">{label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-card overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={getBarStyle(value)}
                />
              </div>
              <span className={`text-xs tabular-nums w-8 text-right shrink-0 ${getLabelColor(value)}`}>
                {value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
