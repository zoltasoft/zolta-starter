import { readBody } from 'h3'
import { handleZoltaApiError } from '#server/http'
import { projectsService } from '../../../utils/projects.service'
import { createTaskSchema, projectIdSchema } from '../../../utils/projects.schema'

export default defineEventHandler(async (event) => {
  await requireAuthSession(event, 'projects')
  const projectId = projectIdSchema.parse(getRouterParam(event, 'id'))
  const body = createTaskSchema.parse(await readBody(event))
  try {
    return await (await projectsService(event)).createTask(projectId, body)
  } catch (error) {
    return handleZoltaApiError(error)
  }
})
