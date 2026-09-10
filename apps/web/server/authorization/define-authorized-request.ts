import type { H3Event } from 'h3'
import type { z } from 'zod/v4'

import { validateRequestData } from '#server/validation'
import {
  type AuthorizationRequirement,
  validateAuthorizedRequest
} from './validate-authorized-request'

type RequestAuthorizer<TPrincipal, TPermission> = (
  event: H3Event,
  permissions: readonly TPermission[],
  match: 'all' | 'any'
) => Promise<TPrincipal>

type DefineAuthorizedRequestOptions<
  TPrincipal,
  TPermission,
  TSchema extends z.ZodRawShape | z.ZodTypeAny
> = {
  authorize: RequestAuthorizer<TPrincipal, TPermission>
  requiredPermissions: AuthorizationRequirement<TPermission>
  schema: TSchema
  resolve: (event: H3Event) => unknown | Promise<unknown>
  statusCode?: number
  statusMessage?: string
  strict?: boolean
}

export function defineAuthorizedRequest<
  TPrincipal,
  TPermission,
  TSchema extends z.ZodRawShape | z.ZodTypeAny
>({
  authorize,
  requiredPermissions,
  schema,
  resolve,
  statusCode,
  statusMessage,
  strict
}: DefineAuthorizedRequestOptions<TPrincipal, TPermission, TSchema>) {
  return async (event: H3Event) =>
    validateAuthorizedRequest({
      event,
      requiredPermissions,
      authorize,
      validateRequest: async () =>
        validateRequestData({
          schema,
          data: await resolve(event),
          statusCode,
          statusMessage,
          strict
        })
    })
}
