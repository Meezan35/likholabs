import { Header } from '@/components/layout/Header'
import { GeneratorClient } from '@/components/generator/GeneratorClient'

export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mb-2">
            Create content that{' '}
            <span className="bg-gradient-to-r from-accent to-emerald-400 bg-clip-text text-transparent">
              converts
            </span>
          </h1>
          <p className="text-text-secondary text-base">
            Describe your idea and get AI-generated posts optimized for LinkedIn, Twitter/X, and Instagram — ready to publish.
          </p>
        </div>
        <GeneratorClient />
      </main>

      <footer className="border-t border-border py-5">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 flex items-center justify-between gap-4">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} LikhoLabs. All rights reserved.
          </p>
          <p className="text-xs text-text-muted">
            Powered by OpenAI
          </p>
        </div>
      </footer>
    </>
  )
}
