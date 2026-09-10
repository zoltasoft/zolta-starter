/** Clear app-scoped client state after an account or project context changes. */
export const useAppEvents = () => {
  const reset = () => {
    clearNuxtState('starter:feature-state')
  }

  return { reset }
}
