# Scaling Architecture

## Overview
SecureDash is currently built as a **Monorepo** using Next.js 15 (App Router). While it runs as a single service for this assignment, it is architected with modular principles that allow it to scale horizontally and essentially into a microservices architecture if needed.

## Database Scaling (PostgreSQL)
1.  **Connection Pooling**: We use a `PrismaClient` singleton (`lib/prisma.ts`) to manage connections efficiently. In production (e.g., Vercel), we would use a connection pooler like **PgBouncer** or **Supabase Transaction Mode** to handle thousands of concurrent serverless functions without exhausting database connections.
2.  **Read Replicas**: The application performs many read operations (Fetching dashboard stats, todos). We can configure Prisma to read from a Read Replica and write to the Primary node to distribute load.
3.  **Sharding**: For user data at scale (millions of users), we can shard the `Todo` and `Note` tables by `userId`, ensuring that all data for a specific user lives on the same shard for fast joins.

## Caching Strategy (Redis)
Currently, session validation checks the database/JWT on every request. To scale:
1.  **Session Caching**: Implement **Redis** to store active session tokens. The `verifySession` (middleware) would check Redis (in-memory, <1ms) instead of the database.
2.  **Data Caching**: Use **Next.js Revalidation** (`revalidatePath`) which we already implemented. For public data or heavy aggregations (dashboard stats), we would wrap database calls with `unstable_cache`.

## Service Decomposition
The application logic is separated into **Server Actions** (`actions/`). This makes it trivial to split:
- **Auth Service**: Extract `actions/auth.ts` -> Dedicated Auth Microservice (Node/Express or Go).
- **Task Service**: Extract `actions/todos.ts` -> Task Management Service.
- **Notes Service**: Extract `actions/notes.ts`.

## Frontend Performance
- **Server Components**: We fetch data on the server (`page.tsx`), reducing client-side JavaScript bundles and eliminating "waterfall" loading states.
- **Optimistic UI**: We use `useOptimistic` (or manual optimistic updates in our `useTransition` flows) to make the UI feel instant, syncing with the server in the background.

## CI/CD Pipeline
- **Linting/Testing**: Running `eslint` and `jest` (unit tests) on every PR.
- **Preview Environments**: Vercel automatically deploys every branch to a preview URL for QA before merging to main.
