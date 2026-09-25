import type { H3Event } from 'h3'
import type { TaskFilters } from '../../shared/types/projects'
import { createProject, createTask, deleteTask, listProjectTasks, listProjects, projectsApi, updateTask } from './projects.client.service'
import { mapDeletedTaskEnvelope, mapProjectEnvelope, mapProjectsEnvelope, mapTaskEnvelope, mapTasksEnvelope } from './projects.mapper'

type UpstreamBody = Record<string, unknown>

export async function projectsService(event: H3Event) {
  const client = await projectsApi(event)
  return {
    list: async () => mapProjectsEnvelope(await listProjects(client)),
    create: async (body: UpstreamBody) => mapProjectEnvelope(await createProject(client, body)),
    tasks: async (projectId: string, filters: TaskFilters = {}) => mapTasksEnvelope(await listProjectTasks(client, projectId, filters)),
    createTask: async (projectId: string, body: UpstreamBody) => mapTaskEnvelope(await createTask(client, projectId, body)),
    updateTask: async (taskId: string, body: UpstreamBody) => mapTaskEnvelope(await updateTask(client, taskId, body)),
    deleteTask: async (taskId: string) => mapDeletedTaskEnvelope(await deleteTask(client, taskId))
  }
}
