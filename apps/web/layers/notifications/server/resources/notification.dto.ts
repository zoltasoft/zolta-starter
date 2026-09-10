export type NotificationDto = {
  id: string
  user_id: string
  type: string
  status: string
  title: string
  body: string
  metadata?: Record<string, unknown> | null
  read_at?: string | null
  created_at: string
  updated_at: string
}

export type NotificationCollectionDto = {
  notifications: NotificationDto[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
  }
}

export type NotificationPreferenceDto = {
  email_enabled: boolean
  browser_enabled: boolean
  in_app_enabled: boolean
  activity_alerts_enabled: boolean
  reminders_enabled: boolean
  product_updates_enabled: boolean
}
