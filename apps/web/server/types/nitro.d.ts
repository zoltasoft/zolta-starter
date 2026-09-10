import type { DbClient } from '../db/client'

declare module 'nitropack/types' {
  interface NitroApp {
    db: DbClient
  }
}

export {}
