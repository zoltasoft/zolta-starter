# External integrations

[← 06-infrastructure index](index.md) · [↑ Architecture home](../index.md) · [Concept catalogue](../00-foundations/concepts.md)

Related: [Infrastructure index](index.md) · [Adapters](adapters.md) · [Domain and Application contracts](../03-domain/ddd-model.md)

---

## External integrations

Mail, notifications, OAuth, storage, rate limiting, secrets, HTTP clients, and webhooks are adapters around focused Application ports. Keep templates, SDK calls, serialization, authentication headers, network timeouts, redirect policy, retry policy, and provider-specific errors in Infrastructure. Outbound webhooks additionally require destination validation, SSRF protections where relevant, authenticated payloads, bounded timeouts, and durable delivery state when retries or auditability matter.

Infrastructure may implement a complete technical capability, but it must not become a second application service. The business workflow remains in Application and Domain; Infrastructure only translates and executes the technical operation.

## Example: an application port with two adapters

```php
// Application
interface NotificationPort
{
    public function send(NotificationMessage $message): void;
}

// Infrastructure
final class ProviderNotificationAdapter implements NotificationPort
{
    public function send(NotificationMessage $message): void
    {
        $this->client->post('/messages', $message->toArray(), timeout: 5);
    }
}
```

The production adapter can call an SDK or HTTP client; a test adapter can record messages in memory; a durable adapter can write an outbox row and let a worker deliver it later. Keep retry classification, authentication, timeout, and provider-error translation in the adapter, while Application decides whether notification failure is fatal to the use case.


### Lifecycle position

```text
Application capability port → integration adapter → SDK/HTTP/provider → translated capability outcome
```

### Alternatives and trade-offs

Use a direct provider adapter for immediate work, an in-memory fake for tests, or an outbox-backed worker for durable delivery. Keep timeout, retry, authentication, serialization, and provider-specific error mapping in the adapter.

### Failure, security, and verification

Validate destinations and webhook signatures, bound network timeouts, classify retryable failures, and never leak credentials into DTOs or logs. Verify request serialization, authentication, timeout, retry, duplicate delivery, and provider-error translation.
---

[Infrastructure index](index.md) · [Architecture index](../index.md) · [Concept catalogue](../00-foundations/concepts.md)
