# Request boundary and validation

[← 02-boundaries index](index.md) · [↑ Architecture home](../index.md) · [Concept catalogue](../00-foundations/concepts.md)

Related: [DTO flow](dto-flow.md) · [Presentation routes](../05-presentation/routes.md) · [Application services](../04-application/application-services.md)

---

## Request boundary and validation


### API boundary tree

Keep transport concerns together inside the bounded context:

```text
API/
  Controllers/       route and Zolta endpoint declarations
  Requests/          BaseRequest classes and transport validation
  Resources/         public response transformers
  Middleware/        authentication, context, rate limiting, transport guards
  Exceptions/        API-facing exception translation
  Documentation/     optional endpoint/OpenAPI helpers
```

A small endpoint may omit `Middleware`, `Exceptions`, or `Documentation`, but request classes, controllers, and resources should remain distinct. Controllers declare the transport contract; requests shape input; resources shape output. None of them owns application workflows or domain rules.

Every HTTP endpoint declares a dedicated request class with `#[Request(RequestClass::class, InputDTO::class)]`. A request extends `Zolta\Http\Request\BaseRequest`. The installed adapter is a Laravel `FormRequest` bridge, but its purpose is to keep Laravel at the API boundary and hand a typed, framework-neutral DTO to Application.

### Pipeline order

```text
route metadata selects the request class and input DTO
  → Laravel FormRequest authorization
  → route/query parameters are normalized and merged into request input
  → Laravel validation rules run
  → validated payload is collected
  → Zolta builds allowed query-options payload, when configured
  → trustedData() is merged last (server values override client keys)
  → Zolta maps the result to the declared input DTO
  → invokable Application service receives the DTO
```

The final merge is a security boundary. A client may send `user_id`, `project_id`, `actor_user_id`, `tenant_id`, or an access-token identifier, but a request must replace those with a value resolved from authentication, middleware, or a trusted route context. Do not accept authority-bearing identifiers from the body or query string.

An API adapter may use an authentication resolver to obtain the current principal and token context. Authenticated requests should inject the resolved actor identifier with `trustedData()`. Uploaded files should be converted into an Application-owned immutable descriptor before Application sees them.

### Request features

The table distinguishes request extension points to use intentionally from bridge methods Zolta invokes for us. The guidance is about transport concerns only; business rules remain in inner layers.

| Feature | Purpose | Use it when |
| --- | --- | --- |
| `authorize(): bool` | Laravel FormRequest gate for API-level access to this endpoint. | The request can decide whether an authenticated principal may enter the transport boundary. Keep stateful business authorization in Domain/Application. |
| `rules(): array` | Laravel validation rules for transport presence, shape, encoding, file type/size, syntactic format, and bounded input. | Always. It is the authoritative validation contract for body, route, and normalized query input. |
| `messages(): array` | Endpoint-specific human-readable validation messages. | A public API needs clearer, stable messages than Laravel defaults. Do not put domain decisions here. |
| `attributes(): array` *(Laravel FormRequest)* | Human-readable field names used in validation errors. | Error copy needs field aliases. |
| `prepareForValidation()` *(Laravel FormRequest)* | Normalize a transport representation before validation. | A safe, local normalization is needed, such as trimming/renaming a purely transport field. Never perform I/O or business decisions. |
| `withValidator()` / `after()` *(Laravel FormRequest)* | Add cross-field transport validation after a validator is built. | A syntactic request-level relationship cannot be expressed by ordinary rules. Domain invariants still belong in Domain. |
| `trustedData(): array` | Supplies server-derived values that Zolta merges **after** `validated()`. Same-named client values cannot override it. | Authenticated actor/tenant/project/ownership scope, current token ID, resolved route identity, request metadata, or a framework file converted into an Application DTO. |
| `withData(): array` | Legacy alias for trusted values. | Do not use in new code. |
| `routeParams(): array` | Declares route parameters to merge into request input, with optional basic type conversion. | A route value must be validated and mapped to the input DTO alongside body data. |
| `queryParams(): array` | Declares query keys to merge into input, with basic type conversion, delimiter splitting, defaults, and dot notation. | A query parameter must be normalized before validation/DTO mapping. |
| `queryOptions(): array` | Configures Zolta's normalized query-options payload: default includes, server context, strict mode, and allowed filters/sorts. | A read endpoint intentionally exposes filtering, includes, sorting, or pagination. |
| `options(): array` | Alias used by the bridge for `queryOptions()`. | Do not normally override it; override `queryOptions()` for clarity. |
| `optionsPayload(): ?array` | Produces the normalized `options` payload added by Zolta before DTO mapping. It contains filters, includes, sort, limit, page, context, and strict allow-lists when configured. | Let the framework call it. DTOs for searchable reads can accept an `options` argument. |
| `toInputDto(?string $dtoClass)` | Executes the bridge mapping from validated/trusted request data to the declared input DTO. | Let the `#[Request]` attribute pipeline call it. Call manually only in an explicit, justified adapter integration. |
| `dtoClass()` *(protected bridge hook)* | Resolves an optional DTO class if there is no request attribute DTO. | Normally do not override: declare the DTO in `#[Request]` so the endpoint contract is visible. |
| `authorizeAction(string|array $action, mixed $subject)` | Delegates a named action check to Zolta's authorization service. |
| `configureDependencies()` *(protected bridge hook)* | Resolves additional API-adapter collaborators without modifying the FormRequest constructor. | Rarely, for transport-only concerns. Prefer middleware or an explicit adapter; never resolve repositories or orchestrate use cases here. |
| `getRouteParameters()` | Returns Laravel route parameters for bridge normalization. | Framework/adapter use; do not normally override. |

`routeParams()` and `queryParams()` support the following normalizers:

```php
public function routeParams(): array
{
    return ['task' => ['type' => 'string']];
}

public function queryParams(): array
{
    return [
        'page' => ['type' => 'integer'],
        'include' => ['type' => 'array', 'delimiter' => ','],
        'filters.status' => ['type' => 'string', 'default' => 'active'],
    ];
}
```

Supported primitive conversions are `int`/`integer`, `float`/`double`, `bool`/`boolean`, `array`, and `string`. Query values may be split by `delimiter`; `default` applies only when the incoming value is `null`; dot notation builds nested input. These are input-shaping helpers, not a security policy. In the installed version, a `required` item in either configuration is not enforced by the normalizer itself—declare `required` in `rules()`.

### Validation responsibilities

| Concern | Correct location |
| --- | --- |
| Required fields, JSON/form shape, scalar type, email/UUID syntax, file MIME/size, pagination bounds | API request `rules()` |
| Friendly validation copy | API request `messages()` / `attributes()` |
| Actor, tenant, project, ownership, request metadata, converted uploaded-file descriptor | API request `trustedData()` from a trusted source |
| Public filter/include/sort allow-list | `queryOptions()` plus a second allow-list in the Infrastructure repository |
| Domain value validity, lifecycle transition, eligibility, uniqueness invariant, business authorization | Domain value object, aggregate, policy, specification, or invariant |
| I/O-dependent fact needed for a decision | Application port and orchestration; pass the resolved fact inward |

Never rely on request validation alone to preserve a domain invariant: the same command may later enter through a queue, CLI, scheduled job, or event consumer. Likewise, do not query Eloquent in a request simply to answer a business question; that makes the transport adapter own application/domain behaviour.

### Read-query safety

For a searchable endpoint, use both gates:

```text
request queryParams() normalizes input
  → request rules() validate it
  → queryOptions() declares allowed public filters/sorts/includes
  → DTO carries normalized options to the query
  → Infrastructure repository independently enforces its allow-list and trusted constraints
```

`queryOptions()` may pass a server-controlled `context` payload. It must never turn client-provided filters into mandatory tenant/ownership scope. Use a trusted repository constraint or an equivalent server-derived condition for that scope.

### Standard request template

```php
final class CompleteTaskRequest extends BaseRequest
{
    use ResolvesAuthenticatedIdentity;

    public function authorize(): bool
    {
        return $this->hasAuthenticatedIdentity();
    }

    public function routeParams(): array
    {
        return ['task' => ['type' => 'string']];
    }

    public function rules(): array
    {
        return [
            'task' => ['required', 'uuid'],
            'completed_on' => ['required', 'date_format:Y-m-d'],
        ];
    }

    public function trustedData(): array
    {
        return ['user_id' => $this->authenticatedUserId()];
    }
}
```

This request only admits and shapes HTTP input. The later command handler loads the aggregate, and `Task` decides whether completion is a valid transition.

---


---


### Alternatives and trade-offs

Use declarative `#[Request]` hydration for normal HTTP endpoints. For CLI, queue, or event entry points, construct the same input DTO directly; do not fabricate an HTTP request. Use `prepareForValidation()` for local representation normalization, and use an Application port when validation needs database or external facts.

### Failure, security, and verification

Authorization failures, malformed transport data, and DTO mapping failures stay at the API boundary. Trusted actor/tenant values must override client input, and request rules must not be treated as domain invariants. Verify route/query normalization, `trustedData()` precedence, allow-lists, unauthorized access, invalid payloads, and DTO construction with request tests.
---

[Architecture index](../index.md) · [Concept catalogue](../00-foundations/concepts.md)
