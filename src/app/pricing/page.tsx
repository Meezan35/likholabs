import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { Header } from '@/components/layout/Header'
import { UpgradeButton } from './UpgradeButton'

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent shrink-0 mt-0.5" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default async function PricingPage() {
  const { userId } = await auth()
  const billingEnabled = process.env.BILLING_ENABLED === 'true'

  return (
    <>
      <Header />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mb-2">
            Simple, transparent pricing
          </h1>
          <p className="text-text-secondary text-base">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {/* Free Plan */}
          <div className="rounded-2xl border border-border bg-surface p-6 flex flex-col gap-5">
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Free</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-text-primary">$0</span>
                <span className="text-text-muted text-sm">/ month</span>
              </div>
              <p className="text-sm text-text-secondary mt-1.5">No credit card required</p>
            </div>

            <ul className="flex flex-col gap-2.5 text-sm text-text-secondary flex-1">
              <li className="flex items-start gap-2"><CheckIcon />3 free generations (no account)</li>
              <li className="flex items-start gap-2"><CheckIcon />15 AI generations per month</li>
              <li className="flex items-start gap-2"><CheckIcon />30 content improvements per month</li>
              <li className="flex items-start gap-2"><CheckIcon />LinkedIn, Twitter & Instagram</li>
              <li className="flex items-start gap-2"><CheckIcon />Hooks, hashtags & performance scores</li>
            </ul>

            <Link
              href={userId ? '/' : '/sign-up'}
              className="w-full rounded-xl border border-border px-6 py-3 text-sm font-semibold text-text-primary hover:bg-background transition-colors text-center"
            >
              {userId ? 'Current plan' : 'Get started free'}
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="rounded-2xl border border-accent/40 bg-surface p-6 flex flex-col gap-5 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full bg-accent text-white">
                POPULAR
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold text-text-accent uppercase tracking-wider mb-1">Pro</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-text-primary">$5</span>
                <span className="text-text-muted text-sm">/ month</span>
              </div>
              <p className="text-sm text-text-secondary mt-1.5">Cancel anytime</p>
            </div>

            <ul className="flex flex-col gap-2.5 text-sm text-text-secondary flex-1">
              <li className="flex items-start gap-2"><CheckIcon /><strong className="text-text-primary">Unlimited</strong>&nbsp;AI generations</li>
              <li className="flex items-start gap-2"><CheckIcon /><strong className="text-text-primary">Unlimited</strong>&nbsp;content improvements</li>
              <li className="flex items-start gap-2"><CheckIcon />LinkedIn, Twitter & Instagram</li>
              <li className="flex items-start gap-2"><CheckIcon />Hooks, hashtags & performance scores</li>
              <li className="flex items-start gap-2"><CheckIcon />Priority support</li>
            </ul>

            <UpgradeButton isSignedIn={!!userId} billingEnabled={billingEnabled} />
          </div>
        </div>

        <p className="text-center text-xs text-text-muted mt-8">
          {billingEnabled
            ? 'Payments processed securely by Stripe. Subscriptions renew monthly.'
            : 'Billing is temporarily unavailable while payments are being configured.'}
        </p>
      </main>
    </>
  )
}
