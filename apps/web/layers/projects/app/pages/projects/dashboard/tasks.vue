<script setup lang="ts">
import type { ProjectTask, TaskFilters, TaskPriority, TaskStatus } from '../../../shared/types/projects'

definePageMeta({ layout: 'projects-dashboard', middleware: ['projects-auth'] })

const route = useRoute()
const { t } = useI18n()
const api = useProjectsClient()
const projectId = computed(() => String(route.query.project || ''))
const project = ref<import('../../../shared/types/projects').Project | null>(null)
const tasks = ref<ProjectTask[]>([])
const pending = ref(true)
const title = ref('')
const description = ref('')
const priority = ref<TaskPriority>('medium')
const descriptionDrafts = reactive<Record<string, string>>({})
const filters = reactive<TaskFilters>({ search: undefined, status: undefined, priority: undefined })

const statusItems = computed(() => [
  { label: t('projects.status.all'), value: undefined },
  { label: t('projects.status.todo'), value: 'todo' as const },
  { label: t('projects.status.in_progress'), value: 'in_progress' as const },
  { label: t('projects.status.done'), value: 'done' as const }
])

const priorityItems = computed(() => [
  { label: t('projects.priority.all'), value: undefined },
  { label: t('projects.priority.low'), value: 'low' as const },
  { label: t('projects.priority.medium'), value: 'medium' as const },
  { label: t('projects.priority.high'), value: 'high' as const }
])

const load = async () => {
  if (!projectId.value) return
  pending.value = true
  try {
    const result = await api.tasks(projectId.value, filters)
    project.value = result.project
    tasks.value = result.tasks
    for (const task of tasks.value) descriptionDrafts[task.id] = task.description || ''
  } finally {
    pending.value = false
  }
}

await load()

watch(() => [filters.search, filters.status, filters.priority], () => load())

const addTask = async () => {
  if (!title.value.trim() || !projectId.value) return
  const result = await api.createTask(projectId.value, { title: title.value, description: description.value || undefined, priority: priority.value })
  tasks.value.unshift(result.task)
  descriptionDrafts[result.task.id] = result.task.description || ''
  title.value = ''
  description.value = ''
  priority.value = 'medium'
}

const update = async (task: ProjectTask, patch: Partial<Pick<ProjectTask, 'status' | 'priority' | 'description'>>) => {
  const result = await api.updateTask(task.id, patch)
  Object.assign(task, result.task)
  descriptionDrafts[task.id] = task.description || ''
}

const removeTask = async (task: ProjectTask) => {
  if (import.meta.client && !window.confirm(t('projects.deleteTaskConfirm', { title: task.title }))) return
  await api.deleteTask(task.id)
  tasks.value = tasks.value.filter(item => item.id !== task.id)
  Reflect.deleteProperty(descriptionDrafts, task.id)
}

const saveDescription = async (task: ProjectTask) => {
  const nextDescription = descriptionDrafts[task.id] || ''
  if (nextDescription === (task.description || '')) return
  await update(task, { description: nextDescription })
}

const countByStatus = (status: TaskStatus) => tasks.value.filter(task => task.status === status).length
useSeoMeta({ title: () => project.value?.name || t('projects.nav.tasks') })
</script>

<template>
  <UDashboardPanel
    id="projects-tasks"
    class="min-w-0 flex-1"
  >
    <template #header>
      <UDashboardNavbar :title="project?.name || t('projects.nav.tasks')">
        <template #right>
          <UBadge
            color="neutral"
            variant="subtle"
          >
            {{ tasks.length }} {{ t('projects.tasks') }}
          </UBadge>
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <UContainer class="w-full max-w-none space-y-6 py-8">
        <div class="grid gap-3 sm:grid-cols-3">
          <UCard variant="subtle">
            <p class="text-sm text-muted">
              {{ t('projects.status.todo') }}
            </p>
            <p class="mt-1 text-2xl font-semibold text-highlighted">
              {{ countByStatus('todo') }}
            </p>
          </UCard>
          <UCard variant="subtle">
            <p class="text-sm text-muted">
              {{ t('projects.status.in_progress') }}
            </p>
            <p class="mt-1 text-2xl font-semibold text-highlighted">
              {{ countByStatus('in_progress') }}
            </p>
          </UCard>
          <UCard variant="subtle">
            <p class="text-sm text-muted">
              {{ t('projects.status.done') }}
            </p>
            <p class="mt-1 text-2xl font-semibold text-highlighted">
              {{ countByStatus('done') }}
            </p>
          </UCard>
        </div>

        <UCard variant="subtle">
          <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
            <UInput
              v-model="filters.search"
              icon="i-lucide-search"
              :placeholder="t('projects.searchTasks')"
            />
            <USelect
              v-model="filters.status"
              :items="statusItems"
              :placeholder="t('projects.filterStatus')"
            />
            <USelect
              v-model="filters.priority"
              :items="priorityItems"
              :placeholder="t('projects.filterPriority')"
            />
          </div>
        </UCard>

        <UCard variant="subtle">
          <form
            class="space-y-3"
            @submit.prevent="addTask"
          >
            <div class="flex flex-wrap gap-3">
              <UInput
                v-model="title"
                class="min-w-60 flex-1"
                :placeholder="t('projects.taskPlaceholder')"
              />
              <USelect
                v-model="priority"
                :items="priorityItems.slice(1)"
              />
              <UButton
                type="submit"
                icon="i-lucide-plus"
              >
                {{ t('projects.addTask') }}
              </UButton>
            </div>
            <UTextarea
              v-model="description"
              :placeholder="t('projects.taskDescriptionPlaceholder')"
              :rows="2"
            />
          </form>
        </UCard>

        <div
          v-if="pending"
          class="text-muted"
        >
          {{ t('projects.loadingTasks') }}
        </div>
        <div
          v-else-if="tasks.length === 0"
          class="rounded-xl border border-dashed border-default p-10 text-center text-muted"
        >
          {{ t('projects.noMatchingTasks') }}
        </div>
        <div
          v-else
          class="space-y-3"
        >
          <UCard
            v-for="task in tasks"
            :key="task.id"
            variant="subtle"
          >
            <div class="space-y-4">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="min-w-0">
                  <p class="font-medium text-highlighted">
                    {{ task.title }}
                  </p>
                  <p class="text-sm text-muted">
                    {{ t(`projects.priority.${task.priority}`) }}
                  </p>
                </div>
                <div class="flex flex-wrap gap-2">
                  <USelect
                    :model-value="task.status"
                    :items="statusItems.slice(1)"
                    @update:model-value="update(task, { status: $event })"
                  />
                  <USelect
                    :model-value="task.priority"
                    :items="priorityItems.slice(1)"
                    @update:model-value="update(task, { priority: $event })"
                  />
                  <UButton
                    type="button"
                    color="error"
                    variant="ghost"
                    size="sm"
                    @click="removeTask(task)"
                  >
                    {{ t('projects.deleteTask') }}
                  </UButton>
                </div>
              </div>
              <UTextarea
                v-model="descriptionDrafts[task.id]"
                :placeholder="t('projects.taskDescriptionPlaceholder')"
                :rows="2"
                @blur="saveDescription(task)"
              />
            </div>
          </UCard>
        </div>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
