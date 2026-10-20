# muCitizen

muCitizen is a service-request portal for county services. Residents can report local issues, add a location and photos, and follow a request through to resolution. County officers can review and assign reports, update their status, and use the map and analytics views to plan follow-up.

This file covers the project as it exists in this repository: how to run it locally, prepare the database, and understand the main routes and code.

## What the app does

- Residents can create an account, submit a service request, attach photos, and download a PDF receipt or CSV of their requests.
- Every request receives a reference number that can also be checked on the public ticket tracker.
- Officers can triage requests, assign work, update status, and view incidents on a map.
- Officers and super admins can use the county analytics dashboard. Super admins can also manage staff accounts and view audit logs.
- The in-app assistant answers common service questions and looks up request and county service data.
- Users can manage notification preferences and account settings.

## Technology

- Next.js 16 App Router and React 19
- TypeScript
- PostgreSQL, accessed with Prisma 7 and the Neon serverless driver
- Neon Object Storage's S3-compatible API for request attachments
- Tailwind CSS and shadcn/ui components built on Base UI
- Zod for request validation and Jose for signed session cookies

## Run it locally

### Requirements

- Node.js 22
- pnpm 10 (the repository pins `pnpm@10.34.7`)
- A PostgreSQL database. Neon works, as does another reachable PostgreSQL instance.
- An S3-compatible bucket to test photo uploads. The app expects a bucket named `service-attachments`.

### 1. Get the code and install packages

Clone this repository, change into its directory, then run:

```bash
pnpm install
```

### 2. Configure environment variables

Create `.env.local` in the project root. It is ignored by Git; do not commit credentials.

```dotenv
# Database connection used by the app and Prisma CLI.
# Use a direct PostgreSQL URL when applying migrations.
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"

# Direct connection used by the demo seed script.
DATABASE_URL_UNPOOLED="postgresql://USER:PASSWORD@DIRECT_HOST/DATABASE?sslmode=require"

# Generate a unique value of at least 32 characters.
NEXTAUTH_SECRET="replace-with-a-long-random-secret"

NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Required for photo uploads; use credentials for your S3-compatible bucket.
AWS_ENDPOINT_URL_S3="https://your-storage-endpoint"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-2"
```

For Neon, use the direct (non-pooler) connection for schema changes. The seed script reads `DATABASE_URL_UNPOOLED`; the application reads `DATABASE_URL`. A pooled connection is appropriate for deployed application traffic, but use a direct connection when running Prisma migrations. Keep the direct URL in `DATABASE_URL` while setting up a fresh local database, or configure your migration command with the direct URL separately.

Generate a secure session secret instead of using the example value. On macOS or Linux:

```bash
openssl rand -base64 32
```

Uploads require a bucket named `service-attachments` and valid S3-compatible credentials. The app will still run without those credentials, but uploading an attachment will fail until storage is configured.

### 3. Generate Prisma Client and apply migrations

```bash
pnpm db:generate
pnpm exec prisma migrate deploy
```

This applies the migrations in `prisma/migrations`, including the password-reset-token table and notification preferences. For a schema change during development, create a migration with:

```bash
pnpm exec prisma migrate dev --name describe_the_change
```

Use a direct database connection for these commands. Do not use `prisma db push` as a substitute for the checked-in migration history when setting up a shared or deployed database.

### 4. (Optional) Add demo accounts and sample requests

To load the local demo dataset:

```bash
pnpm db:seed
```

**The seed is destructive.** It deletes existing audit logs, attachments, service requests, categories, and users in the connected database before inserting demo data. Run it only against a disposable development database. Never run it against production or a database containing records you need to keep.

The seeded demo accounts all use the password `Password@123`:

| Role | Email |
| --- | --- |
| Citizen | `citizen@yahoo.com` |
| Officer | `officer@mucitizen.go.ke` |
| Super admin | `admin@mucitizen.go.ke` |

These credentials are for local demonstration only. Change or remove them before exposing a seeded environment to other people.

### 5. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes and access

The account role controls which dashboard pages a signed-in user can access. The route group names in parentheses are an App Router organization detail; they do not appear in the URL.

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | County services landing page |
| `/login` | Signed out | Sign in or create an account |
| `/forgot-password`, `/reset-password` | Signed out | Password recovery |
| `/terms`, `/privacy` | Public | Terms and privacy information |
| `/track` | Public | Check a service request by reference number |
| `/requests` | Citizen | Submit a service request |
| `/my-requests` | Citizen | View and export personal requests |
| `/my-analytics` | Citizen | View personal request totals and recent activity |
| `/analytics`, `/incidents`, `/map` | Officer or super admin | County overview, incident queue, and map |
| `/staff`, `/audit` | Super admin | Staff management and audit log |
| `/accounts/profile`, `/accounts/settings` | Signed in | Profile, appearance, security, and notification preferences |

Unauthenticated users are sent to sign in when they open a protected route. A signed-in user who opens an authentication page is sent to their role's dashboard.

## Project layout

```text
prisma/
  migrations/          Versioned database schema changes
  fixtures.ts          Seed categories
  schema.prisma        Database models and enums
  seed.ts              Demo data loader (destructive)
src/
  app/
    (auth)/            Login, password recovery
    (dashboard)/       Authenticated pages and shared dashboard layout
    api/               Export route handlers
    privacy/           Privacy page
    terms/              Terms page
    track/              Public request tracker
  components/          Shared forms, layout, account, and UI components
  features/            Feature-specific actions, services, and components
  lib/
    config/             Runtime config and demo accounts
    db/                 Prisma client
    security/           Session cookie and role checks
    storage/            S3-compatible attachment storage
  proxy.ts               Route-level session and role checks
```

Feature code is grouped by domain under `src/features` (for example, `auth`, `requests`, `admin`, `analytics`, `map`, and `copilot`). Shared presentation components live in `src/components`.

## Useful commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Run the local development server |
| `pnpm lint` | Run ESLint |
| `pnpm db:generate` | Generate Prisma Client |
| `pnpm exec prisma migrate deploy` | Apply checked-in migrations |
| `pnpm exec prisma migrate dev --name <name>` | Create and apply a development migration |
| `pnpm db:seed` | Replace database contents with demo data |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm build` | Create a production build |
| `pnpm start` | Serve the production build |

Before opening a pull request, run:

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

The GitHub Actions workflow also runs dependency installation, Prisma generation, TypeScript checking, and a production build.

## Production notes

- Set `DATABASE_URL` to the pooled connection for normal application traffic where supported. Run migrations with a direct connection.
- Set `NEXTAUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, and the S3-compatible storage variables in the deployment environment. Never use the examples in this file as production credentials.
- Apply schema changes with `prisma migrate deploy` before deploying code that relies on them.
- Do not run the demo seed against production; it clears application records.
- Password recovery email delivery is not configured in this project. In development, a recovery link is shown in the app; production currently asks the user to contact portal support.

## Deploy from GitHub

### Vercel

1. Push the repository to GitHub and import it into Vercel as a new project.
2. Keep the detected Next.js framework settings and the default install and build commands (`pnpm install` and `pnpm build`).
3. Add the production environment variables in the Vercel project settings: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, and the S3-compatible storage variables listed above.
4. Set `DATABASE_URL` to the pooled PostgreSQL connection for runtime traffic. Before deploying a schema change, run `pnpm exec prisma migrate deploy` with a direct database URL from a trusted environment.
5. Deploy. Vercel builds pushes to the configured production branch and creates preview deployments for pull requests.

Do not put database passwords, storage credentials, or session secrets in `NEXT_PUBLIC_*` variables. Vercel's Next.js integration supplies the platform adapter; the Docker standalone output setting is for self-hosted deployments.

### Docker or another container platform

Build the production image from the repository root:

```bash
docker build -t mucitizen .
```

Start it with the runtime environment configured. Use a real pooled runtime database URL and a session secret unique to the deployment:

```bash
docker run --rm \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://USER:PASSWORD@POOLER_HOST/DATABASE?sslmode=require" \
  -e NEXTAUTH_SECRET="your-unique-random-secret-of-at-least-32-characters" \
  -e NEXT_PUBLIC_APP_URL="https://your-domain.example" \
  -e AWS_ENDPOINT_URL_S3="https://your-storage-endpoint" \
  -e AWS_ACCESS_KEY_ID="your-access-key" \
  -e AWS_SECRET_ACCESS_KEY="your-secret-key" \
  -e AWS_REGION="us-east-2" \
  mucitizen
```

The Docker build enables Next.js standalone output and does not include local `.env` files. A regular Vercel build leaves standalone output disabled so Vercel can use its own Next.js integration. The database URL and session secret used during image building are placeholders only; supply the real values when the container runs. Apply migrations before starting a new version, using a direct, non-pooled database URL:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@DIRECT_HOST/DATABASE?sslmode=require" \
  pnpm exec prisma migrate deploy
```

The same image can run on any platform that supports Docker containers. For production, terminate HTTPS at the platform's load balancer or a reverse proxy, and configure the database and storage secrets through that platform rather than baking them into the image.

## Exports and API endpoints

- `GET /api/requests/export/csv` exports the signed-in citizen's requests.
- `GET /api/requests/[referenceNumber]/pdf` returns that citizen's PDF receipt. Add `?preview=1` to display it inline.
- `GET /api/admin/export/csv` and `GET /api/admin/export/pdf` provide staff exports. Add `?preview=1` to the PDF endpoint to display it inline.

The `/api/admin/...` paths are API endpoints, not dashboard page URLs.

## License

This project is licensed under the [MIT License](./LICENSE).
