# Use-case application services

[← 04-application index](index.md) · [↑ Architecture home](../index.md) · [Concept catalogue](../00-foundations/concepts.md)

Related: [DTO flow](../02-boundaries/dto-flow.md) · [CQRS](cqrs.md) · [Handler outcomes](handler-outcomes.md)

---

## Use-case application services

An application service is the invokable, typed entry point for **one use case**. It receives an input DTO from the API (or from another outer adapter), coordinates the Zolta CQRS pipeline, and returns an application response DTO. It is not a Laravel service, an Eloquent repository, a generic “manager,” or the owner of domain rules.

```text
API Request DTO
  → Application Service (use-case coordinator)
  → Command or Query
  → mapped Handler (message executor)
  → Domain aggregate / policy + repository or port
  → Result or Option payload
  → Application response DTO
  → API Resource
```

A bounded context can contain command and query application services side by side.

### Responsibilities by class

| Class | Owns | Must not own |
| --- | --- | --- |
| Input DTO | Typed boundary data from the request/consumer. | HTTP request objects, Eloquent models, or business validation that belongs in Domain. |
| Application service | Use-case entry point, primitive-to-domain-value conversion where needed, explicit message dispatch, workflow transaction boundary, and response DTO mapping. | Eloquent, Laravel facades/helpers, HTTP responses, configuration, domain state transitions, or generic CRUD. |
| Command/query | Immutable expression of one intent or read. | Repository access, framework objects, or handler logic. |
| Command handler | Load aggregate roots and required ports, invoke domain behavior, persist, return explicit `Result` and released events. | HTTP/response concerns, Eloquent models, or reimplementation of a domain rule. |
| Query handler | Read a typed projection through a read contract/repository and return `Option` where absence matters. | Mutations, aggregate lifecycle behavior, or a hidden write. |
| Output DTO/payload | Typed result between Application and API. | HTTP serialization rules; the API resource owns those. |

### Application tree

Organize Application by use-case responsibility:

```text
Application/
  DTOs/
    Input/
    Output/
    External/             optional integration DTOs
  Commands/<Subject>/<UseCase>/
    <UseCase>Command.php
    <UseCase>CommandHandler.php
  Queries/<Subject>/<UseCase>/
    <UseCase>Query.php
    <UseCase>QueryHandler.php
  Services/<Subject>/     invokable use-case coordinators
  Contracts/              ports owned by Application
  Payloads/               handler-to-service result shapes
  Exceptions/             application capability/use-case failures
  Policies/               optional application-level authorization
```

Keep commands, queries, handlers, and services grouped by the bounded context’s business subject. Add `External`, `Exceptions`, or `Policies` only when their responsibility exists. Application directories must not contain ORM models, migrations, framework controllers, resources, or concrete Infrastructure adapters.

### Required shape

Place the class under the bounded context, grouped by the ubiquitous-language subject:

```text
TaskService/Application/
  DTOs/Input/CompleteTaskDTO.php
  DTOs/Output/TaskResponseDTO.php
  Commands/Tasks/CompleteTask/
    CompleteTaskCommand.php
    CompleteTaskCommandHandler.php
  Queries/Tasks/GetTaskDashboard/
    GetTaskDashboardQuery.php
    GetTaskDashboardQueryHandler.php
  Services/Tasks/
    CompleteTaskService.php
    GetTaskDashboardService.php
```

Every service is `final`, `readonly`, invokable, and discoverable with `#[AsApplicationService]`:

```php
#[AsApplicationService]
final readonly class CompleteTaskService
{
    public function __construct(private ApplicationService $applicationService) {}

    public function __invoke(CompleteTaskDTO $dto): TaskResponseDTO
    {
        $payload = $this->applicationService
            ->runAndCapture(CompleteTaskCommand::class, [
                'taskId' => new TaskId($dto->taskId),
                'userId' => new ActorId($dto->actorId),
                'completedOn' => LocalDay::fromString($dto->completedOn),
            ])
            ->getOrFail();

        return TaskResponseDTO::fromDomain($payload['task']);
    }
}
```

The service may construct domain value objects from already-validated DTO primitives. That is boundary translation, not business logic. The value object remains the final owner of its own validity. If external facts are needed before a command can run, inject a focused **Application-owned contract**, obtain the fact, and pass a typed value to the command/Domain; never inject an Infrastructure implementation.

### Command use case

```text
Input DTO
  → application service dispatches one command
  → command handler loads aggregate through a Domain repository
  → aggregate performs the intentful transition and records meaningful events
  → handler persists the aggregate
  → handler returns Result::success(payload, aggregate->releaseEvents())
  → application service maps the payload to an output DTO
```

The handler is deliberately small:

```php
#[HandlesCommand(CompleteTaskCommand::class)]
final readonly class CompleteTaskCommandHandler
{
    public function __construct(private TaskRepository $tasks) {}

    public function __invoke(CompleteTaskCommand $command): Result
    {
        $task = $this->tasks->findForUser($command->taskId, $command->userId);

        if ($task === null) {
            return Result::failure(new TaskNotFound);
        }

        $task->complete($command->completedOn);
        $this->tasks->save($task);

        return Result::success(
            new TaskPayload($task),
            $task->releaseEvents(),
        );
    }
}
```

The event release is part of the successful command outcome and occurs after persistence. Do not manually call `dispatchEvents()` from a normal application-service coordinator, and do not dispatch a second copy from an API controller. Zolta's successful-result event pipeline handles mapped domain events. Any stronger after-commit/outbox guarantee remains a separate, verified Infrastructure concern.

### Query use case

```php
#[AsApplicationService]
final readonly class GetTaskDashboardService
{
    public function __construct(private ApplicationService $applicationService) {}

    public function __invoke(GetTaskDashboardDTO $dto): TaskDashboardResponseDTO
    {
        ['dashboard' => $dashboard] = $this->applicationService
            ->runAndCapture(GetTaskDashboardQuery::class, [
                'userId' => new ActorId($dto->actorId),
                'range' => DateRange::from($dto->from, $dto->to),
            ])
            ->getOrFail();

        return TaskDashboardResponseDTO::fromProjection($dashboard);
    }
}
```

The query handler reads a projection/read contract shaped for the dashboard; it does not call aggregate mutation methods or persist anything. A dashboard, history, list, and detail query remain part of `TaskService` when that bounded context owns the language and data. CQRS separates the operation paths, not necessarily the service directory.

### Error, absence, and outputs

- `runAndCapture()` converts command exceptions into a failed `Result` and query exceptions into an error `Option`; `getOrFail()` deliberately propagates the failure to Zolta's API exception handling.
- Command handlers return `Result::success(...)` or `Result::failure(...)` explicitly. Do not depend on a bus convenience that may wrap an arbitrary return value.
- Query handlers use `Option::some`, `Option::none`, or `Option::error` when a single item can be absent. Lists return a typed empty collection/pagination result rather than `none`.
- Application services return a named output DTO (or the project's established typed payload), never arrays leaked directly to an HTTP response.
- A write should normally return its command result. Dispatching a query after a command is allowed only when the API contract genuinely needs a freshly shaped read model; it must not make the write's success dependent on an unrelated projection unless that consistency requirement is explicit.

### Transactions and multi-step workflows

Most commands change one aggregate and need no larger workflow transaction. When a use case has a stated immediate-consistency requirement across several dispatches or ports, make the boundary visible with `ApplicationService::transactional()`:

```php
return $this->applicationService->transactional(
    function (ApplicationService $applicationService) use ($dto): CreateTaskResponseDTO {
        $payload = $applicationService
            ->runAndCapture(CreateTaskCommand::class, [/* typed arguments */])
            ->getOrFail();

        return CreateTaskResponseDTO::fromDomain($payload['task']);
    },
);
```

`transactional()` rolls back a failed `Result`, a `none` `Option`, or an exception and commits a successful callback result. It is not a reason to place unrelated aggregates in one transaction. Prefer a domain event and an idempotent consumer across aggregate or bounded-context boundaries.

### Application-service rules

- One public `__invoke()` method, one named use case, one input DTO, and one output DTO.
- Dispatch one primary command or query. A small, explicit workflow is acceptable; a generic dispatcher or operation switch is not.
- Keep imports limited to Application, Domain, PHP standard-library types, PSR contracts where justified, and Zolta packages. No `Illuminate`, `Symfony`, Eloquent, API, Infrastructure, or concrete SDK imports.
- Inject `ApplicationService` and only focused Application contracts required to coordinate the workflow.
- Convert transport primitives to domain value objects at this boundary or through command hydration; do not pass untyped associative request arrays into handlers.
- Let the aggregate/policy decide business validity. A handler may handle technical absence/failure, but must not duplicate a state-transition rule.
- Never make a query write state, call a queue directly, send HTTP directly, or construct an HTTP response.
- Do not use application services as shared helper bags. Extract a focused port or a genuine Domain service only when the model requires it.

### Verification checklist

- The service is invokable, typed, attributed, and owns one use case.
- Its dependencies point only inward; an import test protects this.
- Its command/query has one mapped handler and no duplicate map entry.
- The command handler persists before it releases events in `Result::success`.
- A query performs no persistence mutation and uses a projection/read contract where aggregate behavior is unnecessary.
- Every multi-step transaction has a documented immediate-consistency reason.
- Tests cover the Domain invariant, handler orchestration, service input/output mapping, and API contract independently.

---


---

---

[Architecture index](../index.md) · [Concept catalogue](../00-foundations/concepts.md)
