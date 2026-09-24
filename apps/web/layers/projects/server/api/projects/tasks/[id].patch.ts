import { readBody } from 'h3'
import { handleZoltaApiError } from '#server/http'
import { projectsService } from '../../../utils/projects.service'
import { projectIdSchema, updateTaskSchema } from '../../../utils/projects.schema'

export default defineEventHandler(async (event) => {
  await requireAuthSession(event, 'projects')
  const taskId = projectIdSchema.parse(getRouterParam(event, 'id'))
  const body = updateTaskSchema.parse(await readBody(event))
  try {
    return await (await projectsService(event)).updateTask(taskId, body)
  } catch (error) {
    return handleZoltaApiError(error)
  }
})
