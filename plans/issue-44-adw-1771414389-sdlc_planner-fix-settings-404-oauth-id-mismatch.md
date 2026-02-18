# Bug: Settings page 404 - user profile not found after OAuth ID change

## Metadata

issue_number: `44`
adw_id: `1771414389`
issue_json: `{"number":44,"title":"Bug: Settings page 404 - user profile not found after OAuth ID change","body":"## Description\n\nAfter the display name removal chore (#41), the settings page is inaccessible and `/api/user` returns a 404 for existing users.\n\n## Steps to Reproduce\n\n1. Log in with Google OAuth\n2. Navigate to `/settings`\n3. Observe redirect back to dashboard, or browser console shows `GET /api/user 404`\n\n## Expected Behavior\n\nThe settings page loads correctly and the user profile is returned from `/api/user`.\n\n## Actual Behavior\n\n- `GET /api/user` returns 404\n- Settings page redirects to dashboard\n- Dev server logs show: `[getUserProfile] result: null` even though the user record exists in the database\n\n## Root Cause\n\nThe user's session `id` (`token.sub`) does not match the `id` stored in the `users` table — the record exists but under a different OAuth ID. `getUserProfile` only queries by `users.id`, so it returns null even when the user exists.\n\nAdditionally, attempting to auto-create the user via `upsertUser` fails with a duplicate key violation on `users_email_unique` because a row with that email already exists under a different ID.\n\n## Additional Issue\n\nTurbopack crashes with a panic when processing `globals.css` because it incorrectly infers the workspace root as the project root (where `tailwindcss` is not installed) instead of the `app/` subdirectory.\n\nError: `node process exited before we could connect to it with exit code: 0xc0000142`"}`

## Bug Description

After the display name removal chore (#41), the settings page is inaccessible and `/api/user` returns 404 for an existing authenticated user. The dev server logs confirm the user record exists in the database, but `getUserProfile(userId)` returns null because the session's `token.sub` (OAuth subject ID) does not match the `id` column stored in the `users` table. The record was originally inserted under a different OAuth ID.

A secondary unrelated issue caused Turbopack to panic when processing `globals.css` due to incorrect workspace root detection — it looked for `tailwindcss` in the project root instead of the `app/` directory where it is actually installed.

**Expected:** Settings page loads correctly; `/api/user` returns the user's profile with `maxTasks`.
**Actual:** `/api/user` returns 404; settings page redirects to dashboard.

## Problem Statement

1. `getUserProfile(userId)` queries only by `users.id`. When a user's OAuth provider changes their subject ID (`token.sub`), the existing record cannot be found, causing a 404.
2. The fallback `upsertUser` call fails with `duplicate key value violates unique constraint "users_email_unique"` because a record with that email already exists under the old ID.
3. Turbopack incorrectly infers the workspace root, causing a fatal CSS processing panic that prevents the dev server from compiling.

## Solution Statement

1. Add an optional `email` parameter to `getUserProfile` — if ID lookup returns null, fall back to email-based lookup. This handles OAuth ID rotation transparently.
2. Update callers (`/api/user` GET and `settings/page.tsx`) to pass the session email to `getUserProfile` so the fallback can trigger.
3. Add `turbopack.root` to `next.config.ts` to pin the workspace root to the `app/` directory, eliminating the CSS panic.

## Steps to Reproduce

1. Have an existing user record in the database with a specific OAuth `id`
2. Log in via Google OAuth — if the session `token.sub` differs from the stored `id`, `getUserProfile` returns null
3. Navigate to `/settings` → redirected to dashboard
4. Open browser devtools → `GET /api/user` returns 404

## Root Cause Analysis

- **Primary:** `getUserProfile` queries `WHERE users.id = $userId`. When the OAuth provider's `token.sub` doesn't match the stored `id`, the query returns zero rows. The subsequent `upsertUser` call targets `ON CONFLICT (id)` so it attempts an INSERT that hits the email unique constraint, throwing an error rather than finding the existing record.
- **Secondary:** Next.js Turbopack detected two `package-lock.json` files (root and `app/`) and chose the project root as the workspace root. Since `tailwindcss` is only installed in `app/node_modules`, all CSS processing panics on startup with exit code `0xc0000142`.

## Relevant Files

- **`app/lib/db/queries.ts`** — Contains `getUserProfile`; the primary fix lives here (add email fallback parameter).
- **`app/app/api/user/route.ts`** — GET handler that calls `getUserProfile`; must pass `user.email` to enable the fallback.
- **`app/app/settings/page.tsx`** — Server component that calls `getUserProfile`; must pass `user.email` to enable the fallback.
- **`app/next.config.ts`** — Next.js config; add `turbopack.root` to fix the CSS panic.
- **`tests/lib/db/queries.test.ts`** — Unit tests for `getUserProfile`; add tests for the email fallback path.
- **`tests/app/api/user/route.test.ts`** — Unit tests for `/api/user` GET; update to assert email is passed to `getUserProfile` and the auto-upsert path is exercised.

## Step by Step Tasks

### Step 1: Write failing regression tests for `getUserProfile`

- In `tests/lib/db/queries.test.ts`, add a `describe('getUserProfile')` block with tests:
  - `returns user when found by id` — mock `db.select` to return a user on first call
  - `returns null when id not found and no email provided` — mock returns empty, no email arg
  - `falls back to email lookup when id not found` — mock first `db.select` returns empty, second returns a user; assert the result is the user found by email
  - `returns null when neither id nor email finds a user` — both mocks return empty
- Run `npm test` from root — these tests will fail because the current `getUserProfile` does not accept an `email` parameter (note: the fix was already applied during diagnosis, so this step validates the tests pass green)

### Step 2: Fix `getUserProfile` in `app/lib/db/queries.ts`

- Add optional `email?: string` parameter to `getUserProfile`
- After the ID lookup returns null, if `email` is provided, perform a second query: `WHERE users.email = $email`
- Return the result of the email lookup, or `null` if that also returns nothing
- The function signature becomes: `getUserProfile(userId: string, email?: string): Promise<User | null>`

### Step 3: Update `/api/user` GET to pass email

- In `app/app/api/user/route.ts`, change:
  ```ts
  let profile = await getUserProfile(user.id!);
  ```
  to:
  ```ts
  let profile = await getUserProfile(user.id!, user.email ?? undefined);
  ```
- Keep the `upsertUser` fallback for brand-new users who have no record at all

### Step 4: Update `settings/page.tsx` to pass email

- In `app/app/settings/page.tsx`, change:
  ```ts
  let profile = await getUserProfile(userId);
  ```
  to:
  ```ts
  let profile = await getUserProfile(userId, user.email ?? undefined);
  ```
- Keep the `upsertUser` fallback for brand-new users

### Step 5: Fix Turbopack workspace root in `app/next.config.ts`

- Add `turbopack: { root: path.resolve(__dirname) }` to the Next.js config
- Add `import path from "path"` at the top
- This pins the workspace root to the `app/` directory, resolving the `tailwindcss` resolution failure and the CSS panic

### Step 6: Update `tests/app/api/user/route.test.ts`

- Update the existing `returns user profile with maxTasks when authenticated` test to assert `getUserProfile` is called with both `user.id` and `user.email`:
  ```ts
  expect(mockGetUserProfile).toHaveBeenCalledWith('user-1', 'test@example.com');
  ```
- Update the `returns 404 when user not found in database` test: since the route now auto-upserts when `getUserProfile` returns null, mock `upsertUser` and verify it is called; the response should now be 200 with the upserted profile (not 404 for a missing user that can be created)
- Mock `upsertUser` from `@/lib/db/mutations` in the test file

### Step 7: Run all validation commands

- Run `npm run lint` from root — ESLint must pass with zero errors
- Run `npx tsc --noEmit` from `app/` — TypeScript must type-check clean
- Run `npm test` from root — all tests must pass
- Run `npm run build` from `app/` — production build must succeed

## Validation Commands

```bash
# From project root
npm run lint

# From app/ directory
npx tsc --noEmit

# From project root
npm test

# From app/ directory
npm run build
```

## Notes

- The email fallback is a defensive measure for OAuth ID rotation. It does not change any existing IDs in the database — the user's session will continue to use the new `token.sub` but their data is fetched by email lookup.
- The `turbopack.root` fix is only needed locally (Windows dev environment with two lockfiles). It has no effect on Vercel deployment.
- The `upsertUser` auto-create fallback in the GET handler is intentional — it handles the case where a user authenticates for the very first time and no DB record exists yet.
