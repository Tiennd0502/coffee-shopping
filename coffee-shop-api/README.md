# Node.js E-commerce API Practice

## OVERVIEW

Practice API for a coffee-shop style domain (users, categories, products, orders) with Express, TypeScript, Clerk, and TypeORM.

## TIMELINE

- Estimated time: 10 days
- Actual time: 10 days

## TECHNICAL STACK

- **[Node.js](https://nodejs.org/en/docs)** v20.x
- **[TypeScript](https://www.typescriptlang.org/docs/)** v5.9.x
- **[Express.js](https://expressjs.com/)** v5.2.x
- **[Clerk](https://clerk.com/docs/references/express/overview)** (`@clerk/express` v2.x)
- **[PostgreSQL](https://www.postgresql.org/docs/)** v18.x
- **[TypeORM](https://typeorm.io/)** v0.3.x & **[reflect-metadata](https://github.com/rbuckton/reflect-metadata)** v0.2.x
- **[Winston](https://github.com/winstonjs/winston#readme)** v3.19.x
- **[Zod](https://zod.dev/)** v4.x
- **[Helmet](https://helmetjs.github.io/)** v8.x & **[cors](https://github.com/expressjs/cors)** v2.x
- **[Svix](https://docs.svix.com/)** v1.x
- **[Swagger](https://swagger.io/docs/)** (**[swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc)** v6.x & **[swagger-ui-express](https://github.com/scottie1984/swagger-ui-express)** v5.x)
- **[Jest](https://jestjs.io/docs/getting-started)** v29.x & **[Supertest](https://github.com/ladjs/supertest#readme)** v7.x
- **[ESLint](https://eslint.org/docs/latest/)** v9.x, **[Prettier](https://prettier.io/docs/en/)** v3.x, **[Husky](https://typicode.github.io/husky/)** v9.x

## SYSTEM REQUIREMENTS

- **[Node.js](https://nodejs.org/)** v20.x
- **[pnpm](https://pnpm.io/)** v7.32.x

## TARGETS

- Design a relational database schema.
- Produce a backend architecture document and API design.
- Use **[Clerk](https://clerk.com/docs/references/express/overview)** for authentication in Node.js.
- Implement a RESTful API with **[Express.js](https://expressjs.com/)** and **[TypeScript](https://www.typescriptlang.org/docs/)**.
- Configure database connectivity and ORM/Query Builder interactions.
- Handle errors with centralized error handling.
- Generate API documentation with **[Swagger](https://swagger.io/docs/)**.
- Validate request and response data (e.g. **[Zod](https://zod.dev/)**).
- Write unit and integration tests with **[Jest](https://jestjs.io/docs/getting-started)** and **[Supertest](https://github.com/ladjs/supertest#readme)**.

## FEATURES

### Authentication & Users

- JWT-based authentication via Clerk
- Clerk webhook integration (user sync via Svix)

### Catalog

- Admin CRUD on categories
- Admin CRUD on products
- Product filtering by status, category, roast level, and price

### Orders

- Authenticated users can place orders
- Multiple payment methods: Stripe, PayPal, COD
- Admin update order status
- Admin delete orders (pending/cancelled only)

### Developer Experience

- API documentation with Swagger UI
- Centralized error handling
- Request/response validation with Zod
- Structured logging with Winston

## CODE STRUCTURE

```
src/
├── app.ts                        # Express app setup & middleware registration
├── container.ts                  # Dependency injection wiring
├── config/                       # App-wide configuration
│   ├── clerk.ts
│   ├── database.ts
│   ├── env.ts
│   ├── logger.ts
│   └── swagger.ts
├── middlewares/                  # Express middlewares
│   ├── auth.ts                   # requireAuthenticated, requireAdmin
│   ├── error.ts                  # Centralized error handler
│   └── http-logger.ts
├── migrations/                   # TypeORM migration files
├── modules/                      # Feature modules (by domain)
│   ├── category/
│   ├── order/
│   ├── product/
│   ├── user/
│   └── webhooks/clerk/           # Clerk webhook handler
├── routes/                       # Route registration
│   └── v1/                       # API version 1
│       ├── category.route.ts
│       ├── order.route.ts
│       ├── product.route.ts
│       ├── swagger.route.ts
│       ├── user.route.ts
│       └── webhook.route.ts
└── shared/                       # Cross-module utilities
    ├── constants/
    ├── entities/                 # BaseEntity, AuditableEntity
    ├── enums/
    ├── errors/                   # AppError, ErrorCode
    ├── repositories/             # Base repository
    ├── services/                 # Base service
    ├── strategies/
    │   ├── discount/             # DiscountStrategyFactory
    │   └── payment/              # PaymentStrategyFactory (Stripe, PayPal, COD)
    ├── types/
    └── utils/
```

Each module follows the same file structure:

| File                 | Purpose                         |
| :------------------- | :------------------------------ |
| `*.entity.ts`        | TypeORM entity definition       |
| `*.dto.ts`           | Zod schemas & inferred types    |
| `*.mapper.ts`        | Entity → response DTO transform |
| `*.repository.ts`    | TypeORM repository              |
| `*.service.ts`       | Business logic                  |
| `*.v1.controller.ts` | HTTP request handlers           |
| `*.swagger.ts`       | Swagger/OpenAPI annotations     |

## ENTITY RELATIONSHIP DIAGRAM(ERD)

```mermaid
erDiagram
    USER {
        id uuid PK
        clerk_id string
        updated_by uuid FK
        email string
        role string "ADMIN | USER"
        first_name string
        last_name string
        phone_number string
        avatar_url string
        status string "ACTIVE | INACTIVE"
        created_at timestamp
        updated_at timestamp
        deleted_at timestamp
    }

    USER_ADDRESS {
        id uuid PK
        user_id uuid FK
        first_name string
        last_name string
        phone_number string
        address_line string
        city string
        district string
        ward string
        postal_code string
        is_default boolean
        created_at timestamp
        updated_at timestamp
        deleted_at timestamp
    }

    CATEGORY {
        id uuid PK
        created_by uuid FK
        updated_by uuid FK
        deleted_by uuid FK
        name string
        slug string
        created_at timestamp
        updated_at timestamp
        deleted_at timestamp
    }

    PRODUCT {
        id uuid PK
        category_id uuid FK
        created_by uuid FK
        updated_by uuid FK
        deleted_by uuid FK
        name string
        slug string
        description string
        roast_level string "LIGHT | MEDIUM | DARK"
        is_organic boolean
        is_fair_trade boolean
        status string "DRAFT | ACTIVE | INACTIVE | ARCHIVED"
        tasting_notes string
        origin string
        processing_method string
        created_at timestamp
        updated_at timestamp
        deleted_at timestamp
    }

    PRODUCT_IMAGE {
        id uuid PK
        product_id uuid FK
        url string
        is_primary boolean
        sort_order int
        created_at timestamp
        updated_at timestamp
        deleted_at timestamp
    }

    PRODUCT_VARIANT {
        id uuid PK
        product_id uuid FK
        created_by uuid FK
        updated_by uuid FK
        deleted_by uuid FK
        sku string
        weight number
        unit string
        name string
        price number
        discount_type string "PERCENT | FIXED"
        discount_value number
        quantity int
        created_at timestamp
        updated_at timestamp
        deleted_at timestamp
    }

    SHIPPING_METHOD {
        id uuid PK
        created_by uuid FK
        updated_by uuid FK
        deleted_by uuid FK
        name string
        description string
        price number
        status string "ACTIVE | INACTIVE"
        created_at timestamp
        updated_at timestamp
        deleted_at timestamp
    }

    ORDER {
        id uuid PK
        user_id uuid FK
        updated_by uuid FK
        shipping_method_id uuid FK
        order_number string
        status string "PENDING | CONFIRMED | COMPLETED | CANCELLED"
        shipping_status string "PENDING | SHIPPING | DELIVERED | RETURNED"
        payment_status string "UNPAID | PENDING | PAID | FAILED"
        payment_method string "STRIPE | PAYPAL | COD"
        shipping_fee number
        shipping_method_name string
        sub_total number
        tax number
        total_amount number
        address_snapshot json
        note string
        created_at timestamp
        updated_at timestamp
        deleted_at timestamp
    }

    ORDER_ITEM {
        id uuid PK
        order_id uuid FK
        product_id uuid FK
        variant_id uuid FK
        product_name string
        product_image string
        variant_name string
        unit_price number
        discount_amount number
        final_price number
        quantity int
        sub_total number
    }

    USER ||--o{ USER_ADDRESS : "has"
    USER ||--o{ ORDER : "places"
    CATEGORY ||--o{ PRODUCT : "contains"
    PRODUCT ||--o{ PRODUCT_IMAGE : "has"
    PRODUCT ||--o{ PRODUCT_VARIANT : "has"
    PRODUCT ||--o{ ORDER_ITEM : "referenced in"
    PRODUCT_VARIANT ||--o{ ORDER_ITEM : "sold as"
    SHIPPING_METHOD ||--o{ ORDER : "used in"
    ORDER ||--o{ ORDER_ITEM : "contains"
```

---

## API ENDPOINTS

> Base path: `/api/v1` - API docs `/api/api-docs`.
>
> **Auth:** 🔓 Public · 🔒 Authenticated (Clerk JWT) · 👑 Admin

### Users

| Method   | Path         | Auth | Description                    |
| :------- | :----------- | :--- | :----------------------------- |
| `GET`    | `/me`        | 🔒   | Get authenticated user profile |
| `GET`    | `/users`     | 👑   | List all users                 |
| `GET`    | `/users/:id` | 👑   | Get user by ID                 |
| `POST`   | `/users`     | 👑   | Create user                    |
| `PATCH`  | `/users/:id` | 👑   | Update user                    |
| `DELETE` | `/users/:id` | 👑   | Soft-delete user               |

### Categories

| Method   | Path              | Auth | Description          |
| :------- | :---------------- | :--- | :------------------- |
| `GET`    | `/categories`     | 🔓   | List categories      |
| `GET`    | `/categories/:id` | 🔓   | Get category by ID   |
| `POST`   | `/categories`     | 👑   | Create category      |
| `PATCH`  | `/categories/:id` | 👑   | Update category      |
| `DELETE` | `/categories/:id` | 👑   | Soft-delete category |

### Products

| Method   | Path            | Auth | Description                                                    |
| :------- | :-------------- | :--- | :------------------------------------------------------------- |
| `GET`    | `/products`     | 🔓   | List products (filter by status, category, roast level, price) |
| `GET`    | `/products/:id` | 🔓   | Get product by ID                                              |
| `POST`   | `/products`     | 👑   | Create product                                                 |
| `PATCH`  | `/products/:id` | 👑   | Update product                                                 |
| `DELETE` | `/products/:id` | 👑   | Soft-delete product                                            |

### Orders

| Method   | Path                          | Auth | Description                           |
| :------- | :---------------------------- | :--- | :------------------------------------ |
| `GET`    | `/orders`                     | 🔒   | List orders                           |
| `GET`    | `/orders/:id`                 | 🔒   | Get order by ID                       |
| `POST`   | `/orders`                     | 🔒   | Place order                           |
| `PATCH`  | `/orders/:id/status`          | 👑   | Update order status                   |
| `PATCH`  | `/orders/:id/shipping-status` | 👑   | Update shipping status                |
| `DELETE` | `/orders/:id`                 | 👑   | Delete order (pending/cancelled only) |

---

## GETTING STARTED

| Command                                                                                         | Action                    |
| :---------------------------------------------------------------------------------------------- | :------------------------ |
| `git clone -b feat/coffee-shop-api git@gitlab.asoft-python.com:tien.nguyen/nodejs-training.git` | Clone repository          |
| `cd nodejs-training/coffee-shop-api`                                                            | Open coffee-shop-api      |
| `pnpm install`                                                                                  | Install dependencies      |
| `pnpm migration:run`                                                                            | Run pending DB migrations |
| `pnpm dev`                                                                                      | Run dev server (watch)    |
| `pnpm build`                                                                                    | Compile to `dist/`        |
| `pnpm start`                                                                                    | Run compiled app          |
| `pnpm test`                                                                                     | Run tests                 |
| `pnpm test:coverage`                                                                            | Tests with coverage       |

### Local Webhook (ngrok)

Clerk sends webhook events (user created, updated, deleted) to your server. For local development, expose your server with [ngrok](https://ngrok.com/docs):

```bash
# Start your dev server first
pnpm dev

# In a separate terminal, expose port 3000
ngrok http 3000
```

Copy the `https://<id>.ngrok-free.app` URL from ngrok output, then in the [Clerk Dashboard](https://dashboard.clerk.com) → **Webhooks** → create/update the endpoint URL to:

```
https://<id>.ngrok-free.app/api/v1/webhooks/clerk
```

For Clerk, database, and other secrets, use `.env` (see `.env.example`). For environment variable details, email **tien.nguyen@asnet.com.vn**.
