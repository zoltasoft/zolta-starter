# Events, listeners, and jobs

[← 06-infrastructure index](index.md) · [↑ Architecture home](../index.md) · [Concept catalogue](../00-foundations/concepts.md)

Related: [Infrastructure index](index.md) · [Domain events](../07-cross-cutting/events.md) · [Application outcomes](../04-application/handler-outcomes.md)

---

## Events, listeners, and jobs

A pure Domain event is wrapped at the Infrastructure boundary with a framework event adapter, using Zolta domain-event mapping attributes where supported. Laravel event and queue traits belong only on the wrapper, listener, or job—not on the Domain event.

Listeners translate an integration event into an Application capability or use case. They do not reimplement aggregate rules. Queue listeners and jobs must be idempotent, carry stable identifiers instead of large ORM graphs, define timeout/attempt/backoff policy, and record terminal failure when the business requires it. Use `afterCommit`, a transactional outbox, or an equivalent mechanism when the consumer must not observe uncommitted state or event publication must survive a process failure.

## Example: keep the event wrapper thin

```php
// Infrastructure
#[HandlesDomainEvent(TaskCompleted::class)]
final readonly class TaskCompletedIntegration
{
    public function __construct(public string $taskId, public string $ownerId) {}
}

final class NotifyTaskCompleted
{
    public function handle(TaskCompletedIntegration $event): void
    {
        $this->notifications->send($event->ownerId, 'task.completed', [
            'task_id' => $event->taskId,
        ]);
    }
}
```

For a cheap, local side effect the listener may run synchronously. For mail, indexing, or another bounded context, queue a small job containing stable IDs and use retry/backoff. `afterCommit` is sufficient when the framework can guarantee it; use an outbox when publication must be durable across process failure.


### Lifecycle position

```text
committed aggregate event → framework wrapper → listener/job → Application capability or use case
```

### Alternatives and trade-offs

Run a listener synchronously for a cheap local reaction, queue a job for retryable work, or use `afterCommit`/an outbox when publication must respect or survive a transaction. The event wrapper may contain framework metadata; the Domain event may not.

### Failure, security, and verification

Carry stable identifiers, validate authorization at the consumer boundary, and avoid replaying non-idempotent effects. Verify retry/backoff/timeout policy, duplicate delivery, after-commit behavior, terminal failure handling, and event-wrapper mapping.
---

[Infrastructure index](index.md) · [Architecture index](../index.md) · [Concept catalogue](../00-foundations/concepts.md)
