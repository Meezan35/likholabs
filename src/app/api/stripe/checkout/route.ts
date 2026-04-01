import { auth, currentUser } from '@clerk/nextjs/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { ensureUserExists } from '@/lib/usage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request): Promise<Response> {
  try {
    if (process.env.BILLING_ENABLED !== 'true') {
      return Response.json(
        { error: 'Billing is currently disabled', code: 'BILLING_DISABLED' },
        { status: 503 },
      )
    }

    const { userId } = await auth()

    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const priceId = process.env.STRIPE_PRO_PRICE_ID
    if (!priceId) {
      return Response.json({ error: 'Stripe price not configured' }, { status: 500 })
    }

    const origin = request.headers.get('origin') ?? 'http://localhost:3000'
    const clerkUser = await currentUser()
    const email = clerkUser?.primaryEmailAddress?.emailAddress ?? ''
    await ensureUserExists(userId, email)

    // Fail fast with a clear setup error if the configured price does not exist
    // in the Stripe account/mode used by STRIPE_SECRET_KEY.
    try {
      await stripe.prices.retrieve(priceId)
    } catch {
      return Response.json(
        {
          error:
            'Invalid STRIPE_PRO_PRICE_ID. Use a valid recurring test-mode price from the same Stripe account as STRIPE_SECRET_KEY.',
          code: 'INVALID_STRIPE_PRICE',
        },
        { status: 500 },
      )
    }

    const { data: user } = await db
      .from('users')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single()

    let customerId = user?.stripe_customer_id as string | undefined

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email ?? undefined,
        metadata: { userId },
      })
      customerId = customer.id
      await db.from('users').update({ stripe_customer_id: customerId }).eq('id', userId)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      metadata: { userId },
    })

    return Response.json({ url: session.url })
  } catch {
    return Response.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
