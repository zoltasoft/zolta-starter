import type { CommandPaletteItem, NavigationMenuItem } from '@nuxt/ui'

export function toCommandPaletteItems(
  items: NavigationMenuItem[]
): CommandPaletteItem[] {
  return items.map(({ chip, children, ...item }) => ({
    ...item,
    chip: chip ? (chip === true ? {} : chip) : undefined,
    children: children ? toCommandPaletteItems(children) : undefined
  }))
}
