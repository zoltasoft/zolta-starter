import { readBody } from 'h3'
import { handleZoltaApiError } from '#server/http'
import { projectsService } from '../../utils/projects.service'
import { createProjectSchema } from '../../utils/projects.schema'

export default defineEventHandler(async (event) => {
  await requireAuthSession(event, 'projects')
  const body = createProjectSchema.parse(await readBody(event))
  try {
    return await (await projectsService(event)).create(body)
  } catch (error) {
    return handleZoltaApiError(error)
  }
})
