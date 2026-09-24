import type { H3Event } from 'h3'
import type { ZoltaApiEnvelope, ZoltaApiFetchClient } from '@zoltasoft/api-client'
import type { Project, ProjectTask, TaskFilters } from '../../shared/types/projects'
import { createZoltaApiClient } from '#server/utils/create-zolta-api-client'

type UpstreamBody = Record<string, unknown>

export function projectsApi(event: H3Event): Promise<ZoltaApiFetchClient> {
  return createZoltaApiClient(event, 'projects')
}

export function listProjects(client: ZoltaApiFetchClient) {
  return client<ZoltaApiEnvelope<{ projects: Project[] }>>('/api/projects')
}

export function createProject(client: ZoltaApiFetchClient, body: UpstreamBody) {
  return client<ZoltaApiEnvelope<{ project: Project }>>('/api/projects', { method: 'POST', body })
}

export function listProjectTasks(client: ZoltaApiFetchClient, projectId: string, filters: TaskFilters = {}) {
  return client<ZoltaApiEnvelope<{ project: Project, tasks: ProjectTask[] }>>(`/api/projects/${projectId}/tasks`, {
    query: Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== undefined && value !== ''))
  })
}

export function createTask(client: ZoltaApiFetchClient, projectId: string, body: UpstreamBody) {
  return client<ZoltaApiEnvelope<{ task: ProjectTask }>>(`/api/projects/${projectId}/tasks`, { method: 'POST', body })
}

export function updateTask(client: ZoltaApiFetchClient, taskId: string, body: UpstreamBody) {
  return client<ZoltaApiEnvelope<{ task: ProjectTask }>>(`/api/tasks/${taskId}`, { method: 'PATCH', body })
}
