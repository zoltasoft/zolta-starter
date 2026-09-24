# Handler return-data contract

[← 04-application index](index.md) · [↑ Architecture home](../index.md) · [Concept catalogue](../00-foundations/concepts.md)

Related: [CQRS](cqrs.md) · [Presentation responses](../05-presentation/responses.md) · [Events](../07-cross-cutting/events.md)

---

## Handler return-data contract

Handlers are application-layer message endpoints. They do not return HTTP responses, Laravel models, or unstructured domain results directly. They return the Zolta CQRS envelope that represents the outcome of the message, and the application service then maps that envelope to an API response DTO.

### Commands return `Result`

Every command handler should declare `Result` and finish with one of these explicit outcomes:

```php
return Result::success(new RecordPayload($record), $record->releaseEvents());
return Result::successWithEvents($events); // successful command with no data
return Result::failure(new RecordNotFoundException());
```

`Result::success($value, $events)` carries a structured value and the domain events produced by the aggregate. The value must be an associative array or a `MessagePayloadInterface`; a dedicated payload class is preferred because it names the output contract and keeps the handler independent of transport serialization. `Result::failure($throwable)` carries a meaningful exception and has no readable value. Do not return a raw aggregate, ORM model, scalar, or an HTTP response. Although the runtime normalizes `null` to an empty payload, use an explicit empty success form so the handler contract remains visible. `Result` rejects other unsupported value types.

The normal write sequence is:

1. Load the aggregate through a domain repository contract.
2. Invoke domain behavior (the aggregate validates its invariants and records events).
3. Persist through the repository contract.
4. Release the aggregate events exactly once and attach them to the successful `Result`.
5. Let the application service/transaction boundary dispatch those events after a successful operation.

This keeps persistence, event publication, and transport concerns out of the domain while preserving a clear success/failure boundary. A command that intentionally has no response data should use `successWithEvents()` (or `success()` with an empty payload), not an ad-hoc boolean convention.

### Queries return `Option`

Query handlers should declare `Option` when the result may be absent:

```php
return Option::some(new RecordPayload($record));
return Option::none();
return Option::error($exception);
```

`some()` carries a payload, `none()` means a valid “not found/no value” outcome, and `error()` preserves an actual failure. `getOrFail()` on the application service boundary converts the latter two into the service's error policy. An empty list is not absence: return `Option::some(new RecordCollectionPayload($emptyPagination))` so callers receive a stable collection shape.

Read handlers should be side-effect free. They obtain a projection or repository result, wrap it in a named payload (for example `RecordCollectionPayload` or `RecordDashboardSummaryPayload`), and return it. They must not mutate aggregates, dispatch commands, or format HTTP pagination.

### Payloads are the handler-to-service contract

Payloads implement `Zolta\\Cqrs\\Contracts\\MessagePayloadInterface` and expose `toArray()`. They are application transport objects, not response DTOs: a payload may contain a domain aggregate or a pagination value because the next application-layer step still owns the mapping. The use-case service extracts the envelope with `runAndCapture()`/`getOrFail()`, then maps the named payload data to an output `ResponseDTO` for the API layer.

Keep one payload shape per use-case outcome and use explicit names (`RecordPayload`, `RecordCollectionPayload`, `PreferencePayload`). Avoid generic arrays such as `['data' => ...]` because they hide the contract, make refactoring unsafe, and encourage API concerns to leak into handlers. If an existing handler returns an array, treat it as a compatibility case to migrate toward a named payload; it is not the preferred pattern.

### Service orchestration and failure propagation

The application service invokes the command/query through `runAndCapture()`. That method preserves a command's `Result` or query's `Option`, catches unexpected exceptions into the corresponding failure envelope, and allows the service to call `getOrFail()` once. The service then maps the extracted payload to its output DTO. Controllers only serialize the DTO and choose the HTTP status; they do not inspect aggregates or unwrap CQRS envelopes themselves.

Do not catch an exception in a handler merely to return `success(['error' => ...])`. Return `Result::failure()` or `Option::error()` so the configured exception adapter can produce the consistent error response. Domain errors should remain domain/application exceptions; HTTP status translation belongs at the outer API boundary.

### Why this pattern matters

- The envelope makes success, absence, failure, and events explicit and testable.
- Named payloads provide a stable seam between a use case and its API representation.
- Event release is tied to a successful write and can be coordinated with the transaction boundary.
- Query absence is distinct from an empty collection, preventing ambiguous client behavior.
- Handlers remain framework-agnostic and reusable from HTTP, CLI, jobs, or tests.

Zolta supplies the envelope implementations and CQRS dispatching, but it does not statically enforce every architectural rule. Enforce return type declarations, payload naming, single event release, and “no HTTP/domain formatting in handlers” through code review and focused architecture tests.

---


### Alternatives and trade-offs

Use `Result` for commands and `Option` for queries where absence is meaningful. A query returning a collection should normally wrap an empty typed collection in `Option::some`; use a direct typed payload only when the use-case contract makes absence impossible. Named payload classes are preferred over compatibility arrays.

### Failure and security considerations

Never convert authorization or domain failures into successful payloads. Preserve `Result::failure()` and `Option::error()` so the outer exception/response adapter can apply policy. Do not include secrets, ORM objects, or HTTP responses in payloads.

### Verification checklist

Assert success, absence, failure, unsupported-value rejection, event attachment and single release, payload `toArray()` shape, and service `getOrFail()` propagation.
---

[Architecture index](../index.md) · [Concept catalogue](../00-foundations/concepts.md)
