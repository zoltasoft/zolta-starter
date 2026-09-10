import { useNotificationState } from './state.notifications'
import { useNotificationClient } from './client.notifications'

export function useNotificationQuery() {
  const state = useNotificationState()
  const client = useNotificationClient()
  let listRequest = 0

  async function load(query: { page?: number, per_page?: number, status?: 'read' | 'unread' } = { per_page: 10 }) {
    const request = ++listRequest
    state.value.pending = true
    state.value.error = null
    try {
      const collection = await client.list(query)
      if (request === listRequest) state.value.collection = collection
      return collection
    } catch (error) {
      if (request === listRequest) state.value.error = {
        message: error instanceof Error ? error.message : 'Unable to load notifications.'
      }
      throw error
    } finally {
      if (request === listRequest) state.value.pending = false
    }
  }

  async function loadPreference() {
    state.value.preferencePending = true
    state.value.preferenceError = null
    try {
      const preference = await client.preference()
      state.value.preference = preference
      return preference
    } catch (error) {
      state.value.preferenceError = {
        message: error instanceof Error ? error.message : 'Unable to load notification preferences.'
      }
      throw error
    } finally {
      state.value.preferencePending = false
    }
  }

  return { load, loadPreference }
}
