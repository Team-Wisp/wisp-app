# Server Directory README

This document explains the **server-side architecture** under `src/server/` and how to add/change code safely as the project grows.

> TL;DR: Keep **route handlers thin** (only validation + auth + delegation). Put **business logic in services**, **data in models**, **cross-cutting helpers** (env, db, security, utils) in their folders.

---

## Directory Layout

```
src/
  app/
    api/
      enrich-domain/
        route.ts              # POST /api/enrich-domain (thin glue)
  server/
    db/
      index.ts                # Mongo connection (singleton, hot-reload safe)
    env.ts                    # Environment variable validation via zod
    models/
      Organization.ts         # Mongoose schema + model for organizations
      OrganizationType.ts     # Enum of organization types
    services/
      domain-enrichment.ts    # Business logic (OpenAI + persistence)
    validation/
      enrich-domain.ts        # zod schema for request payloads
    security/
      verify-caller.ts        # AuthN of callers (shared secret / HMAC)
    utils/
      slug.ts                 # Slug utility wrapper
```

### What lives where

* **`app/api/**/route.ts`**: Next.js route handlers. Do only: request parsing, auth check, validation, calling a service, shaping response.
* **`server/services/`**: Pure business logic. No `NextRequest/Response`. Import models, utils, other services.
* **`server/models/`**: Mongoose schemas + models + domain enums/types.
* **`server/db/`**: Connection bootstrap (singleton pattern). Never connect in services directly to URIs; always go through `dbConnect()`.
* **`server/validation/`**: All zod schemas for HTTP input (and optionally service input). Keep them close to routes.
* **`server/security/`**: Reusable security helpers (shared-secret, HMAC verification, rate-limiting glue, CSRF for future web forms, etc.).
* **`server/utils/`**: Stateless helpers (formatting, slug, time, ids, etc.). No network or DB calls.
* **`server/env.ts`**: Centralized, zod-validated env parsing. Import `env` everywhere; never read `process.env` directly elsewhere.

---

## Conventions

* **Thin routes, fat services**: Route handlers should be < \~50 LOC. If it grows, extract to a service.
* **Server-only imports**: Everything under `src/server/` is server-only. Never import from `server/` into a Client Component.
* **Validation at the edge**: All input to routes must be validated via zod. Return 400 with validation details.
* **Idempotency**: When writing to DB from external webhooks, protect with unique indexes and application checks.
* **Typed enums**: Use TypeScript enums/union types for finite values (e.g., `OrganizationType`).
* **No `process.env` in app code**: Only `env` from `server/env.ts`.
* **Logs**: Use structured logs and consistent prefixes. Don’t log secrets or PII.

---

## Environment Variables

Defined and validated in `server/env.ts`.

* `MONGODB_URI` – Mongo connection string
* `OPENAI_API_KEY` – OpenAI API key
* `AUTH_WEBHOOK_SECRET` – Shared secret (or HMAC key) for authenticating the Go auth service

Add them to `.env.local` (dev) and your deployment environment. Also keep a `.env.example` in the repo for onboarding.

---

## Database

* Connection via `db/index.ts` using a cached/singleton approach to avoid multiple connections in dev hot-reload.
* **Indexes** are defined in schemas; rely on `unique` and `index` for lookup-heavy fields.
* For migrations or backfills, prefer **script files** under `scripts/` (you can add a `src/server/scripts/` folder) and run with `ts-node`.

---

## Adding a New API Endpoint

1. **Create a route**: `src/app/api/<feature>/route.ts`
2. **Create zod schema**: `src/server/validation/<feature>.ts`
3. **Add service**: `src/server/services/<feature>.ts`
4. **Use security helper**: import and call `verifyCaller(req)` or HMAC verifier
5. **Call the service**: from the route; return JSON with proper status codes
6. **Tests**: add unit tests for the service (see Testing section)

**Route pattern example** (minimal):

```ts
export async function POST(req: NextRequest) {
  const isTrusted = await verifyCaller(req);
  if (!isTrusted) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = mySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 });

  await myService(parsed.data);
  return NextResponse.json({ ok: true }, { status: 200 });
}
```

---

## Adding a New Model

1. Create schema in `server/models/YourModel.ts`.
2. Export using `mongoose.models.YourModel || mongoose.model(...)` to be hot-reload safe.
3. Add indexes/uniques at schema definition time.

---

## Services: Best Practices

* Services contain **business rules** only. No HTTP awareness (no `NextRequest/Response`).
* Always call `await dbConnect()` at the top if DB is needed.
* Keep functions small and testable. Inject dependencies where helpful (e.g., pass a client instead of importing globally) for easier testing.
* Handle external APIs defensively (timeouts, retries, fallbacks, circuit breakers if needed).

---

## Security

* **verify-caller**: Validates a shared secret header (`X-Auth-Secret`) or HMAC signature from the Go auth service.
* If the endpoint is public, add **rate limiting** (e.g., Upstash Redis token bucket) at the route level.
* Return **401** for auth failures, **403** for permission issues.

---

## Observability

* Use structured logs: `console.log(JSON.stringify({ level: 'info', msg: '...', meta }))` or a logger (pino/winston) behind a tiny wrapper.
* Include a **correlation ID** header (forwarded from Go) to trace a request end-to-end.
* Consider adding basic metrics (requests, latency, error counts) if you deploy to a platform with built-in observability.

---

## Error Handling

* Throw domain-specific errors in services; map them to HTTP in the route.
* Don’t leak internal error messages to clients; log details server-side.
* Prefer **explicit returns** over silent failures.

---

## Performance & Scaling

* Route handlers should be **fast**; offload slow tasks (like AI calls) to **background jobs**.
* Suggested: add a `jobs/` or `workers/` directory for BullMQ/Cloud Tasks/Trigger.dev.
* Use **unique constraints** for idempotency (e.g., `domain` unique) and short-circuit in services.
* Add **caching** for repeat AI lookups (Redis) with sensible TTLs.

---

## Testing

* Unit test services with Jest/Vitest. Keep routes thin so most logic is testable without Next runtime.
* Mock external APIs (OpenAI) and DB with lightweight fakes.
* Basic example structure:

```
__tests__/
  services/
    domain-enrichment.test.ts
```

---

## Example: Enrich Domain Flow (Current Feature)

* **Route**: `/api/enrich-domain` → verifies caller → validates payload → calls `enrichDomain()`.
* **Service**: `enrichDomain(domain, type)` → connects DB → checks existing → calls OpenAI → creates `Organization` with slug.
* **Model**: `Organization` (name, domain\[unique], type, org\_slug\[unique]).

---

## Making Future Changes

* **New business logic**: add/modify a file in `server/services/` and wire it from a route.
* **New data fields**: update the Mongoose schema, add/migrate indexes, adjust service code accordingly.
* **New external API**: create a dedicated client helper (e.g., `server/clients/<provider>.ts`) and keep services focused on orchestration.
* **Swap security scheme**: replace `verify-caller` with HMAC variant; keep route code unchanged.

---

## Do / Don’t

**Do**

* Keep concerns separated; keep routes tiny.
* Validate env and inputs.
* Use enums/types for finite domains.
* Add indexes for frequent lookups.

**Don’t**

* Read `process.env` outside `server/env.ts`.
* Put business logic inside route handlers.
* Import `server/` files in Client Components.

---

## Quick Commands

* Run dev server: `npm run dev`
* Typecheck: `npm run typecheck` (add a script)
* Lint: `npm run lint`
* Test: `npm run test`

---

## Glossary

* **Route handler**: Next.js server function in `app/api/**/route.ts` mapping HTTP to services.
* **Service**: Unit of business logic, independent of HTTP or UI.
* **Model**: Data schema and access logic using Mongoose.
* **Validation**: zod schemas guarding inputs.
* **Env validation**: Ensures required configuration is present at boot.

---

If you add new folders (e.g., `clients/`, `jobs/`, `scripts/`), update this README with their purpose and rules.
