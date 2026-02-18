# Bug: Task creation fails with 500 User not found due to missing email fallback in createTask

## Metadata

issue_number: `51`
adw_id: `1771418020`
issue_json: `{"number":51,"title":"Task creation fails with 500 User not found due to missing email fallback in createTask","body":"## Bug Description\n\nCreating a task returns a 500 error with 'User not found' when the user's OAuth ID doesn't match the stored ID.\n\n## Steps to Reproduce\n\n1. Log in with Google\n2. Try to create a task from the dashboard\n3. Observe 500 error\n\n## Root Cause\n\n`createTask()` in `app/lib/db/mutations.ts` calls `getUserProfile(userId)` without the email parameter. When the user ID lookup fails (OAuth ID mismatch), the email fallback in `getUserProfile` never fires because `email` is `undefined`.\n\nThe `/api/user` route was fixed in #44 to pass email, but `/api/tasks` and `createTask` were not updated.\n\n## Expected Behavior\n\nTask creation succeeds even when there is an OAuth ID mismatch, using email as a fallback lookup.\n\n## Actual Behavior\n\n500 Internal Server Error — 'User not found'"}`

## Bug Description

When a user tries to create a task from the dashboard, the API returns a 500 error with "User not found". This happens when the user's OAuth ID in their session does not match the `id` stored in the database (OAuth ID mismatch), because the email fallback mechanism in `getUserProfile` is never invoked.

**Expected:** Task is created successfully.
**Actual:** 500 Internal Server Error — "User not found".

## Problem Statement

`createTask()` in `app/lib/db/mutations.ts` calls `getUserProfile(userId)` without the optional `email` parameter. The `getUserProfile` function supports an email fallback for OAuth ID mismatches, but it only triggers when `email` is provided. Since `createTask` never passes it, the fallback is dead code in this path.

## Solution Statement

Pass the user's email through the call chain:
1. `POST /api/tasks` → extract `session.user.email` and pass to `createTask`
2. `createTask` → accept `email?: string` and forward to `getUserProfile`

This mirrors the fix applied to `/api/user` in Bug #44.

## Steps to Reproduce

1. Log in with Google
2. Navigate to the dashboard
3. Click "Add Task" and enter a title
4. Submit — observe 500 error in the network tab

## Root Cause Analysis

`getUserProfile(userId, email?)` in `queries.ts` first queries by ID. On failure, it only falls back to email if the `email` argument was provided. In the `/api/user` route (fixed in #44), the session email is passed correctly. However, `POST /api/tasks` calls `createTask(session.user.id, ...)` without email, and `createTask` calls `getUserProfile(userId)` without email — so the fallback never fires and `null` is returned, triggering the `throw new Error('User not found')` on line 42 of `mutations.ts`.

## Relevant Files

- **`app/lib/db/mutations.ts`** — `createTask` needs to accept `email?: string` and forward it to `getUserProfile`
- **`app/app/api/tasks/route.ts`** — POST handler needs to pass `session.user.email` to `createTask`
- **`tests/lib/db/mutations.test.ts`** — Existing `createTask` tests assert `mockGetUserProfile` called with only `userId`; must update and add email fallback regression test
- **`tests/app/api/tasks/route.test.ts`** — Should assert that email is forwarded to `createTask`

## Step by Step Tasks

### Step 1: Write a failing regression test in mutations.test.ts

- In `tests/lib/db/mutations.test.ts`, add a test inside `describe('createTask')`:
  ```ts
  it('passes email to getUserProfile for OAuth ID fallback', async () => {
    mockGetUserProfile.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      image: null,
      maxTasks: 3,
      createdAt: new Date(),
    });
    mockGetTaskCount.mockResolvedValue(0);

    const mockQuery = {
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([{ id: 1, userId: 'user-1', title: 'T', description: null, status: 'pending', position: 1, createdAt: new Date(), updatedAt: new Date() }]),
    };
    mockDb.insert.mockReturnValue(mockQuery as any);

    await createTask('user-1', { title: 'T', position: 1 }, 'test@example.com');

    expect(mockGetUserProfile).toHaveBeenCalledWith('user-1', 'test@example.com');
  });
  ```
- Also update the existing test assertion on line 164:
  ```ts
  // Before:
  expect(mockGetUserProfile).toHaveBeenCalledWith('user-1');
  // After:
  expect(mockGetUserProfile).toHaveBeenCalledWith('user-1', undefined);
  ```
- Run `npm test` — this test should FAIL (createTask doesn't accept email yet)

### Step 2: Fix mutations.ts — add email parameter to createTask

- In `app/lib/db/mutations.ts`, update `createTask` signature:
  ```ts
  export async function createTask(
    userId: string,
    data: Omit<InsertTask, 'userId'>,
    email?: string
  ): Promise<Task> {
    const user = await getUserProfile(userId, email);
    ...
  }
  ```

### Step 3: Fix route.ts — pass email to createTask

- In `app/app/api/tasks/route.ts`, update the `createTask` call:
  ```ts
  const task = await createTask(session.user.id, {
    title: body.title,
    description: body.description || null,
    position: body.position,
    status: body.status || 'pending',
  }, session.user.email ?? undefined);
  ```

### Step 4: Run validation commands

- Run all validation commands and confirm zero failures.

## Validation Commands

- `npm run lint` - Run ESLint to validate code quality
- `npx tsc --noEmit` - Run TypeScript type check to validate no type errors
- `npm test` - Run test suite to validate the bug is fixed with zero regressions
- `npm run build` - Run production build to validate the bug is fixed with zero regressions

## Notes

- Only `createTask` needs the email parameter — `updateTask` and `deleteTask` do not call `getUserProfile`, they rely on ownership checks via `userId` in the WHERE clause.
- The fix is intentionally minimal: two files changed, one parameter added.
