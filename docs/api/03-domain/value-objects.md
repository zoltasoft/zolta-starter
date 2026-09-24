# Value objects with Zolta Forge

[← 03-domain index](index.md) · [↑ Architecture home](../index.md) · [Concept catalogue](../00-foundations/concepts.md)

Related: [Domain model](ddd-model.md) · [Application services](../04-application/application-services.md) · [Infrastructure](../06-infrastructure/index.md)

---

## Value objects with Zolta Forge

A value object (VO) represents a domain value whose meaning is its value rather than an identity. It is useful when a value has normalization, validity, equality, formatting, or a small domain behavior that should be consistent everywhere. Examples are `TaskId`, `LocalDay`, `Email`, `Money`, a cadence, or a bounded title—not every primitive in the system.

Value objects belong in Domain and must remain framework-agnostic. They may use Zolta Forge primitives and PHP standard-library types, but must not import Laravel, Eloquent, HTTP, configuration, persistence, queues, or SDKs. They are immutable from the caller's perspective: no public setters, no hidden I/O, and no framework lifecycle hooks.

### Why use a value object

- Replace primitive obsession with a named domain concept.
- Normalize equivalent representations once (`"  SAVED "` → `"saved"`).
- Reject invalid values at construction, regardless of whether the use case came from HTTP, a queue, or a CLI.
- Make method signatures communicate intent (`TaskStatus`, not `string`).
- Centralize equality and serialization semantics.
- Keep aggregate invariants readable by passing meaningful types instead of unbounded scalars.

Do not create a VO merely to wrap an unconstrained string. Introduce one when it protects a real rule, semantics, normalization, or type distinction. A VO is not an Entity: it has no independent lifecycle identity and is normally compared by value.

### Zolta Forge base capabilities

The installed `Zolta\Domain\ValueObjects\ValueObject` base provides:

- immutable-style reflection-based construction support;
- `resolve(array $data, ?VOConstructionContext $context = null)` as a factory-style entry point;
- `get(string|array $key)` for named values;
- `toArray()` using configured `$getters` or discovered properties;
- `equals(VO $other)` by normalized payload;
- `jsonSerialize()` and `__toString()` normalization;
- recursive normalization for nested VOs, traversables, dates, enums, JSON-serializable values, and strings.

`AbstractUuid` is the standard identity specialization. It generates a UUID when no value is supplied, validates through a Zolta rule, and exposes `fromString()`, `default()`, and `toString()`. A bounded context should subclass it for semantic identity (`TaskId`, not a generic UUID) so unrelated identifiers cannot be mixed accidentally.

### Construction alternatives

| Construction | Use it for | Example |
| --- | --- | --- |
| Named constructor | A readable domain creation intention or a common valid default. | `TaskStatus::active()`, `AmountRange::unknown()`. |
| `fromString()` / `fromNullable()` | Explicit conversion at an Application or mapper boundary. | `TaskStatus::fromString($dto->status)`, `CallbackUrl::fromNullable($url)`. |
| `fromRange()` / `fromArray()` | Multi-property values with a clear input shape. | `AmountRange::fromRange($min, $max)`, `Address::fromArray($data)`. |
| `resolve(array)` | Zolta Forge's attribute-aware construction pipeline, especially when the VO has transforms, rules, nested values, or runtime context. | `Email::resolve(['address' => $raw])`. |
| `restore(...)` on an aggregate/factory | Reconstituting persisted state. | `User::restore(...)`; do not record a “created” event while restoring. |
| `new ConcreteVO(...)` | A simple VO whose constructor is already the clearest valid API. | `new TaskTitle($title)`. |

Prefer named constructors for ubiquitous language and `resolve()`/attribute metadata where the value has a reusable pipeline. All construction paths must produce a valid value; do not expose a public constructor that bypasses the same invariants.

### Forge resolution pipeline

For a `ValueObject` with a constructor property, `VOAutoResolution` executes:

```text
raw property value
  → runtime/default preprocessor
  → property transforms (in declaration order)
  → property rules
  → property specifications
  → nested ValueObject resolution
  → construction
  → class-level invariants
  → class-level policies
```

The pipeline is reflection-cached. `VOConstructionContext` can provide runtime preprocessors, runtime options, and an intentional `skipResolve` flag for adapter-specific construction. Runtime options can override static transform/rule/specification options. A preprocessor may normalize a value but must not perform persistence or network I/O.

### Attributes and responsibilities

```php
#[UseInvariant(AmountRangeInvariant::class)]
final class AmountRange extends ValueObject
{
    protected array $getters = ['min', 'max'];

    public function __construct(
        #[UseRule(NonNegativeIntegerRule::class, ['paramName' => 'min'])]
        protected ?int $min,
        #[UseRule(NonNegativeIntegerRule::class, ['paramName' => 'max'])]
        protected ?int $max,
        protected ?VOConstructionContext $context = null,
    ) {
        parent::__construct();
    }
}
```

| Forge feature | Purpose | Correct use |
| --- | --- | --- |
| `#[Transform(...)]` | Normalize representation before validation. | Trim/lowercase a string, parse a date, or normalize a code. Never perform I/O. |
| `#[UseRule(...)]` | Validate one property value. | Non-empty, max length, UUID, non-negative number, or URL syntax. |
| `#[UseSpecification(...)]` | Apply a composable predicate to a property. | A reusable “allowed provider” or “strong password” condition. |
| `#[UseInvariant(...)]` | Validate the completed VO as a whole. | `min <= max`, mutually dependent fields, or “verified date cannot be future.” |
| `#[UsePolicy(...)]` | Apply a domain decision to the completed VO using supplied facts/options. | Only when the decision genuinely belongs to the value concept; do not query infrastructure. |
| `$getters` | Explicitly choose public `get()`/`toArray()` fields and aliases. | Use it when internal properties should not be exposed or a stable serialized name is needed. |
| `VOConstructionContext` | Supply runtime preprocessing/options without coupling the VO to a caller. | Specialized imports/reconstitution; keep the context small and deterministic. |

Rules should throw semantic Domain exceptions, specifications should remain side-effect-free predicates, and invariants/policies should receive resolved facts rather than loading repositories.

### Generic value-object examples

Use semantic identifier subclasses such as `AccountId`, `WorkspaceId`, or `DocumentId` rather than passing generic UUIDs throughout a bounded context. Richer value objects can normalize and validate names, statuses, URLs, money ranges, locations, or other structured values. The important distinction is that local value validity belongs in the value object, while a lifecycle transition belongs in the aggregate that owns the state.

These examples teach an important distinction: normalization and local value validity belong in the VO, while a state transition such as changing a record's status belongs in the aggregate (for example, `Record::transitionTo()`), even if `TaskStatus` exposes the reusable transition vocabulary.

### How Application hydrates value objects

The API request produces validated DTO primitives. The Application service or command hydrator then constructs domain VOs before the handler invokes Domain behavior:

```php
$command = new UpdateTaskCommand(
    actorId: new ActorId($dto->actorId),
    taskId: new TaskId($dto->taskId),
    status: TaskStatus::fromString($dto->status),
);
```

For VOs with multiple or optional values, use the named factory at the boundary:

```php
'redirectUrl' => CallbackUrl::fromNullable($dto->redirectUrl),
'salary' => AmountRange::fromRange($dto->salaryMin, $dto->salaryMax),
'location' => $dto->location === null ? null : Address::fromArray($dto->location),
```

Zolta message hydration can also resolve supported nested/value-object types when the command/query is dispatched with named arguments. Use automatic hydration for straightforward typed constructors; use an explicit Application conversion when the input needs a semantic factory, nullable policy, or a clearer boundary transformation. Either way, the resulting command carries domain types, not raw HTTP strings.

### Reconstitution and persistence

Infrastructure mappers translate database columns into VOs and call an explicit aggregate `restore(...)`/factory path. Reconstitution restores trusted persisted state; it is not a public mutation backdoor and must not emit a creation event. The reverse mapper extracts VO values through `toString()`, `get()`, accessors, or `toArray()` and writes persistence primitives. No Eloquent model crosses into Application or Domain.

### VO rules and boundary validation

API validation and VO validation complement each other:

- API request rules: requiredness, payload shape, encoding, file limits, and HTTP syntax;
- VO rules/specifications: value validity independent of transport;
- aggregate/invariant/policy: relationships between values and current state;
- Application: orchestration and external fact gathering.

Do not trust an API `uuid`, `url`, or `max` rule as a substitute for a VO. A command invoked from a queue must receive the same protection. Conversely, do not place database uniqueness or external service availability inside a VO; use an Application port/repository and then pass the resolved fact to Domain.

### VO anti-patterns

- Public setters or mutable arrays that let callers bypass construction invariants.
- A VO importing Laravel helpers, Eloquent, HTTP, configuration, or external SDKs.
- A transformer/rule that performs I/O.
- A “God VO” containing unrelated business workflows.
- Wrapping every scalar without a semantic rule or type distinction.
- Serializing a VO by exposing internal implementation fields accidentally.
- Treating `resolve()` as a persistence lookup rather than deterministic construction.


### VO verification checklist

- The value has domain meaning and justified invariants.
- Construction is immutable, deterministic, and yields a valid object.
- Transforms run before rules; class invariants/policies run after construction.
- Equality, string conversion, and `toArray()` expose a deliberate stable representation.
- The VO imports only PHP, its bounded context, and Zolta packages.
- No rule, transform, specification, invariant, or policy performs I/O.
- Application commands receive VOs or explicitly typed primitives at the intended boundary.
- Infrastructure maps persistence values to/from VOs without leaking ORM types inward.
- Direct unit tests cover valid, invalid, normalized, nullable, nested, and invariant-failure cases.

---


---

---

[Architecture index](../index.md) · [Concept catalogue](../00-foundations/concepts.md)
