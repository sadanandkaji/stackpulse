# StackPulse

Look up any GitHub developer, view a profile built from live GitHub data, and compare developers side by side. Logged-in users can pin repositories, annotate them with notes and tags, and save named comparisons.

## Tech Stack

| Layer    | Choice                                                          |
| -------- | --------------------------------------------------------------- |
| Frontend | React, TypeScript, Vite, React Router, TanStack Query, Recharts, Tailwind CSS |
| Backend  | Node.js, Express, TypeScript, Zod (validation)                  |
| Database | PostgreSQL on Neon (serverless) with Prisma ORM                 |
| Auth     | Email + password (bcrypt), JWT                                  |

## Features

- Sign up and log in with email and password. Every user's pins and saved comparisons are private to them.
- Search a GitHub username and view a profile: avatar, bio, followers, public repos, total stars, language breakdown, 12-month commit activity, and a repository list (stars, forks, language, last updated).
- Compare 2 to 5 developers with a metrics table (leader highlighted), language share chart and commit activity chart.
- Pin repositories, add notes and tags, filter pins by tag, edit and unpin (full CRUD).
- Save, rename, reopen and delete named comparisons.
- Mobile responsive: profile, repo list, Compare table (horizontal scroll with sticky metric column), charts and navigation.

## Project Structure

```
stackpulse/
├── backend/
│   ├── prisma/            # schema.prisma + migrations
│   └── src/
│       ├── config/        # env validation (zod)
│       ├── controllers/   # thin request/response handlers
│       ├── lib/           # prisma client, jwt, mapLimit, HttpError, asyncHandler
│       ├── middleware/    # requireAuth, validate, error handling
│       ├── routes/        # auth, developers, compare, pins, comparisons, health
│       ├── schemas/       # zod request schemas
│       ├── services/      # business logic, GitHub client, caching
│       ├── app.ts
│       └── index.ts
└── frontend/
    └── src/
        ├── auth/          # AuthContext, ProtectedRoute
        ├── components/    # RepoList, CompareTable, CompareCharts, SaveComparison, ...
        ├── hooks/         # TanStack Query hooks
        ├── lib/           # api client, types, colors
        └── pages/         # Home, Profile, Compare, Pins, SavedComparisons, Login, Signup
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

App runs at http://localhost:5173. Vite proxies `/api` to the backend in development. For a separate deployment, set `VITE_API_URL` to the API base URL (for example `https://api.example.com/api`) and set the backend's `CORS_ORIGIN` to the frontend origin.

### 4. Try it

1. Sign up at `/signup`.
2. Search a username (for example `gaearon`) on the home page.
3. Pin a repo from the profile, then open **Pins** to add a note and tags.
4. Open **Compare**, add two or more usernames, then save the comparison and reopen it from **Saved**.

## Environment Variables

`backend/.env`

| Variable       | Required | Description                                                     |
| -------------- | -------- | --------------------------------------------------------------- |
| `DATABASE_URL` | Yes      | Neon **pooled** connection string (host contains `-pooler`)     |
| `DIRECT_URL`   | Yes      | Neon **direct** connection string, used by Prisma migrations    |
| `JWT_SECRET`   | Yes      | Random string, at least 16 characters, used to sign tokens      |
| `GITHUB_TOKEN` | Yes*     | GitHub PAT. Raises the limit from 60 to 5,000 req/hour          |
| `PORT`         | No       | API port (default `4000`)                                       |
| `CORS_ORIGIN`  | No       | Allowed frontend origin (default `http://localhost:5173`)       |

`frontend/.env` (optional)

| Variable       | Required | Description                                                     |
| -------------- | -------- | --------------------------------------------------------------- |
| `VITE_API_URL` | No       | API base URL. Defaults to `/api` (Vite dev proxy)               |

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

## Database Schema

| Model        | Purpose                                                                                      |
| ------------ | -------------------------------------------------------------------------------------------- |
| `User`       | email (unique), bcrypt password hash                                                         |
| `Developer`  | GitHub profile plus precomputed `totalStars`, `languageBreakdown` (JSON), `commitActivity` (JSON) and `fetchedAt` (cache timestamp). Shared across users |
| `Repo`       | Belongs to a Developer; stars, forks, primary language, `pushedAt`, `isFork`. Unique per (developer, name), indexed on (developer, stars) |
| `Pin`        | A user's pinned repo with `note` and `tags[]`. Unique per (user, repo); cascades on user or repo delete |
| `Comparison` | A user's named comparison with `usernames[]`. Indexed by user                                |

`Developer` and `Repo` are shared GitHub data and are never duplicated per user. `Pin` and `Comparison` always carry a `userId`, and every query on them is scoped to the authenticated user (another user's id returns 404, not 403, so existence is not leaked). Refreshes upsert repos instead of deleting and re-inserting, so pins keep pointing at the same repo rows.

## REST API

All routes except auth and health require `Authorization: Bearer <token>`.

| Method | Endpoint                            | Description                                   |
| ------ | ----------------------------------- | --------------------------------------------- |
| GET    | `/api/health`                       | API and DB status                             |
| POST   | `/api/auth/signup`                  | Create account, returns user and token        |
| POST   | `/api/auth/login`                   | Log in, returns user and token                |
| GET    | `/api/auth/me`                      | Current user                                  |
| GET    | `/api/developers/:username`         | Profile, repos and metrics (cached)           |
| POST   | `/api/developers/:username/refresh` | Force refresh from GitHub (1 per minute)      |
| GET    | `/api/compare?users=a,b,c`          | Metrics, languages, commits for 2 to 5 devs   |
| GET    | `/api/pins?tag=x`                   | List my pins, optional tag filter             |
| POST   | `/api/pins`                         | Pin a repo (`repoId`, `note?`, `tags?`)       |
| PATCH  | `/api/pins/:id`                     | Update note or tags                           |
| DELETE | `/api/pins/:id`                     | Remove a pin                                  |
| GET    | `/api/comparisons`                  | List my saved comparisons                     |
| GET    | `/api/comparisons/:id`              | One saved comparison plus freshly computed results |
| POST   | `/api/comparisons`                  | Save a comparison (`name`, `usernames`)       |
| PATCH  | `/api/comparisons/:id`              | Rename or change developers                   |
| DELETE | `/api/comparisons/:id`              | Delete a comparison                           |

Errors use a consistent shape: `{ "error": "message", "details": [{ "field", "message" }] }`.

## Handling GitHub API Limits and Performance

- **Database as cache.** A developer fetched within the last hour is served from PostgreSQL with zero GitHub calls.
- **Authenticated requests.** A server-side token gives 5,000 req/hour instead of 60.
- **Bounded fetching.** One cold lookup costs roughly 1 user call, 1 to 2 repo-list calls (up to 200 repos), 8 language calls and 5 commit calls, about 15 requests in total, no matter how large the account is.
- **Controlled concurrency.** Per-repo calls run through a small worker pool (4 at a time). Compare loads developers 3 at a time.
- **In-flight deduplication.** Simultaneous requests for the same username share one GitHub fetch.
- **Refresh cooldown.** Manual refresh is honored at most once per minute per developer, so it cannot be used to burn the quota.
- **Precomputed metrics.** Language breakdown and commit activity are stored on `Developer`. Compare computes from stored data, and only calls GitHub for developers that are missing or older than an hour.
- **Partial failure in Compare.** If one username fails (not found, rate limited), the others still load and the failure is reported in an `errors` array.
- **Graceful degradation.** If the rate limit is hit and cached data exists, the app serves it with a `stale` flag and the UI shows a banner. With no cache, the API returns 429 with a clear message.

## Security

- Passwords hashed with bcrypt (10 rounds); never stored or logged in plain text.
- JWT-protected routes (7-day expiry); all pin and comparison queries are scoped by `userId`.
- Login returns the same error for unknown email and wrong password.
- Request bodies validated with Zod; GitHub usernames validated against GitHub's username rules before any outbound call.
- Secrets live in `.env`, which is git-ignored. Only `.env.example` is committed.

## Project Status

- [x] Project scaffold
- [x] Prisma schema and migrations
- [x] Authentication (signup, login, JWT middleware)
- [x] GitHub service with caching and rate-limit handling
- [x] Developer search and profile page
- [x] Compare view with table and charts
- [x] Pins with notes and tags
- [x] Saved comparisons
- [x] Mobile responsive layout
- [x] Demo video and write-up (see `NOTES.md`)

## Trade-offs and Notes

See [`NOTES.md`](./NOTES.md) for the full write-up. In short:

- Postgres-backed caching instead of Redis keeps the stack small; Redis would suit a multi-instance deployment.
- Neon was chosen over a local database so reviewers can run the app without Docker. The free tier suspends idle databases, so the first request after inactivity can take a few seconds.
- Languages and commit activity are sampled from the top repositories rather than all of them, trading completeness for speed and API budget.
- JWT is stored in localStorage for simplicity; httpOnly cookies would be the next hardening step.

## License

MIT