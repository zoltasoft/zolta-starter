# Persistence models and mappers

[← 06-infrastructure index](index.md) · [↑ Architecture home](../index.md) · [Concept catalogue](../00-foundations/concepts.md)

Related: [Infrastructure index](index.md) · [Repositories](repositories.md) · [Domain model](../03-domain/ddd-model.md)

---

## Persistence models and mappers

Eloquent models represent storage. They may define casts, relations, scopes, guarded/fillable rules, and persistence queries, but they do not own domain invariants or use-case workflows. No Eloquent model crosses into Domain or Application.

Mappers are the anti-corruption boundary:

```text
persistence record + loaded relations
  → mapper
  → value objects + aggregate restore/reconstitute

aggregate + value objects
  → mapper
  → persistence primitives/model
```

Keep creation and reconstitution separate. A mapper reading a row must call an explicit restore path and must not emit a creation event. The reverse mapper should deliberately serialize value objects, enums, dates, and nested entities; it should not rely on accidental ORM casting or expose internal fields. Mapper round-trips are Infrastructure tests.

## Example: explicit mapping

```php
final class TaskMapper
{
    public static function toDomain(TaskRecord $row): Task
    {
        return Task::restore(
            id: TaskId::fromString($row->id),
            title: TaskTitle::fromString($row->title),
            status: TaskStatus::from($row->status),
            completedAt: $row->completed_at ? DateTimeImmutable::createFromMutable($row->completed_at) : null,
        );
    }

    public static function toRecord(Task $task): TaskRecord
    {
        return new TaskRecord([
            'id' => $task->id()->toString(),
            'title' => $task->title()->toString(),
            'status' => $task->status()->value,
            'completed_at' => $task->completedAt(),
        ]);
    }
}
```

Use a dedicated mapper when the aggregate contains value objects, nested entities, encrypted fields, or a restore path. A simple scalar record may use a small inline projector, while a read-only screen can map directly to a projection DTO; that shortcut must never be reused as the aggregate reconstitution path.


### Alternatives and trade-offs

Use an explicit data mapper for aggregates with value objects, nested entities, encrypted fields, or separate create/restore paths. A scalar read projection may use a simpler projector, but it must not become the aggregate reconstitution path.

### Failure and verification

Reject malformed persistence data with a semantic mapping failure rather than silently coercing it. Test nullable fields, enums, dates, nested entities, secret handling, create/restore separation, and both mapping directions.
---

[Infrastructure index](index.md) · [Architecture index](../index.md) · [Concept catalogue](../00-foundations/concepts.md)
