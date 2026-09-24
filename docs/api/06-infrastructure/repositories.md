# Repository adapters

[← 06-infrastructure index](index.md) · [↑ Architecture home](../index.md) · [Concept catalogue](../00-foundations/concepts.md)

Related: [Infrastructure index](index.md) · [Models and mappers](models-and-mappers.md) · [Application services](../04-application/application-services.md)

---

## Repository adapters

A concrete repository implements a Domain repository contract or an Application read/capability port. It translates domain identifiers and Zolta query options into persistence queries, applies server-side ownership/tenant constraints, and maps results back into aggregates, projections, iterables, or pagination.

Zolta repository facilities such as `BaseRepository`, query options, filters, includes, sorting, pagination, caching, and streaming are Infrastructure tools. Keep allow-lists and query safety in the adapter even when the API request also declares public options. Never expose an Eloquent builder, model, SQL expression, or framework query object through an inner-layer interface.

Repository methods should express domain language (`findById`, `save`, `remove`, `findForOwner`) rather than technical operations. Separate aggregate repositories from screen-specific read repositories when the read shape does not represent aggregate behavior. Translate persistence/client failures into a semantic Application capability failure; do not make Domain depend on an ORM exception.

## Example: two repository shapes

```php
final class EloquentTaskRepository implements TaskRepository
{
    public function findForOwner(TaskId $id, UserId $owner): ?Task
    {
        $row = TaskRecord::query()
            ->whereKey($id->toString())
            ->where('owner_id', $owner->toString())
            ->first();
        return $row ? TaskMapper::toDomain($row) : null;
    }
}

final class TaskDashboardReader implements TaskDashboardPort
{
    public function page(TaskDashboardQuery $query): Page
    {
        return TaskRecord::query()
            ->where('owner_id', $query->ownerId->toString())
            ->whereIn('status', $query->statuses)
            ->orderBy($query->sortColumn, $query->direction)
            ->paginate($query->perPage, page: $query->page)
            ->through(TaskDashboardRow::fromRecord(...));
    }
}
```

The first adapter protects aggregate invariants and returns a domain object. The second is intentionally a read projection and returns rows; it should not be used by a command to mutate an aggregate. Zolta query options can also be translated to an iterable/stream for exports, or to a cached projection when latency matters.


### Alternatives and trade-offs

Use an aggregate repository for command behavior and a projection/read repository for screen-shaped queries. Zolta `BaseRepository` facilities are useful when their options fit; a custom adapter is valid when the query or storage needs are specialized. Use pagination or streaming according to the consumer’s size and latency requirements.

### Failure, security, and verification

Translate missing records and persistence failures into the contract’s semantic outcome. Enforce tenant/ownership scope and filter/include/sort allow-lists in Infrastructure. Test scope isolation, missing records, query safety, pagination, streaming, caching, and mapper integration.
---

[Infrastructure index](index.md) · [Architecture index](../index.md) · [Concept catalogue](../00-foundations/concepts.md)
