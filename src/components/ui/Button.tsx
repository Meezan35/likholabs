import { forwardRef, ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-gradient-to-br from-accent to-emerald-500 text-white ' +
    'hover:from-accent-hover hover:to-emerald-600 ' +
    'shadow-[var(--shadow-glow)] hover:shadow-[var(--shadow-glow-strong)] ' +
    'active:scale-[0.98]',
  secondary:
    'bg-card text-text-primary border border-border hover:bg-card-hover hover:border-border active:scale-[0.98]',
  ghost:
    'text-text-secondary hover:text-text-primary hover:bg-card active:scale-[0.98]',
  danger:
    'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 active:scale-[0.98]',
}

const sizeStyles: Record<Size, string> = {
  sm: 'h-7 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-base gap-2.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    className = '',
    disabled,
    children,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-medium rounded-lg',
        'transition-all duration-150 cursor-pointer select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        'focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin shrink-0"
          width={size === 'sm' ? 12 : size === 'lg' ? 18 : 14}
          height={size === 'sm' ? 12 : size === 'lg' ? 18 : 14}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  )
})
