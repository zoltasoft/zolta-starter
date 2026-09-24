# Vertical slices and CQRS principles

[← 07-cross-cutting index](index.md) · [↑ Architecture home](../index.md) · [Concept catalogue](../00-foundations/concepts.md)

Related: [Request/DTO](../02-boundaries/request-validation.md) · [Application/CQRS](../04-application/cqrs.md) · [Infrastructure](../06-infrastructure/index.md)

---

## A vertical slice


### Complete bounded-context tree

A feature slice crosses a stable layer tree:

```text
<BoundedContext>/
  API/
  Application/
    DTOs/
    Commands/
    Queries/
    Services/
    Contracts/
    Payloads/
  Domain/
    Aggregates/
    Entities/
    ValueObjects/
    Repositories/
    Events/
  Infrastructure/
    Models/
    Mappers/
    Repositories/
    Providers/
```

Add `Rules`, `Policies`, `Resources`, `Jobs`, `Listeners`, or other directories only when the slice needs them. Keep the business subject visible in the path, and avoid global technical folders that force unrelated bounded contexts to share implementation details.

### Write path

```text
Zolta HTTP attributes
  → API request validation + trusted actor/tenant data
  → Input DTO
  → invokable Application service
  → Command
  → mapped command handler
  → Aggregate method / domain policy
  → Domain repository contract
  → Infrastructure repository + mapper + persistence
  → Result(value, released domain events)
  → response DTO / API resource
```

A profile-update slice illustrates this shape: its controller declares route/request/service/response attributes; the request injects trusted actor context; the application service dispatches a typed command; the handler loads an aggregate through a repository contract, invokes aggregate methods, persists it, and uses a mailer port rather than a mail implementation.

Use `ApplicationService::transactional()` when a multi-step workflow has a real atomicity requirement. A normal dispatch is not an implicit application transaction. By default, one command changes one aggregate root.

### Worked Zolta slice (compact but complete)

The following is the smallest useful end-to-end shape; each class still has one responsibility:

```php
// API
#[Route('/tasks/{taskId}/complete', methods: ['POST'], auth: true)]
#[Request(CompleteTaskRequest::class, CompleteTaskDTO::class)]
#[Service(CompleteTaskService::class, 'Task completed')]
#[Response(TaskResource::class)]
final class CompleteTaskController extends Controller {}

// Application
#[AsApplicationService]
final readonly class CompleteTaskService
{
    public function __construct(private ApplicationService $cqrs) {}

    public function __invoke(CompleteTaskDTO $input): TaskResponseDTO
    {
        $payload = $this->cqrs
            ->runAndCapture(CompleteTaskCommand::class, [
                'taskId' => TaskId::fromString($input->taskId),
                'actorId' => ActorId::fromString($input->actorId),
            ])
            ->getOrFail();

        return TaskResponseDTO::fromDomain($payload['task']);
    }
}

// Application/CQRS
#[HandlesCommand(CompleteTaskCommand::class)]
final readonly class CompleteTaskHandler
{
    public function __construct(private TaskRepository $tasks) {}

    public function __invoke(CompleteTaskCommand $command): Result
    {
        $task = $this->tasks->findForActor($command->taskId, $command->actorId);
        if ($task === null) return Result::failure(new TaskNotFound());
        $task->complete();
        $this->tasks->save($task);
        return Result::success(new TaskPayload($task), $task->releaseEvents());
    }
}

// Domain
final class Task extends AggregateRoot
{
    public function complete(): void
    {
        if ($this->status->isComplete()) return; // deliberate idempotence
        $this->status = TaskStatus::Completed;
        $this->recordThat(new TaskCompleted($this->id));
    }
}
```

`CompleteTaskRequest` owns transport rules and trusted actor data; `CompleteTaskDTO` is framework-neutral; `TaskRepository` is an inner contract; Infrastructure supplies its mapper/repository/provider; `TaskResource` owns only the public response shape. For the expanded request, DTO, resource, transaction, and alternative patterns, follow the linked layer chapters above.

### Read path

```text
Zolta HTTP attributes
  → API request query allow-list + validation
  → Input DTO
  → invokable Application service
  → Query
  → mapped query handler
  → read repository / projection adapter
  → typed payload or response DTO
  → API resource
```

A list slice uses `ListService → ListQuery → ListQueryHandler`. The handler creates Zolta query options and obtains its result through a repository contract. Request-level allow-lists constrain supported filters, includes, sorting, and pagination; the persistence adapter must independently constrain what it executes. Trusted ownership, tenant, or project constraints are derived from server context, never raw client filters.

A query is side-effect free. It must not write audit state, rotate a token, update a last-seen timestamp, or mutate persistence. Queries that only render a screen should use a typed read contract/projection and should not rehydrate aggregates unnecessarily.

## CQRS in one bounded context

CQRS means commands express intent and can change state, while queries retrieve state and do not mutate. It is applied inside a bounded context.

```text
TaskService
  Application/
    Commands/Tasks/CreateTask/...
    Commands/Tasks/CompleteTask/...
    Queries/Tasks/ListTasks/...
    Queries/Tasks/GetTaskDashboardSummary/...
    Services/Tasks/...
```

A dashboard, history, list, and detail query remain in the bounded context that owns their language and data. A separate bounded context is justified only when it owns different language, lifecycle, invariants, and integrations—not merely because it reads data.

Each use case has:

- an endpoint-specific input DTO;
- one invokable Application service;
- one explicit command **or** query;
- one mapped handler with one responsibility;
- typed output at the application/API boundary.

Command handlers return an explicit `Result`. Queries use `Option` when absence has business meaning; collection queries normally return a typed empty collection rather than “missing.”

---

---

[Architecture index](../index.md) · [Concept catalogue](../00-foundations/concepts.md)
