export type EntitlementLimitError = {
  code: 'billing.entitlement_exceeded'
  entitlementCode?: string
  limit?: number
  used?: number
  remaining?: number
  resetsAt?: string | null
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null
    ? value as Record<string, unknown>
    : undefined
}

function parseMessage(value: unknown): unknown {
  if (typeof value !== 'string' || !value.trim().startsWith('{')) return
  try {
    return JSON.parse(value)
  } catch {
    return
  }
}

export function getEntitlementLimitError(error: unknown): EntitlementLimitError | undefined {
  const queue: unknown[] = [error]
  const visited = new Set<unknown>()

  while (queue.length) {
    const candidate = queue.shift()
    if (candidate === undefined || candidate === null || visited.has(candidate)) continue
    visited.add(candidate)

    const record = asRecord(candidate)
    if (!record) {
      const parsed = parseMessage(candidate)
      if (parsed) queue.push(parsed)
      continue
    }

    const data = asRecord(record.data)
    const code = record.code ?? data?.code
    if (code === 'billing.entitlement_exceeded') {
      const details = data ?? record
      return {
        code,
        entitlementCode: typeof details.entitlement_code === 'string' ? details.entitlement_code : undefined,
        limit: typeof details.limit === 'number' ? details.limit : undefined,
        used: typeof details.used === 'number' ? details.used : undefined,
        remaining: typeof details.remaining === 'number' ? details.remaining : undefined,
        resetsAt: typeof details.resets_at === 'string' || details.resets_at === null
          ? details.resets_at
          : undefined
      }
    }

    queue.push(record.data, record.cause, record.response, asRecord(record.response)?._data)
    const parsed = parseMessage(record.message)
    if (parsed) queue.push(parsed)
  }
}
