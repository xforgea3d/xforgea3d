import crypto from 'crypto'

const CSRF_SECRET = process.env.JWT_SECRET_KEY
if (!CSRF_SECRET) {
   throw new Error('JWT_SECRET_KEY environment variable is required for CSRF protection')
}

/**
 * Generate a CSRF token tied to a user session.
 * Token = timestamp.hmac(timestamp + userId)
 */
export function generateCsrfToken(userId: string): string {
   const timestamp = Date.now().toString(36)
   const hmac = crypto
      .createHmac('sha256', CSRF_SECRET)
      .update(`${timestamp}:${userId}`)
      .digest('hex')
      .slice(0, 16)
   return `${timestamp}.${hmac}`
}

/**
 * Verify a CSRF token. Valid for 4 hours.
 */
export function verifyCsrfToken(token: string, userId: string): boolean {
   if (!token || !token.includes('.')) return false

   const [timestamp, hmac] = token.split('.')
   const ts = parseInt(timestamp, 36)

   // Token expires after 4 hours
   if (Date.now() - ts > 4 * 60 * 60 * 1000) return false

   const expectedHmac = crypto
      .createHmac('sha256', CSRF_SECRET)
      .update(`${timestamp}:${userId}`)
      .digest('hex')
      .slice(0, 16)

   return hmac === expectedHmac
}
