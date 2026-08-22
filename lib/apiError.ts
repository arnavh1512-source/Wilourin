import { NextResponse } from 'next/server'

/**
 * Postgres error text names tables, columns and constraints. Log it, return a
 * generic message so the schema is not disclosed to the browser.
 */
export function dbError(scope: string, message: string | undefined, status = 500): NextResponse {
  console.error(`[${scope}] ${message ?? 'unknown database error'}`)
  return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status })
}

/** First Zod issue, formatted for the client. */
export function badRequest(message: string | undefined): NextResponse {
  return NextResponse.json({ error: message ?? 'Invalid input' }, { status: 400 })
}
