# Zolta Starter

An open-source starter stack for applications in the Zolta ecosystem.

## Composition

- `apps/web` — a Nuxt 4 client with reusable SaaS marketing and authenticated dashboard foundations.
- `apps/identity` — an independently versioned identity component, pinned as a Git submodule. It owns authentication, users, projects, memberships, roles, and permissions.

The web application provides shared foundations only. Add application-specific capabilities as independent applications or feature layers when your product requires them.

## Quick start

```bash
git clone --recurse-submodules <your-starter-repository-url>
cd zolta-starter

cd apps/identity
cp .env.example .env
pnpm install

cd ../web
cp .env.example .env
pnpm install
```

Configure the Identity client created for your application in `apps/web/.env`, then run Identity and the web client in separate terminals. See [apps/identity/README.md](apps/identity/README.md) for Identity setup.

## Licensing

The root starter and `apps/web` are licensed under Apache-2.0. `apps/identity` is an independently versioned Apache-2.0 submodule; its `LICENSE`, `NOTICE`, and trademark policy remain authoritative for that component. Third-party dependencies retain their own licenses.

## Updating Identity

```bash
git submodule update --remote apps/identity
git add apps/identity
```

Review and commit the resulting submodule pointer. The starter intentionally pins Identity rather than silently following its default branch.
