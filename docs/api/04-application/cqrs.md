# Commands, queries, and service orchestration

[← 04-application index](index.md) · [↑ Architecture home](../index.md) · [Concept catalogue](../00-foundations/concepts.md)

Related: [Application services](application-services.md) · [Domain model](../03-domain/ddd-model.md) · [Handler outcomes](handler-outcomes.md)

---

## Commands, queries, and service orchestration

Commands and queries are the Application layer's explicit messages. They make intent visible, allow Zolta to resolve one handler per message, and keep API transport details out of the use case.

### Command versus query

| Message | Meaning | Allowed work | Result |
| --- | --- | --- | --- |
| Command | “Please perform this intent.” | May load an aggregate, invoke Domain behavior, persist state, coordinate focused ports, and record events. | Explicit `Result::success(payload, events)` or `Result::failure(error)`. |
| Query | “Tell me this information.” | Reads a typed projection/read contract, applies trusted scope and allow-listed options, and returns data. | Typed payload, normally inside `Option::some/none/error` when presence matters. |

CQRS is semantic separation, not a class-count exercise. A single bounded context owns both message families, and the same aggregate repository may support several use cases where its interface remains domain-oriented. A screen-only dashboard query may instead use an Application-owned read contract and Infrastructure projection adapter.

### Message definitions

Messages extend the Zolta bases and contain immutable, typed intent only:

```php
final class CompleteTaskCommand extends Command
{
    public function __construct(
        public readonly TaskId $taskId,
        public readonly UserId $userId,
        public readonly LocalDay $completedOn,
    ) {}
}

final class GetTaskDashboardQuery extends Query
{
    public function __construct(
        public readonly UserId $userId,
        public readonly DateRange $range,
    ) {}
}
```

Commands and queries must not contain repositories, services, Eloquent models, HTTP requests, Laravel configuration, closures, or mutable arrays whose meaning is not defined. Use domain value objects for meaningful values; keep public query options as a deliberately typed options structure at the Application boundary.

### Handler mapping

Each message has one explicit handler:

```php
#[HandlesCommand(CompleteTaskCommand::class)]
final readonly class CompleteTaskCommandHandler { /* one command responsibility */ }

#[HandlesQuery(GetTaskDashboardQuery::class)]
final readonly class GetTaskDashboardQueryHandler { /* one query responsibility */ }
```

Zolta scans configured bounded-context roots and builds cached command/query maps. Missing mappings fail at runtime. The current map generator may allow a later duplicate to overwrite an earlier entry, so CI must verify one handler per message key. Handler attributes are ownership declarations, not decoration.

### Write orchestration

The application service performs boundary translation and dispatches the command:

```php
$payload = $this->applicationService
    ->runAndCapture(CompleteTaskCommand::class, [
        'taskId' => new TaskId($dto->taskId),
        'userId' => new ActorId($dto->actorId),
        'completedOn' => LocalDay::fromString($dto->completedOn),
    ])
    ->getOrFail();
```

The Zolta CQRS proxy resolves the message, hydrates the command, runs mapped validation when configured, invokes the handler, and captures its result. The handler then:

1. loads the aggregate through an inward-facing Domain repository contract;
2. invokes an intentful aggregate/policy method;
3. persists the root through that contract;
4. returns an explicit successful `Result` with the released events, or a semantic failure.

The service maps the returned payload to an output DTO. It does not decide whether the transition is valid, query Eloquent, send an HTTP response, or manually dispatch a duplicate event.

### Read orchestration

The application service dispatches a query with typed scope and options:

```php
['dashboard' => $dashboard] = $this->applicationService
    ->runAndCapture(GetTaskDashboardQuery::class, [
        'userId' => new ActorId($dto->actorId),
        'range' => DateRange::from($dto->from, $dto->to),
    ])
    ->getOrFail();
```

The query handler reads a projection/read repository, not a Laravel request or an ORM model. It must not update last-seen fields, write audit rows, rotate tokens, dispatch commands as a side effect, or mutate a cache-backed persistence record. The service maps the typed payload to a response DTO; an empty list is a typed empty collection, while an absent single resource uses `Option::none` when that distinction matters.

### `runAndCapture()` and orchestration context

`ApplicationService::runAndCapture()` catches dispatch exceptions and returns `Result::failure` for commands or `Option::error` for queries. It stores successful payloads in its capture context. This permits an explicit small workflow to reference a previous result through the Zolta proxy or `get(...)`, but that facility must not become a generic workflow language.

Use captured results only when the dependency is visible and meaningful:

```text
command A → capture named payload → command/query B consumes a specific value
```

Do not hide unrelated operations behind aliases, route names, dynamic message strings, or a catch-all “execute operation” command. Prefer a dedicated orchestration service with typed DTOs when a workflow genuinely spans several messages.

### Transactions

`ApplicationService::transactional()` is an explicit workflow boundary. It begins a transaction, executes the callback, rolls back on an exception, failed `Result`, or `none` `Option`, and commits otherwise. Use it when immediate consistency across the coordinated steps is a stated business requirement. One aggregate per command remains the default; events and idempotent consumers are preferred for eventual cross-aggregate/context work.

Do not assume ordinary `runAndCapture()` is transactional. Do not wrap every query in a transaction. Do not claim post-commit event delivery unless the configured adapter or outbox proves it.

### Validation and failure ownership

- API requests validate transport shape and supply trusted actor/tenant/route context.
- Optional Zolta command validators validate message-level input that applies to every entry point.
- Domain value objects, aggregates, policies, and invariants enforce business validity.
- Handlers translate repository absence and capability failures into semantic `Result::failure`/`Option` outcomes.
- Application services call `getOrFail()` so the outer Zolta HTTP exception pipeline can format the failure consistently.

Do not catch and flatten all exceptions into a generic “operation failed” response in the application service. Preserve semantic failures for the configured exception adapter and public contract.

### Anti-patterns

- A command handler that is a generic CRUD wrapper or directly accepts an Eloquent model.
- A query that writes “for convenience.”
- A handler that reimplements an aggregate invariant with `if` branches around direct property mutation.
- One command/query class with an `operation` switch for many unrelated actions.
- A service that injects every repository and external client in the bounded context.
- Direct `dispatchEvents()` in a normal coordinator after the handler already returned released events.
- A query that rehydrates a large aggregate solely to build a dashboard projection.
- A transaction added for convenience without a named immediate-consistency invariant.

### Command/query verification checklist

- Message extends the correct Zolta `Command` or `Query` base and is immutable.
- Message has exactly one mapped handler under the configured scan root.
- Command handler changes state only through aggregate behavior and inward repository/port contracts.
- Query handler has no persistence mutation and returns a typed projection outcome.
- Application service dispatches through `ApplicationService`, not a framework bus or direct handler construction.
- Command events are released once after persistence and flow through the successful `Result`.
- Query options and ownership scope are typed and trusted; client filters cannot override mandatory scope.
- Transaction use is explicit, justified, and tested for rollback/commit behavior.
- Architecture tests reject forbidden imports, duplicate mappings, handler side effects, and query mutations.

---


---

---

[Architecture index](../index.md) · [Concept catalogue](../00-foundations/concepts.md)
