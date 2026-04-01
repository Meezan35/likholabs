import Link from 'next/link'
import { auth, currentUser } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import { ThemeToggle } from './ThemeToggle'
import { getUserPlan, getUsage, FREE_LIMITS, currentMonth } from '@/lib/usage'

export async function Header() {
  const { userId } = await auth()
  const user = userId ? await currentUser() : null

  let plan: string | null = null
  let usageCount = 0

  if (userId) {
    plan = await getUserPlan(userId)
    if (plan === 'free') {
      const usage = await getUsage(userId, currentMonth())
      usageCount = usage.generations
    }
  }

  const remaining = FREE_LIMITS.generations - usageCount
  const displayName =
    user?.firstName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress?.split('@')[0] ||
    null

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-emerald-500 flex items-center justify-center shrink-0">
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
        </Link>

        <div className="flex items-center gap-3">
          {userId && plan === 'free' && (
            <>
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-text-muted">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${remaining > 5 ? 'bg-emerald-400' : remaining > 0 ? 'bg-amber-400' : 'bg-red-400'}`}
                  aria-hidden
                />
                {remaining > 0 ? `${remaining} generations left` : 'Limit reached'}
              </span>
              <Link
                href="/pricing"
                className="hidden sm:inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors"
              >
                Upgrade
              </Link>
            </>
          )}

          {userId && plan === 'pro' && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              PRO
            </span>
          )}

          {!userId && (
            <Link
              href="/sign-in"
              className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Sign in
            </Link>
          )}

          <ThemeToggle />

          {userId && (
            <>
              {displayName && (
                <span className="hidden sm:inline text-xs font-medium text-text-secondary">
                  Hi, {displayName}
                </span>
              )}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-7 h-7',
                  },
                }}
              />
            </>
          )}
        </div>
      </div>
    </header>
  )
}
