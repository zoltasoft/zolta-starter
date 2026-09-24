# Infrastructure verification

[← 06-infrastructure index](index.md) · [↑ Architecture home](../index.md) · [Concept catalogue](../00-foundations/concepts.md)

Related: [Infrastructure index](index.md) · [Repositories](repositories.md) · [Events and jobs](events-and-jobs.md)

---

## Infrastructure verification

- Mapper tests cover persistence-to-domain and domain-to-persistence round-trips, nullable fields, nested entities, enums, dates, and hashed secrets.
- Repository tests cover ownership/tenant scope, filter/include/sort allow-lists, pagination, caching/streaming behavior, and missing records.
- Provider tests verify every interface binding and listener/event registration.
- Integration tests verify serialization, timeouts, retries, authentication, and external-client failure translation.
- Job/listener tests verify idempotency, retry/backoff, after-commit behavior, and terminal failure handling.
- Dependency tests confirm that Domain and Application import no Infrastructure, ORM, or framework classes.

Infrastructure implements capabilities; it does not contain the complete business workflow.

---

---

[Architecture index](../index.md) · [Concept catalogue](../00-foundations/concepts.md)

## Example verification slices

A mapper test can assert both directions without booting HTTP:

```php
it('round-trips a task aggregate', function () {
    $task = Task::restore(TaskId::fromString('t-1'), TaskTitle::fromString('Write docs'));
    $record = TaskMapper::toRecord($task);
    expect(TaskMapper::toDomain($record)->id()->toString())->toBe('t-1');
});
```

A repository test should additionally prove tenant scoping and allow-list enforcement. Provider tests should resolve every port from the container. These focused tests complement API contract tests; they do not justify importing framework classes into inner layers.

---

[Infrastructure index](index.md) · [Architecture index](../index.md) · [Concept catalogue](../00-foundations/concepts.md)
