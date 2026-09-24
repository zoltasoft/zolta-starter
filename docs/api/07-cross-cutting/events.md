# Domain events and event-driven work

[← 07-cross-cutting index](index.md) · [↑ Architecture home](../index.md) · [Concept catalogue](../00-foundations/concepts.md)

Related: [Domain model](../03-domain/ddd-model.md) · [Handler outcomes](../04-application/handler-outcomes.md) · [Infrastructure](../06-infrastructure/index.md)

---

## Domain events and event-driven work

Domain events are not Laravel events and are not Event Sourcing.

```text
Aggregate completes a valid transition and records a pure domain event
  → repository persists the aggregate
  → command handler returns successful Result with releaseEvents()
  → Zolta maps the domain event to an Infrastructure integration wrapper
  → framework listener invokes a consumer Application use case
  → consumer applies its own domain rules
```

A bounded context can define a pure domain event, an Infrastructure wrapper marked `#[HandlesDomainEvent(...)]`, and a provider-registered queued listener. This cleanly keeps Laravel event and queue traits outside the Domain.

Event-driven coordination is normally eventually consistent across aggregate or bounded-context boundaries. Consumers must be idempotent and retry-safe; do not use a distributed transaction to make independent contexts appear atomic. If a side effect must only occur after a database commit, verify an actual after-commit mechanism. If publishing must survive a process failure after commit, use a transactional outbox or equivalent durable mechanism.

### Event Sourcing is different

Recording and dispatching domain events does **not** make the system event sourced. Event Sourcing requires an event store, stream-based aggregate rehydration, replay, and projections built from the event stream. The normal Zolta model is state persistence plus domain events. Event Sourcing should be introduced only as a deliberate, separately documented architectural choice.

---

## Three valid delivery choices

The domain event and aggregate contract stay the same while delivery changes:

```text
transaction + local listener      → immediate side effect
transaction + after-commit queue  → asynchronous side effect
transaction + outbox + worker     → durable cross-process delivery
```

Choose the first for a deterministic in-process reaction, the second for work that may be delayed but is safe after commit, and the third when a process crash must not lose publication. None of these choices moves framework code into Domain or turns ordinary event dispatch into Event Sourcing.


### Failure, security, and verification

Consumers must tolerate duplicate delivery, validate event data, and avoid trusting client-controlled identifiers. Verify event mapping, persistence-before-publication ordering, idempotency, retry behavior, and outbox durability where claimed. If Event Sourcing is introduced, separately verify stream rehydration, replay, and projection rebuilds.
---

[Architecture index](../index.md) · [Concept catalogue](../00-foundations/concepts.md)
