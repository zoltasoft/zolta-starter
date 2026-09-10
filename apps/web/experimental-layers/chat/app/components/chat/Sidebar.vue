<script setup lang="ts">
import ConfirmModal from './ConfirmModal.vue'

const route = useRoute()
const toast = useToast()
const overlay = useOverlay()
const { loggedIn } = useIdentitySession()

const open = ref(false)

const deleteModal = overlay.create(ConfirmModal, {
  props: {
    title: 'Delete chat',
    description: 'Are you sure you want to delete this chat? This cannot be undone.'
  }
})

const { data: chats, refresh: refreshChats } = await useFetch('/api/chats', {
  key: 'chats',
  transform: data =>
    data.map(chat => ({
      id: chat.id,
      label: chat.title || 'Untitled',
      to: `/chat/${chat.id}`,
      icon: 'i-lucide-message-circle',
      createdAt: chat.createdAt
    }))
})

onNuxtReady(async () => {
  const firstTenChats = (chats.value || []).slice(0, 10)
  for (const chat of firstTenChats) {
    await $fetch(`/api/chats/${chat.id}`)
  }
})

watch(loggedIn, () => {
  refreshChats()
  open.value = false
})

const { groups } = useChats(chats)
const items = computed(() =>
  groups.value?.flatMap(group => [
    {
      label: group.label,
      type: 'label' as const
    },
    ...group.items.map(item => ({
      ...item,
      slot: 'chat' as const,
      icon: undefined,
      class: item.label === 'Untitled' ? 'text-muted' : ''
    }))
  ])
)

async function deleteChat(id: string) {
  const instance = deleteModal.open()
  const result = await instance.result
  if (!result) {
    return
  }

  await $fetch(`/api/chats/${id}`, { method: 'DELETE' })

  toast.add({
    title: 'Chat deleted',
    description: 'Your chat has been deleted',
    icon: 'i-lucide-trash'
  })

  await refreshChats()

  if (route.params.id === id) {
    await navigateTo('/chat')
  }
}

defineShortcuts({
  c: () => {
    navigateTo('/chat')
  }
})
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      :min-size="12"
      collapsible
      resizable
      class="border-r-0 py-4"
    >
      <template #header="{ collapsed }">
        <NuxtLink
          to="/chat"
          class="flex items-end gap-0.5"
        >
          <ChatLogo class="h-8 w-auto shrink-0" />
          <span
            v-if="!collapsed"
            class="text-xl font-bold text-highlighted"
          >
            Chat
          </span>
        </NuxtLink>

        <div
          v-if="!collapsed"
          class="ms-auto flex items-center gap-1.5"
        >
          <UDashboardSearchButton collapsed />
        </div>
      </template>

      <template #default="{ collapsed }">
        <div class="flex flex-col gap-1.5">
          <UButton
            v-bind="collapsed ? { icon: 'i-lucide-plus' } : { label: 'New chat' }"
            variant="soft"
            block
            to="/chat"
            @click="open = false"
          />

          <UDashboardSearchButton
            v-if="collapsed"
            collapsed
          />
        </div>

        <UNavigationMenu
          v-if="!collapsed"
          :items="items"
          :collapsed="collapsed"
          orientation="vertical"
          :ui="{ link: 'overflow-hidden' }"
        >
          <template #chat-trailing="{ item }">
            <div class="flex -mr-1.25 translate-x-full transition-transform group-hover:translate-x-0">
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="xs"
                class="p-0.5 text-muted hover:bg-accented/50 hover:text-primary focus-visible:bg-accented/50"
                tabindex="-1"
                @click.stop.prevent="deleteChat((item as { id: string }).id)"
              />
            </div>
          </template>
        </UNavigationMenu>
      </template>
    </UDashboardSidebar>

    <UDashboardSearch
      placeholder="Search chats..."
      :groups="[
        {
          id: 'links',
          items: [
            {
              label: 'New chat',
              to: '/chat',
              icon: 'i-lucide-square-pen'
            }
          ]
        },
        ...groups
      ]"
    />

    <div class="m-4 flex min-w-0 flex-1 rounded-lg bg-default/75 shadow ring ring-default lg:ml-0">
      <slot />
    </div>
  </UDashboardGroup>
</template>
