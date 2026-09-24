# DTO flow between API and Application

[← 02-boundaries index](index.md) · [↑ Architecture home](../index.md) · [Concept catalogue](../00-foundations/concepts.md)

Related: [Request validation](request-validation.md) · [Application services](../04-application/application-services.md) · [Presentation responses](../05-presentation/responses.md)

---

## DTO flow between API and Application

DTOs form the anti-corruption boundary between HTTP transport and the use-case layer. API requests know Laravel; Application DTOs do not. DTOs carry typed data and mapping semantics, not persistence, authorization, domain transitions, or workflows.

```text
HTTP body / route / query / trusted context
  → #[Request(RequestClass::class, InputDTO::class)]
  → BaseRequest validates and normalizes
  → Zolta RequestMapper adds options, then trustedData()
  → typed InputDTO → Application service → Command / Query
  → typed payload / Domain result → ResponseDTO → API Resource
```

### Input DTOs

Input DTOs extend `Zolta\Support\Application\DTO\Input\InputDTO` (or implement its contract). They should be final, immutable, use-case-specific, and framework-agnostic. The Zolta base provides the normalized `toArray()` capability.

```php
final class CompleteTaskDTO extends InputDTO
{
    public function __construct(
        #[FromRequest('task')]
        public readonly string $taskId,
        #[FromRequest('completed_on')]
        public readonly string $completedOn,
        #[FromRequest('user_id')]
        public readonly string $userId,
    ) {}
}
```

API `rules()` validate transport shape. The Application service may translate primitives into `TaskId` or `LocalDay`; Domain value objects and aggregates remain the final authority for domain validity and invariants.

### `#[Request]` and mapper order

`#[Request(RequestClass::class, InputDTO::class)]` binds the transport request to its input type. The installed Laravel mapper:

1. calls `validated()`;
2. injects an `options` payload from `optionsPayload()` when absent;
3. merges `trustedData()` (or deprecated `withData()`) last, so server values override client keys;
4. optionally applies a mapping callback;
5. returns an array only when no DTO class is declared, otherwise invokes the framework-agnostic core mapper.

The core mapper reflects constructor parameters, supports parameter-name defaults and `#[FromRequest('field')]` aliases, resolves dot paths, honors defaults/nullability, coerces `bool`/`int`/`float`/`string`, recursively maps nested DTOs, and raises `ValidationException` for missing required values. Attributes with a `validate()` method on non-promoted properties are also evaluated.

`FromRequest` declares an optional `transformer` property, but this installed mapper currently uses only `field`. Do not rely on `transformer:` until implemented and tested; use request normalizers for transport shaping and Zolta Forge transformations/value objects for domain shaping.

### Input mapping alternatives

| Situation | Recommended approach |
| --- | --- |
| Stable HTTP endpoint | `#[Request(..., InputDTO::class)]` plus `FromRequest` aliases. |
| Search/list endpoint | Request `queryParams()` + `queryOptions()`; DTO carries normalized `options`. |
| Route identifier | `routeParams()` normalizes, `rules()` validates, `trustedData()` supplies actor/ownership scope. |
| Uploaded file | Convert Laravel `UploadedFile` to an immutable Application descriptor such as `UploadedAsset`. |
| Queue/CLI/event entry point | Construct the same Application DTO directly; do not fake an HTTP request. |
| Legacy compatibility endpoint | Omit the DTO only deliberately and document the array contract. |

### Output DTOs

Output DTOs extend `Zolta\Support\Application\DTO\Output\ResponseDTO` (or implement its contract). They are typed results from Application to API and may expose deliberate `fromDomain()`, `fromProjection()`, or `toArray()` mappings.

```php
final class TaskResponseDTO extends ResponseDTO
{
    public function __construct(
        public readonly string $id,
        public readonly string $title,
        public readonly string $status,
    ) {}

    public static function fromDomain(Task $task): self
    {
        return new self($task->id()->toString(), $task->title()->toString(), $task->status()->toString());
    }
}
```

Output DTOs must not expose Eloquent models, repositories, requests, secrets, password hashes, or mutable aggregate internals. `#[Response(Resource::class)]` remains responsible for the HTTP envelope and serialization details.

### DTO boundary rules

- Input DTOs are not Domain entities and are never persisted.
- Output DTOs are not aggregates and must not be sent back inward as mutable state.
- Application translates primitives to domain values before command dispatch; handlers receive typed messages, not HTTP arrays.
- Domain objects reach API only through explicit Application mapping, never ORM serialization.
- Do not put repository lookups, network calls, event dispatch, or business authorization in DTO constructors or `toArray()`.
- Do not pass `Illuminate\Http\Request`, `UploadedFile`, Eloquent models, or Laravel collections into Application.
- Do not let client fields override trusted actor/tenant/project values during mapping.

### DTO verification checklist

- `#[Request]` names the intended request and input DTO.
- DTOs are immutable, use-case-specific, and import only Application, Domain, PHP, and Zolta types.
- Every transport field is covered by request rules; every trusted field comes from `trustedData()`.
- `FromRequest` aliases match validated/trusted keys, including nested paths.
- Required constructor parameters have a value or intentional default/nullable type.
- Output DTOs exclude secrets/internal state and pair with a response resource.
- Tests cover aliases, scalar coercion, nested DTOs, missing values, trusted precedence, and output normalization.

---

---

[Architecture index](../index.md) · [Concept catalogue](../00-foundations/concepts.md)
