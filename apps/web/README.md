# Zolta Starter Web

A reusable Nuxt 4 application foundation for Zolta Identity. It ships with a neutral SaaS marketing surface, an authenticated dashboard shell, localization, theme controls, and hosted authentication integration.

## What is included

- A SaaS landing page, pricing, legal-page, and changelog patterns intended for replacement.
- An authenticated dashboard foundation with responsive navigation and account controls.
- Zolta Identity integration through `@zoltasoft/identity-consumer-nuxt`; browser tokens remain in the encrypted server-side session.
- Shared UI, validation, caching, error, and authorization primitives for future feature layers.

No business API, product domain, payment integration, demo accounts, portfolio content, or application-specific feature is included.

## Setup

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Create an Identity project and confidential client in `../identity`, then provide its API URL, hosted-auth URL, client ID, client secret, and callback URL in `.env`. The default callback is `http://localhost:3000/api/identity/starter/auth/callback`.

## Building features

Keep feature-specific UI, BFF endpoints, and shared types in a Nuxt layer. The browser should call a local `/api` BFF endpoint rather than calling product APIs directly. Keep authentication, project, user, membership, role, and permission concerns in Zolta Identity.

## Commands

```bash
pnpm dev
pnpm lint
pnpm build
pnpm test
```

## License

Apache-2.0. The complete license is at the repository root.
