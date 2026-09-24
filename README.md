# Zoltasoft Starter

An open-source starter stack for applications in the Zoltasoft ecosystem.

## Composition

- `apps/web` — a product-neutral Nuxt 4 client/BFF foundation with Identity integration and shared tooling.
- `apps/api` — a Laravel 13 API foundation that demonstrates Zoltasoft Clean Architecture and CQRS patterns.
- `apps/identity` — the independently versioned Nuxt identity client and BFF, pinned as a Git submodule.
- `apps/identity-server` — the starter's Laravel identity API, extracted as a sibling service so the client and server have separate build and runtime boundaries.

The web application provides shared foundations only. Add application-specific capabilities as independent applications or feature layers when your product requires them.

## Quick start

```bash
git clone --recurse-submodules <your-starter-repository-url>
cd zolta-starter

cd apps/identity-server
composer install
cp .env.example .env
php artisan key:generate

cd ../identity
cp .env.example .env
pnpm install

cd ../api
composer install
cp .env.example .env
php artisan key:generate

cd ../web
cp .env.example .env
pnpm install
```

Configure the Identity client created for your application in `apps/web/.env` and `apps/api/.env`, then run Identity, the API, and the web client in separate terminals. The Identity component README included in your checked-out submodule covers its setup.

## Licensing

The root starter, `apps/web`, and `apps/api` are licensed under Apache-2.0. `apps/identity` is an independently versioned Apache-2.0 submodule; its `LICENSE`, `NOTICE`, and trademark policy remain authoritative for that component. Third-party dependencies retain their own licenses.

## Updating Identity

```bash
git submodule update --remote apps/identity
git add apps/identity
```

Review and commit the resulting submodule pointer. The starter intentionally pins Identity rather than silently following its default branch.

### Initialize the complete local stack

After PHP dependencies are installed, run the initializer from the repository root:

    ./scripts/init-stack

It prepares the local Identity server database when needed, generates and stores local owner credentials, runs the source-backed identity:bootstrap command, authenticates as the local installation owner, and provisions separate `zoltasoft-starter` and `zoltasoft-tasks` Identity projects. The Starter project receives only its Nuxt BFF client; the Tasks project receives its Laravel API and Nuxt BFF clients. The `starter` and `projects` hosted applications remain separate and keep their existing callback paths. Generated credentials are written to apps/identity/.env, apps/api/.env, and apps/web/.env with restrictive file permissions.

Project access, clients, and both hosted applications are configured in [`scripts/identity-bootstrap.template.json`](scripts/identity-bootstrap.template.json). The template sets public registration, the `member` default role, `account.read` and `account.update` grants, separate `starter` and `projects` hosted auth appearances, and the bundled PNG logo for each application. The initializer creates or updates each project, its clients, roles, permissions, registration policy, hosted application, hosted logo, and local environment wiring.

The initializer is local-only and never prints secrets. If Identity was already bootstrapped, it requires the existing console client credentials and prompts once for the owner password if ZOLTA_BOOTSTRAP_OWNER_PASSWORD is not already in apps/identity-server/.env; the prompt is hidden and the password is then persisted there. Do not run it against a shared or production Identity server. Generated .env files are local secrets and must not be committed.

On the first interactive run, the initializer asks for the installation owner name, email, password, and confirmation. It then creates a local automation user named agent@zoltasoft.com, generates and stores that user password in the Identity server .env, and promotes the agent to administrator in both the Zoltasoft Starter and Zoltasoft Tasks projects. Agents should use this dedicated account for project wiring; the installation owner is only for initial bootstrap.
