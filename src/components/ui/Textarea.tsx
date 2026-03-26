import { forwardRef, TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  maxLength?: number
  currentLength?: number
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, maxLength, currentLength, className = '', id, ...props },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-secondary"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          ref={ref}
          id={inputId}
          className={[
            'w-full bg-surface border rounded-xl px-4 py-3',
            'text-sm text-text-primary placeholder:text-text-muted',
            'resize-none [transition:border-color_200ms_ease,box-shadow_200ms_ease]',
            error
              ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
              : 'border-border focus:border-accent focus:ring-1 focus:ring-accent/30',
            'focus:outline-none',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {maxLength !== undefined && (
          <div
            className={[
              'absolute bottom-3 right-3 text-xs tabular-nums',
              (currentLength ?? 0) >= maxLength
                ? 'text-red-400'
                : (currentLength ?? 0) >= maxLength * 0.85
                ? 'text-amber-400'
                : 'text-text-muted',
            ].join(' ')}
          >
            {currentLength ?? 0}/{maxLength}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  )
})
