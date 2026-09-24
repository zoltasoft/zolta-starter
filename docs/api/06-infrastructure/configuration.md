# Zolta configuration

[← 06-infrastructure index](index.md) · [↑ Architecture home](../index.md) · [Concept catalogue](../00-foundations/concepts.md)

Related: [providers](providers.md) · [adapters](adapters.md) · [routes](../05-presentation/routes.md) · [CQRS](../04-application/cqrs.md)

---

## Configuration boundary

For a new Laravel host, follow the repository [initialization workflow](../../../AGENTS.md#initialize-a-laravel-application-with-zolta) before configuring feature discovery roots.

Zolta configuration is an Infrastructure/composition concern. It tells the runtime where to discover messages and routes, where to write maps and documentation, which adapter classes and security metadata to use, and which environment-backed integration settings to load. Domain and Application code must not read `config()` or `env()` directly.

The Laravel package ships a default `config/zolta.php`. `ZoltaFrameworkServiceProvider::register()` loads those defaults, reads the application’s `zolta` configuration, and merges it with `array_replace_recursive`; application values override matching defaults while unspecified defaults remain available. The provider also exposes the configuration through the `zolta-config` publish tag.

## Configuration tree

```text
config/zolta.php
  cqrs/                    command, query, event discovery and map cache
  http/routes/             attribute route discovery and route cache
  http/routes/documentation/ OpenAPI output and metadata
  identity/                identity implementation and permission schema
  security/                abilities and user permission attributes
  identity_consumer/       remote identity connections, cache, and webhooks
```

Keep service-specific overrides in the application config file and environment-specific secrets in `.env`/deployment configuration. Never place credentials or private tokens in source-controlled config.

## CQRS discovery and maps

`cqrs.commands`, `cqrs.queries`, and `cqrs.infrastructure_events` are arrays of `{path, namespace}` roots scanned for attributed handlers and event wrappers. A bounded context normally contributes its own service root rather than scanning the entire application.

`cqrs.cache` names the generated command, query, and event map files. `cache_manifest` stores the corresponding manifests when enabled by the installed package. `map_cache.enabled` controls reuse of generated maps; `auto_refresh_env` can enable refresh behavior in selected environments. `options` controls PSR-4 detection, atomic writes, file patterns, excluded paths, Composer autoload path, symlink traversal, and verbose logging.

```php
'cqrs' => [
    'commands' => [[
        'path' => app_path('Services/TaskService'),
        'namespace' => 'App\Services\TaskService\',
    ]],
    'queries' => [[
        'path' => app_path('Services/TaskService'),
        'namespace' => 'App\Services\TaskService\',
    ]],
    'infrastructure_events' => [[
        'path' => app_path('Services/TaskService'),
        'namespace' => 'App\Services\TaskService\',
    ]],
    'map_cache' => [
        'enabled' => env('ZOLTA_MAP_CACHE', true),
    ],
],
```

Use the installed package’s map-generation command or application workflow to rebuild maps after adding handlers. Do not include migrations, seeders, factories, vendor code, API route folders, or concrete repository folders in message discovery unless the installed version explicitly requires it.

## Generated route and CQRS caches

Zolta exposes separate Artisan commands for attribute routes and CQRS maps:

```bash
php artisan zolta:routes:cache
php artisan zolta:routes:cache --file=app/Services/TaskService/API/Controllers/TasksController.php
php artisan zolta:routes:clear
php artisan zolta:routes:watch --poll=500

php artisan zolta:maps:cache
php artisan zolta:maps:cache --fresh
php artisan zolta:maps:cache --type=command,query,event
php artisan zolta:maps:clear
```

`zolta:routes:cache` scans configured controller paths and writes the attribute-route cache; when route documentation is enabled it also refreshes the configured OpenAPI output and manifest. `zolta:routes:watch` is a local development watcher. `zolta:maps:cache` rebuilds command, query, and event maps from the configured CQRS roots; `--type` limits the rebuild and `--fresh` removes existing files first. The clear commands remove generated cache files/manifests.

Run a full rebuild after changing discovery paths, namespaces, handler/route attributes, or event mappings. Generated files are build artifacts and must not be hand-edited.

## HTTP route and documentation configuration

`http.routes.paths` identifies controller roots scanned for route attributes. `http.routes.cache.enabled` controls route-map caching, while `ensure_fresh_on_boot` and `skip_commands` control refresh behavior during selected Artisan commands. `http.routes.exclude_paths` removes unwanted roots.

`http.routes.documentation` controls generated OpenAPI output: enabled flag, output directory/file, manifest file, title, version, description, server URL, and server description. `default_response` can provide a fallback resource when an endpoint does not declare its own response mapping. Verify the installed route loader before relying on optional attribute metadata such as prefixes or targets.

```php
'http' => [
    'routes' => [
        'paths' => [app_path('Services/*/API/Controllers')],
        'cache' => [
            'enabled' => env('ZOLTA_ATTR_ROUTE_CACHE', false),
            'ensure_fresh_on_boot' => env('ZOLTA_ATTR_ROUTE_ENSURE_FRESH_ON_BOOT', false),
        ],
        'documentation' => [
            'enabled' => env('ZOLTA_ROUTE_DOCS_ENABLED', false),
            'output_file' => env('ZOLTA_ROUTE_DOCS_OUTPUT_FILE', 'openapi.json'),
        ],
    ],
],
```

Enable generated documentation deliberately per environment. Generated maps and OpenAPI files are build artifacts; do not hand-edit them.

## Identity, security, and consumer settings

- `identity.class` selects the identity implementation used by the HTTP authorization layer; `identity.permissions` and `identity.schema` describe the permission shape understood by the adapter.
- `security.abilities` maps named abilities to required permissions; `security.user.class` and `security.user.attributes` tell the security adapter where permission data is read.
- `identity_consumer.connections` defines named remote identity connections (`base_url`, project, client ID, and secret). Timeout, introspection cache, webhook secrets, and webhook tolerance are separate settings.

These settings configure adapters; they do not authorize a domain transition. Application and Domain policies still decide business permission using trusted identity facts.

## Environment and defaults

Use `env()` only while building configuration. Resolve configuration through the container/framework at the outer edge; inner layers receive typed options or ports. Keep safe local defaults for non-secret values, fail fast for required production credentials, and distinguish `false`, `null`, and an empty list deliberately. Configuration caching means environment changes may not be visible until the application config cache is rebuilt.

## Alternatives and trade-offs

Use the published unified `config/zolta.php` for ordinary Laravel services. A package or bounded context may add its own config file when ownership or deployment differs, then pass only typed settings into its adapters. Prefer Composer adapter metadata for reusable framework adapters and explicit provider bindings for service-local adapters. Do not duplicate the entire vendor config to change one key; override the narrow subtree and retain package defaults through recursive merging.

## Failure, security, and verification

A missing discovery root, stale map, invalid adapter class, absent binding, or malformed connection should fail during boot/build verification rather than silently route to the wrong handler. Secrets must come from deployment configuration and must never appear in generated maps, OpenAPI output, logs, DTOs, or response resources.

Verify configuration with: registration tests for recursive default merging; CQRS map generation and handler discovery tests; route discovery/cache tests; OpenAPI output tests; provider binding tests; environment/default tests; and security tests proving client input cannot override trusted identity context.

---

[Infrastructure index](index.md) · [Architecture index](../index.md) · [Concept catalogue](../00-foundations/concepts.md)
