# Domain model and DDD

[← 03-domain index](index.md) · [↑ Architecture home](../index.md) · [Concept catalogue](../00-foundations/concepts.md)

Related: [Value objects](value-objects.md) · [CQRS](../04-application/cqrs.md) · [Events](../07-cross-cutting/events.md)

---

## DDD building blocks


### Domain tree

Organize the Domain by business building block, not by framework or database concern:

```text
Domain/
  Aggregates/       consistency boundaries and intentful behavior
  Entities/         identity-bearing objects inside aggregates
  ValueObjects/     immutable semantic values
  Enums/            closed domain vocabularies and states
  Factories/        creation and persistence reconstitution
  Repositories/     inward-facing aggregate contracts
  Rules/            single-value validation
  Specifications/   reusable predicates
  Invariants/       cross-property or always-true conditions
  Policies/         domain decisions from supplied facts
  Services/         behavior belonging to no single object
  Events/           immutable domain facts
  Exceptions/       semantic business failures
  Transformers/     deterministic normalization before validation
```

Directories are optional and should appear only when the bounded context has that building block. Domain folders must not mirror `Models`, `Migrations`, `Controllers`, or other framework terminology.

Use a building block only when it protects real business meaning.

| Building block | Use it for | Example of ownership |
| --- | --- | --- |
| Aggregate root | a transactional consistency boundary | `Task` decides whether it can be completed for a local day |
| Entity | stable identity plus changing lifecycle | a completion that remains identifiable over time |
| Value object | immutable, validated domain value | `TaskId`, cadence, local day, task name |
| Factory | valid creation or explicit reconstitution | create new aggregate; restore persisted state without recording a new event |
| Repository contract | collection of aggregate roots in domain language | load/save a `Task` root |
| Read contract/projection | data shaped for a screen, not aggregate behaviour | dashboard summary or history calendar |
| Rule/specification/invariant | focused or composable domain validation | valid cadence; completion is allowed today |
| Policy | a business decision based on supplied facts | eligibility to change a state |
| Domain service | a genuine domain operation belonging to no one object | only when an aggregate/value object cannot own it |
| Domain event | an immutable completed business fact | `TaskCompleted`, `TaskStreakReached` |

Avoid pattern theatre: not every primitive needs a value object, and not every class change needs an event, factory, or domain service.

## Domain model construction and behavior

The Domain layer should make valid state the easiest state to create and invalid transitions difficult to express. The following patterns apply to any bounded context:

- Keep aggregate constructors private and expose named `create(...)` and `restore(...)`/`reconstitute(...)` paths. Creation establishes defaults and may record a creation event; reconstitution restores persisted state without replaying creation side effects.
- Zolta `Entity`/`AggregateRoot` supplies the event lifecycle: aggregate behavior records events internally, and `releaseEvents()` returns and clears them for the application pipeline.
- Keep aggregate state private. Expose intentful methods such as `suspend()`, `reactivate()`, `scheduleDeletion()`, or `changeEmail()` rather than public setters or direct property mutation.
- Make repeated transitions deliberately idempotent where the business meaning permits it. A no-op should not create duplicate state or duplicate events.
- Represent closed state vocabularies with enums or value objects, but let the aggregate own legal transitions and transition side effects.
- Keep entities inside an aggregate when their identity and lifecycle have meaning only within that consistency boundary. Create and restore nested entities through factories and domain identity methods.
- Use semantic types for identifiers, credentials, tokens, money, dates, and other values with invariants. Creation and reconstitution of sensitive values (for example plaintext versus hashed secrets) must remain distinct.
- Factories own valid creation and persistence reconstitution. Prefer typed factory inputs at the Application boundary; array-based factory APIs require explicit normalization and must not become an unvalidated domain backdoor.
- Place each rule at its narrowest owner: property rules validate one value, specifications express reusable predicates, invariants validate relationships across completed state, policies decide from supplied facts, and domain services handle behavior that belongs to no single object.
- Specifications, invariants, policies, and transformations are deterministic and side-effect free. Database uniqueness, availability, and other I/O-dependent facts belong behind an Application port and are passed into Domain as resolved facts.
- Return a meaningful eligibility decision for an expected business condition; throw a semantic domain exception for an impossible or unsafe state. Do not flatten every business failure into `false`.
- Use PHP standard-library types and Zolta domain primitives only. Framework helpers, ORM models, configuration, queues, and external SDKs remain outside Domain.
- Inject a clock or pass resolved time for time-dependent decisions when deterministic tests, retries, or replay matter; avoid hidden wall-clock dependencies deep inside behavior.

This separation gives the Application layer a small, predictable orchestration surface: it constructs or receives valid domain types, invokes one aggregate behavior, persists through a contract, and returns the explicit outcome.

---


### Lifecycle position

```text
validated Application input → factory/create → aggregate behavior → repository contract → restore/map → output payload
```

### Alternatives and trade-offs

Use an aggregate method when one consistency boundary owns the decision. Use a domain service only when behavior genuinely spans objects without belonging to one aggregate. Use a specification for reusable predicates and a policy for a decision from supplied facts; do not introduce all three for the same rule.

### Failure and security considerations

Invalid transitions raise semantic domain exceptions or return an explicit domain decision; they must not be silently normalized by a controller or ORM. Sensitive values require distinct plaintext creation and persisted-hash restoration paths.

### Verification checklist

Test creation versus restoration, invariant failures, idempotent transitions, event recording/release, nested-entity identity, value-object equality, deterministic clocks, and the absence of framework imports.
---

[Architecture index](../index.md) · [Concept catalogue](../00-foundations/concepts.md)
