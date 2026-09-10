import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

function collectIndexAliases(
  rootDir: string,
  aliasRoot: string,
  result: Record<string, string>
) {
  const indexPath = join(rootDir, 'index.ts')
  if (existsSync(indexPath)) {
    result[aliasRoot] = indexPath
  }

  for (const entry of readdirSync(rootDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue
    }

    collectIndexAliases(
      join(rootDir, entry.name),
      `${aliasRoot}/${entry.name}`,
      result
    )
  }
}

export function createBarrelAliases(
  importMetaUrl: string,
  namespaceRoot: string,
  sections: string[] = ['composables']
) {
  const layerDir = fileURLToPath(new URL('./', importMetaUrl))
  const aliases: Record<string, string> = {}

  for (const section of sections) {
    const sectionDir = join(layerDir, 'app', section)
    if (!existsSync(sectionDir)) {
      continue
    }

    collectIndexAliases(sectionDir, `${namespaceRoot}/${section}`, aliases)
  }

  return aliases
}
