# Node.js E-commerce Website

## OVERVIEW

The web app lives in **`coffee-shop-web/`**: **Next.js 15** (App Router), **React 19**, **TypeScript**, **Tailwind CSS v4**, **shadcn/ui** (tokens in `coffee-shop-web/src/app/globals.css`, components in `coffee-shop-web/src/components/ui/`). Tooling: ESLint, Prettier, Jest + React Testing Library, Husky (`coffee-shop-web/.husky/`).

---

## STRUCTURE FOLDER

```text
coffee-shop-web/
├── src/
│   ├── app/                    # App Router
│   │   ├── layout.tsx
│   │   ├── globals.css         # Theme + Tailwind @theme
│   │   ├── (shop)/             # Shop, URL /
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── dashboard/          # URL /dashboard
│   │       ├── layout.tsx
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/                 # shadcn / primitives
│   │   ├── features/           # By domain
│   │   └── shared/             # Header, footer, … (when present)
│   ├── hooks/
│   ├── utils/
│   ├── services/               # Server Actions, API client
│   ├── store/
│   ├── types/
│   └── middleware.ts
├── public/
├── .husky/
├── components.json
├── eslint.config.mjs
├── jest.config.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

---

## GETTING STARTED

| Command                             | Description               |
| ----------------------------------- | ------------------------- |
| `pnpm dev`                          | Dev server (Turbopack)    |
| `pnpm build`                        | Production build          |
| `pnpm start`                        | Run production build      |
| `pnpm lint` / `pnpm lint:fix`       | ESLint                    |
| `pnpm format` / `pnpm format:check` | Prettier                  |
| `pnpm test`                         | Jest once (CI / pre-push) |
| `pnpm test:watch`                   | Jest watch mode           |
| `pnpm test:coverage`                | Jest with coverage        |

For Clerk and other secrets, use `.env` (see `.env.example`). For environment variable details, email **tien.nguyen@asnet.com.vn**.
