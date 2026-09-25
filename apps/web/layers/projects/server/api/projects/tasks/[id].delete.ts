import { handleZoltaApiError } from '#server/http'
import { projectsService } from '../../../utils/projects.service'
import { projectIdSchema } from '../../../utils/projects.schema'

export default defineEventHandler(async (event) => {
  await requireAuthSession(event, 'projects')
  const taskId = projectIdSchema.parse(getRouterParam(event, 'id'))
  try {
    return await (await projectsService(event)).deleteTask(taskId)
  } catch (error) {
    return handleZoltaApiError(error)
  }
})
