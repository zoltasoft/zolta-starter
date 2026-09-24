# Foundations and dependency direction

[← 01-foundations index](index.md) · [↑ Architecture home](../index.md) · [Concept catalogue](../00-foundations/concepts.md)

Related: [Concept catalogue](../00-foundations/concepts.md) · [Request boundary](../02-boundaries/request-validation.md) · [Domain model](../03-domain/ddd-model.md)

---

## Purpose

A Zolta service can use a layered, modular-monolith architecture. A feature is a bounded context: it owns its language, use cases, domain model, persistence adapters, and public API surface. A bounded context may contain both commands and queries. CQRS separates operation responsibilities; it does **not** require a separate service for each read model.

```text
API / Presentation ───────► Application ───────► Domain
                                     │              ▲
                                     ▼              │
                           application ports        │
                                     ▲              │
Infrastructure ─────────────────────┴──────────────┘
```

Dependencies always point inward. Infrastructure is the composition and adapter layer: it implements contracts owned by Application or Domain, then binds them at startup.

## Non-negotiable dependency rules

### Domain

The Domain is framework-agnostic. It may use Zolta Forge domain primitives, such as aggregates, value objects, rules, invariants, specifications, policies, and domain-event contracts. It must not import Laravel, Eloquent, HTTP, queues, configuration, cache, storage, SDKs, API classes, Application classes, or Infrastructure classes.

The Domain owns business meaning:

- aggregate consistency boundaries and lifecycle transitions;
- entities with stable identity and behaviour;
- immutable, self-validating value objects where a primitive has domain meaning;
- semantic domain exceptions;
- rules, invariants, specifications, and policies that do not perform I/O;
- immutable, past-tense domain facts recorded by the aggregate.

An aggregate exposes intentful methods such as `complete`, `pause`, or `changeEmail`; callers do not set its state directly. It records a domain event when a meaningful fact has happened. It references other aggregates by identity unless a stated invariant truly requires immediate consistency.

### Application

The Application layer is also framework-agnostic apart from Zolta application/CQRS packages. It may depend on Domain and on its own interfaces (ports), DTOs, messages, payloads, and Zolta `ApplicationService`, commands, queries, `Result`, and `Option`. It must not import Laravel, Eloquent, Illuminate facades, Symfony HTTP types, API classes, Infrastructure classes, configuration, or concrete SDK clients.

Application owns use-case orchestration, not business rules:

1. accept a typed input DTO;
2. dispatch one explicit command or query through Zolta's application pipeline;
3. obtain external facts through a focused Application port when necessary;
4. load aggregate roots through Domain repository contracts;
5. invoke domain behaviour;
6. persist changed roots;
7. return a typed response DTO or payload.

A contract represents one capability, for example a mail sender, clock, token issuer, file store, or external identity gateway. Its Infrastructure implementation can use Laravel or an SDK, but that implementation never leaks inward. Do not create a broad “manager” contract that owns an entire use case.

### API / Presentation

API is the outer transport adapter. It is the only layer that should know HTTP, authentication middleware, request validation, HTTP status codes, response resources, and OpenAPI documentation.

A Zolta API can use a declarative, one-endpoint controller:

```php
#[Route(...) ]
#[Request(RequestClass::class, InputDTO::class)]
#[Service(ApplicationService::class, 'Success message')]
#[Response(ResponseResource::class)]
#[Doc(...)]
final class FeatureController extends Controller {}
```

The controller does not contain a manual action. A dedicated request validates transport shape and supplies trusted server context. For example, an authenticated request can derive an actor identifier in `trustedData()`; a client cannot substitute another actor. The request is then hydrated into a framework-neutral input DTO before Application is invoked. A resource owns the public response shape.

API must not query Eloquent, make domain decisions, orchestrate a use case, or pass a framework request/model into Application.

---

## A small dependency example

The inner contract is deliberately boring and stable:

```php
// Domain
interface TaskRepository
{
    public function find(TaskId $id): ?Task;
    public function save(Task $task): void;
}

// Application
final readonly class CompleteTask
{
    public function __construct(private TaskRepository $tasks) {}

    public function handle(CompleteTaskInput $input): CompleteTaskOutput
    {
        $task = $this->tasks->find($input->taskId) ?? throw new TaskNotFound();
        $task->complete();
        $this->tasks->save($task);
        return CompleteTaskOutput::from($task);
    }
}

// Infrastructure
final class EloquentTaskRepository implements TaskRepository
{
    public function find(TaskId $id): ?Task
    {
        return ($row = TaskRecord::query()->find($id->toString()))
            ? TaskMapper::toDomain($row) : null;
    }

    public function save(Task $task): void
    {
        TaskMapper::toRecord($task)->save();
    }
}
```

The same port can have an in-memory adapter for tests, a SQL adapter for production, or a remote adapter when the aggregate is owned by another service. Only the composition root chooses the implementation; the use case remains unchanged.

---

[Architecture index](../index.md) · [Concept catalogue](../00-foundations/concepts.md)
