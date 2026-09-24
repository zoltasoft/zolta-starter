import type { Project, ProjectCollection, ProjectResponse, ProjectTask, ProjectTasksResponse, TaskFilters, TaskPriority, TaskResponse, TaskStatus } from '../../shared/types/projects'

export type { Project, ProjectCollection, ProjectResponse, ProjectTask, ProjectTasksResponse, TaskFilters, TaskPriority, TaskResponse, TaskStatus }

export function useProjectsClient() {
  const { csrf, headerName } = useCsrf()
  const authenticatedFetch = useZoltaIdentityFetch('projects', { defaultRedirect: '/projects/dashboard', loginPath: '/projects' })
  const writeHeaders = { [headerName]: csrf }

  const list = () => authenticatedFetch<ProjectCollection>('/api/projects')
  const create = (body: { name: string, key: string, description?: string }) => authenticatedFetch<ProjectResponse>('/api/projects', { method: 'POST', headers: writeHeaders, body })
  const tasks = (id: string, filters: TaskFilters = {}) => authenticatedFetch<ProjectTasksResponse>(`/api/projects/${id}/tasks`, { query: filters })
  const createTask = (id: string, body: { title: string, description?: string, priority: TaskPriority }) => authenticatedFetch<TaskResponse>(`/api/projects/${id}/tasks`, { method: 'POST', headers: writeHeaders, body })
  const updateTask = (id: string, body: Partial<Pick<ProjectTask, 'status' | 'priority' | 'title' | 'description'>>) => authenticatedFetch<TaskResponse>(`/api/tasks/${id}`, { method: 'PATCH', headers: writeHeaders, body })

  return { list, create, tasks, createTask, updateTask }
}
