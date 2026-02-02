This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Database (Neon + Prisma)

- **Connection pooling**: Use Neon's pooled connection string for Prisma. Set `DATABASE_POOL_URL` (or append `?pgbouncer=true&connection_limit=5` to `DATABASE_URL`) so the app uses a single pool with a low connection limit and avoids exhausting serverless connections.
- **Production**: In Neon dashboard, disable autosuspend for production so cold starts don't add latency.
- **Staging**: Use a Neon branch for staging; point staging env to the branch URL.
- **Read replicas**: For heavy read endpoints, consider using Neon read replicas and a separate read URL in the future.

**Migration commands:**
- `npx prisma migrate dev --name <name>` — create and apply a migration (dev).
- `npx prisma migrate deploy` — apply pending migrations (prod).
- `npx prisma generate` — regenerate the client after schema changes.

**Best practices:** Use `select`/`include` only as needed; prefer cursor pagination over offset for large tables; wrap public listing data in `withCache` (see `lib/cache.ts`); use `$transaction` for payment + subscription and other multi-step writes; see `lib/db-examples.ts` for patterns.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
