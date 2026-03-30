import { ThemeToggle } from './ThemeToggle'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white" aria-hidden>
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <span className="font-semibold text-text-primary tracking-tight text-[15px]">
            LikhoLabs
          </span>
          <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded bg-accent-muted text-text-accent border border-accent/20">
            AI
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:block text-xs text-text-muted">
            Social Media Content Generator
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
