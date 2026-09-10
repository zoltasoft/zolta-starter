import type { z } from 'zod'
import type { H3Event } from 'h3'
import { createValidationError, toValidationFieldErrors } from '#server/http'

export const validateQuery = <S extends z.ZodTypeAny>(
  schema: S,
  event: H3Event
): z.infer<S> => {
  const result = schema.safeParse(getQuery(event))

  if (!result.success) {
    throw createValidationError({
      statusCode: 400,
      message: result.error.issues[0]?.message ?? 'Invalid request',
      fieldErrors: toValidationFieldErrors(result.error.issues)
    })
  }

  return result.data
}

export const validateBody = async <S extends z.ZodTypeAny>(
  schema: S,
  event: H3Event
): Promise<z.infer<S>> => {
  const body = await readBody(event)
  const result = schema.safeParse(body)

  if (!result.success) {
    throw createValidationError({
      message: result.error.issues[0]?.message ?? 'Invalid request',
      fieldErrors: toValidationFieldErrors(result.error.issues)
    })
  }

  return result.data
}
