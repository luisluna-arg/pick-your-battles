# Feature: Task Completion Logic

## Metadata

- **issue_number**: `12`
- **adw_id**: `1771393238`
- **issue_json**:
```json
{
  "title": "Feat. 11: Task Completion Logic",
  "number": 12,
  "body": "**Goal:** Manage task lifecycle.\n**Context:** Allow users to finish tasks to free up slots.\n\n**Tasks:**\n- [ ] Implement the endpoint to mark a task as completed.\n\n**Acceptance Criteria:**\n- Completed tasks are immediately excluded from the active limit count."
}
```

## Feature Description

Implement task completion functionality that allows users to mark tasks as completed, immediately freeing up a slot in their task limit. When a task is marked as completed, it should no longer count toward the user's active task limit (maxTasks), allowing them to create new tasks without hitting the constraint. This implements the core "Pick Your Battles" workflow where completing a task is one of the two ways to free up capacity (the other being deletion).

## User Story

As a **logged-in user with active tasks**
I want to **mark a task as completed**
So that **it no longer counts toward my task limit and I can add new priority tasks**

## Problem Statement

Currently, the system enforces a task limit (default 3, configurable) to force prioritization. However, the way to free up task slots is unclear:
- The task limit enforcement (Issue #10) blocks creation of new tasks when limit is reached
- Users need a way to complete tasks and free up slots
- The `getTaskCount` function currently counts ALL tasks regardless of status
- Completed tasks should not count toward the active limit, but currently do

Without proper task completion logic, users cannot effectively manage their task workflow within the constraint system.

## Solution Statement

Modify the `getTaskCount` query to exclude completed tasks from the active task count. The PATCH /api/tasks/[id] endpoint already exists and supports updating task status to 'completed'. The key change is ensuring that when tasks are marked as completed, they immediately stop counting toward the user's limit. This involves:

1. Update `getTaskCount` to filter out tasks with status='completed'
2. Add validation to ensure status can only be 'pending', 'in-progress', or 'completed'
3. Add comprehensive tests to verify completed tasks don't count toward limit
4. Document the task lifecycle and completion behavior

## Relevant Files

### Existing Files

- **app/lib/db/queries.ts** - Contains `getTaskCount` function
  - Line 50-57: Currently counts ALL tasks regardless of status
  - **NEEDS MODIFICATION**: Must exclude completed tasks from count
  - Used by `createTask` mutation to enforce limits

- **app/lib/db/schema.ts** - Database schema with task status field
  - Line 23: status field with values 'pending', 'in-progress', 'completed'
  - Already supports the three task states

- **app/app/api/tasks/[id]/route.ts** - PATCH endpoint for updating tasks
  - Line 9-52: Already implements PATCH endpoint
  - Line 28: Calls `updateTask` mutation with request body
  - Already supports status updates via `{ status: 'completed' }`

- **app/lib/db/mutations.ts** - Contains `updateTask` function
  - Line 69-84: Already implements updateTask with ownership verification
  - Already supports updating any task field including status

- **tests/lib/db/queries.test.ts** - Unit tests for queries
  - May need to add tests for getTaskCount with status filtering

- **tests/lib/db/mutations.test.ts** - Unit tests for mutations
  - Contains tests for createTask with limit enforcement
  - Need to add tests verifying completed tasks don't count

### Files to Enhance

- **app/lib/db/queries.ts**
  - Modify `getTaskCount` to filter by status (exclude 'completed')

- **tests/lib/db/queries.test.ts**
  - Add tests for getTaskCount with different status values

- **tests/lib/db/mutations.test.ts**
  - Add tests for task limit enforcement with completed tasks

### New Files

None required - all functionality can be achieved by modifying existing files

## Implementation Plan

### Phase 1: Foundation

Understand the current task counting logic and identify the exact change needed:
1. Review how `getTaskCount` is used in `createTask` mutation
2. Verify that PATCH /api/tasks/[id] endpoint works for status updates
3. Confirm the three valid status values: 'pending', 'in-progress', 'completed'

### Phase 2: Core Implementation

Modify the task counting logic to exclude completed tasks:
1. Update `getTaskCount` to filter out completed tasks
2. Add SQL-level filtering using Drizzle ORM where clause
3. Document the change and its implications

### Phase 3: Testing and Validation

Add comprehensive tests to ensure the feature works correctly:
1. Add unit tests for `getTaskCount` with various status combinations
2. Add integration tests for task limit enforcement with completed tasks
3. Test the full workflow: create → complete → create new task
4. Validate that completing a task immediately frees up a slot

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Verify Existing Implementation

- Read `app/lib/db/queries.ts` getTaskCount function (line 50-57)
  - Confirm it currently counts ALL tasks
  - Understand the current query structure
- Read `app/lib/db/mutations.ts` createTask function (line 36-63)
  - Confirm it uses getTaskCount to check limits
  - Verify the error message when limit is reached
- Read `app/app/api/tasks/[id]/route.ts` PATCH endpoint (line 9-52)
  - Confirm it accepts status updates
  - Verify it calls updateTask mutation
- Test manually (if possible):
  - Create 3 tasks (at default limit)
  - Try to create a 4th → should fail
  - Mark one as completed via PATCH
  - Verify task still counts toward limit (current bug)

### 2. Modify getTaskCount to Exclude Completed Tasks

- Open `app/lib/db/queries.ts`
- Locate the `getTaskCount` function (line 50-57)
- Import `ne` (not equal) from 'drizzle-orm' if not already imported
- Modify the query to exclude completed tasks:
  ```typescript
  import { eq, and, ne } from 'drizzle-orm';

  export async function getTaskCount(userId: string): Promise<number> {
    const results = await db
      .select()
      .from(tasks)
      .where(and(
        eq(tasks.userId, userId),
        ne(tasks.status, 'completed')
      ));

    return results.length;
  }
  ```
- Update the JSDoc comment to clarify behavior:
  ```typescript
  /**
   * Get the count of active (non-completed) tasks for a user
   * Used for enforcing task limits
   * Note: Completed tasks are excluded from the count
   */
  ```

### 3. Add Unit Tests for getTaskCount

- Open `tests/lib/db/queries.test.ts`
- Add tests for getTaskCount with different statuses:
  - Test returns 0 when user has no tasks
  - Test counts only pending tasks (excludes completed)
  - Test counts only in-progress tasks (excludes completed)
  - Test counts both pending and in-progress (excludes completed)
  - Test excludes all tasks when all are completed
  - Test with mix of statuses (2 pending, 1 completed, 1 in-progress → returns 3)

If getTaskCount tests don't exist yet, create a new describe block:
```typescript
describe('getTaskCount', () => {
  it('returns 0 when user has no tasks', async () => {
    // Test implementation
  });

  it('counts only non-completed tasks', async () => {
    // Mock db with 2 pending, 1 completed
    // Expect count to be 2
  });

  it('excludes all tasks when all completed', async () => {
    // Mock db with 3 completed tasks
    // Expect count to be 0
  });

  it('counts pending and in-progress, excludes completed', async () => {
    // Mock db with 1 pending, 1 in-progress, 1 completed
    // Expect count to be 2
  });
});
```

### 4. Add Integration Tests for Task Limit with Completion

- Open `tests/lib/db/mutations.test.ts`
- Add tests to the `createTask` describe block:
  - Test creating task succeeds after completing a task at limit
  - Test task limit uses non-completed count
  - Test with user at limit (3 tasks) → complete 1 → create new task succeeds

Example test:
```typescript
it('allows task creation after completing a task at limit', async () => {
  mockGetUserProfile.mockResolvedValue({
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    image: null,
    displayName: 'test@example.com',
    maxTasks: 3,
    createdAt: new Date(),
  });

  // User has 3 tasks total: 2 pending + 1 completed
  // Only 2 should count toward limit
  mockGetTaskCount.mockResolvedValue(2);

  const mockTask = {
    id: 4,
    userId: 'user-1',
    title: 'New Task After Completion',
    description: null,
    status: 'pending',
    position: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockQuery = {
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([mockTask]),
  };

  mockDb.insert.mockReturnValue(mockQuery as any);

  const result = await createTask('user-1', {
    title: 'New Task After Completion',
    position: 4,
  });

  expect(result).toEqual(mockTask);
  // Verify it checked count (which excludes completed tasks)
  expect(mockGetTaskCount).toHaveBeenCalledWith('user-1');
});
```

### 5. Add Status Validation Tests

- In `tests/lib/db/mutations.test.ts`, add tests for updateTask:
  - Test updating task status to 'completed'
  - Test updating task status to 'in-progress'
  - Test updating task status to 'pending'
  - Test updating task status to invalid value (should use DB validation)

### 6. Run All Validation Commands

- From app directory, run:
  - `npm run lint` - ESLint check
  - `npx tsc --noEmit` - TypeScript type check
  - `npm test` - Run test suite (all tests must pass)
  - `npm run build` - Production build (must succeed)

### 7. Manual Testing (Optional but Recommended)

If time permits, manually test the complete workflow:
- Start dev server: `npm run dev`
- Login as test user
- Create 3 tasks (at default limit)
- Attempt to create 4th task → should fail with limit error
- Mark one task as completed:
  ```bash
  curl -X PATCH http://localhost:3000/api/tasks/1 \
    -H "Content-Type: application/json" \
    -d '{"status": "completed"}'
  ```
- Attempt to create 4th task again → should succeed
- Verify the completed task is still in the database but doesn't count

## Testing Strategy

### Unit Tests

**getTaskCount function**:
- Returns 0 for user with no tasks
- Counts only pending tasks
- Counts only in-progress tasks
- Counts both pending and in-progress
- Excludes completed tasks from count
- Returns 0 when all tasks are completed
- Correctly counts mix of statuses (e.g., 2 pending, 1 in-progress, 1 completed → 3)

**createTask with completion**:
- Allows creation after completing a task at limit
- Respects non-completed count for limit enforcement
- Test scenario: 3 total tasks (2 pending, 1 completed) → can create new task

**updateTask with status**:
- Successfully updates task status to 'completed'
- Successfully updates task status to 'in-progress'
- Successfully updates task status to 'pending'
- Returns null when task doesn't exist or doesn't belong to user

### Edge Cases

- User with all tasks completed (count = 0, can create maxTasks new tasks)
- User alternates between creating and completing (slot management)
- User completes multiple tasks at once (all slots free up)
- User changes task from completed back to pending (counts again)
- User with maxTasks=1 completes task and creates new one (tight limit)
- Concurrent completion and creation (race condition - acceptable for MVP)
- Completed task is still retrievable via getUserTasks query

## Acceptance Criteria

✅ `getTaskCount` query excludes tasks with status='completed'
✅ Task limit enforcement uses the modified count (only non-completed tasks)
✅ PATCH /api/tasks/[id] endpoint works to update status to 'completed'
✅ Marking a task as completed immediately frees up a slot in the limit
✅ Users can create a new task after completing one when at limit
✅ Unit tests verify getTaskCount excludes completed tasks
✅ Integration tests verify task limit respects completion status
✅ All validation commands pass with zero errors
✅ Documentation/comments clarify that completed tasks don't count
✅ Task statuses remain valid: 'pending', 'in-progress', 'completed'

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

```bash
# Navigate to app directory
cd app

# Run linter
npm run lint

# Run TypeScript type check
npx tsc --noEmit

# Run test suite (all tests must pass)
npm test

# Run production build
npm run build
```

**Manual Validation** (optional):
1. Start dev server: `npm run dev`
2. Login and create tasks up to limit (e.g., 3 tasks)
3. Attempt to create another task → verify error "Task limit reached"
4. Mark one task as completed via PATCH /api/tasks/[id] with `{ status: 'completed' }`
5. Attempt to create another task → verify success
6. Verify completed task still exists in database but doesn't count toward limit
7. Verify getTaskCount returns correct number (excludes completed)

## Notes

### Current Behavior (Bug)

Currently, `getTaskCount` counts ALL tasks regardless of status:
```typescript
export async function getTaskCount(userId: string): Promise<number> {
  const results = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId));
  return results.length;
}
```

This means completed tasks count toward the limit, which breaks the core workflow.

### Fixed Behavior

After this change, `getTaskCount` will only count non-completed tasks:
```typescript
export async function getTaskCount(userId: string): Promise<number> {
  const results = await db
    .select()
    .from(tasks)
    .where(and(
      eq(tasks.userId, userId),
      ne(tasks.status, 'completed')
    ));
  return results.length;
}
```

Completed tasks remain in the database (for history/reference) but don't count toward active limit.

### Task Lifecycle

Valid task status transitions:
- **pending** → in-progress → completed
- **pending** → completed (skip in-progress)
- **in-progress** → completed
- **in-progress** → pending (move back)
- **completed** → pending (reopen task)

All non-completed statuses count toward limit:
- pending: counts
- in-progress: counts
- completed: **does not count**

### Alternative Approach: Soft Delete

An alternative approach would be to "soft delete" completed tasks by setting a `completedAt` timestamp and filtering by `completedAt IS NULL`. However, the current status field approach is simpler and aligns with the existing schema.

### Future Enhancements

1. **Task archival**: Move old completed tasks to an archive table to keep main table lean
2. **Completion timestamp**: Add `completedAt` field to track when tasks were completed
3. **Completion analytics**: Track completion rates and time-to-completion
4. **Bulk completion**: Allow marking multiple tasks as completed at once
5. **Undo completion**: Add UI to easily reopen a completed task
6. **Filter views**: Add UI filters to show/hide completed tasks
7. **Completion history**: Show user's completion history and stats

### Related Issues

- **Issue #10**: Dynamic Task Constraint (uses getTaskCount for enforcement)
- **Issue #6**: User Profile Schema (maxTasks setting)
- **Issue #8**: User Settings UI (allows changing maxTasks)

### Dependencies

No new dependencies required. Using existing:
- `drizzle-orm` - Database ORM with `ne` (not equal) operator
- `next` - API routes
- `@auth/core` - Authentication
- `jest` - Testing framework

### Performance Considerations

The modified `getTaskCount` query adds a status filter which is already indexed (if status column has an index). Performance impact should be negligible. The query structure is:

```sql
SELECT * FROM tasks
WHERE user_id = ? AND status != 'completed'
```

Consider adding a composite index on (user_id, status) if performance becomes an issue with many users/tasks.

### Breaking Changes

**IMPORTANT**: This change modifies the behavior of `getTaskCount`, which affects task limit enforcement. Existing users who have completed tasks will suddenly have those tasks not count toward their limit. This is the desired behavior, but worth noting for migration:

- Users at limit with completed tasks will immediately be able to create new tasks
- Users may be surprised if they had manually worked around the limit by deleting tasks

This is generally a positive change (bug fix) rather than a breaking change.
