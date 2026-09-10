export type ValidationFieldErrors = Record<string, string[]>

export type ApiValidationErrorData = {
  code: 'validation.failed'
  message: string
  fieldErrors: ValidationFieldErrors
}
