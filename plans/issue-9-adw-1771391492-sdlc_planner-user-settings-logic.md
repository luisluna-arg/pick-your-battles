# Feature: User Settings Logic

## Metadata

- **issue_number**: `9`
- **adw_id**: `1771391492`
- **issue_json**:
```json
{
  "title": "Feat. 9: User Settings Logic",
  "number": 9,
  "body": "**Goal:** Persist user preferences.\n\n**Context:** Update the database with values from the settings UI.\n\n**Tasks:**\n- [ ] Create the API endpoint to update user preferences.\n- [ ] Implement server-side validation for inputs.\n\n**Acceptance Criteria:**\n- User changes are successfully saved and applied to their session."
}
```

## Context

**IMPORTANT**: The core functionality for this issue was already implemented in Issue #8 (PR #27). This plan focuses on verification, additional testing, and ensuring completeness of the user settings logic implementation.

## Feature Description

Implement the backend logic to persist user preferences (display name and max tasks) to the database with comprehensive server-side validation. The feature ensures user changes from the settings UI are saved securely, validated properly, and reflected immediately in their session.

## User Story

As a **logged-in user**
I want to **update my profile settings (display name and max concurrent tasks)**
So that **my preferences are saved permanently and applied to my experience immediately**

## Problem Statement

Users need a reliable, secure backend system to persist their profile customizations. The system must:
- Validate all inputs server-side to prevent invalid data
- Authenticate users before allowing updates
- Handle errors gracefully with clear messages
- Ensure changes are immediately reflected in the user's session
- Protect against common security vulnerabilities (XSS, injection, etc.)

## Solution Statement

Create a RESTful API endpoint (`/api/user`) that accepts PATCH requests with user preference updates. Implement comprehensive server-side validation for display name (string type, max 50 characters) and max tasks (integer, range 1-10). Use the existing `updateUserProfile` mutation to persist changes to the Neon PostgreSQL database. Return updated user data upon success to allow immediate UI updates without requiring a page refresh.

## Relevant Files

### Existing Files (Already Implemented in Issue #8)

- **app/app/api/user/route.ts** - PATCH endpoint for updating user preferences
  - Already implements authentication check with `getCurrentUser()`
  - Already validates displayName (string type, max 50 chars)
  - Already validates maxTasks (integer type, range 1-10)
  - Already calls `updateUserProfile` mutation
  - Already handles errors with appropriate status codes

- **app/lib/db/mutations.ts** - Database mutations including `updateUserProfile`
  - Already implements `updateUserProfile(userId, { displayName?, maxTasks? })`
  - Already validates maxTasks range (1-10) at mutation level
  - Already updates only provided fields (partial update)
  - Already returns updated user or null if not found

- **app/lib/db/schema.ts** - Database schema with users table
  - Already includes displayName (text, nullable) column
  - Already includes maxTasks (integer, default 3) column

- **app/lib/auth.ts** - Authentication utilities
  - Already provides `getCurrentUser()` for session verification

- **tests/lib/db/mutations.test.ts** - Unit tests for mutations
  - Already includes 6 tests for `updateUserProfile`:
    - Update displayName only
    - Update maxTasks only
    - Update both fields
    - Validate maxTasks < 1 (error)
    - Validate maxTasks > 10 (error)
    - Handle user not found (returns null)

### Files to Enhance

- **tests/app/api/user/route.test.ts** (NEW) - API endpoint tests
  - Add integration tests for the /api/user PATCH endpoint
  - Test authentication requirements
  - Test input validation at API level
  - Test error responses
  - Note: Previous attempt removed due to Jest environment issues with Next.js Request/Response objects

### New Files

- **tests/integration/user-settings.test.ts** (OPTIONAL) - Integration tests
  - End-to-end tests that verify the full flow from API to database
  - Test that session updates are reflected immediately

## Implementation Plan

### Phase 1: Verification

Verify that the existing implementation (from Issue #8) fully satisfies Issue #9 requirements:
1. API endpoint exists and works correctly
2. Server-side validation is comprehensive
3. Database persistence works reliably
4. Authentication is enforced
5. Session updates are immediate

### Phase 2: Additional Testing

Add missing API-level tests to ensure robustness:
1. Create integration tests for the /api/user endpoint (if Jest environment allows)
2. Test edge cases not covered by unit tests
3. Test concurrent update scenarios
4. Verify session behavior after updates

### Phase 3: Documentation and Validation

Document the complete user settings logic flow and validate with zero regressions:
1. Document API contract (request/response format)
2. Run full test suite
3. Verify production build
4. Manual testing of settings update flow

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Verify Existing Implementation

- Read and review `app/app/api/user/route.ts` to confirm all validation logic is present
- Read and review `app/lib/db/mutations.ts` to confirm `updateUserProfile` works correctly
- Read existing tests in `tests/lib/db/mutations.test.ts` to understand coverage
- Verify that displayName validation includes:
  - Type checking (must be string)
  - Length checking (max 50 characters)
  - Handles undefined/null correctly
- Verify that maxTasks validation includes:
  - Type checking (must be integer)
  - Range checking (1-10 inclusive)
  - Handles undefined correctly

### 2. Identify Gaps

- Check if API endpoint tests exist (likely missing from Issue #8)
- Identify any edge cases not covered by existing tests:
  - Empty string for displayName
  - Negative numbers for maxTasks
  - Non-integer numbers (e.g., 3.5) for maxTasks
  - Very long strings (XSS attempts) for displayName
  - Special characters in displayName
  - Concurrent updates by same user
  - Unauthenticated requests

### 3. Add API Endpoint Tests (if feasible)

**Note**: Issue #8 attempted to create API route tests but encountered Jest environment issues with Next.js Request/Response objects. If these issues can be resolved, proceed with this step. Otherwise, skip to Step 4.

- Create `tests/app/api/user/route.test.ts`
- Mock `getCurrentUser` from auth module
- Mock `updateUserProfile` from mutations module
- Test cases:
  - ✅ Successful update of displayName
  - ✅ Successful update of maxTasks
  - ✅ Successful update of both fields
  - ✅ 401 error when unauthenticated
  - ✅ 400 error for invalid displayName (not string, too long)
  - ✅ 400 error for invalid maxTasks (not integer, out of range)
  - ✅ 404 error when user not found
  - ✅ 500 error for unexpected failures

If Jest environment issues persist, document why API tests are skipped and rely on unit tests + manual testing.

### 4. Test Edge Cases in Mutations

- Update `tests/lib/db/mutations.test.ts` if any edge cases are missing
- Add tests for:
  - Empty string for displayName (should be allowed)
  - Null or undefined handling
  - Boundary values (maxTasks = 1, maxTasks = 10)

### 5. Manual Testing

- Start the development server (`npm run dev` from app directory)
- Log in as a test user
- Navigate to `/settings`
- Test updating display name:
  - Change to valid value → should save successfully
  - Try empty string → should save (clear display name)
  - Try very long string (>50 chars) → should show error
- Test updating max tasks:
  - Change to valid value (e.g., 5) → should save successfully
  - Try value < 1 → should show error
  - Try value > 10 → should show error
  - Try non-integer → should show error
- Verify changes persist after page refresh
- Verify changes are reflected immediately in UI

### 6. Verify Session Updates

- After updating settings, verify the user session reflects new values
- Check that `getCurrentUser()` returns updated displayName and maxTasks
- Verify that task limit enforcement uses the updated maxTasks value immediately

### 7. Security Review

- Review `/api/user` endpoint for security vulnerabilities:
  - ✅ Authentication required (getCurrentUser check)
  - ✅ Input validation (type and range checks)
  - ✅ SQL injection prevention (using Drizzle ORM parameterized queries)
  - ✅ XSS prevention (no direct HTML rendering of user input)
  - ✅ Authorization (users can only update their own profile)
  - ✅ Rate limiting (consider adding if needed)
  - ✅ CSRF protection (Next.js API routes have built-in protection)

### 8. Documentation

- Document the API contract in code comments or README:
  - Endpoint: `PATCH /api/user`
  - Request body: `{ displayName?: string, maxTasks?: number }`
  - Response: `{ id, email, name, image, displayName, maxTasks, createdAt }`
  - Error responses: `{ error: string }` with appropriate status codes
- Update any API documentation files if they exist

### 9. Run All Validation Commands

- Execute all validation commands to ensure zero regressions
- From app directory:
  - `npm run lint` - ESLint check
  - `npx tsc --noEmit` - TypeScript type check
  - `npm test` - Run test suite (all tests must pass)
  - `npm run build` - Production build (must succeed)

## Testing Strategy

### Unit Tests

**Mutation Layer** (already implemented in Issue #8):
- `updateUserProfile` with displayName only
- `updateUserProfile` with maxTasks only
- `updateUserProfile` with both fields
- Validation error for maxTasks < 1
- Validation error for maxTasks > 10
- Returns null when user not found

**API Layer** (to be added if feasible):
- Successful updates (various scenarios)
- Authentication errors (401)
- Validation errors (400)
- Not found errors (404)
- Server errors (500)

### Integration Tests

**Full Flow** (optional):
- User authenticates → updates settings → changes persist → session reflects updates
- User updates maxTasks → task limit enforcement uses new value

### Manual Tests

**Settings UI Flow**:
1. Navigate to /settings when logged in
2. Update display name with valid value → success message
3. Update max tasks with valid value → success message
4. Try invalid inputs → error messages shown
5. Refresh page → changes persist
6. Check dashboard → new task limit enforced

### Edge Cases

- Empty string for displayName (allowed)
- Null/undefined values (should not update those fields)
- Boundary values (maxTasks = 1, maxTasks = 10)
- Out of range values (maxTasks = 0, maxTasks = 11)
- Invalid types (displayName = 123, maxTasks = "5")
- Very long strings (displayName with 100+ characters)
- Special characters in displayName (emoji, HTML tags, scripts)
- Concurrent updates by same user (last write wins)
- Unauthenticated requests (should reject with 401)

## Acceptance Criteria

✅ API endpoint `/api/user` exists and accepts PATCH requests
✅ Endpoint requires authentication (returns 401 if not authenticated)
✅ Server-side validation rejects invalid displayName (not string, >50 chars)
✅ Server-side validation rejects invalid maxTasks (not integer, <1, >10)
✅ Valid updates are persisted to the database
✅ Endpoint returns updated user data on success
✅ Endpoint returns appropriate error messages and status codes on failure
✅ Unit tests cover all validation scenarios and edge cases
✅ Changes are immediately reflected in user session (no page refresh needed)
✅ Task limit enforcement uses updated maxTasks value immediately
✅ All validation commands pass with zero errors
✅ Manual testing confirms settings updates work as expected

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
2. Login and navigate to `/settings`
3. Update display name with valid value → verify success
4. Update max tasks with valid value → verify success
5. Try invalid inputs → verify error messages
6. Refresh page → verify changes persist
7. Return to dashboard → verify task limit reflects new maxTasks

## Notes

### Implementation Status

**✅ Already Implemented in Issue #8 (PR #27):**
- `/api/user` PATCH endpoint with full authentication and validation
- `updateUserProfile` mutation with maxTasks range validation
- Comprehensive unit tests for mutation layer (6 tests)
- Settings UI integration

**⚠️ Missing/Optional:**
- API endpoint integration tests (removed from Issue #8 due to Jest environment issues)
- Explicit session verification tests
- Rate limiting (may not be needed for MVP)

### Future Enhancements

1. **Rate Limiting**: Add rate limiting to prevent abuse (e.g., max 10 updates per minute)
2. **Audit Log**: Track settings changes for debugging and user history
3. **Email Notifications**: Notify users when critical settings change
4. **Additional Validations**:
   - Profanity filter for displayName
   - Reserved words check for displayName
   - Internationalization support (unicode characters in displayName)
5. **Optimistic Updates**: Update UI immediately before server confirmation (current implementation waits for response)
6. **Undo Functionality**: Allow users to revert settings changes

### Known Issues

**Jest Environment with Next.js API Routes**:
API route tests were attempted in Issue #8 but removed due to `ReferenceError: Request is not defined` errors. Next.js server components and API routes use server-only APIs that don't work well in Jest's jsdom environment. Solutions:
- Use Next.js's own testing utilities for API routes
- Use integration tests with actual HTTP requests (supertest)
- Rely on unit tests for business logic + manual testing for API layer
- Consider using Playwright or Cypress for E2E tests

### Dependencies

No new dependencies required. Using existing:
- `next` - API routes and server components
- `drizzle-orm` - Database ORM
- `@auth/core` - Authentication
- `jest` - Testing framework
- `@testing-library/react` - Component testing

### Session Behavior

Auth.js (NextAuth v5) sessions are managed via JWT tokens stored in cookies. When `updateUserProfile` updates the database, the session is NOT automatically updated. To reflect changes:
1. **Current approach (Issue #8)**: API returns updated user data, SettingsForm updates local state
2. **For immediate global effect**: May need to force session refresh or update session data server-side
3. **Session reads from database**: Each request calls `getCurrentUser()` which reads from DB, so server-side components will see updated values immediately

### Related Issues

- **Issue #8**: User Settings UI (already implemented, includes the backend logic)
- **Issue #6**: User Profile Schema (already implemented, includes displayName and maxTasks columns)
- **Issue #3**: Database Connection (already implemented, Neon PostgreSQL with Drizzle ORM)

This issue (Issue #9) is essentially verification and documentation that the backend logic from Issue #8 is complete and correct.
