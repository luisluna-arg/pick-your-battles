# Bug: Hardcoded task limit ignoring user settings

## Metadata

issue_number: `38`
adw_id: `1771399383`
issue_json: `{"body":"**Goal:** Ensure the task creation logic dynamically respects the max_tasks value defined in the user's settings.\n\n**Context:**\nThe application is currently enforcing a hardcoded limit of 3 tasks for everyone. This ignores the custom configuration saved in the user's profile, making the \"Max Concurrent Tasks\" setting in the UI non-functional.\n\n**Tasks:**\n\n- [ ] Modify the task creation validation to fetch the current user's max_tasks from the database.\n- [ ] Replace the hardcoded limit with the dynamic value retrieved from the user profile.\n- [ ] Update the UI to reflect the correct number of available slots based on the user's setting.\n\n**Acceptance Criteria:**\n\n- The application allows the exact number of pending tasks specified in the user's settings.\n- If a user changes their limit from 3 to 5, they should be able to create 5 tasks without being blocked at the 3rd.\n- Validation correctly blocks creation only when the specific user-defined limit is reached.","number":38,"title":"Bug: Hardcoded task limit ignoring user settings"}`

## Bug Description

The Dashboard UI always renders exactly 3 task slots, regardless of the user's `maxTasks` setting. A user who sets their limit to 5 can only see 3 slots in the UI — they cannot even attempt to add tasks 4 or 5. A user who sets their limit to 1 still sees 3 slots.

The backend `createTask` mutation already correctly reads `user.maxTasks` from the database to enforce the limit — so the enforcement layer is fine. The problem is entirely in the UI:

- **`Dashboard.tsx`** hardcodes three `<TaskSlot>` components with positions 1, 2, 3
- **`Dashboard.tsx`** never fetches the user's profile or `maxTasks`
- **`Dashboard.tsx`** shows the subtitle "Limit yourself to 3 tasks at a time." — hardcoded
- **`app/app/api/user/route.ts`** only has a `PATCH` handler — there is no `GET /api/user` endpoint so the client cannot fetch user settings

**Expected:** Slot count matches `user.maxTasks`. A user with `maxTasks = 5` sees 5 slots.
**Actual:** Always 3 slots.

## Problem Statement

`Dashboard.tsx` renders a fixed grid of 3 `<TaskSlot>` components. It never fetches the user's `maxTasks` because there is no `GET /api/user` endpoint to query it from. The subtitle also hardcodes the number 3.

## Solution Statement

1. Add a `GET /api/user` handler to `app/app/api/user/route.ts` that returns the authenticated user's profile (including `maxTasks`) from the database.
2. Update `Dashboard.tsx` to fetch `GET /api/user` on mount, store `maxTasks` in state (default 3), and dynamically render that many `<TaskSlot>` components via `Array.from`.
3. Update the subtitle in `Dashboard.tsx` to use the dynamic `maxTasks` value.

No changes are needed to the backend `createTask` mutation — it already enforces `user.maxTasks` correctly.

## Steps to Reproduce

1. Sign in to the application
2. Go to Settings and set "Max Concurrent Tasks" to any value other than 3 (e.g. 5)
3. Return to Dashboard
4. Observe: only 3 slots are shown — slots 4 and 5 are missing

## Root Cause Analysis

`Dashboard.tsx` hardcodes three `<TaskSlot slotNumber={1|2|3} />` components. There is no `GET /api/user` endpoint, so the client has no way to read `maxTasks`. The `PATCH /api/user` handler exists but only accepts writes. As a result, the UI is completely disconnected from the user's configured task limit.

## Relevant Files

Use these files to fix the bug:

- **`app/app/api/user/route.ts`** — Add `GET` handler. Currently only has `PATCH`. Needs to fetch `getUserProfile` and return the user object (including `maxTasks`).
- **`app/components/Dashboard.tsx`** — Root cause of UI hardcoding. Needs to fetch `GET /api/user`, store `maxTasks` in state, render slots dynamically, and update subtitle.
- **`app/lib/db/queries.ts`** — Read-only reference. `getUserProfile(userId)` already exists and returns `User` with `maxTasks`.
- **`app/lib/auth.ts`** — Read-only reference. `requireAuth()` used by API route handlers.

### New Files

- **`tests/app/api/user/route.test.ts`** — New test file for GET /api/user: verify it returns user profile with maxTasks, returns 401 when unauthenticated, returns 404 when user not found.
- Update **`tests/components/Dashboard.test.tsx`** — Add tests verifying Dashboard fetches GET /api/user and renders the correct number of slots based on maxTasks.

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Add GET /api/user handler

- Open `app/app/api/user/route.ts`
- Add a `GET` handler above the existing `PATCH` handler:
  ```typescript
  import { getUserProfile } from '@/lib/db/queries';

  export async function GET() {
    try {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const profile = await getUserProfile(user.id!);
      if (!profile) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json(profile, { status: 200 });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
  ```
- The import for `getCurrentUser` already exists in the file — only add `getUserProfile` from `@/lib/db/queries`

### Step 2: Update Dashboard to fetch user profile and render dynamic slots

- Open `app/components/Dashboard.tsx`
- Add `maxTasks` state: `const [maxTasks, setMaxTasks] = useState(3);`
- In the `useEffect`, alongside fetching tasks, also fetch `GET /api/user`:
  ```typescript
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [tasksResponse, userResponse] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/user'),
        ]);

        if (!tasksResponse.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const tasksData = await tasksResponse.json();
        setTasks(tasksData);

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setMaxTasks(userData.maxTasks ?? 3);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);
  ```
- Replace the hardcoded three `<TaskSlot>` components with a dynamic render:
  ```typescript
  {/* Task Slots */}
  {!loading && !error && (
    <div className="grid gap-6 md:grid-cols-3">
      {Array.from({ length: maxTasks }, (_, i) => i + 1).map((slotNumber) => (
        <TaskSlot
          key={slotNumber}
          slotNumber={slotNumber}
          task={getTaskForSlot(slotNumber)}
          focusedTaskId={focusedTaskId}
          onFocusToggle={handleFocusToggle}
          onAddTask={handleAddTask}
        />
      ))}
    </div>
  )}
  ```
- Update the subtitle to use the dynamic value:
  ```typescript
  <p className="text-lg text-zinc-600 dark:text-zinc-400">
    Focus on what matters. Limit yourself to {maxTasks} task{maxTasks !== 1 ? 's' : ''} at a time.
  </p>
  ```

### Step 3: Add tests for GET /api/user

- Create `tests/app/api/user/route.test.ts`
- Use `@jest-environment node` docblock (same pattern as `tests/app/api/tasks/route.test.ts`)
- Mock `@/lib/auth` and `@/lib/db/queries`
- Test cases:
  - `GET returns user profile with maxTasks when authenticated` — mock `getCurrentUser` returning `{ id: 'user-1' }`, mock `getUserProfile` returning full user with `maxTasks: 5`, assert 200 and `maxTasks: 5`
  - `GET returns 401 when not authenticated` — mock `getCurrentUser` returning `null`, assert 401
  - `GET returns 404 when user not found in database` — mock `getCurrentUser` returning `{ id: 'ghost' }`, mock `getUserProfile` returning `null`, assert 404

### Step 4: Update Dashboard tests to cover dynamic slots

- Open `tests/components/Dashboard.test.tsx`
- Update `fetchMock` in existing tests to also mock `GET /api/user` response (returning `{ maxTasks: 3 }`)
- Add new test cases:
  - `renders maxTasks slots based on user profile` — mock `GET /api/user` returning `{ maxTasks: 5 }`, assert 5 slots rendered (5 "Empty Slot N" or Add Task buttons)
  - `defaults to 3 slots when user fetch fails` — mock `GET /api/user` returning `{ ok: false }`, assert 3 slots rendered
  - `subtitle reflects maxTasks value` — mock `GET /api/user` returning `{ maxTasks: 5 }`, assert subtitle contains "5 tasks"

### Step 5: Run validation commands

- Run all commands listed in the Validation Commands section

## Validation Commands

Execute every command to validate the bug is fixed with zero regressions.

- `npm run lint` - Run ESLint to validate code quality
- `npx tsc --noEmit` - Run TypeScript type check to validate no type errors
- `npm test` - Run test suite to validate the bug is fixed with zero regressions
- `npm run build` - Run production build to validate the bug is fixed with zero regressions

## Notes

- The `GET /api/user` handler should return the full user profile. The client only needs `maxTasks` but returning the full profile is consistent with the existing `PATCH` response.
- Keep `maxTasks` state default at `3` so the UI renders correctly during the brief fetch window before user data arrives.
- The `md:grid-cols-3` class is intentionally kept — for users with more than 3 tasks, slots wrap to new rows which is the correct behavior. No additional grid changes are needed.
- `handleAddTask` re-fetches `GET /api/tasks` on success but does not re-fetch `GET /api/user` — this is correct since `maxTasks` only changes in Settings, not during task creation.
