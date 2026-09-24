# BFF and upstream integration

[← BFF and upstream integration index](index.md) · [↑ Nuxt architecture index](../index.md) · [Architecture home](../../api/index.md)

## BFF route pattern

A feature BFF route under `layers/<feature>/server/api` should be a thin entry point:

```ts
// layers/tasks/server/api/tasks/index.get.ts
export default defineEventHandler(async (event) => {
  const query = parseTaskListQuery(getQuery(event))
  const session = await requireAuthSession(event)
  return taskService(event).list({ query, userId: session.userId })
})
```

The route validates query/body/params, requires authentication where needed, delegates to a feature service, and returns a client-facing resource. Put upstream calls, cache policy, mapping, retries, and envelope normalization in `task.service.ts`/`task.client.service.ts`, not in the handler.

Use Zod or the repository’s server validation helper for BFF input. Treat Laravel envelopes and third-party payloads as external representations; map them before returning them to the browser.

## Upstream clients and API package

Use the published `@zoltasoft/api-client` package (or an equivalent typed client) inside shared/server HTTP infrastructure. Configure base URL, credentials, timeout, and error translation at the server edge. Feature services call the shared client service; pages and client composables call only the BFF.

```text
feature BFF service
  → shared Laravel client
  → @zoltasoft/api-client request/envelope handling
  → Laravel Zolta API
```

Do not leak API-client instances, bearer tokens, Laravel response envelopes, or external SDK types into Vue components or shared feature types.
