<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'workspace' | 'automation'
}>(), {
  variant: 'workspace'
})
</script>

<template>
  <div
    class="overflow-hidden rounded-2xl border border-default bg-default shadow-2xl shadow-primary/5"
    aria-hidden="true"
  >
    <div class="flex h-11 items-center justify-between border-b border-default bg-elevated/60 px-4">
      <div class="flex items-center gap-2">
        <span class="size-2.5 rounded-full bg-error/60" />
        <span class="size-2.5 rounded-full bg-warning/60" />
        <span class="size-2.5 rounded-full bg-success/60" />
      </div>
      <div class="h-2 w-24 rounded-full bg-accented" />
      <div class="size-5 rounded-md bg-primary/15" />
    </div>

    <div
      v-if="variant === 'workspace'"
      class="grid min-h-80 grid-cols-[4.5rem_minmax(0,1fr)] sm:grid-cols-[8rem_minmax(0,1fr)]"
    >
      <div class="border-r border-default bg-elevated/35 p-3">
        <div class="mb-5 flex items-center gap-2">
          <div class="grid size-6 place-items-center rounded-lg bg-primary">
            <UIcon
              name="i-lucide-orbit"
              class="size-3.5 text-white"
            />
          </div>
          <div class="hidden h-2 w-12 rounded-full bg-accented sm:block" />
        </div>
        <div class="space-y-3">
          <div class="h-7 rounded-lg bg-primary/10 ring-1 ring-primary/20" />
          <div class="h-7 rounded-lg bg-accented/60" />
          <div class="h-7 rounded-lg bg-accented/60" />
          <div class="h-7 rounded-lg bg-accented/60" />
        </div>
      </div>

      <div class="min-w-0 p-4 sm:p-5">
        <div class="flex items-center justify-between gap-4">
          <div>
            <div class="h-3 w-28 rounded-full bg-highlighted/80" />
            <div class="mt-2 h-2 w-40 rounded-full bg-accented" />
          </div>
          <div class="h-8 w-24 rounded-lg bg-primary" />
        </div>

        <div class="mt-5 grid grid-cols-3 gap-2">
          <div
            v-for="(width, index) in ['55%', '35%', '70%']"
            :key="index"
            class="rounded-xl border border-default p-3"
          >
            <div class="h-2 w-12 rounded-full bg-accented" />
            <div
              class="mt-3 h-5 rounded-full bg-primary/15"
              :style="{ width }"
            />
          </div>
        </div>

        <div class="mt-4 space-y-2.5">
          <div
            v-for="(tone, index) in ['primary', 'warning', 'success']"
            :key="tone"
            class="flex items-center gap-3 rounded-xl border border-default p-3"
          >
            <div class="grid size-9 shrink-0 place-items-center rounded-lg bg-elevated">
              <UIcon
                :name="['i-lucide-megaphone', 'i-lucide-code-2', 'i-lucide-life-buoy'][index]"
                class="size-4 text-muted"
              />
            </div>
            <div class="min-w-0 flex-1">
              <div
                class="h-2.5 rounded-full bg-highlighted/70"
                :class="index === 1 ? 'w-36' : 'w-28'"
              />
              <div class="mt-2 h-2 w-20 rounded-full bg-accented" />
            </div>
            <div
              class="h-6 w-20 rounded-full"
              :class="{
                'bg-primary/15': tone === 'primary',
                'bg-warning/15': tone === 'warning',
                'bg-success/15': tone === 'success'
              }"
            />
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="min-h-80 bg-elevated/25 p-4 sm:p-6"
    >
      <div class="mb-5 flex items-center justify-between">
        <div>
          <div class="h-3 w-32 rounded-full bg-highlighted/80" />
          <div class="mt-2 h-2 w-44 rounded-full bg-accented" />
        </div>
        <div class="h-8 w-24 rounded-lg bg-primary" />
      </div>

      <div class="overflow-x-auto pb-2">
        <div class="flex min-w-[34rem] items-stretch gap-3">
          <div class="flex w-36 shrink-0 flex-col justify-center rounded-xl border border-default bg-default p-4">
            <span class="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <UIcon
                name="i-lucide-webhook"
                class="size-4"
              />
            </span>
            <div class="mt-4 h-2.5 w-20 rounded-full bg-highlighted/70" />
            <div class="mt-2 h-2 w-24 rounded-full bg-accented" />
          </div>
          <div class="flex items-center text-muted">
            <UIcon
              name="i-lucide-arrow-right"
              class="size-5"
            />
          </div>
          <div class="flex w-36 shrink-0 flex-col justify-center rounded-xl border border-primary/25 bg-primary/5 p-4">
            <span class="grid size-8 place-items-center rounded-lg bg-primary text-white">
              <UIcon
                name="i-lucide-git-branch"
                class="size-4"
              />
            </span>
            <div class="mt-4 h-2.5 w-16 rounded-full bg-highlighted/70" />
            <div class="mt-2 h-2 w-24 rounded-full bg-primary/20" />
          </div>
          <div class="flex items-center text-muted">
            <UIcon
              name="i-lucide-arrow-right"
              class="size-5"
            />
          </div>
          <div class="flex w-36 shrink-0 flex-col justify-center rounded-xl border border-default bg-default p-4">
            <span class="grid size-8 place-items-center rounded-lg bg-success/10 text-success">
              <UIcon
                name="i-lucide-send"
                class="size-4"
              />
            </span>
            <div class="mt-4 h-2.5 w-20 rounded-full bg-highlighted/70" />
            <div class="mt-2 h-2 w-16 rounded-full bg-accented" />
          </div>
        </div>
      </div>

      <div class="mt-5 grid grid-cols-3 gap-3 border-t border-default pt-4">
        <div
          v-for="index in 3"
          :key="index"
          class="rounded-lg bg-default p-3 ring-1 ring-default"
        >
          <div class="h-2 w-12 rounded-full bg-accented" />
          <div
            class="mt-2 h-2 rounded-full bg-primary/15"
            :class="index === 2 ? 'w-1/2' : 'w-3/4'"
          />
        </div>
      </div>
    </div>
  </div>
</template>
