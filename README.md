# Tradexo Frontend (Next.js 15)

Public marketplace website for the Tradexo B2B + local business platform.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- TanStack React Query
- Axios API client

## Getting Started

1. Copy environment file:

```bash
cp .env.local.example .env.local
```

2. Ensure backend is running on port 5003:

```bash
cd ../lead-dikhao-backend
npm run dev
```

3. Start frontend:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — search, categories, featured |
| `/listings` | Search & filter businesses |
| `/business/[id]` | Business profile (SSR + SEO) |
| `/login` | OTP authentication |
| `/profile` | User profile |
| `/dashboard` | Vendor dashboard |
| `/register-business` | Business registration |
| `/plans` | Premium plans |
| `/privacy`, `/terms`, `/support` | Legal & support |

## API

All API calls go through `/api/v1/*` (proxied to backend via `next.config.ts` rewrites).
