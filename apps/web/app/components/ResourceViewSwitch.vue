<script setup lang="ts">
type ResourceView = 'grid' | 'list'

const props = withDefaults(defineProps<{
  accessibleLabel?: string
  gridLabel?: string
  listLabel?: string
}>(), {
  accessibleLabel: 'Collection view',
  gridLabel: 'Grid view',
  listLabel: 'List view'
})

const view = defineModel<ResourceView>({ required: true })

const options = computed(() => [
  {
    value: 'grid' as const,
    icon: 'i-lucide-layout-grid',
    label: props.gridLabel
  },
  {
    value: 'list' as const,
    icon: 'i-lucide-list',
    label: props.listLabel
  }
])

function selectView(value: ResourceView) {
  view.value = value
}
</script>

<template>
  <div
    class="inline-flex h-10 shrink-0 items-center gap-0.5 rounded-lg border border-default bg-muted/30 p-1"
    role="group"
    :aria-label="props.accessibleLabel"
  >
    <UTooltip
      v-for="option in options"
      :key="option.value"
      :text="option.label"
    >
      <UButton
        :icon="option.icon"
        :aria-label="option.label"
        :aria-pressed="view === option.value"
        color="neutral"
        :variant="view === option.value ? 'soft' : 'ghost'"
        size="sm"
        square
        class="transition-[color,background-color,box-shadow]"
        :class="view === option.value ? 'shadow-xs' : 'text-muted'"
        @click="selectView(option.value)"
      />
    </UTooltip>
  </div>
</template>
