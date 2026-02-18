# Feature: Dynamic Task Constraint

## Metadata

- **issue_number**: `10`
- **adw_id**: `1771392778`
- **issue_json**:
```json
{
  "title": "Feat. 10: Dynamic Task Constraint",
  "number": 10,
  "body": "**Goal:** Enforce the \"Pick Your Battles\" limit.\n\n**Context:** Prevent adding tasks based on the user's specific max_tasks setting.\n\n**Tasks:**\n- [ ] Implement POST /api/tasks with validation logic.\n- [ ] Check user limit vs. current pending tasks before insertion.\n\n**Acceptance Criteria:**\n- New tasks are rejected if the user's current limit is reached."
}
```

## Context

**IMPORTANT**: The core functionality for this issue is already implemented. This plan focuses on verification, additional testing, and ensuring completeness of the dynamic task constraint feature.

## Feature Description

Enforce the "Pick Your Battles" core constraint by preventing users from creating more tasks than their configured limit (maxTasks). When a user attempts to create a new task and they already have the maximum number of tasks, the system rejects the request with a clear error message. This constraint dynamically adapts to each user's personal maxTasks setting (default: 3, configurable via settings).

## User Story

As a **logged-in user**
I want to **be prevented from creating more tasks than my configured limit**
So that **I'm forced to focus on my current priorities and maintain a manageable workload**

## Problem Statement

The core value proposition of "Pick Your Battles" is the enforced task limit that forces prioritization. Without this constraint enforcement:
- Users could accumulate unlimited tasks, defeating the purpose
- The app would become just another todo list without differentiation
- Users wouldn't experience the forcing function that drives focus

The system must dynamically enforce each user's personal maxTasks limit when creating new tasks, providing clear feedback when the limit is reached.

## Solution Statement

Implement task limit validation in the `createTask` mutation and POST /api/tasks endpoint. Before inserting a new task:
1. Fetch the user's profile to get their maxTasks setting
2. Count the user's current tasks using `getTaskCount`
3. If current count >= maxTasks, reject with error "Task limit reached. You can only have X tasks at a time."
4. Otherwise, proceed with task creation

The validation happens at the database layer (mutation) to ensure consistency regardless of where tasks are created, and the API layer handles error responses appropriately.

## Relevant Files

### Existing Files (Already Implemented)

- **app/lib/db/mutations.ts** - `createTask` function with limit enforcement
  - Already fetches user profile to get maxTasks
  - Already calls `getTaskCount` to check current task count
  - Already throws error when limit reached with dynamic message
  - Line 36-63 contains full implementation

- **app/lib/db/queries.ts** - `getTaskCount` function
  - Already counts tasks for a user
  - Used by createTask to enforce limits
  - Line 50-57 contains implementation

- **app/lib/db/schema.ts** - Database schema
  - Users table has maxTasks column (integer, default 3)
  - Tasks table with userId foreign key and cascade delete

- **app/app/api/tasks/route.ts** - POST /api/tasks endpoint
  - Already implements POST endpoint with authentication
  - Already validates required fields (title, position)
  - Already calls createTask mutation
  - Already handles "Task limit reached" error with 400 status
  - Line 36-88 contains full implementation

- **tests/lib/db/mutations.test.ts** - Unit tests for createTask
  - Already includes 4 comprehensive tests:
    - Creates task when under limit
    - Throws error when limit reached
    - Enforces custom user limits
    - Throws error when user not found
  - Line 134-230 contains tests

### Files to Enhance

- **tests/app/api/tasks/route.test.ts** (CURRENTLY PLACEHOLDER)
  - Add integration tests for POST /api/tasks endpoint
  - Test authentication requirements
  - Test input validation
  - Test limit enforcement at API level
  - Test error responses

### New Files

None required - all core functionality exists

## Implementation Plan

### Phase 1: Verification

Verify that the existing implementation fully satisfies Issue #10 requirements:
1. POST /api/tasks endpoint exists and works
2. Task limit enforcement logic is correct
3. Error messages are clear and helpful
4. All edge cases are handled

### Phase 2: Enhanced Testing

Add missing API route tests to ensure robustness:
1. Create integration tests for POST /api/tasks
2. Test the full flow from API request to database
3. Test error scenarios comprehensively

### Phase 3: Validation

Validate the complete feature with zero regressions:
1. Run all unit tests
2. Run new API tests
3. Manual testing of task creation flow
4. Verify production build

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Verify Existing Implementation

- Read `app/lib/db/mutations.ts` createTask function (line 36-63)
  - Confirm it fetches user profile to get maxTasks
  - Confirm it calls getTaskCount to check current count
  - Confirm it throws error when currentCount >= maxTasks
  - Confirm error message includes dynamic maxTasks value
- Read `app/app/api/tasks/route.ts` POST endpoint (line 36-88)
  - Confirm it uses requireAuth() for authentication
  - Confirm it validates title (required, string)
  - Confirm it validates position (required, number)
  - Confirm it calls createTask mutation
  - Confirm it catches "Task limit reached" error and returns 400
- Read existing tests in `tests/lib/db/mutations.test.ts` (line 134-230)
  - Verify 4 tests exist for createTask
  - Verify tests cover: success, limit reached, custom limits, user not found

### 2. Identify Gaps

- Check if API route tests are just placeholders (they are)
- Determine if any edge cases are missing from unit tests:
  - Completed tasks (should they count toward limit?)
  - Concurrent task creation (race conditions)
  - Invalid user ID handling
  - Database connection errors

### 3. Enhance API Route Tests

**Note**: API route testing in Next.js App Router has known limitations with Jest. If mocking issues persist, skip this step and rely on unit tests + manual testing.

- Open `tests/app/api/tasks/route.test.ts`
- Replace placeholder test with real tests (if feasible):
  - Test POST with valid data under limit → 201 Created
  - Test POST when at limit → 400 with "Task limit reached" error
  - Test POST without authentication → 401 Unauthorized
  - Test POST with missing title → 400 Bad Request
  - Test POST with missing position → 400 Bad Request
  - Test POST with invalid data types → 400 Bad Request

If Jest environment issues make this infeasible, document why and skip to step 4.

### 4. Add Edge Case Tests (if needed)

- Check if getTaskCount counts all tasks or only pending/in-progress
- If it counts completed tasks, consider if that's correct behavior
- Add tests for:
  - User with maxTasks=1 (boundary condition)
  - User with maxTasks=10 (upper boundary)
  - Task creation at exact limit (e.g., 2 tasks, maxTasks=3, should succeed)

### 5. Manual Testing

- Start the development server (`npm run dev` from app directory)
- Log in as a test user
- Navigate to dashboard or task creation UI
- Attempt to create tasks:
  - Create first task → should succeed
  - Create second task → should succeed
  - Create third task (at default limit) → should succeed
  - Create fourth task → should fail with clear error message
- Update user settings to maxTasks=5
- Create additional tasks up to 5 → should succeed
- Attempt to create 6th task → should fail
- Verify error message shows correct limit ("You can only have 5 tasks at a time")

### 6. Test Status Field Handling

- Verify that createTask properly handles the status field:
  - Default status is 'pending' if not provided
  - Can explicitly set status to 'pending', 'in-progress', or 'completed'
- Determine if completed tasks should count toward limit (likely yes, based on current implementation)
- Document this behavior

### 7. Run All Validation Commands

- Execute all validation commands to ensure zero regressions
- From app directory:
  - `npm run lint` - ESLint check
  - `npx tsc --noEmit` - TypeScript type check
  - `npm test` - Run test suite (all tests must pass)
  - `npm run build` - Production build (must succeed)

## Testing Strategy

### Unit Tests (Already Exist)

**createTask mutation** (in tests/lib/db/mutations.test.ts):
- ✅ Creates task successfully when under user limit
- ✅ Throws error when user task limit is reached
- ✅ Enforces custom user task limit (e.g., 5 instead of default 3)
- ✅ Throws error when user not found

**Potential additions**:
- Test with maxTasks=1 (minimum practical value)
- Test with maxTasks=10 (maximum allowed value)
- Test task creation at exact limit boundary

### API Integration Tests (To Be Added)

**POST /api/tasks** (in tests/app/api/tasks/route.test.ts):
- Authentication required (401 if not authenticated)
- Input validation (title required, position required, correct types)
- Task limit enforcement (400 with error message when limit reached)
- Success response (201 with created task data)
- Error handling for unexpected failures (500)

**Note**: May skip if Jest environment issues persist (document reason)

### Manual Tests

**Task Creation Flow**:
1. User with 0 tasks creates task → success
2. User with (maxTasks - 1) tasks creates task → success
3. User with maxTasks tasks attempts to create task → error with clear message
4. User updates maxTasks setting then creates tasks → respects new limit

### Edge Cases

- User with maxTasks=1 (can only have one task at a time)
- User with maxTasks=10 (upper boundary)
- Concurrent task creation requests (race condition)
- Task creation when database connection fails
- Task creation with completed tasks (do they count?)
- Invalid userId (should throw "User not found")
- Missing user profile in database (should throw "User not found")

## Acceptance Criteria

✅ POST /api/tasks endpoint exists and requires authentication
✅ Endpoint validates required fields (title, position)
✅ createTask mutation checks user's maxTasks setting before insertion
✅ createTask counts current tasks using getTaskCount
✅ Task creation is rejected when currentCount >= maxTasks
✅ Error message clearly states "Task limit reached. You can only have X tasks at a time."
✅ Error includes user's specific maxTasks value (not hardcoded)
✅ API endpoint returns 400 status when limit reached
✅ API endpoint returns 201 status when task created successfully
✅ Unit tests exist for all limit enforcement scenarios
✅ All validation commands pass with zero errors
✅ Manual testing confirms limit enforcement works correctly
✅ Custom maxTasks limits are properly enforced (not just default 3)

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

**Manual Validation**:
1. Start dev server: `npm run dev`
2. Login and navigate to dashboard
3. Create tasks up to user's limit → verify all succeed
4. Attempt to create one more task → verify error message appears
5. Check that error message shows correct maxTasks value
6. Update maxTasks in settings (e.g., to 5)
7. Create additional tasks → verify new limit is enforced
8. Verify completed/deleted tasks don't count toward limit (or do, if that's intended behavior)

## Notes

### Implementation Status

**✅ Already Implemented:**
- POST /api/tasks endpoint with authentication and validation
- createTask mutation with dynamic limit enforcement
- getTaskCount query to count user's tasks
- Error handling with clear, dynamic error messages
- Comprehensive unit tests for mutation layer (4 tests)

**⚠️ Missing/Optional:**
- API route integration tests (currently placeholder due to Jest environment limitations)
- Edge case tests for boundary values (maxTasks=1, maxTasks=10)
- E2E tests for full user flow

### Current Behavior

**Task Counting**:
The current implementation of `getTaskCount` counts ALL tasks for a user, regardless of status:
```typescript
export async function getTaskCount(userId: string): Promise<number> {
  const results = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId));
  return results.length;
}
```

This means completed tasks count toward the limit. Consider if this is desired behavior:
- **Pros**: Forces users to delete/archive old tasks, keeps list clean
- **Cons**: Users can't keep completed tasks for reference

If the intent is to only count pending/in-progress tasks, modify getTaskCount:
```typescript
.where(and(
  eq(tasks.userId, userId),
  ne(tasks.status, 'completed')
))
```

### Error Message

The error message dynamically includes the user's maxTasks value:
```typescript
`Task limit reached. You can only have ${user.maxTasks} tasks at a time.`
```

This provides clear feedback and adapts to custom limits automatically.

### Race Conditions

The current implementation has a potential race condition if two task creation requests happen simultaneously:
1. Request A checks count (2 tasks) → under limit (3)
2. Request B checks count (2 tasks) → under limit (3)
3. Request A inserts task (total now 3)
4. Request B inserts task (total now 4, exceeds limit)

For MVP, this edge case is acceptable. For production, consider:
- Database-level constraint (CHECK constraint on task count)
- Pessimistic locking
- Optimistic locking with retry logic

### Future Enhancements

1. **Status-aware counting**: Only count pending/in-progress tasks
2. **Task archival**: Allow archiving completed tasks instead of deletion
3. **Soft task limit**: Warning at limit, hard stop at limit+1
4. **Analytics**: Track how often users hit their limit
5. **UI feedback**: Show "X of Y tasks" counter in UI
6. **Bulk operations**: Allow bulk delete/archive when at limit

### Related Issues

- **Issue #6**: User Profile Schema (maxTasks column)
- **Issue #8**: User Settings UI (allows changing maxTasks)
- **Issue #9**: User Settings Logic (updateUserProfile mutation)

### Dependencies

No new dependencies required. Using existing:
- `next` - API routes and server components
- `drizzle-orm` - Database ORM
- `@auth/core` - Authentication
- `jest` - Testing framework

### Testing Limitations

Next.js App Router API routes are difficult to test with Jest due to:
- NextRequest/NextResponse not available in jsdom environment
- Server-only modules can't be imported in test environment
- Mocking authentication context is complex

**Solutions**:
1. Rely on unit tests for business logic (createTask mutation)
2. Use manual testing for API endpoint verification
3. Consider adding E2E tests with Playwright/Cypress for full flow
4. Use integration tests with actual HTTP requests (supertest)

For this issue, unit tests + manual testing provide sufficient coverage since the core logic is well-tested at the mutation layer.
