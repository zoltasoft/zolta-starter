# Identity project integration at the API boundary

[← 07-cross-cutting index](index.md) · [↑ Architecture home](../index.md) · [Concept catalogue](../00-foundations/concepts.md)

Related: [identity and authorization](identity-and-authorization.md) · [configuration](../06-infrastructure/configuration.md) · [routes](../05-presentation/routes.md) · [request validation](../02-boundaries/request-validation.md)

---

This chapter describes the API-side integration when a service chooses the Identity Project as its identity provider. It is an adapter recipe: the API remains responsible for its own use cases, domain authorization, resources, and data.

## Consumer architecture

```text
Nuxt/client bearer token
  → API route middleware: identity.introspect:<permission>
  → identity client credentials + token introspection
  → active IntrospectedIdentity
  → GenericUser/IdentityPrincipal + request identity context
  → route permission gate
  → BaseRequest trustedData()
  → Application DTO / policy / aggregate
```

The API never trusts a user ID, project ID, role, or permission supplied by the client. It obtains them from the validated introspection result or another server-trusted source.

## Consumer configuration

Configure the provider connection at the API edge, normally in `config/zolta.php` and environment variables:

```php
'identity' => [
    'class' => App\Identity\RemoteIdentity::class,
    'permissions' => ['identity.permissions.*'],
],
'identity_consumer' => [
    'base_url' => env('IDENTITY_API_URL'),
    'client_id' => env('IDENTITY_CLIENT_ID'),
    'client_secret' => env('IDENTITY_CLIENT_SECRET'),
    'local' => (bool) env('IDENTITY_INTROSPECTION_LOCAL', false),
    'introspection_cache_seconds' => (int) env('IDENTITY_INTROSPECTION_CACHE_SECONDS', 30),
],
```

The client credentials authenticate the API to the Identity Project; they are not end-user credentials and must never be sent to the browser. Set a separate connection/configuration for sandbox or test identity environments. Keep URL, credentials, timeout, cache, and webhook settings out of Domain/Application.

## Identity class and principal

The API may specialize Zolta’s `Identity` to declare permission paths or ability defaults:

```php
namespace App\Identity;

use Zolta\Http\Authorization\Identity;

final class RemoteIdentity extends Identity
{
    protected static array $permissionPaths = ['identity.permissions.*'];
}
```

The Identity Project’s introspection response is normalized into a typed `IntrospectedIdentity` containing user, project, client, session, role, permission, expiry, and temporary-account facts. A Laravel adapter can expose an `IdentityPrincipal`/`GenericUser` to framework code while placing the typed identity on request attributes. Application code should receive only the fields represented by its input DTO or an Application-owned identity context.

## Middleware and route declaration

Register the consumer middleware alias in an Infrastructure provider. The reference Identity Project registers `identity.introspect` for its introspection middleware; a consuming API may use the package adapter or its own thin adapter with the same contract.

Declare the required permission at the route boundary:

```php
#[Route(
    path: 'notifications',
    methods: ['GET'],
    middleware: ['api', 'identity.introspect:notifications.read'],
    name: 'notifications.index',
)]
final class ListNotificationsController extends Controller {}
```

The middleware extracts the bearer token, validates it locally or by calling the Identity Project, bounds cache lifetime by token expiry, rejects inactive tokens, checks the requested permission, sets the authenticated user resolver, and stores the typed identity context. Route middleware runs before Zolta service invocation.

Use one permission per endpoint capability. Keep route gates coarse and stable; resource ownership, membership, lifecycle, and state transitions still belong to Application/Domain.

## Trusted identity data in requests

```php
final class ListNotificationsRequest extends BaseRequest
{
    public function authorize(): bool
    {
        return Identity::current() !== null;
    }

    public function trustedData(): array
    {
        $identity = Identity::current();

        return [
            'actorId' => (string) $identity?->getId(),
            'projectId' => (string) request()->attributes->get('identity')?->projectId,
        ];
    }
}
```

Prefer a dedicated resolver/helper around request identity attributes when the adapter exposes richer project/session facts. Never allow body or query fields with the same names to override these values. The resulting DTO remains framework-neutral.

## Authorization after introspection

Identity Project permissions answer whether the API capability may be entered. The API’s Application policy then loads local facts if needed: notification ownership, workspace membership, subscription state, or resource status. The Domain aggregate enforces transitions regardless of entry point. A command invoked by a queue or CLI must repeat the authorization-relevant business checks without relying on HTTP middleware.

```text
permission `notifications.read`
  → route admission
  → Application loads local notification ownership
  → Domain policy/aggregate confirms readable state
  → query handler returns projection
```

## Failure and operational behavior

- Missing bearer token or inactive/expired token → 401.
- Valid identity without the required permission → 403.
- Invalid API client credentials or unavailable Identity Project → fail closed; expose a controlled dependency error (normally 503), never continue unauthenticated.
- Introspection cache entries must not outlive the token expiry.
- Do not log bearer tokens, client secrets, or raw introspection payloads.
- Rotate client credentials and use separate project/client credentials per environment.

## Alternatives and trade-offs

Use local introspection when the API and Identity Project run in the same deployment and the adapter supports it; use remote introspection for a separately deployed identity service. A signed-token/JWT adapter may avoid a network call when the API can validate issuer, audience, signature, expiry, and revocation policy. Use a custom Infrastructure adapter when the API framework is not Laravel, but preserve the same typed identity contract and failure semantics.

Do not couple Application or Domain to Identity Project endpoint paths, Sanctum models, Laravel middleware, or provider-specific permission names. Map provider permissions to the API’s capability vocabulary at the boundary when the API needs a different language.

## Verification checklist

- Configuration loads the intended Identity Project URL and environment credentials.
- Middleware alias is registered and route permission arguments are discovered.
- Missing, expired, revoked, malformed, and wrong-project tokens fail closed.
- Active introspection is cached only until the lower of cache TTL and token expiry.
- Permission denial returns 403 before the application service runs.
- Typed identity context and `trustedData()` cannot be spoofed by request input.
- Application/domain ownership and lifecycle checks still run after route permission success.
- Identity Project outages return controlled dependency errors and do not grant access.
- Consumer tests cover both live and sandbox connections without storing credentials.

---

[Cross-cutting index](index.md) · [Architecture index](../index.md) · [Concept catalogue](../00-foundations/concepts.md)
