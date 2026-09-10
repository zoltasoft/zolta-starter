<template>
  <div class="resource-scroll-area overflow-y-auto">
    <slot />
  </div>
</template>

<style scoped>
.resource-scroll-area {
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color:
    color-mix(in srgb, var(--ui-text-muted) 22%, transparent)
    transparent;
}

.resource-scroll-area:hover {
  scrollbar-color:
    color-mix(in srgb, var(--ui-text-muted) 38%, transparent)
    transparent;
}

.resource-scroll-area::-webkit-scrollbar {
  width: 8px;
}

.resource-scroll-area::-webkit-scrollbar-track {
  background: transparent;
  margin-block: 4px;
}

.resource-scroll-area::-webkit-scrollbar-thumb {
  background-color: color-mix(in srgb, var(--ui-text-muted) 22%, transparent);
  background-clip: padding-box;
  border: 2px solid transparent;
  border-radius: 999px;
}

.resource-scroll-area:hover::-webkit-scrollbar-thumb {
  background-color: color-mix(in srgb, var(--ui-text-muted) 38%, transparent);
}
</style>
