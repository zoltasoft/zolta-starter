import { getQuery } from 'h3'
import { handleZoltaApiError } from '#server/http'
import { projectsService } from '../../../utils/projects.service'
import { projectIdSchema, taskFiltersSchema } from '../../../utils/projects.schema'

export default defineEventHandler(async (event) => {
  await requireAuthSession(event, 'projects')
  const projectId = projectIdSchema.parse(getRouterParam(event, 'id'))
  const filters = taskFiltersSchema.parse(getQuery(event))
  try {
    return await (await projectsService(event)).tasks(projectId, filters)
  } catch (error) {
    return handleZoltaApiError(error)
  }
})
