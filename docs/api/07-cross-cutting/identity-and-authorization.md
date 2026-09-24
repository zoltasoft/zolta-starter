# Identity, authentication, and authorization

[← 07-cross-cutting index](index.md) · [↑ Architecture home](../index.md) · [Concept catalogue](../00-foundations/concepts.md)

Related: [routes](../05-presentation/routes.md) · [request validation](../02-boundaries/request-validation.md) · [configuration](../06-infrastructure/configuration.md) · [DDD model](../03-domain/ddd-model.md)

---

## Responsibility split

Authentication answers **who is making the request**. Authorization answers **whether that principal may perform an action**. Business authorization answers **whether the action is valid for the current aggregate, project, tenant, or lifecycle state**. Keep these decisions separate:

```text
transport authentication → identity principal/context → route ability gate
                                                     → Application/domain policy
                                                     → aggregate invariant
```

An API may authenticate with local session/token tables, a third-party provider, a gateway, or a separate identity service. The identity context keeps those implementation choices behind one stable boundary.

## Zolta identity context

`Zolta\Http\Authorization\Identity` is a framework-neutral identity projection. `Identity::current()` delegates to `UserIdentity::current()`, which first checks a container-bound `UserIdentityInterface`, then framework resolvers (Laravel/Symfony adapters). The projection exposes an identifier, normalized roles, role entries, permissions, `can(permission)`, `isAuthorized(abilities)`, and an optional domain user.

```php
final class UpdateProfileRequest extends BaseRequest
{
    use ResolvesAuthenticatedIdentity;

    public function authorize(): bool
    {
        return $this->hasAuthenticatedIdentity();
    }

    public function trustedData(): array
    {
        return ['actorId' => $this->authenticatedUserId()];
    }
}
```

`trustedData()` is server-derived context. It overrides client input during Zolta request mapping and is the correct bridge from an authenticated principal to an Application DTO. Do not put the framework user, bearer token, or request object into Domain.

## Authentication adapters

An API may authenticate locally (session or bearer token), delegate to a remote identity provider (introspection or JWT verification), or use a gateway-provided principal. The adapter must produce the Zolta `UserIdentityInterface`/identity context regardless of the protocol. Cache remote validation only up to both the configured cache TTL and credential expiry; an unavailable identity dependency is never an authorization success.

Use a local resolver when the API owns its users, remote introspection when another service owns identity, JWT verification when signed claims are sufficient, or a custom Zolta adapter for another framework/token provider. Keep provider credentials, URLs, cache TTLs, and identity-class configuration in Infrastructure configuration.

### Reference implementation

A complete identity service can combine access/refresh sessions, OAuth, email verification, password recovery, session revocation, scope, introspection, roles, permissions, memberships, and lifecycle guards. A smaller service can implement only the subset its bounded context needs behind the same identity contracts.

## AuthorizationMatrix and route abilities

Zolta’s `AuthorizationMatrix` maps named abilities to concrete permissions and extracts permissions from configured user attribute paths (`permissions`, `role.permissions`, or wildcard role paths). `authorized` entries on `#[Route]` are checked by the route invoker through `AuthorizationServiceInterface`; the matrix expands abilities and requires the resulting permissions.

```php
#[Route(
    path: 'projects/{project}/settings',
    methods: ['PUT'],
    auth: 'sanctum',
    authorized: ['project.manage'],
)]
final class UpdateProjectSettingsController extends Controller {}
```

Route abilities are coarse API gates. For an action requiring membership, active resource state, or ownership, continue in Application/Domain with a focused policy or authorization guard. A local service can load its own membership/role records; a remote-identity consumer can use claims or a capability port. The identity project’s guard is an example of this second-stage check, not a required class or dependency.

## Required configuration and class placement

Use this ownership map when adding authentication or authorization to a service:

```text
config/zolta.php
  identity.class / identity.permissions / identity.schema
  security.abilities / security.user.class / security.user.attributes
  identity_consumer.* (only for a remote identity adapter)

API/
  Middleware/              credential extraction and transport authentication
  Requests/                authorize(), trustedData(), DTO hydration
  Controllers/             #[Route(auth:, authorized: ...)]

Application/
  Contracts/               identity, membership, capability, and authorization ports
  DTOs/External/           typed principal/introspection data crossing an adapter
  Policies/                use-case decisions requiring loaded application facts

Domain/
  Policies/, Specifications/, Aggregates/
                            business authorization and invariants

Infrastructure/
  Adapters/                token/session/JWT/remote-provider implementations
  Services/                identity resolver, token issuer, introspector, permission loader
  Providers/               bindings and middleware/event registration
  Models/, Repositories/   users, roles, permissions, memberships, sessions
```

### Classes for a self-managed identity

A service that owns authentication usually provides:

1. a user/account persistence model and repository;
2. a credential/session or token service in Infrastructure;
3. an adapter that resolves the credential into `UserIdentityInterface`;
4. an identity class extending Zolta `Identity` when custom permission paths or ability defaults are needed;
5. a provider binding the resolver/identity services;
6. API middleware that establishes the authenticated principal;
7. request `trustedData()` that copies only server-derived identity fields into the input DTO;
8. Application ports/policies and Domain policies/aggregates for resource-level authorization.

The authentication adapter owns hashing, token parsing, expiry, revocation, rotation, and credential transport. It must return a neutral identity projection; Application and Domain must not inspect token models or framework guards.

### Classes for a remote identity provider

A consumer service replaces the local credential adapter with an Infrastructure introspector/client. Configuration supplies the provider URL, client credentials, timeout, and cache policy. Middleware validates the bearer credential, creates a typed principal/context, stores it on the request, and fails closed when validation is unavailable. Application receives only the typed identity facts it needs.

### Authorization configuration example

```php
// config/zolta.php
'identity' => [
    'class' => App\Security\ServiceIdentity::class,
    'permissions' => ['roles.*.permissions'],
],
'security' => [
    'abilities' => [
        'task.manage' => ['tasks.read', 'tasks.write'],
    ],
    'user' => [
        'class' => App\Models\User::class,
        'attributes' => ['permissions', 'roles.*.permissions'],
    ],
],
```

`authorized: ['task.manage']` then supplies a route gate. A policy or aggregate still checks ownership, membership, status, and other business facts. Bind custom resolvers and ports explicitly in an Infrastructure provider; never resolve them directly from Domain/Application.

## Authorization layers

- **Route middleware/auth:** establish an authenticated transport principal and reject missing/invalid credentials.
- **Zolta route `authorized`:** enforce configured ability/permission gates before service invocation.
- **Request authorization:** reject entry to a specific transport boundary; use `BaseRequest::authorize()` and `authorizeAction()` for transport-level checks.
- **Application capability/policy:** load the relevant membership/project facts through ports and coordinate a use-case decision.
- **Domain policy/aggregate:** enforce resource ownership, lifecycle, and invariants using supplied facts; never query the framework directly.

A service may add resource-, tenant-, or project-scoped token middleware and documented administrative exceptions. This is a transport security boundary; the command must still enforce the domain rule because commands can enter through queues or CLI.

## Failure and security rules

Return 401 for missing/invalid authentication, 403 for an authenticated principal lacking an ability or business authorization, and 503 when a required remote identity dependency is unavailable. Do not reveal whether a protected resource exists before authorization unless the endpoint deliberately defines that policy. Never trust client-supplied actor, tenant, project, permission, role, or token identifiers. Hash/cache tokens safely, bound introspection cache by expiry, protect webhook signatures, and avoid logging credentials.

Do not confuse `Identity::isAuthorized()` convenience checks with the route authorization matrix’s permission expansion semantics; verify the installed adapter when combining multiple abilities.

## Alternatives and trade-offs

Use route `authorized` for stable, reusable ability gates; use request authorization for transport admission; use an Application policy/port when authorization needs database or external facts; and use a Domain policy/aggregate when the decision is business meaning. Use local session authentication for an identity-owning service, remote introspection for consumers, or a custom adapter behind the same identity contract.

Do not place all authorization in middleware: that bypasses aggregate invariants and makes non-HTTP entry points unsafe. Do not place all authorization in Domain: authentication protocol and transport status mapping belong at the outer adapters.

## Verification checklist

- Authentication rejects missing, expired, revoked, malformed, and incorrectly scoped credentials when scope exists.
- Local or remote credential validation fails closed; any remote-validation cache never outlives the credential.
- `Identity::current()` resolves the configured identity class and permission paths when the Zolta identity adapter is used; custom adapters satisfy the same contract.
- Route `auth` and `authorized` metadata produce the expected 401/403 behavior.
- Trusted request data overrides spoofed actor/tenant/project fields.
- Application policies and domain aggregates re-check ownership, membership, lifecycle, and invariants.
- System-admin exceptions are explicit and covered by tests.
- Permission changes invalidate or version cached authorization context where required.
- No Domain/Application class imports Laravel, Sanctum, HTTP clients, or identity persistence models.

---

[Cross-cutting index](index.md) · [Architecture index](../index.md) · [Concept catalogue](../00-foundations/concepts.md)
