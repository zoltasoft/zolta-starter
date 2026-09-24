# Nuxt client and BFF architecture

[← Architecture home](../api/index.md) · [Concept catalogue](../api/00-foundations/concepts.md)

This is the entry point for the Nuxt client and server-side BFF architecture. The guide uses a two-level tree: lifecycle category, then focused topic. The browser calls Nuxt `/api/...`; BFF routes integrate Laravel/external services and return stable client shapes.

## Documentation tree

- [Full-stack contracts and verification](../full-stack-contracts.md)

- [Foundations and starter tooling](00-foundations/index.md)
- [BFF and upstream integration](01-bff/index.md)
- [Client architecture](02-client/index.md)
- [Reference feature layer](03-reference/index.md)
- [Conventions, examples, and verification](04-quality/index.md)

## Lifecycle

```text
Vue page → composable model/store → client transport → Nuxt BFF
  → validation/auth/service/cache/mapper → Laravel or external API
  → client resource shape → component rendering
```

Start from any category. Each focused topic links back here and to the architecture home; use the reference feature only to learn structure, not to copy product behavior.
