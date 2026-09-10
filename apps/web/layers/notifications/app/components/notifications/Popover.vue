<script setup lang="ts">
import type { NotificationItem } from '../../../shared/types/notifications'

defineProps<{
  collapsed?: boolean
}>()

const open = ref(false)
const route = useRoute()
const { locale, t } = useI18n()
const {
  notifications,
  unreadCount,
  status,
  error,
  refresh,
  markingRead,
  markAsRead
} = useNotifications()

const iconByType: Record<NotificationItem['type'], string> = {
  application: 'i-lucide-briefcase-business',
  content: 'i-lucide-file-text',
  message: 'i-lucide-messages-square',
  activity: 'i-lucide-search-check',
  security: 'i-lucide-shield-check',
  system: 'i-lucide-info',
  custom: 'i-lucide-bell-ring'
}

const accentByLevel: Record<NotificationItem['level'], string> = {
  info: 'bg-info/10 text-info',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error'
}

const buttonLabel = computed(() =>
  unreadCount.value > 0
    ? t('notificationCenter.openUnread', { count: unreadCount.value })
    : t('notificationCenter.open')
)

useIntervalFn(() => {
  void refresh()
}, 60_000)

watch(open, (isOpen) => {
  if (isOpen) void refresh()
})

function formattedDate(value: string) {
  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

function translatedText(
  fallback: string,
  key?: string,
  params?: Record<string, string | number>
) {
  return key ? t(key, params ?? {}) : fallback
}

async function selectNotification(notification: NotificationItem) {
  const updated = await markAsRead(notification)
  const destination = updated.actionTo

  if (destination && destination !== route.fullPath) {
    open.value = false
    await navigateTo(destination)
  }
}
</script>

<template>
  <UPopover
    v-model:open="open"
    :content="{ align: 'end', side: 'right', sideOffset: 8 }"
    :ui="{ content: 'w-[min(24rem,calc(100vw-1rem))] p-0' }"
  >
    <UButton
      icon="i-lucide-bell"
      color="neutral"
      variant="ghost"
      :square="collapsed"
      :label="collapsed ? undefined : t('notificationCenter.title')"
      :aria-label="buttonLabel"
      class="relative shrink-0"
    >
      <template #trailing>
        <UBadge
          v-if="unreadCount > 0"
          :label="unreadCount > 99 ? '99+' : String(unreadCount)"
          color="primary"
          variant="solid"
          size="sm"
        />
      </template>
    </UButton>

    <template #content>
      <div
        class="flex items-center justify-between gap-3 border-b border-default px-4 py-3"
      >
        <div>
          <p class="font-semibold text-highlighted">
            {{ t("notificationCenter.title") }}
          </p>
          <p class="text-xs text-muted">
            {{ t("notificationCenter.unread", { count: unreadCount }) }}
          </p>
        </div>

        <UButton
          icon="i-lucide-refresh-cw"
          color="neutral"
          variant="ghost"
          size="sm"
          :loading="status === 'pending'"
          :aria-label="t('notificationCenter.refresh')"
          @click="refresh()"
        />
      </div>

      <div class="max-h-[28rem] overflow-y-auto p-2">
        <div
          v-if="status === 'pending' && notifications.length === 0"
          class="space-y-2"
        >
          <USkeleton
            v-for="index in 3"
            :key="index"
            class="h-20 w-full rounded-xl"
          />
        </div>

        <UAlert
          v-else-if="error"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-alert"
          :title="t('notificationCenter.errorTitle')"
          :description="t('notificationCenter.errorDescription')"
        />

        <div
          v-else-if="notifications.length === 0"
          class="flex flex-col items-center gap-2 px-4 py-10 text-center"
        >
          <span
            class="flex size-10 items-center justify-center rounded-xl bg-elevated text-muted"
          >
            <UIcon
              name="i-lucide-bell-off"
              class="size-5"
            />
          </span>
          <p class="text-sm font-medium text-highlighted">
            {{ t("notificationCenter.emptyTitle") }}
          </p>
          <p class="text-xs text-muted">
            {{ t("notificationCenter.emptyDescription") }}
          </p>
        </div>

        <div
          v-else
          class="space-y-1"
        >
          <button
            v-for="notification in notifications"
            :key="notification.id"
            type="button"
            class="group flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
            :class="notification.status === 'unread' ? 'bg-primary/5' : ''"
            :disabled="markingRead.includes(notification.id)"
            @click="selectNotification(notification)"
          >
            <span
              class="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl"
              :class="accentByLevel[notification.level]"
            >
              <UIcon
                :name="iconByType[notification.type]"
                class="size-4"
              />
            </span>

            <span class="min-w-0 flex-1">
              <span class="flex items-start gap-2">
                <span
                  class="min-w-0 flex-1 truncate text-sm font-medium text-highlighted"
                >
                  {{
                    translatedText(
                      notification.title,
                      notification.titleKey,
                      notification.messageParams
                    )
                  }}
                </span>
                <span
                  v-if="notification.status === 'unread'"
                  class="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                  :aria-label="t('notificationCenter.unreadIndicator')"
                />
              </span>
              <span class="mt-0.5 line-clamp-2 text-xs leading-5 text-muted">
                {{
                  translatedText(
                    notification.message,
                    notification.messageKey,
                    notification.messageParams
                  )
                }}
              </span>
              <time
                :datetime="notification.createdAt"
                class="mt-1 block text-[11px] text-dimmed"
              >
                {{ formattedDate(notification.createdAt) }}
              </time>
            </span>
          </button>
        </div>
      </div>
    </template>
  </UPopover>
</template>
