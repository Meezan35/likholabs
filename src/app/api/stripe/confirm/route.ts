import { auth, currentUser } from '@clerk/nextjs/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { ensureUserExists } from '@/lib/usage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request): Promise<Response> {
  try {
    if (process.env.BILLING_ENABLED !== 'true') {
      return Response.json({ error: 'Billing is currently disabled' }, { status: 503 })
    }

    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as { sessionId?: string }
    const sessionId = body?.sessionId?.trim()

    if (!sessionId) {
      return Response.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const clerkUser = await currentUser()
    const email = clerkUser?.primaryEmailAddress?.emailAddress ?? ''
    await ensureUserExists(userId, email)

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.mode !== 'subscription') {
      return Response.json({ error: 'Invalid checkout mode' }, { status: 400 })
    }

    const metadataUserId = session.metadata?.userId
    if (metadataUserId && metadataUserId !== userId) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    let active = false
    if (session.subscription) {
      const subscriptionId =
        typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription.id
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      active = subscription.status === 'active' || subscription.status === 'trialing'
    } else {
      active = session.status === 'complete' && session.payment_status === 'paid'
    }

    if (!active) {
      return Response.json({ error: 'Subscription is not active yet' }, { status: 409 })
    }

    const { error: updateError } = await db
      .from('users')
      .update({
        plan: 'pro',
        stripe_customer_id:
          typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null,
      })
      .eq('id', userId)

    if (updateError) {
      return Response.json({ error: 'Failed to update user plan' }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Failed to confirm upgrade' }, { status: 500 })
  }
}
