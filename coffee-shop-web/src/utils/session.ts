/**
 * Reads `role` from Clerk session claims. Depends on the session JWT including
 * user public metadata (Clerk Dashboard → Sessions → Customize session token), e.g.:
 * `{ "metadata": "{{user.public_metadata}}" }` then `metadata.role`.
 *
 * Accepts `role` as a string or one nested object shape Clerk sometimes surfaces:
 * `{ role: { role: 'ADMIN' } }`.
 */
function pickRole(node: unknown): string | null {
  if (node == null) return null
  if (typeof node === 'string') return node
  if (typeof node !== 'object' || Array.isArray(node)) return null

  const r = (node as Record<string, unknown>).role
  if (typeof r === 'string') return r
  if (r && typeof r === 'object' && !Array.isArray(r)) {
    const inner = (r as Record<string, unknown>).role
    return typeof inner === 'string' ? inner : null
  }
  return null
}

export function getSessionPublicRole(sessionClaims: unknown): string | null {
  if (!sessionClaims || typeof sessionClaims !== 'object') return null
  const o = sessionClaims as Record<string, unknown>

  return (
    pickRole(o.metadata) ??
    pickRole(o.public_metadata) ??
    pickRole(o.publicMetadata) ??
    pickRole(o.role) ??
    null
  )
}
