# Bug: Call to /api/tasks results in 401 errors

## Metadata

issue_number: `32`
adw_id: `20260218032314`
issue_json: `{"body":"**Issue:** Requests to tasks endpoint result in a 401 error.\n\n**Context:**\nThe calls to the endpoint `/api/tasks` result in a 401 error. In consequence there's no data presented to the user, and the UI shows an error message\n\n**Screenshots:**\n<img width=\"1235\" height=\"651\" alt=\"Image\" src=\"https://github.com/user-attachments/assets/8aabc717-deb7-4730-9f51-80ad3232ddba\" />\n\n**Acceptance Criteria:**\n- The user must be able to see their tasks\n- If the user has no tasks, then here should not be any error messages","number":32,"title":"Bug 1: Call to /api/tasks results in 401 errors"}`

## Bug Description

When an authenticated user loads the dashboard, the client-side `Dashboard` component calls `fetch('/api/tasks')`. This request consistently returns a `401 Unauthorized` response, even though the user is successfully logged in. As a result, the UI displays an error message ("Failed to fetch tasks") instead of the user's tasks.

**Expected behavior:** Authenticated users can see their tasks (or empty task slots if they have none).
**Actual behavior:** The UI shows a red error box with "Failed to fetch tasks" for all authenticated users.

## Problem Statement

The `/api/tasks` GET handler calls `requireAuth()`, which checks `session?.user?.id`. In NextAuth v5 (beta.30), the `session.user.id` field is **not automatically populated** from the JWT token (`token.sub`) without an explicit `session` callback. As a result, `session.user.id` is always `undefined` when called from an API route, causing `requireAuth()` to throw "Unauthorized: User must be authenticated" and the route to return a `401`.

## Solution Statement

Add a `session` callback to `auth.ts` that explicitly maps `token.sub` to `session.user.id`. This is the standard pattern required by NextAuth v5 to expose the user ID in the session object.

## Steps to Reproduce

1. Deploy the application (or run locally with valid Google OAuth credentials and a Neon database)
2. Sign in with a Google account
3. Observe the dashboard — it shows a red error: "Failed to fetch tasks"
4. Open browser DevTools → Network tab → find the `GET /api/tasks` request — it returns `401`

## Root Cause Analysis

In `app/auth.ts`, the NextAuth v5 configuration defines a `signIn` callback and an `authorized` callback, but **no `session` callback**:

```typescript
callbacks: {
  authorized: async ({ auth }) => { return !!auth },
  signIn: async ({ user }) => { /* upserts user to DB */ },
  // ❌ No session callback
}
```

In NextAuth v5 (beta.30), the default session object only includes `user.name`, `user.email`, and `user.image`. The `user.id` field (which is stored as `token.sub` in the JWT) is NOT automatically forwarded to the session object without an explicit `session` callback.

The `requireAuth()` function in `app/lib/auth.ts` checks `session?.user?.id`:

```typescript
if (!session?.user?.id) {
  throw new Error("Unauthorized: User must be authenticated")
}
```

Since `session.user.id` is always `undefined` in the real session (no callback sets it), `requireAuth()` always throws, and every call to `/api/tasks` returns `401`.

## Relevant Files

Use these files to fix the bug:

- **`app/auth.ts`** — Root cause: the NextAuth v5 configuration is missing the `session` callback that maps `token.sub` → `session.user.id`. This is the only file that needs to change.
- **`app/lib/auth.ts`** — Contains `requireAuth()` which depends on `session.user.id` being set. No changes needed; the logic is correct once the session callback is added.
- **`app/app/api/tasks/route.ts`** — The API route that returns 401. No changes needed; it correctly uses `requireAuth()`.
- **`tests/lib/auth.test.ts`** — Existing tests for auth utilities. The existing test "throws error when session has no user ID" already covers the broken path; we need a new test that confirms `session.user.id` flows through correctly.

### New Files

- **`tests/app/api/tasks/route.test.ts`** — Existing placeholder test file needs to be upgraded with real tests that reproduce the 401 bug before the fix and confirm it's resolved after.

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Write a failing test that reproduces the bug

- Open `tests/app/api/tasks/route.test.ts`
- Replace the placeholder test with a real test that:
  - Mocks `@/lib/auth` so that `requireAuth` throws "Unauthorized: User must be authenticated" (simulating the real broken session — no `user.id`)
  - Mocks `@/lib/db/queries` `getUserTasks` (should not be called)
  - Calls the `GET` handler from `app/app/api/tasks/route.ts`
  - Asserts that the response status is `401`
  - Also write a test for the happy path: mock `requireAuth` to return a session with `user.id: 'user-123'`, mock `getUserTasks` to return `[]`, and assert the response is `200` with `[]`
- Run `npm test` — the happy path test should fail because in real runtime `requireAuth` would fail (we can't reproduce the real NextAuth session issue in a unit test directly, but we verify the route plumbing)

### Step 2: Fix the root cause in `app/auth.ts`

- Open `app/auth.ts`
- Add a `session` callback to the `callbacks` object that copies `token.sub` to `session.user.id`:

```typescript
session: async ({ session, token }) => {
  if (token.sub && session.user) {
    session.user.id = token.sub
  }
  return session
},
```

- The full `callbacks` object should look like:

```typescript
callbacks: {
  authorized: async ({ auth }) => {
    return !!auth
  },
  signIn: async ({ user }) => {
    if (user.id && user.email) {
      try {
        await upsertUser({
          id: user.id,
          email: user.email,
          name: user.name || null,
          image: user.image || null,
        });
      } catch (error) {
        console.error('Error syncing user to database:', error);
      }
    }
    return true;
  },
  session: async ({ session, token }) => {
    if (token.sub && session.user) {
      session.user.id = token.sub
    }
    return session
  },
},
```

### Step 3: Verify unit tests pass

- Run `npm test` from the project root
- Confirm that:
  - The new `route.test.ts` tests pass (both the 401 path and the 200 path)
  - All existing tests in `tests/lib/auth.test.ts` still pass
  - No regressions in `tests/components/` or `tests/lib/db/`

### Step 4: Run the full Validation Commands

- Run all validation commands listed in the Validation Commands section below to confirm zero regressions

## Validation Commands

Execute every command to validate the bug is fixed with zero regressions.

- `npm run lint` - Run ESLint to validate code quality
- `npx tsc --noEmit` - Run TypeScript type check to validate no type errors
- `npm test` - Run test suite to validate the bug is fixed with zero regressions
- `npm run build` - Run production build to validate the bug is fixed with zero regressions

## Notes

- The fix is a one-callback addition to `auth.ts`. It is minimal and surgical.
- This is a known NextAuth v5 beta quirk: `session.user.id` is NOT auto-populated from `token.sub` in `beta.30`. The `session` callback is the documented workaround.
- The `jwt` callback is NOT required — Google OAuth already stores the user ID in `token.sub` by default. Only the `session` callback is needed to forward it.
- The `/api/user` PATCH route uses `user.id!` (force assertion), which suggests the developer was aware that `id` might be missing but worked around it. After this fix, the `!` is no longer needed for safety, but changing it is out of scope.
- The existing test in `tests/lib/auth.test.ts` already validates the case where `session.user.id` is missing — confirming the bug path. No changes are needed to that file.
