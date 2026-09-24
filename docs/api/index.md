# Zolta Framework Architecture

This is the entry point for the product-neutral Zolta architecture documentation. The detailed guide uses a two-level tree: first a lifecycle/responsibility category, then a focused topic file. Links preserve the complete request-to-response model.

For how this documentation is researched and structured, see [../../AGENTS.md](../../AGENTS.md). For implementation work, follow the repository-level [AGENTS.md](../../AGENTS.md). For the concise concept inventory, see [00-foundations/concepts.md](00-foundations/concepts.md).

## Documentation tree

- [Full-stack contracts and verification](../full-stack-contracts.md)

- [Nuxt client and BFF architecture](../client/index.md)

### 00 Concepts

- [Foundational concepts](00-foundations/index.md)

### 01 Foundations

- [Foundations and dependency direction](01-foundations/index.md)

### 02 Boundaries

- [Boundary contracts](02-boundaries/index.md)

### 03 Domain

- [Domain and DDD](03-domain/index.md)

### 04 Application

- [Application and CQRS](04-application/index.md)

### 05 Presentation

- [Presentation layer](05-presentation/index.md)

### 06 Infrastructure

- [Infrastructure layer](06-infrastructure/index.md)

### 07 Cross-cutting

- [Cross-cutting architecture](07-cross-cutting/index.md)

## Focused implementation topics

You can enter the documentation at any topic; the links below are the implementation destinations for the concepts catalogue. Each topic links back to its concepts and to adjacent lifecycle stages.

- Foundations: [dependency direction](01-foundations/dependency-direction.md)
- Boundaries: [request validation](02-boundaries/request-validation.md) · [DTO flow](02-boundaries/dto-flow.md)
- Domain: [DDD model](03-domain/ddd-model.md) · [value objects](03-domain/value-objects.md)
- Application: [application services](04-application/application-services.md) · [CQRS](04-application/cqrs.md) · [handler outcomes](04-application/handler-outcomes.md)
- Presentation: [routes](05-presentation/routes.md) · [responses](05-presentation/responses.md)
- Infrastructure: [models and mappers](06-infrastructure/models-and-mappers.md) · [repositories](06-infrastructure/repositories.md) · [adapters](06-infrastructure/adapters.md) · [providers](06-infrastructure/providers.md) · [events and jobs](06-infrastructure/events-and-jobs.md) · [integrations](06-infrastructure/integrations.md) · [verification](06-infrastructure/verification.md)
- Cross-cutting: [vertical slices](07-cross-cutting/vertical-slices.md) · [events](07-cross-cutting/events.md) · [verification](07-cross-cutting/verification.md)

## How the files communicate

The files are chapters of one model, not independent manuals. A request becomes an input DTO, an application service dispatches a message, Domain enforces business rules, Infrastructure implements ports, and the result travels back through an output DTO and resource. Each topic file links to adjacent boundaries and cross-cutting principles.

No layer file is a standalone implementation recipe. A feature must be traced across the complete sequence—API boundary, Application orchestration, Domain behavior, Infrastructure adapters, and the outward response path. The category names describe ownership, not an order in which layers can be implemented independently.

Zolta supplies a preferred convention without forcing a single developer experience. Supported alternatives are intentional escape hatches, not permission to cross layer boundaries; see the [flexibility principle](00-foundations/concepts.md#zolta-flexibility-principle).

When a rule changes, update the affected topic file, its related links/examples/checklists, and the corresponding point in the [concept catalogue](00-foundations/concepts.md). Use the [agent and documentation guide](../../AGENTS.md) to preserve terminology, evidence, and lifecycle ordering.

## Global dependency direction

```text
API / Presentation → Application → Domain
Infrastructure implements ports owned by Application or Domain
```

The Domain and Application chapters are framework-agnostic (apart from appropriate Zolta packages). Laravel, Eloquent, HTTP, queues, SDKs, and other technical details belong in the outer adapters described by the Infrastructure and Presentation chapters.

## Maintenance

This index and all topic files form the living architecture contract. Keep examples generic, verify installed Zolta behavior against source, synchronize the concept catalogue, and run `git diff --check` after changes.
