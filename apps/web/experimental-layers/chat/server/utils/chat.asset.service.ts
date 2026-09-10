import { chatBlob } from './chat.blob'

export function chatAssetService() {
  return {
    async listByPrefix(prefix: string) {
      const { blobs } = await chatBlob.list({ prefix })

      return blobs.map(item => ({
        pathname: item.pathname
      }))
    },

    async delete(pathname: string) {
      await chatBlob.del(pathname)
    }
  }
}
