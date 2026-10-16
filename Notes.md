# StackPulse: Approach, Decisions and Trade-offs

## 1. What I built

A full-stack app where a logged-in user searches any GitHub username, sees a profile built from GitHub data, compares 2 to 5 developers side by side, pins repositories with notes and tags, and saves named comparisons. Everything is exposed through my own REST API and persisted in PostgreSQL.

## 2. Architecture

- **Backend:** Express + TypeScript, layered as routes, controllers, services. Controllers are thin; business logic and GitHub access live in services. Zod validates env vars and request bodies. A single error handler turns `HttpError` into a consistent JSON shape.
- **Database:** PostgreSQL (Neon) with Prisma. Shared GitHub data (`Developer`, `Repo`) is separate from per-user data (`Pin`, `Comparison`).
- **Frontend:** React + TypeScript + Vite. TanStack Query handles fetching, caching and mutations. Recharts draws the charts. Tailwind handles responsive layout.
- **Auth:** email + password, bcrypt hashing, JWT in the `Authorization` header, `requireAuth` middleware on every private route.

## 3. The core problem: GitHub's rate limits

The brief deliberately leaves this open, so this is where I spent the most design effort. Naively, one developer with 100 repos needs 200+ calls (languages and commits per repo). Five developers would exhaust the unauthenticated limit of 60/hour instantly and put real pressure on 5,000/hour.

What I did:

1. **Authenticated token** on the server (5,000/hour instead of 60).
2. **Database as the cache.** Each developer row stores `fetchedAt`. Within one hour the profile is served from Postgres with zero GitHub calls. Compare reuses the same path, so comparing developers I have already loaded is free.
3. **Bounded cost per lookup.** The repo list endpoint already returns stars and primary language, so it is used for totals. Per-repo calls are capped: languages for the top 8 repos by stars, commits for the 5 most recently pushed repos. A cold lookup is about 15 requests regardless of account size.
4. **Concurrency control.** A small `mapLimit` worker pool (4 concurrent for per-repo calls, 3 for loading developers in Compare) avoids bursts and GitHub's secondary rate limits.
5. **In-flight deduplication.** A map of in-progress fetches means ten simultaneous requests for the same username produce one GitHub fetch.
6. **Refresh cooldown.** The manual Refresh button works at most once per minute per developer.
7. **Graceful degradation.** On a rate-limit response (429, or 403 with remaining = 0) I serve the stale cached copy with a `stale` flag and show a banner. If there is no cache, the API returns a clear 429.
8. **Partial failure in Compare.** One bad or rate-limited username does not fail the whole comparison. It is reported in `errors` and the rest still render.
9. **Upserts instead of delete-and-reinsert** when refreshing repos, so pins keep pointing at stable repo ids.

## 4. Data model choices

- `Developer.languageBreakdown` and `commitActivity` are JSON columns holding precomputed aggregates. Compare then needs no joins or recomputation; the shape is fixed and always read as a whole, so JSON is a good fit.
- `Repo` has a unique constraint on (developerId, name) and an index on (developerId, stars) for the default sort.
- `Pin` is unique per (userId, repoId), so double-pinning returns a 409. Tags are a Postgres `String[]` (lowercased, de-duplicated, capped at 10).
- `Comparison.usernames` is a `String[]` rather than a join table. The brief suggested `comparison_devs`. I chose the array because a saved comparison is a list of usernames to re-run, not a relation I need to query by developer. It also means a saved comparison survives even if a developer row is later removed, and it re-fetches fresh data when opened. The cost is no referential integrity to `Developer` and no "which comparisons include X" query. If that query became a feature, I would switch to a join table.
- Every `Pin` and `Comparison` query includes `userId` in the `where` clause. Another user's id returns 404 rather than 403 so existence is not leaked.

## 5. API design

Resource-style routes with proper verbs and status codes: 201 on create, 204 on delete, 400 validation, 401 auth, 404 missing or not owned, 409 duplicate, 429 rate limited, 502 upstream failure. Validation errors include per-field messages that the forms display.

## 6. Frontend choices

- TanStack Query with a 5-minute `staleTime` on developer and compare queries avoids refetching while navigating back and forth.
- Compare state lives in the URL (`/compare?users=a,b,c`), so a comparison is shareable, survives refresh, and the profile page's "Compare" button can pre-fill it. Opening a saved comparison is a link to the same page with `&saved=<id>`.
- **Mobile:** single-column layouts that expand at `sm`/`lg`; the Compare table scrolls horizontally with a sticky metric column; charts use `ResponsiveContainer`; the header nav scrolls horizontally on narrow screens; inputs are 16px to avoid iOS zoom.

## 7. Trade-offs and known limitations

| Decision | Benefit | Cost |
| --- | --- | --- |
| Languages from top 8 repos, commits from 5 most recent | About 15 calls per lookup, fast | Language mix and commit counts are approximate for prolific developers |
| Commits: first 100 per repo, last 12 months | Predictable cost | A very active repo can be undercounted |
| Forks excluded from stars and language totals | Reflects the developer's own work | A developer whose notable work is in forks looks smaller |
| Up to 200 repos fetched (2 pages) | Bounded cost | Very large accounts show only their 200 most recently pushed repos |
| Postgres cache, not Redis | One less service to run | In-flight dedupe is per process; multiple instances could duplicate a fetch |
| JWT in localStorage | Simple | Exposed to XSS; httpOnly cookies would be stronger |
| Neon free tier | No Docker for reviewers | Cold start after idle can take a few seconds |
| Saved comparisons as `usernames[]` | Simple, always shows fresh data | No FK integrity; no reverse lookup |

## 8. What I would do next

- Use GitHub's GraphQL API (one query for contributions per user) for exact commit counts instead of sampling.
- Background refresh with a job queue (for example BullMQ) so lookups never block on GitHub, plus conditional requests with ETags so a 304 does not count against the limit.
- Rate limiting on my own API (`express-rate-limit`), especially signup, login and developer lookup.
- httpOnly refresh-token cookie, email verification and password reset.
- Automated tests: service tests with a mocked GitHub client, API tests for ownership checks, and a few component tests.
- Shared-link read-only view for saved comparisons.
- Redis for cross-instance deduplication if the app were scaled horizontally.