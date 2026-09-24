# Route declaration

[← 05-presentation index](index.md) · [↑ Architecture home](../index.md) · [Concept catalogue](../00-foundations/concepts.md)

Related: [Request validation](../02-boundaries/request-validation.md) · [Responses](responses.md) · [Application services](../04-application/application-services.md)

---

## Route declaration


### Presentation tree

The presentation layer can be organized as follows:

```text
API/
  Controllers/       declarative class/method route owners
  Requests/          request attributes, validation, trusted context
  Resources/         ResponseDTO-to-public-shape transformers
  Middleware/        transport pipeline concerns
  Exceptions/        presentation-specific exception mapping
  Documentation/     route documentation helpers (when needed)
```

Keep each endpoint’s controller, request, resource, and documentation close to its bounded-context language. The tree is a transport adapter; it should not contain repositories, aggregates, command handlers, or persistence models.

`Zolta\Http\Router\Attributes\Route` makes an API endpoint discoverable from its controller source. The route scanner reads configured controller paths, reflects class and method attributes, generates Laravel route definitions that target Zolta's auto-invocation proxy, and can cache the resulting route/OpenAPI artifacts.

Route declaration describes the transport contract only: URI, verb, transport middleware, API-level authorization metadata, and stable route name. It does not contain validation, response shaping, use-case orchestration, or domain authorization rules; those belong respectively to `#[Request]`, `#[Response]`, `#[Service]`, and inner layers.

### Attribute signature in the installed version

```php
#[Route(
    path: 'tasks/{task}',
    methods: ['PATCH'],
    prefix: 'api',
    target: '__invoke',
    middleware: ['api', 'auth:sanctum'],
    auth: null,
    authorized: [],
    name: 'tasks.update',
)]
```

| Option | Purpose | Best use | Installed-version note |
| --- | --- | --- | --- |
| `path` | URI relative to the application host, with Laravel route placeholders such as `{task}`. It is the first positional argument, so `#[Route('tasks')]` and `#[Route(path: 'tasks')]` are equivalent. | Use explicit, plural resource paths and meaningful placeholder names that match the request DTO contract. | Required in practice. Leading/trailing `/` are normalized by the loader. |
| `methods` | Allowed HTTP verbs; defaults to `['GET']`. | Declare the semantic verb explicitly: `GET` for reads; `POST` for creation or domain actions; `PATCH` for partial changes; `PUT` for a full replacement where appropriate; `DELETE` for removal. | An array is passed to Laravel `Route::match`, so several verbs are supported but should be rare for a clean public contract. |
| `middleware` | Laravel middleware aliases/classes for the endpoint. | Start with `['api']`; add authentication, identity context, rate limiting, and other transport concerns deliberately. | A string is normalized to a one-item list; duplicates/empty values are removed; generic `auth` becomes `auth:sanctum`. |
| `auth` | Semantic shortcut for authentication middleware. `true` means `auth:sanctum`; `'sanctum'`, `'web'`, or `'api'` becomes `auth:<guard>`; an `auth:*` string is kept unchanged. | Prefer it for a simple, obvious guard where no explicit middleware composition is needed. | It is additive: Zolta will not duplicate an equivalent middleware already in `middleware`. A service may use explicit authentication middleware rather than this shortcut. |
| `authorized` | A list of named Zolta authorization actions/gates stored as route metadata. The route invoker calls `ensureAuthorized()` for each before request/service invocation. | API-level permission gates that are independent of aggregate state, for example access to an administration surface. | Different from `auth`: it checks authorization, not merely authentication. Use it only when the endpoint has a named route-level permission. It must not replace domain policy/aggregate authorization. |
| `name` | Stable Laravel route name. | Always set it explicitly with bounded-context naming, e.g. `tasks.index`, `tasks.complete`, `tasks.dashboard.show`. | If omitted, Zolta derives a name from the class/method FQCN; derived names couple the external contract to refactoring. |
| `prefix` | Declared as an attribute constructor option. | Do not rely on this option until the installed adapter supports it. Put the full intended path in `path`, for example `v1/tasks`. | **Currently inert in the installed adapter:** the Laravel attribute loader does not read or apply it. Its default `'api'` therefore does not add `/api`. |
| `target` | Declared as an attribute constructor option. | Do not use in new code. Select class-level or method-level placement instead. | **Currently inert:** the loader routes class attributes to `__invoke` and method attributes to the annotated method, ignoring this supplied value. |

The scanner also accepts `middlewares` as a compatibility alias for `middleware`, but new code should use the documented `middleware` spelling.

### Class-level versus method-level routes

The attribute can target either a class or a method.

```php
// Preferred default: one endpoint, one controller class.
#[Route(path: 'v1/tasks', methods: ['GET'], middleware: ['api', 'auth:sanctum'], name: 'tasks.index')]
#[Request(ListTasksRequest::class, ListTasksDTO::class)]
#[Service(ListTasksService::class, 'Tasks retrieved.')]
#[Response(TaskCollectionResource::class)]
#[Doc(summary: 'List tasks', tags: ['Tasks'])]
final class ListTasksController extends Controller {}
```

```php
// Supported alternative: several tightly related endpoints in one controller.
final class TaskDashboardController extends Controller
{
    #[Route('v1/tasks/dashboard', methods: ['GET'], middleware: self::MIDDLEWARE, name: 'tasks.dashboard.show')]
    #[Request(GetTaskDashboardDTORequest::class, GetTaskDashboardDTO::class)]
    #[Service(GetTaskDashboardService::class, 'Task dashboard retrieved.')]
    public function show(): void {}
}
```

Class-level routes invoke `__invoke`; method-level routes invoke the annotated method through the same Zolta proxy. Both class-level and method-level styles are valid. Choose one based on endpoint cohesion, and never turn a controller into a generic route dispatcher or business workflow.

### Recommended route design

- Keep one public operation per route and one clear owner controller.
- Use a named version segment (`v1/...`) when versioning is part of the public API. Do not assume `prefix: 'api'` or the Laravel `/api` convention is applied by this attribute version.
- Keep paths resource-oriented and reserve action subpaths for real domain commands: `POST v1/tasks/{task}/completions` is clearer than a generic `POST v1/tasks/{task}/update`.
- Name paths and route names in the bounded context's ubiquitous language, and keep the latter stable.
- Apply `api` middleware to API endpoints. Add `auth:sanctum`/`auth: true` only when authentication is required; add a narrowly chosen `throttle:*` policy for credential, recovery, webhook, upload, or other abuse-prone routes.
- Use `authorized` only for a route-level, named permission. Put ownership checks into trusted request scope and aggregate/policy decisions into the Domain.
- Align placeholder names exactly with `routeParams()` and the input DTO (`{task}` → `task`). Validate their syntax in the request; a placeholder alone is not validation.
- Avoid optional and greedy path parameters. Zolta sorts discovered routes to favor static, deeper, non-optional routes, but an unambiguous API remains the safer design.
- Pair each route with the rest of the declarative pipeline: `#[Request]`, `#[Service]`, `#[Response]`, and `#[Doc]`. A route without those attributes is an explicit manual-controller escape hatch, not the default architecture.

### API security example

```php
#[Route(
    path: 'v1/tasks/{task}/completions',
    methods: ['POST'],
    middleware: ['api', 'auth:sanctum', 'throttle:30,1'],
    name: 'tasks.completions.store',
)]
#[Request(CompleteTaskRequest::class, CompleteTaskDTO::class)]
#[Service(CompleteTaskService::class, 'Task completed.', 201)]
#[Response(TaskResource::class)]
#[Doc(summary: 'Complete a task', tags: ['Tasks'])]
final class CompleteTaskController extends Controller {}
```

This route authenticates and rate-limits transport access. `CompleteTaskRequest` resolves the authenticated user into trusted data. The Application handler loads the user's aggregate, and the aggregate decides whether the completion is permitted. No layer is asked to perform another layer's responsibility.

### Discovery, cache, and verification

The API must list its controller directories in `config/zolta.php` under `http.routes.paths`; otherwise an attribute is invisible. The installed configuration can ensure route-cache freshness on boot and generate OpenAPI from the same declarations. After adding, moving, or changing a route, regenerate the supported Zolta artifacts and verify:

- the route list contains exactly one expected URI/verb/name;
- no static route is shadowed by a dynamic one;
- the request, service, response, and documentation metadata resolve;
- the generated OpenAPI contract reflects the intended public operation;
- no duplicate route name, URI/verb combination, or controller ownership exists.

---


---


### Lifecycle position

```text
route discovery → request authorization/validation → input DTO → application service → resource/response bridge
```

### Alternatives and trade-offs

Prefer a class-level declarative route for one cohesive endpoint contract; use method-level attributes when a controller intentionally groups several actions. Use a manual controller action only for transport-specific behavior that the attribute pipeline cannot express. The installed loader may ignore metadata such as `prefix` or `target`; verify behavior before relying on it.

### Failure, security, and verification

Route authorization metadata is an API gate, not a substitute for domain authorization. Verify verbs, names, middleware, auth normalization, class/method discovery, duplicate routes, and the generated route cache.
---

[Architecture index](../index.md) · [Concept catalogue](../00-foundations/concepts.md)
