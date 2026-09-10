import { createError } from 'h3'
import type { ApiValidationErrorData, ValidationFieldErrors } from '~~/shared/types/validation'

type ValidationIssueLike = {
  path: readonly PropertyKey[]
  message: string
}

type CreateValidationErrorOptions = {
  fieldErrors?: ValidationFieldErrors
  message?: string
  statusCode?: number
}

export function toValidationFieldErrors(
  issues: readonly ValidationIssueLike[]
): ValidationFieldErrors {
  return issues.reduce<ValidationFieldErrors>((acc, issue) => {
    const path = issue.path
      .map(segment => String(segment))
      .join('.')

    const field = path || '_form'

    ;(acc[field] ??= []).push(issue.message)
    return acc
  }, {})
}

export function createValidationErrorData({
  fieldErrors = {},
  message = 'Validation failed'
}: CreateValidationErrorOptions = {}): ApiValidationErrorData {
  return {
    code: 'validation.failed',
    message,
    fieldErrors
  }
}

export function createValidationError({
  fieldErrors = {},
  message = 'Validation failed',
  statusCode = 422
}: CreateValidationErrorOptions = {}) {
  const data = createValidationErrorData({
    fieldErrors,
    message
  })

  return createError({
    statusCode,
    statusMessage: message,
    message,
    data
  })
}
