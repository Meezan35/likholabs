import 'server-only'
import { db } from './db'
import type { Plan, UsageRecord } from '@/types'

export const FREE_LIMITS = {
  generations: 15,
  improves: 30,
} as const

export const ANON_LIMIT = 3

export function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export async function getUserPlan(userId: string): Promise<Plan> {
  const { data } = await db
    .from('users')
    .select('plan')
    .eq('id', userId)
    .single()
  return (data?.plan as Plan) ?? 'free'
}

export async function getUsage(userId: string, month: string): Promise<UsageRecord> {
  const { data } = await db
    .from('usage')
    .select('generations, improves')
    .eq('user_id', userId)
    .eq('month', month)
    .single()

  return {
    generations: data?.generations ?? 0,
    improves: data?.improves ?? 0,
  }
}

export async function incrementUsage(
  userId: string,
  month: string,
  field: 'generations' | 'improves',
): Promise<void> {
  // Ensure a row exists for this user+month first.
  await db
    .from('usage')
    .upsert(
      { user_id: userId, month, generations: 0, improves: 0 },
      { onConflict: 'user_id,month', ignoreDuplicates: true },
    )

  const { data, error } = await db
    .from('usage')
    .select('generations, improves')
    .eq('user_id', userId)
    .eq('month', month)
    .single()

  if (error) {
    throw error
  }

  const nextGenerations =
    field === 'generations' ? (data?.generations ?? 0) + 1 : (data?.generations ?? 0)
  const nextImproves =
    field === 'improves' ? (data?.improves ?? 0) + 1 : (data?.improves ?? 0)

  const { error: upsertError } = await db.from('usage').upsert(
    {
      user_id: userId,
      month,
      generations: nextGenerations,
      improves: nextImproves,
    },
    { onConflict: 'user_id,month' },
  )

  if (upsertError) {
    throw upsertError
  }
}

export async function ensureUserExists(userId: string, email: string): Promise<void> {
  await db.from('users').upsert({ id: userId, email }, { onConflict: 'id', ignoreDuplicates: true })
}
