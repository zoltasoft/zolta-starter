# Zolta adapters and service-local adapters

[← 06-infrastructure index](index.md) · [↑ Architecture home](../index.md) · [Concept catalogue](../00-foundations/concepts.md)

Related: [Infrastructure index](index.md) · [Providers](providers.md) · [Application and API contracts](../04-application/application-services.md)

---

## Zolta adapters and service-local adapters

Zolta packages keep their Core abstractions separate from framework adapters. A package adapter implements `Zolta\\Framework\\FrameworkAdapterInterface`:

```php
final class AcmeFrameworkAdapter implements FrameworkAdapterInterface
{
    public static function supports(): bool
    {
        return class_exists(AcmeApplication::class);
    }

    public static function priority(): int
    {
        return 90;
    }

    public static function bindings(): array
    {
        return [
            CoreBaseRequest::class => AcmeBaseRequest::class,
            ResponseBridge::class => AcmeResponseBridge::class,
        ];
    }
}
```

The adapter is discovered from Composer metadata under `extra["zolta-framework-adapter"]`. At runtime, `FrameworkBootstrap` discovers candidate classes, `FrameworkRegistry` keeps adapters that report `supports()`, orders them by descending `priority()`, and resolves the first binding for a requested Core abstraction. A package may also register framework service providers for framework-native bootstrapping; those providers are separate from the registry adapter.

A service-local adapter is the same boundary idea applied to a consuming application when Zolta does not yet expose the abstraction or integration it needs. Keep local adapters under Infrastructure and name the inner layer whose contract they implement:

```text
Infrastructure/
  Adapters/
    Domain/                 implementations of Domain repository/port contracts
      Persistence/
      Time/
    Application/            implementations of Application capability ports
      Mail/
      Storage/
      Identity/
    API/                    presentation/framework bridges and transport adapters
      Request/
      Response/
      Authorization/
    Shared/                 local technical helpers used only by local adapters
  Providers/
    AdapterServiceProvider.php
```

Adapter placement describes the inward contract being implemented, not a permission to import that layer’s dependencies. For example, `Adapters/Application/Mail/LaravelMailer.php` may implement an Application mail port and import Laravel; an Application class must never import that adapter. `Adapters/API/Response/LaravelResponseBridge.php` may implement Zolta’s `ResponseBridge`; Domain and Application remain unaware of it. A Domain repository implementation belongs under `Adapters/Domain/Persistence` or the normal `Repositories` directory, not inside Domain itself.

Use a local adapter when:

- the required capability is a genuine boundary adapter, not a missing domain rule;
- the relevant Zolta or Application/Domain contract already exists, or you define a narrow local contract owned by the inner layer;
- the integration is local to this service and does not yet justify an upstream Zolta package;
- the adapter can be tested through the contract without booting unrelated infrastructure.

Do not use a local adapter to bypass a missing abstraction by importing Laravel into Domain/Application, to hide a workflow in Infrastructure, or to place business rules in a technical adapter. If several services need the same bridge, propose an upstream Zolta package adapter instead of copying local adapters.

## Local adapter implementation and registration

A local adapter should be a small adapter with one responsibility:

1. depend on the inner contract it implements;
2. translate between framework/external types and the contract’s neutral types;
3. keep framework exceptions, configuration, serialization, and lifecycle hooks inside the adapter;
4. expose no framework types through the contract;
5. register the binding explicitly in a bounded-context Infrastructure provider;
6. document whether it is temporary, service-specific, or a candidate for upstreaming.

For a service-local Laravel adapter, explicit container binding is usually clearer than modifying vendor packages:

```php
final class AdapterServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            SendMail::class,
            LaravelMailer::class,
        );

        $this->app->bind(
            ResponseBridge::class,
            LaravelResponseBridge::class,
        );
    }
}
```

When the adapter supplies a Zolta Core framework abstraction rather than a service-owned port, implement `FrameworkAdapterInterface` and register it through Composer metadata or an explicit `FrameworkRegistry::register(...)` call during bootstrap. Prefer Composer discovery for reusable packages; prefer an Infrastructure provider for application-local bindings. Check adapter priority when multiple adapters can support the same runtime, and test the resolved binding rather than assuming registration order.

Local adapter tests should verify `supports()` is side-effect free, binding priority is intentional, contract behavior is preserved, framework failures are translated, and no adapter type leaks across the contract boundary. A successful adapter is a replaceable seam: removing it should require changing only composition/configuration, not Domain or Application code.


### Lifecycle position

```text
inner contract → adapter translation → framework/package API → translated result or capability failure
```

### Alternatives and trade-offs

Use a reusable package adapter with Composer metadata when several services need the integration. Use a service-local adapter under `Infrastructure/Adapters/<InnerLayer>` for a narrow gap. Prefer an existing Zolta abstraction before adding a local adapter; upstream a repeated local capability when it becomes broadly reusable.

### Failure and verification

Adapters translate framework exceptions, configuration, and types into the inner contract’s semantic failures. Test `supports()`, priority resolution, bindings, provider registration, contract behavior, and the absence of framework-type leakage across the boundary.
---

[Infrastructure index](index.md) · [Architecture index](../index.md) · [Concept catalogue](../00-foundations/concepts.md)
