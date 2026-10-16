# StackPulse

Look up any GitHub developer, view a profile built from live GitHub data, and compare developers side by side. Logged-in users can pin repositories, annotate them, and save named comparisons.

## Tech Stack

| Layer    | Choice                                                          |
| -------- | --------------------------------------------------------------- |
| Frontend | React, TypeScript, Vite, React Router, TanStack Query, Recharts |
| Backend  | Node.js, Express, TypeScript, Zod (validation)                  |
| Database | PostgreSQL on Neon (serverless) with Prisma ORM (v6)            |
| Auth     | Email + password (bcrypt), JWT                                  |

## Features

- Sign up and log in with email and password. Every user's data is private to them.
- Search a GitHub username and view a profile: avatar, followers, repositories (stars, language, last updated), total stars, language breakdown, commit activity.
- Compare two or more developers with a comparison table and charts.
- Pin repositories and add notes and tags, with full CRUD on your own pins.
- Save, rename, reopen and delete named comparisons.
- Fully responsive on mobile and desktop.

## Project Structure

```
stackpulse/
├── backend/
│   ├── prisma/            # schema.prisma + migrations
│   └── src/
│       ├── lib/           # prisma client, helpers
│       ├── middleware/    # auth, error handling
│       ├── routes/        # auth, developers, compare, pins, comparisons
│       ├── services/      # GitHub client + caching logic
│       └── index.ts
└── frontend/
    └── src/               # pages, components, hooks, api client
```

## Getting Started

### Prerequisites

- Node.js 20+
- A free [Neon](https://neon.tech) account and project (PostgreSQL)
- A GitHub personal access token (no scopes needed for public data)

### 1. Clone and create the database

```bash
git clone <your-repo-url>
cd stackpulse
```

Create a project at neon.tech, then open the **Connect** dialog and copy two connection strings:

- **Pooled** (pooling toggle on, host contains `-pooler`) goes in `DATABASE_URL`.
- **Direct** (pooling toggle off) goes in `DIRECT_URL`, used for migrations.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # PowerShell: Copy-Item .env.example .env
# edit .env with your values
npx prisma migrate dev
npm run dev
```

API runs at http://localhost:4000. Check http://localhost:4000/api/health.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at http://localhost:5173. Vite proxies `/api` to the backend, so no CORS setup is needed in development.

## Environment Variables

`backend/.env`

| Variable       | Required | Description                                                     |
| -------------- | -------- | --------------------------------------------------------------- |
| `DATABASE_URL` | Yes      | Neon **pooled** connection string (host contains `-pooler`)     |
| `DIRECT_URL`   | Yes      | Neon **direct** connection string, used by Prisma migrations    |
| `JWT_SECRET`   | Yes      | Long random string used to sign tokens                          |
| `GITHUB_TOKEN` | Yes*     | GitHub PAT. Raises the limit from 60 to 5,000 req/hour          |
| `PORT`         | No       | API port (default `4000`)                                       |
| `CORS_ORIGIN`  | No       | Allowed frontend origin (default `http://localhost:5173`)       |

*The app runs without a token, but you will hit the 60 req/hour limit quickly.

Example Neon strings:
```
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=15"
DIRECT_URL="postgresql://USER:PASSWORD@ep-xxxx.REGION.aws.neon.tech/neondb?sslmode=require&connect_timeout=15"
```

## Scripts

Backend:

| Command              | Purpose                      |
| -------------------- | ---------------------------- |
| `npm run dev`        | Start API with hot reload    |
| `npm run build`      | Compile TypeScript           |
| `npm start`          | Run compiled build           |
| `npm run db:migrate` | Create and apply a migration |
| `npm run db:studio`  | Open Prisma Studio           |

Frontend: `npm run dev`, `npm run build`, `npm run preview`.

## Database Schema (planned)

- **User**: email (unique), password hash.
- **Developer**: GitHub profile plus precomputed `totalStars`, `languageBreakdown` (JSON), `commitActivity` (JSON), and `fetchedAt` (cache timestamp). Shared across users.
- **Repo**: belongs to a Developer; stars, forks, primary language, `pushedAt`. Unique per (developer, name).
- **Comparison / ComparisonDev**: a user's named comparison and its developers (many-to-many).
- **Pin**: a user's pinned repo with note and tags. Unique per (user, repo).

`Developer` and `Repo` are shared GitHub data, so they are never duplicated per user. `Pin` and `Comparison` always carry a `userId`, and every query on them is scoped to the authenticated user.

## REST API (planned)

All routes except auth and health require `Authorization: Bearer <token>`.

| Method | Endpoint                            | Description                           |
| ------ | ----------------------------------- | ------------------------------------- |
| GET    | `/api/health`                       | API and DB status                     |
| POST   | `/api/auth/signup`                  | Create account, returns token         |
| POST   | `/api/auth/login`                   | Log in, returns token                 |
| GET    | `/api/auth/me`                      | Current user                          |
| GET    | `/api/developers/:username`         | Profile, repos and metrics (cached)   |
| POST   | `/api/developers/:username/refresh` | Force refresh from GitHub             |
| GET    | `/api/compare?users=a,b,c`          | Metrics for 2+ developers             |
| GET    | `/api/pins`                         | List my pins                          |
| POST   | `/api/pins`                         | Pin a repo (`repoId`, `note`, `tags`) |
| PATCH  | `/api/pins/:id`                     | Update note or tags                   |
| DELETE | `/api/pins/:id`                     | Remove a pin                          |
| GET    | `/api/comparisons`                  | List my saved comparisons             |
| POST   | `/api/comparisons`                  | Save a comparison                     |
| PATCH  | `/api/comparisons/:id`              | Rename or change developers           |
| DELETE | `/api/comparisons/:id`              | Delete a comparison                   |

## Handling GitHub API Limits and Performance

- **Database as cache.** A developer fetched within the last hour is served from PostgreSQL with zero GitHub calls. Stale data triggers a refetch.
- **Authenticated requests.** A server-side token gives 5,000 req/hour instead of 60.
- **Bounded fetching.** Repositories come from one paginated list call, which already includes stars and primary language. Per-repo calls (languages, commits) are limited to the top N repositories by stars.
- **Controlled concurrency.** Per-repo calls run in parallel with a concurrency cap to avoid abuse limits.
- **In-flight deduplication.** Simultaneous requests for the same username share one GitHub fetch.
- **Precomputed metrics.** Language breakdown and commit activity are stored on `Developer`, so Compare is pure database reads.
- **Graceful degradation.** If the rate limit is hit, the app serves stale cached data and tells the user instead of failing.

## Security

- Passwords hashed with bcrypt; never stored or logged in plain text.
- JWT-protected routes; all user data queries are scoped by `userId`.
- Request bodies validated with Zod.
- Secrets live in `.env`, which is git-ignored. Only `.env.example` is committed.

## Project Status

- [x] Project scaffold (backend, frontend, dependencies, Prisma installed)
- [ ] Prisma schema and migrations
- [ ] Authentication (signup, login, JWT middleware)
- [ ] GitHub service with caching and rate-limit handling
- [ ] Developer search and profile page
- [ ] Compare view with table and charts
- [ ] Pins with notes and tags
- [ ] Saved comparisons
- [ ] Mobile responsive polish
- [ ] Demo video and write-up

## Trade-offs and Notes

- Postgres-backed caching was chosen over Redis to keep the stack small. Redis would suit a larger multi-instance deployment.
- Neon (serverless Postgres) was chosen over a local database so reviewers can run the app without Docker. The free tier suspends idle databases, so the first request after inactivity can take a few seconds.
- Commit activity covers the top repositories rather than all of them, trading completeness for speed and API budget.
- JWT is stored client-side for simplicity. httpOnly cookies would be the next hardening step.

## License

MIT