# Providers and composition roots

[← 06-infrastructure index](index.md) · [↑ Architecture home](../index.md) · [Concept catalogue](../00-foundations/concepts.md)

Related: [Infrastructure index](index.md) · [Adapters](adapters.md) · [Verification](verification.md)

---

## Providers and composition roots

Providers compose the application at startup:

- bind each repository and capability interface to one concrete adapter;
- register migrations, persistence factories, and seeders deliberately;
- register authentication, mail, storage, queue, and external-client adapters;
- register domain-event mappings, listeners, and integration services once;
- keep provider registration grouped by bounded context and predictable in order.

A provider is configuration/composition code, not a place for business workflows. Prefer explicit bindings over container magic so the dependency graph is reviewable and testable.

## Example: an explicit composition root

```php
final class TaskServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(TaskRepository::class, EloquentTaskRepository::class);
        $this->app->bind(TaskDashboardPort::class, TaskDashboardReader::class);
        $this->app->singleton(TaskMapper::class);
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/migrations');
        $this->app->tag([TaskCompletedListener::class], 'domain-event-listeners');
    }
}
```

Use `bind` for stateless or request-scoped adapters, `singleton` for safe shared clients/configuration, and tags when a dispatcher consumes a collection. A package-provided Zolta adapter may instead be discovered through Composer metadata; a service-local adapter is normally registered explicitly so its bounded-context ownership is visible.


### Alternatives and trade-offs

Use explicit `bind` for stateless adapters, `singleton` only for safely shared clients, and tags for multi-consumer collections. Reusable package adapters may be discovered through Composer metadata; local bounded-context adapters should normally be registered explicitly.

### Failure and verification

A missing binding should fail at composition time, not during a request. Verify every port resolves to the intended adapter, provider ordering is deterministic, migrations/listeners are registered once, and test containers do not accidentally use production clients.
---

[Infrastructure index](index.md) · [Architecture index](../index.md) · [Concept catalogue](../00-foundations/concepts.md)
