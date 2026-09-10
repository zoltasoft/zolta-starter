import type { H3Event } from 'h3'

export type AuthorizationMatchMode = 'all' | 'any'

export type AuthorizationRequirement<TPermission>
  = | TPermission
    | readonly TPermission[]
    | {
      permissions: readonly TPermission[]
      match?: AuthorizationMatchMode
    }

export type AuthorizedRequestValidationResult<TPrincipal, TRequest> = {
  principal: TPrincipal
  request: TRequest
}

type RequestAuthorizer<TPrincipal, TPermission> = (
  event: H3Event,
  permissions: readonly TPermission[],
  match: AuthorizationMatchMode
) => Promise<TPrincipal>

type ValidateAuthorizedRequestOptions<TPrincipal, TPermission, TRequest> = {
  event: H3Event
  requiredPermissions: AuthorizationRequirement<TPermission>
  authorize: RequestAuthorizer<TPrincipal, TPermission>
  validateRequest: () => TRequest | Promise<TRequest>
}

function normalizeAuthorizationRequirement<TPermission>(
  requirement: AuthorizationRequirement<TPermission>
): {
  permissions: readonly TPermission[]
  match: AuthorizationMatchMode
} {
  if (Array.isArray(requirement)) {
    return {
      permissions: requirement,
      match: 'all'
    }
  }

  if (typeof requirement === 'object' && requirement !== null && 'permissions' in requirement) {
    return {
      permissions: requirement.permissions,
      match: requirement.match ?? 'all'
    }
  }

  return {
    permissions: [requirement as TPermission],
    match: 'all'
  }
}

export async function validateAuthorizedRequest<
  TPrincipal,
  TPermission,
  TRequest
>({
  event,
  requiredPermissions,
  authorize,
  validateRequest
}: ValidateAuthorizedRequestOptions<TPrincipal, TPermission, TRequest>): Promise<
  AuthorizedRequestValidationResult<TPrincipal, TRequest>
> {
  const { permissions, match } = normalizeAuthorizationRequirement(requiredPermissions)
  const principal = await authorize(event, permissions, match)
  const request = await validateRequest()

  return {
    principal,
    request
  }
}
