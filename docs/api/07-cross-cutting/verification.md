# Zolta guarantees and verification

[← 07-cross-cutting index](index.md) · [↑ Architecture home](../index.md) · [Concept catalogue](../00-foundations/concepts.md)

Related: [Concept catalogue](../00-foundations/concepts.md) · [Agent and documentation guide](../../../AGENTS.md)

---

## What Zolta provides—and what we enforce

When configured, Zolta provides the runtime protocol: attribute-owned HTTP execution, validation before service invocation, trusted-data precedence, DTO hydration, command/query/event handler mapping, command validation, `Result`/`Option` support, explicit transactional workflows, repository query facilities, and generated route/map/OpenAPI artifacts.

Zolta does not prove that our architecture is clean. We enforce these by review, architecture tests, static analysis, and focused tests:

- no Laravel, Eloquent, API, or Infrastructure imports in Domain or Application;
- no Eloquent access outside Infrastructure;
- empty, declarative single-endpoint controllers;
- one responsibility per message handler;
- aggregate behaviour rather than public setters;
- private aggregate construction with separate creation and reconstitution paths;
- event recording/release exactly once;
- deterministic, side-effect-free rules, specifications, invariants, policies, and transformations;
- explicit repository/read contracts and explicit adapter bindings;
- unique command/query/event mappings;
- current generated maps, routes, and OpenAPI artifacts;
- domain-invariant tests, application-orchestration tests, mapper tests, and API contract tests.

## Lessons from a reference bounded context

A well-structured bounded context demonstrates:

1. a complete `API / Application / Domain / Infrastructure` bounded-context layout;
2. declarative Zolta HTTP controllers and trusted authenticated identity data;
3. command and query trees coexisting in one context;
4. invokable application services dispatching typed messages through Zolta;
5. aggregate repositories and application capability ports injected as interfaces;
6. explicit Infrastructure provider bindings;
7. Eloquent-to-domain mapping and aggregate reconstitution at the boundary;
8. Zolta query option allow-lists and a typed pagination payload;
9. pure domain events wrapped for Laravel queues/listeners only in Infrastructure.

These observations become general guardrails:

- a domain event must be released in the successful command `Result` after persistence; recording one on an aggregate alone does not publish it;
- a handler should load, invoke aggregate behaviour, persist, and return an explicit outcome rather than reconstructing domain decisions;
- read screens should use Application-owned typed projection contracts rather than treating an aggregate repository as a general reporting repository;
- an Infrastructure listener may queue work, but its retry policy, idempotency, and post-commit guarantees must be intentionally tested;
- automated dependency-boundary tests should keep Laravel/Symfony/API/Infrastructure imports out of Domain and Application.

## Definition of done for a new feature slice

- The bounded context, ubiquitous language, aggregate owner, and invariant are named first.
- API, Application, Domain, and Infrastructure dependencies follow the inward rule.
- Domain and Application use only PHP, project code from inner layers, and appropriate Zolta packages—never Laravel packages.
- A command changes state only through an aggregate root and returns `Result` with events released after persistence.
- Aggregates expose intentful, deliberately idempotent behavior and separate creation from persistence reconstitution.
- A query is side-effect free and returns a typed read result.
- Framework models are mapped only in Infrastructure.
- Every port is focused and explicitly bound to an Infrastructure adapter.
- Requests use trusted context for actor/tenant/ownership constraints.
- Event consumers are registered once, idempotent, retry-safe, and tested for their delivery guarantee.
- Zolta maps/routes/OpenAPI are regenerated and verified.
- The feature has direct domain tests, application tests, Infrastructure mapper/adapter tests, API contract tests, and dependency-boundary tests.

## Status

This is a living architecture document. Before implementing a feature, refine its domain language, boundaries, UI/BFF contract, testing strategy, and exact event guarantees here.

---

---

[Architecture index](../index.md) · [Concept catalogue](../00-foundations/concepts.md)
