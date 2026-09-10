import { join } from 'node:path'

import { createBlobStorage } from '@nuxthub/core/blob'
import { createDriver } from '@nuxthub/core/blob/drivers/fs'

const blobDir = join(process.cwd(), '.data/blob')

export const chatBlob = createBlobStorage(createDriver({
  dir: blobDir
}))
