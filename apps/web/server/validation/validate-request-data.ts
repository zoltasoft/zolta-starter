import { z } from 'zod/v4'
import { createValidationError, toValidationFieldErrors } from '#server/http'

type RequestSchema = z.ZodRawShape | z.ZodTypeAny

type NormalizedRequestSchema<TSchema extends RequestSchema>
  = TSchema extends z.ZodRawShape ? z.ZodObject<TSchema> : Extract<TSchema, z.ZodTypeAny>

type ValidatedRequestData<TSchema extends RequestSchema>
  = z.output<NormalizedRequestSchema<TSchema>>

type ValidateRequestDataOptions<TSchema extends RequestSchema> = {
  schema: TSchema
  data: unknown
  statusCode?: number
  statusMessage?: string
  strict?: boolean
}

function toObjectSchema<TSchema extends RequestSchema>(
  schema: TSchema,
  strict: boolean
): NormalizedRequestSchema<TSchema> {
  if (schema instanceof z.ZodObject) {
    return (strict ? schema.strict() : schema) as NormalizedRequestSchema<TSchema>
  }

  return (strict ? z.object(schema).strict() : z.object(schema)) as
    NormalizedRequestSchema<TSchema>
}

export function validateRequestData<TSchema extends RequestSchema>({
  schema,
  data,
  statusCode = 400,
  statusMessage = 'Invalid request',
  strict = false
}: ValidateRequestDataOptions<TSchema>): ValidatedRequestData<TSchema> {
  const objectSchema = toObjectSchema(schema, strict)
  const parsedRequest = objectSchema.safeParse(data)

  if (!parsedRequest.success) {
    throw createValidationError({
      statusCode,
      message: parsedRequest.error.issues[0]?.message ?? statusMessage,
      fieldErrors: toValidationFieldErrors(parsedRequest.error.issues)
    })
  }

  return parsedRequest.data as ValidatedRequestData<TSchema>
}
