<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()
const { t } = useI18n()

const teams = ref([{
  label: 'MyApp',
  avatar: {
    src: '/myapp.svg',
    alt: 'MyApp'
  }
}, {
  label: 'MyApp Hub',
  avatar: {
    src: '/myapp.svg',
    alt: 'MyApp Hub'
  }
}, {
  label: 'MyApp Labs',
  avatar: {
    src: '/myapp.svg',
    alt: 'MyApp Labs'
  }
}])
const selectedTeam = ref(teams.value[0])

const items = computed<DropdownMenuItem[][]>(() => {
  return [teams.value.map(team => ({
    ...team,
    onSelect() {
      selectedTeam.value = team
    }
  })), [{
    label: t('dashboard.teams.createTeam'),
    icon: 'i-lucide-circle-plus'
  }, {
    label: t('dashboard.teams.manageTeams'),
    icon: 'i-lucide-cog'
  }]]
})
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-40' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      v-bind="{
        ...selectedTeam,
        label: collapsed ? undefined : selectedTeam?.label,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :class="[!collapsed && 'py-2']"
      :ui="{
        trailingIcon: 'text-dimmed'
      }"
    />
  </UDropdownMenu>
</template>
