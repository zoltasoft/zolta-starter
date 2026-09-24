# Zoltasoft Starter Web

`apps/web` is a product-neutral Nuxt 4 foundation for applications that use Zoltasoft Identity and a Nuxt BFF. It contains shared UI/i18n packages, authentication/session plumbing, validation, error handling, caching, and the Identity consumer integration. No product pages, feature layers, demo data, or business API client are enabled by default.

## Setup

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Configure an Identity Project confidential client in `.env` when authenticated development is needed. The client secret remains server-side; browser code talks to Nuxt `/api` BFF routes.

## Adding features

Create an independent layer under `layers/<feature>` with `app`, `server`, and (when shared) `shared` directories. Keep cross-layer foundations in the root `app`, `server`, or `shared` directories. See the [client architecture docs](../../docs/client/index.md) and [Identity Project integration](../../docs/api/07-cross-cutting/identity-project-integration.md).

## Commands

```bash
pnpm dev
pnpm lint
pnpm build
pnpm test
```

## Container

Build the Nuxt runtime from `apps/web`:

```bash
  docker build -f docker/nuxt/Dockerfile -t zoltasoft-starter-web .
```

The web image contains only the Nuxt server output. Laravel/API containers are defined and built from `apps/api`.

## License

Apache-2.0. The complete license is at the repository root.


## Tasks product example

The `layers/projects` layer is a separate task-management demo demonstrating a hosted Identity application, Nuxt BFF routes, and a Laravel API for task workspaces. Open `/projects` from the Starter root page. Initialize its local Identity client and hosted application with the repository-level `./scripts/init-stack` command before signing in.
