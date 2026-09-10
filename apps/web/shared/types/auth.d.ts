// shared/types/auth.d.ts
declare module '#auth-utils' {
  interface User {
    id: string
    name: string
    email: string
    emailVerified: boolean
    username: string
    avatar: string
    provider: 'credentials' | 'github' | 'google'
    providerId: string
    permissions: string[]
  }

  interface UserSession {
    lastLoggedIn: Date
    identity?: {
      projectId: string
      projectName: string
      projectSlug: string
      clientId: string
      membershipId: string
      isProjectAdmin: boolean
      isSystemAdmin: boolean
      roles: string[]
      permissions: string[]
      authorizationVersion: number
      accessTokenExpiresAt: string
    }
  }

  interface SecureSessionData {
    identityAccessToken?: string | null
    identityAccessTokenExpiresAt?: string | null
    identityRefreshToken?: string | null
    identityRefreshTokenExpiresAt?: string | null
    identityConnection?: 'primary' | 'sandbox'
    hostedAuth?: {
      state: string
      returnTo: string
      createdAt: number
    }
  }
}

export {}
