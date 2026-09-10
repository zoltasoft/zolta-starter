export function isIdentitySessionExpired(
  user: unknown,
  now = Date.now()
): boolean {
  if (!user || typeof user !== 'object' || !('expiresAt' in user)) return false

  const value = user.expiresAt
  if (typeof value !== 'string' || value === '') return false

  const expiresAt = Date.parse(value)
  return Number.isFinite(expiresAt) && expiresAt <= now
}
