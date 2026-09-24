# Conventions, examples, and verification

[← Conventions, examples, and verification index](index.md) · [↑ Nuxt architecture index](../index.md) · [Architecture home](../../api/index.md)

## BFF orchestration alternatives

- Direct upstream call: use when one source already matches the client contract.
- Merge/enrich: call Laravel and an external provider, then combine them in a feature service.
- Cached read: use when data tolerates staleness and invalidation is explicit.
- Server-only action endpoint: use when a browser action needs credentials, signing, or a multi-step workflow.
- Simpler `useXxx` client composable: use for a thin resource screen; use the state/query/action/client/store/model split for richer workflows.

These alternatives change placement or orchestration detail, not the boundary rule that the browser calls BFF routes and the BFF owns upstream integration.

## Independent layers: organization and naming

A feature layer is an independently sustainable Nuxt module, not just a folder for pages. It owns its client UI, BFF routes, feature server utilities, and shared contracts. The root app composes layers; it does not absorb their business behavior.

### Independent-layer tree

```text
layers/<feature>/
  index.ts                  optional public layer entrypoint
  nuxt.config.ts            alias, modules, local runtime needs
  package.json              optional layer-local dependencies/scripts
  tsconfig.json             layer path/type settings
  app/
    pages/<feature>/        route views owned by the layer
    components/             feature presentation components
    composables/             state/query/action/client/store/model/page
    layouts/                feature-only layouts
    middleware/             feature-only navigation guards
    utils/                  pure client helpers
  server/
    api/<feature>/           BFF route handlers (*.get.ts, *.post.ts, etc.)
    utils/                  feature services, clients, mappers, schemas
    resources/              client-facing resource transformers
    middleware/             feature-only server guards
  shared/
    types/                  browser/server-safe feature contracts
    utils/                  isomorphic feature helpers
  tests/                    optional colocated unit/contract tests
```

Create only the directories the layer needs. A small layer can start with `app/pages`, `app/composables`, `server/api`, and `server/utils`; add components, shared types, resources, or tests as responsibilities appear. A layer must not import another feature layer’s internals. Promote a contract or utility to root only after multiple layers genuinely depend on it.

### Root versus layer ownership

- Root `app/`: global shell, layouts, session/auth foundations, global middleware, shared UI primitives, and app-wide plugins.
- Root `server/`: shared BFF clients, error translation, cache drivers, validation/authorization helpers, rate limiting, and server composition.
- Layer `app/`: feature pages, components, local state, composables, and feature navigation.
- Layer `server/`: feature endpoints, orchestration, upstream calls, mapping, schemas, resources, and feature cache keys.
- Layer `shared/`: types and utilities safe in both browser and server bundles.

A root module may depend on a layer only through the Nuxt composition contract; a feature layer should not reach into root implementation details beyond documented shared aliases such as `#server` or `#shared`.

### Naming conventions

Use the local naming dialect of the layer, but keep the responsibility visible:

| Concern | Preferred naming | Example |
| --- | --- | --- |
| Layer directory | lowercase feature noun | `layers/tasks` |
| Layer config | `nuxt.config.ts` | `layers/tasks/nuxt.config.ts` |
| Feature alias | `#<feature>` | `#tasks` |
| Page | route-oriented kebab-case | `pages/tasks/my/index.vue` |
| Component | PascalCase noun/role | `TaskCard.vue`, `TaskGrid.vue` |
| Rich state composable | role + feature suffix | `state.task.ts`, `query.task.ts`, `actions.task.ts` |
| Simple composable | `use` + noun/role | `useTaskPreferences.ts` |
| Page/model composable | `page.<feature>.<view>.ts` or `model.<feature>.ts` | `page.task.my.ts` |
| BFF route | Nuxt method suffix | `index.get.ts`, `[id].patch.ts` |
| Server service | feature + `.service.ts` | `task.service.ts` |
| Upstream client service | feature + `client.service.ts` | `task.client.service.ts` |
| Schema | feature + `.schema.ts` | `task.schema.ts` |
| Mapper | feature + `.mapper.ts` | `task.mapper.ts` |
| Resource | feature + `.resource.ts` | `task.resource.ts` |
| Cache key | feature + `-cache-key.ts` | `task-cache-key.ts` |
| Shared client type | plural/domain noun | `shared/types/tasks.ts` |
| Tests | behavior-oriented suffix | `task.service.test.ts` |

The `jobs` reference uses domain-suffixed composables (`state.job.ts`, `query.job.ts`, `client.job.ts`), while the `admin` reference uses `useXxx` names. Both are valid local dialects. Do not rename an existing layer’s files merely to impose another dialect; match sibling files and preserve the concern split.

### Route and type naming

Use URL nouns and HTTP method suffixes for BFF files: `tasks/index.get.ts`, `tasks/index.post.ts`, `tasks/[id].get.ts`, `tasks/[id].patch.ts`. Keep route names stable and resource-oriented. Name schemas by boundary (`TaskListQuery`, `CreateTaskBody`, `UpdateTaskBody`) and distinguish server/upstream types (`ServerTask`) from browser-facing types (`Task`).

Avoid generic names such as `helpers.ts`, `utils.ts`, or `service.ts` when a feature-specific name communicates ownership. Root utilities may use generic names only when they are genuinely cross-layer foundations.

## Worked examples

### State, client, query, action, and store

```ts
// state.task.ts
export type TaskState = {
  items: Task[]
  pending: boolean
  page: number
  hasMore: boolean
  errors: Record<string, unknown>
}

export const useTaskState = () => useState<TaskState>('tasks', () => ({
  items: [], pending: false, page: 1, hasMore: false, errors: {}
}))

// client.task.ts — BFF calls only
export function useTaskClient() {
  const fetcher = useAuthenticatedFetch()
  const { csrf, headerName } = useCsrf()
  const writeHeaders = { [headerName]: csrf }

  return {
    list: (query: TaskQuery) => fetcher<TaskCollection>('/api/tasks', { query }),
    update: (id: string, body: TaskUpdate) => fetcher<Task>(`/api/tasks/${id}`, {
      method: 'PATCH', headers: writeHeaders, body
    }),
    remove: (id: string) => fetcher(`/api/tasks/${id}`, {
      method: 'DELETE', headers: writeHeaders
    })
  }
}

// store.task.ts — readonly facade
export function useTaskStore() {
  const state = useTaskState()
  const client = useTaskClient()

  const refresh = async (query: TaskQuery = {}) => {
    state.value.pending = true
    try {
      const result = await client.list(query)
      state.value.items = result.items
      state.value.page = result.meta.currentPage
      state.value.hasMore = result.meta.currentPage < result.meta.lastPage
    } finally {
      state.value.pending = false
    }
  }

  const update = async (task: Task) => {
    const saved = await client.update(task.id, { status: task.status })
    state.value.items = state.value.items.map(item => item.id === saved.id ? saved : item)
    return saved
  }

  return { state: readonly(state), refresh, update, remove: client.remove }
}
```

For a production feature, split `refresh` into `query.*.ts` and `update` into `actions.*.ts`; the example shows the data direction and readonly facade, not a requirement to combine concerns.

### BFF route, schema, client service, and mapper

```ts
// server/api/tasks/index.get.ts
export default defineEventHandler(async (event) => {
  const query = validateQuery(taskListSchema, event)
  const session = await requireAuthSession(event)
  return taskService(event).list({ ...query, userId: session.userId })
})

// server/utils/task.service.ts
export const taskService = (event: H3Event) => {
  const client = createTaskApiClient(event)
  return {
    async list(input: TaskListInput): Promise<TaskCollection> {
      const response = await client('/api/tasks/my', { query: toLaravelQuery(input) })
      return response.data.items.map(mapTaskResponse)
    }
  }
}

// server/utils/task.mapper.ts
export const mapTaskResponse = (source: ServerTask): Task => ({
  id: source.id, title: source.title, status: source.status,
  updatedAt: source.updated_at
})
```

The route owns boundary validation and authentication; the service owns orchestration and caching; the client service owns upstream transport/error translation; the mapper owns the server-to-browser shape.

### Race-safe search and mutation locking

```ts
let sequence = 0
const search = async (query: SearchQuery) => {
  const requestId = ++sequence
  state.value.pending = true
  try {
    const result = await client.search(query)
    if (requestId !== sequence) return // stale response
    state.value.items = result.items
  } finally {
    if (requestId === sequence) state.value.pending = false
  }
}

const lock = inFlight.claim(`task:${task.id}`, 'update')
if (!lock) return
try { await client.update(task) } finally { inFlight.remove(lock) }
```

Use request sequencing for replaceable reads such as search and keyed locks for independent writes. Do not disable all actions globally when only one resource is in flight.

### Thin page and model

```vue
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: ['auth'] })
const model = useTaskPageModel()
</script>

<template>
  <TaskGrid
    :items="model.items"
    :phase="model.phase"
    :pending="model.pending"
    @select="model.select"
    @update="model.update"
  />
</template>
```

`useTaskPageModel()` combines the store with route query, responsive state, toasts, and lifecycle watchers. `TaskGrid` renders props and emits intent; neither knows Laravel envelopes or API credentials.

### Cache isolation test

```ts
it('does not expose session enrichment through a public cache entry', async () => {
  const publicResult = await providerService.search({ country: 'ca' })
  const enriched = await bffRouteForSignedInUser(publicResult)
  expect(enriched.items[0]?.saved).toBeDefined()
  expect(await cache.get(publicCacheKey({ country: 'ca' }))).toEqual(publicResult)
})
```

Cache public provider data separately from user/session-enriched results, and test the separation explicitly.

## Verification checklist

- Layer is independently sustainable and added to Nuxt `extends`.
- Pages remain thin and components do not call Laravel/external APIs.
- Client transport calls only `/api/...` BFF routes.
- BFF routes validate input, enforce auth, delegate, normalize, and return stable shapes.
- Authenticated mutations use the approved fetch helper and CSRF header.
- Laravel/API-client errors are translated to client-safe errors.
- Cache keys are correctly scoped and writes invalidate affected reads.
- Server secrets stay private and are absent from client bundles.
- Feature shared types do not contain ORM, SDK, or server-only types.
- Tests cover BFF contracts, mapping, auth/expiry, CSRF, state transitions, and responsive page behavior.

## Decomposition plan

When this guide becomes large, split it by lifecycle: foundations/layers, BFF routes, upstream clients, authentication, client state/composables, pages/components, resources/data shapes, caching, and verification. Preserve cross-links and keep the lifecycle diagram in the architecture index.
