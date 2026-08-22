import { NextResponse } from 'next/server'

/**
 * Central fail-closed configuration gate for every payment surface (H1).
 * Routes return a generic 503 so a probe cannot enumerate which secret is
 * missing; the specifics only go to the server log.
 */
const REQUIRED_KEYS = [
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const

export function missingPaymentConfig(extra: readonly string[] = []): string[] {
  return [...REQUIRED_KEYS, ...extra].filter(k => !process.env[k])
}

export function paymentsUnavailable(scope: string, missing: string[]): NextResponse {
  console.error(`[payments] ${scope} unavailable — missing configuration: ${missing.join(', ')}`)
  return NextResponse.json({ error: 'Payment system unavailable' }, { status: 503 })
}

export function clientIp(headers: Headers): string {
  return (
    headers.get('x-real-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  )
}
