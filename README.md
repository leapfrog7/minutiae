# Minutiae

Minutiae is a local-first personal records application built with React and Vite. Records remain in the browser by default. Optional cloud sync uses Neon Auth and a Neon Postgres Data API connected through Vercel.

## Data Model

- Local records remain the working copy in browser `localStorage`.
- JSON export and import remain available without an account.
- Signing in does not upload records automatically.
- Cloud save and cloud restore are separate, confirmed actions.
- Each authenticated user has one versioned JSON snapshot protected by PostgreSQL row-level security.

## Local Development

```powershell
npm install
npm run dev
```

The app works without cloud environment variables. To enable cloud sync, create `.env.local` with:

```text
VITE_NEON_AUTH_URL=https://your-project.auth.neon.tech
VITE_NEON_DATA_API_URL=https://your-project.data-api.neon.tech
DATABASE_URL=postgresql://...
```

When the project is linked to Vercel and Neon, pull the configured variables with:

```powershell
npx vercel env pull .env.local
```

Apply the database schema once:

```powershell
npm run db:migrate
```

## Verification

```powershell
npm test
npm run lint
npm run build
```

## Deployment

The Vite base path is `/minutiae/` for the existing GitHub Pages build and `/` when Vercel sets its `VERCEL` build environment variable. Cloud credentials are injected through Vercel environment variables and must not be committed.

The application is intended for personal, non-commercial use while hosted on Vercel Hobby. Do not store sensitive operational or official records without an approved hosting, security, retention and backup policy.
