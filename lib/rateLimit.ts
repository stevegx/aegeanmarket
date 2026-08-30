interface Bucket {
  count: number
  resetAt: number
}

// Simple in-memory fixed-window limiter. Does not survive a process restart
// and is not shared across serverless instances -- a first line of defense
// for this app's current scale, not a substitute for Redis/Upstash under
// real multi-instance load.
const buckets = new Map<string, Bucket>()
let opsSinceSweep = 0

function sweep(now: number) {
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key)
  }
}

export function isRateLimited(key: string, limit: number, windowMs: number) {
  // Escape hatch for E2E tests, which fire many login/register attempts in
  // quick succession from a single IP. Never set in production.
  if (process.env.DISABLE_RATE_LIMIT === '1') return false

  const now = Date.now()

  opsSinceSweep += 1
  if (opsSinceSweep >= 500) {
    opsSinceSweep = 0
    sweep(now)
  }

  const bucket = buckets.get(key)
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }

  if (bucket.count >= limit) return true

  bucket.count += 1
  return false
}

export function getClientIp(headers: Headers) {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return headers.get('x-real-ip') ?? 'unknown'
}
