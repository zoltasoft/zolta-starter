<script setup lang="ts">
definePageMeta({ layout: 'projects-dashboard', middleware: ['projects-auth'] })
const { t } = useI18n()
const api = useProjectsClient()
const projects = ref<Project[]>([])
const pending = ref(true)
const showCreate = ref(false)
const form = reactive({ name: '', key: '', description: '' })
const load = async () => {
  pending.value = true
  try {
    projects.value = (await api.list()).projects
  } finally {
    pending.value = false
  }
}
await load()
const submit = async () => {
  const result = await api.create(form)
  projects.value.unshift(result.project)
  form.name = ''
  form.key = ''
  form.description = ''
  showCreate.value = false
}
useSeoMeta({ title: () => t('projects.nav.overview') })
</script>

<template>
  <UDashboardPanel
    id="projects-overview"
    class="min-w-0 flex-1"
  >
    <template #header>
      <UDashboardNavbar :title="t('projects.nav.overview')">
        <template #right>
          <UButton
            icon="i-lucide-plus"
            @click="showCreate = true"
          >
            {{ t('projects.create') }}
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <UContainer class="w-full max-w-none py-8">
        <div
          v-if="pending"
          class="text-muted"
        >
          {{ t('projects.loading') }}
        </div><div
          v-else-if="projects.length === 0"
          class="rounded-xl border border-dashed border-default p-10 text-center text-muted"
        >
          {{ t('projects.empty') }}
        </div><div
          v-else
          class="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          <UPageCard
            v-for="project in projects"
            :key="project.id"
            :to="`/projects/dashboard/tasks?project=${project.id}`"
            :title="project.name"
            :description="project.description || project.key"
            icon="i-lucide-folder-kanban"
            variant="subtle"
          >
            <p class="mt-4 text-sm text-muted">
              {{ t('projects.taskCount', { count: project.tasks_count || 0 }) }}
            </p>
          </UPageCard>
        </div>
      </UContainer>
      <UModal v-model:open="showCreate">
        <template #content>
          <UCard>
            <template #header>
              <h2 class="text-lg font-semibold">
                {{ t('projects.createTitle') }}
              </h2>
            </template><UForm
              :state="form"
              @submit="submit"
            >
              <UFormField :label="t('projects.name')">
                <UInput v-model="form.name" />
              </UFormField><UFormField
                class="mt-4"
                :label="t('projects.key')"
              >
                <UInput v-model="form.key" />
              </UFormField><UFormField
                class="mt-4"
                :label="t('projects.descriptionLabel')"
              >
                <UTextarea v-model="form.description" />
              </UFormField><UButton
                type="submit"
                class="mt-6"
              >
                {{ t('projects.create') }}
              </UButton>
            </UForm>
          </UCard>
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>
