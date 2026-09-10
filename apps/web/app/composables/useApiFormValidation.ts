import type { FormError } from '@nuxt/ui'
import type { ApiValidationErrorData, ValidationFieldErrors } from '~~/shared/types/validation'

type ValidationErrorCandidate = {
  data?: unknown
  response?: {
    _data?: unknown
  }
}

function isValidationFieldErrors(value: unknown): value is ValidationFieldErrors {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  return Object.values(value).every(messages =>
    Array.isArray(messages)
    && messages.every(message => typeof message === 'string')
  )
}

function isApiValidationErrorData(value: unknown): value is ApiValidationErrorData {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    candidate.code === 'validation.failed'
    && typeof candidate.message === 'string'
    && isValidationFieldErrors(candidate.fieldErrors)
  )
}

export function extractApiValidationError(
  error: unknown
): ApiValidationErrorData | null {
  const candidate = error as ValidationErrorCandidate | null

  const sources = [
    error,
    candidate?.data,
    candidate?.data && typeof candidate.data === 'object'
      ? (candidate.data as Record<string, unknown>).data
      : null,
    candidate?.response?._data,
    candidate?.response?._data && typeof candidate.response._data === 'object'
      ? (candidate.response._data as Record<string, unknown>).data
      : null
  ]

  for (const source of sources) {
    if (isApiValidationErrorData(source)) {
      return source
    }
  }

  return null
}

export function useApiFormValidation() {
  const validation = ref<ApiValidationErrorData | null>(null)

  const clear = (): void => {
    validation.value = null
  }

  const capture = (error: unknown): boolean => {
    const extracted = extractApiValidationError(error)

    if (!extracted) {
      return false
    }

    validation.value = extracted
    return true
  }

  const fieldErrors = computed<ValidationFieldErrors>(
    () => validation.value?.fieldErrors ?? {}
  )

  const message = computed<string | null>(
    () => validation.value?.message ?? null
  )

  const getFieldErrors = (field: string): string[] =>
    fieldErrors.value[field] ?? []

  const getFieldError = (field: string): string | undefined =>
    getFieldErrors(field)[0]

  const toFormErrors = (
    mapFieldName?: Record<string, string> | ((field: string) => string)
  ): FormError[] => {
    return Object.entries(fieldErrors.value).flatMap(([field, messages]) => {
      const mappedField
        = typeof mapFieldName === 'function'
          ? mapFieldName(field)
          : mapFieldName?.[field] ?? field

      return messages.map(message => ({
        name: mappedField,
        message
      }))
    })
  }

  return {
    validation: readonly(validation),
    fieldErrors,
    message,
    clear,
    capture,
    getFieldErrors,
    getFieldError,
    toFormErrors
  }
}
