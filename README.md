# Node.js Training — Coffee Shop Monorepo

## TABLE OF CONTENTS

- [Overview](#overview)
- [Architecture](#architecture)
- [Timeline](#timeline)
- [Author](#author)
- [Technical Stacks](#technical-stacks)
- [Development Tools](#development-tools)
- [Project Structure](#project-structure)
- [Features](#features)
- [Getting Started](#getting-started)

## OVERVIEW

- `nodejs-training` is a coffee-shop practice project made up of a REST API and a storefront/admin web app.
- It's managed as a pnpm workspace monorepo, orchestrated by Turborepo.

## ARCHITECTURE

- `apps/web` (Next.js) calls `apps/api` (Express) over HTTP via the `NEXT_PUBLIC_API_URL` environment variable.
- Both apps authenticate against Clerk independently — `apps/web` uses `@clerk/nextjs`, `apps/api` uses `@clerk/express`. `apps/api` also receives Clerk webhooks (via Svix) to keep users in sync.
- `apps/api` persists data to PostgreSQL through TypeORM.
- Shared code — `packages/types`, `packages/eslint-config`, `packages/prettier-config`, `packages/typescript-config` — is consumed by both apps via `workspace:*`.

## AUTHOR

- **tien.nguyen@asnet.com.vn**

## TECHNICAL STACKS

**API** (`apps/api`)

- **[Node.js](https://nodejs.org/en/docs)** `v20.x`
- **[TypeScript](https://www.typescriptlang.org/docs/)** `^5.9.3`
- **[Express](https://expressjs.com/)** `^5.2.1`
- **[Clerk](https://clerk.com/docs/references/express/overview)** (`@clerk/express`) `^2.1.3`
- **[PostgreSQL](https://www.postgresql.org/docs/)** `v18.x`
- **[TypeORM](https://typeorm.io/)** `0.3.28`
- **[Winston](https://github.com/winstonjs/winston#readme)** `^3.19.0`
- **[Zod](https://zod.dev/)** `^4.3.6`
- **[Helmet](https://helmetjs.github.io/)** `^8.1.0`
- **[Svix](https://docs.svix.com/)** `^1.90.0`
- **[Swagger](https://swagger.io/docs/)** (`swagger-ui-express`) `^5.0.1`
- **[Jest](https://jestjs.io/docs/getting-started)** `^29.7.0`

**Web** (`apps/web`)

- **[Next.js](https://nextjs.org/docs)** `15.5.15`
- **[React](https://react.dev/)** `^19.0.0`
- **[TypeScript](https://www.typescriptlang.org/docs/)** `^5`
- **[Tailwind CSS](https://tailwindcss.com/docs)** `^4`
- **[Shadcn/ui](https://ui.shadcn.com/)** `^4.2.0`
- **[Clerk](https://clerk.com/docs/references/nextjs/overview)** (`@clerk/nextjs`) `^6.30.0`
- **[TanStack React Query](https://tanstack.com/query/latest)** `5.62.0`
- **[Zustand](https://zustand-demo.pmnd.rs/)** `^5.0.12`
- **[React Hook Form](https://react-hook-form.com/)** `^7.73.1`
- **[Zod](https://zod.dev/)** `^4.3.6`

## DEVELOPMENT TOOLS

- **[Pnpm](https://pnpm.io/workspaces)** `7.32.2`
- **[Turborepo](https://turbo.build/repo/docs)** `^2.5.5`
- **[ESLint](https://eslint.org/docs/latest/)** `^9.39.4`
- **[Prettier](https://prettier.io/docs/en/)** `^3.8.x`
- **[TypeScript](https://www.typescriptlang.org/docs/)** `^5.9.3`
- **[Husky](https://typicode.github.io/husky/)** `^9.1.7`
- **[Lint-staged](https://github.com/lint-staged/lint-staged)** `^16.4.0`

## PROJECT STRUCTURE

```text
nodejs-training/
├── apps/
│   ├── api/                    # Express 5 + TypeORM REST API
│   └── web/                    # Next.js 15 + React 19 frontend
├── packages/
│   ├── types/                  # @repo/types - shared TS types
│   ├── eslint-config/          # @repo/eslint-config
│   ├── prettier-config/        # @repo/prettier-config
│   └── typescript-config/      # @repo/typescript-config
├── package.json                # root scripts (turbo run ...)
├── turbo.json                  # Turborepo task pipeline
└── pnpm-workspace.yaml         # workspace globs
```

## FEATURES

- Authentication & user sync via Clerk (JWT + webhooks)
- Catalog browsing with filtering (status, category, roast level, price)
- Checkout & orders with multiple payment methods (Stripe, PayPal, COD)
- Admin CRUD on categories, products, and orders
- API documentation via Swagger UI

See [apps/api/README.md](apps/api/README.md#features) for the full feature breakdown and API endpoint reference.

## GETTING STARTED

```bash
git clone <repo-url>
cd nodejs-training
pnpm install
```

`pnpm install` is run once at the root — pnpm workspaces install dependencies for `apps/api`, `apps/web`, and `packages/*` in a single pass. There are no separate `install:api` / `install:web` scripts.

Copy the env files and fill in the values (Clerk keys, DB credentials, etc.):

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

| Command                                      | Description                                       |
| :------------------------------------------- | :------------------------------------------------ |
| `pnpm install`                               | Install dependencies for all workspaces           |
| `pnpm dev`                                   | Run all apps in dev mode (Turborepo)              |
| `pnpm dev:api`                               | Run API only (`tsx watch`)                        |
| `pnpm dev:web`                               | Run web only (`next dev --turbopack`)             |
| `pnpm build` / `build:api` / `build:web`     | Build all / API / web                             |
| `pnpm start` / `start:api` / `start:web`     | Run production build (API on :3000, web on :3001) |
| `pnpm lint` / `lint:fix`                     | Lint all workspaces                               |
| `pnpm test` / `test:watch` / `test:coverage` | Run tests                                         |
| `pnpm format` / `format:check`               | Prettier                                          |

> Neither `tsx watch` (api) nor `next dev --turbopack` (web) hot-reloads `.env` changes — restart the dev server after editing `apps/api/.env` or `apps/web/.env`.

For database migrations, the local webhook (ngrok) setup, and full API endpoint docs, see [apps/api/README.md](apps/api/README.md).
For the frontend folder layout and component conventions, see [apps/web/README.md](apps/web/README.md).
