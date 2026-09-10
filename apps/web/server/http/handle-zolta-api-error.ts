import { ZoltaApiError } from '@zoltasoft/api-client'
import { createError } from 'h3'
import { createValidationError } from './validation-error'

type HandleZoltaApiErrorOptions<T extends boolean = false> = {
  notFoundAsNull?: T
}

/** Maps the Zolta API client contract into stable BFF HTTP errors. */
export function handleZoltaApiError<T extends boolean = false>(
  error: unknown,
  options?: HandleZoltaApiErrorOptions<T>
): T extends true ? null : never {
  if (!(error instanceof ZoltaApiError)) throw error
  if (options?.notFoundAsNull && error.isNotFound) return null as T extends true ? null : never
  if (error.isValidation) {
    throw createValidationError({
      message: error.apiMessage || 'Validation failed',
      fieldErrors: error.fieldErrorsByField
    })
  }
  if (error.isUnauthorized) throw createError({ statusCode: 401, message: error.apiMessage })
  if (error.isForbidden) throw createError({ statusCode: 403, message: error.apiMessage })
  if (error.isNotFound) throw createError({ statusCode: 404, message: error.apiMessage })
  if (error.isServerError) throw createError({ statusCode: 502, message: 'Upstream API error' })
  throw createError({ statusCode: error.statusCode, message: error.apiMessage })
}
