# Zoltasoft Starter

An open-source starter stack for applications in the Zoltasoft ecosystem.

## Composition

- `apps/web` — a product-neutral Nuxt 4 client/BFF foundation with Identity integration and shared tooling.
- `apps/api` — a Laravel 13 API foundation that demonstrates Zoltasoft Clean Architecture and CQRS patterns.
- `apps/identity-console` — the Nuxt Identity administration console and hosted-auth client.
- `apps/identity-server` — the Laravel Identity API, kept as a separate build and runtime boundary from the console.

The web application provides shared foundations only. Add application-specific capabilities as independent applications or feature layers when your product requires them.

## Quick start

```bash
git clone <your-starter-repository-url>
cd zolta-starter

cd apps/identity-console
pnpm install

cd apps/identity-server
composer install
cp .env.example .env
php artisan key:generate

cd ../api
composer install
cp .env.example .env
php artisan key:generate

cd ../web
cp .env.example .env
pnpm install
```

Configure the Identity client created for your application in `apps/web/.env` and `apps/api/.env`, then run the Identity console, Identity server, API, and web client in separate terminals. Identity source, tests, and Docker build files are maintained in this repository.

## Licensing

The root starter and all four applications are licensed under Apache-2.0. Third-party dependencies retain their own licenses.

## Identity source ownership

Identity console and server changes are reviewed and released with the Starter repository. The console and server remain independently deployable applications and may run as separate instances for the main and Starter Identity projects, but they share one source and release history.

### Initialize the complete local stack

After PHP dependencies are installed, run the initializer from the repository root:

    ./scripts/init-stack

It prepares the local Identity server database when needed, generates and stores local owner credentials, runs the source-backed identity:bootstrap command, authenticates as the local installation owner, and provisions separate `zoltasoft-starter` and `zoltasoft-tasks` Identity projects. The Starter project receives only its Nuxt BFF client; the Tasks project receives its Laravel API and Nuxt BFF clients. The `starter` and `projects` hosted applications remain separate and keep their existing callback paths. Generated credentials are written to apps/identity-console/.env.starter, apps/identity-server/.env.starter, apps/api/.env, and apps/web/.env with restrictive file permissions.

Project access, clients, and both hosted applications are configured in [`scripts/identity-bootstrap.template.json`](scripts/identity-bootstrap.template.json). The template sets public registration, the `member` default role, `account.read` and `account.update` grants, separate `starter` and `projects` hosted auth appearances, and the bundled PNG logo for each application. The initializer creates or updates each project, its clients, roles, permissions, registration policy, hosted application, hosted logo, and local environment wiring.

The initializer is local-only and never prints secrets. If Identity was already bootstrapped, it requires the existing console client credentials and prompts once for the owner password if ZOLTA_BOOTSTRAP_OWNER_PASSWORD is not already in apps/identity-server/.env.starter; the prompt is hidden and the password is then persisted there. Do not run it against a shared or production Identity server. Generated .env files are local secrets and must not be committed.

On the first interactive run, the initializer asks for the installation owner name, email, password, and confirmation. It then creates a local automation user named agent@zoltasoft.com, generates and stores that user password in the Identity server .env, and promotes the agent to administrator in both the Zoltasoft Starter and Zoltasoft Tasks projects. Agents should use this dedicated account for project wiring; the installation owner is only for initial bootstrap.
