export type IdentityAuthenticatedUser = {
  id: string
  email: string
  emailVerified: boolean
  name: string
  avatar?: string
  username: string
  permissions?: string[]
  isTemporary?: boolean
  expiresAt?: string | null
}
