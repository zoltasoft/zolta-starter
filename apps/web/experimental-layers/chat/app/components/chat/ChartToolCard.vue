<script setup lang="ts">
import {
  type BulletLegendItemInterface,
  CurveType,
  Position
} from '@unovis/ts'

import type { ChartUIToolInvocation } from '#chat/shared/utils'

const props = defineProps<{
  invocation: ChartUIToolInvocation
}>()

const color = computed(() => {
  return (
    {
      'output-error': 'bg-muted text-error'
    }[props.invocation.state as string] || 'bg-muted text-white'
  )
})

const icon = computed(() => {
  return (
    {
      'input-available': 'i-lucide-line-chart',
      'output-error': 'i-lucide-triangle-alert'
    }[props.invocation.state as string] || 'i-lucide-loader-circle'
  )
})

const message = computed(() => {
  return (
    {
      'input-available': 'Generating chart...',
      'output-error': 'Can\'t generate chart, please try again'
    }[props.invocation.state as string] || 'Loading chart data...'
  )
})

function xFormatter(invocation: ChartUIToolInvocation) {
  return (tick: number) => {
    if (!invocation.output?.data[tick]) {
      return ''
    }

    return String(invocation.output.data[tick][invocation.output.xKey] ?? '')
  }
}

function categories(
  invocation: ChartUIToolInvocation
): Record<string, BulletLegendItemInterface> {
  if (!invocation.output?.series) {
    return {}
  }

  return invocation.output.series.reduce(
    (accumulator, seriesItem) => {
      accumulator[seriesItem.key] = {
        name: seriesItem.name,
        color: seriesItem.color
      }

      return accumulator
    },
    {} as Record<string, BulletLegendItemInterface>
  )
}

function formatValue(value: string | number | undefined) {
  if (value === undefined || value === null) {
    return 'N/A'
  }

  if (typeof value === 'string') {
    return value
  }

  if (Number.isInteger(value)) {
    return value.toLocaleString()
  }

  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
}
</script>

<template>
  <div
    v-if="invocation.state === 'output-available'"
    class="my-5"
  >
    <div
      v-if="invocation.output.title"
      class="mb-2 flex items-center gap-2"
    >
      <UIcon
        name="i-lucide-line-chart"
        class="size-5 shrink-0 text-primary"
      />
      <div class="min-w-0">
        <h3 class="truncate text-lg font-semibold">
          {{ invocation.output.title }}
        </h3>
      </div>
    </div>

    <div class="relative overflow-hidden">
      <div class="dot-pattern h-full -top-5 left-0 right-0" />

      <LineChart
        :height="300"
        :data="invocation.output.data"
        :categories="categories(invocation)"
        :x-formatter="xFormatter(invocation)"
        :x-label="invocation.output.xLabel"
        :y-label="invocation.output.yLabel"
        :y-grid-line="true"
        :curve-type="CurveType.MonotoneX"
        :legend-position="Position.Top"
        :hide-legend="false"
        :x-num-ticks="Math.min(6, invocation.output.data.length)"
        :y-num-ticks="5"
        :show-tooltip="true"
      >
        <template #tooltip="{ values }">
          <div class="max-w-xs rounded-sm border border-default bg-muted/50 px-2 py-1 shadow-lg ring ring-default ring-offset-2 ring-offset-(--ui-bg) backdrop-blur-sm">
            <div
              v-if="values && values[invocation.output.xKey]"
              class="mb-2 text-sm font-semibold text-highlighted"
            >
              {{ values[invocation.output.xKey] }}
            </div>
            <div class="space-y-1.5">
              <div
                v-for="seriesItem in invocation.output.series"
                :key="seriesItem.key"
                class="flex items-center justify-between gap-3"
              >
                <div class="flex min-w-0 items-center gap-2">
                  <div
                    class="size-2.5 shrink-0 rounded-full"
                    :style="{ backgroundColor: seriesItem.color }"
                  />
                  <span class="truncate text-sm text-muted">
                    {{ seriesItem.name }}
                  </span>
                </div>
                <span class="shrink-0 text-sm font-semibold text-highlighted">
                  {{ formatValue(values?.[seriesItem.key]) }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </LineChart>
    </div>
  </div>

  <div
    v-else
    class="my-5 rounded-xl px-5 py-4"
    :class="color"
  >
    <div class="flex h-44 items-center justify-center">
      <div class="text-center">
        <UIcon
          :name="icon"
          class="mx-auto mb-2 size-8"
          :class="[invocation.state === 'input-streaming' && 'animate-spin']"
        />
        <div class="text-sm">
          {{ message }}
        </div>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --vis-tooltip-padding: 0 !important;
  --vis-tooltip-background-color: transparent !important;
  --vis-tooltip-border-color: transparent !important;
  --vis-axis-grid-color: rgba(255, 255, 255, 0) !important;
  --vis-axis-tick-label-color: var(--ui-text-muted) !important;
  --vis-axis-label-color: var(--ui-text-toned) !important;
  --vis-legend-label-color: var(--ui-text-muted) !important;
  --dot-pattern-color: #111827;
}

.dark {
  --dot-pattern-color: #9ca3af;
}

.dot-pattern {
  position: absolute;
  background-image: radial-gradient(var(--dot-pattern-color) 1px, transparent 1px);
  background-size: 7px 7px;
  background-position: -8.5px -8.5px;
  opacity: 20%;
  mask-image: radial-gradient(ellipse at center, rgba(0, 0, 0, 1), transparent 75%);
}
</style>
