# Feature: User Settings UI

## Metadata

issue_number: `8`
adw_id: `1771390598`
issue_json: `{"body":"**Goal:** Create the interface for user customization.\n\n**Context:** Provide a dedicated page for users to modify their profile and constraints.\n\n**Tasks:**\n- [ ] Create the /settings page.\n- [ ] Implement forms for Display Name and Max Concurrent Tasks.\n\n**Acceptance Criteria:**\n- The UI allows users to input their preferred settings.","number":8,"title":"Feat. 8: User Settings UI"}`

## Feature Description

Implement a functional user settings page that allows authenticated users to customize their profile by updating their display name and maximum concurrent tasks limit. The page will replace the current placeholder with an interactive form that validates input, updates the database, and provides user feedback.

This feature enables users to personalize their experience and adjust the task limit constraint to match their workflow preferences, enhancing the flexibility and user control of the application.

## User Story

As an **authenticated user**
I want to **update my display name and task limit from a settings page**
So that **I can personalize my profile and adjust the task constraint to fit my productivity style**

## Problem Statement

Currently, the application has several limitations regarding user customization:

1. **No Settings Interface**: The `/settings` page exists as a placeholder with no functional forms
2. **No Profile Update Capability**: Users cannot change their display name after it's set to email on first login
3. **Fixed Task Limits**: Users cannot adjust their task limit (maxTasks) despite the database supporting it
4. **No Backend API**: There's no API endpoint to handle user profile updates
5. **No Update Mutation**: The mutations file only has `upsertUser` for login, no function for updating user settings

While the database schema (from Issue #6) supports `displayName` and `maxTasks` fields with defaults, users have no way to customize these values after account creation. The settings page placeholder (from Issue #4) mentions "task limit configuration" as a future feature, but provides no implementation.

## Solution Statement

Create a complete user settings experience with frontend and backend components:

**Frontend (UI Components):**
- Replace the settings page placeholder with an interactive form
- Add input field for Display Name (text input with validation)
- Add input field for Max Concurrent Tasks (number input with min/max validation)
- Implement client-side form validation
- Display current values pre-populated in the form
- Show success/error feedback using toast notifications or inline messages
- Disable form submission while saving

**Backend (API & Database):**
- Create `/api/user` API route with PATCH method for profile updates
- Add `updateUserProfile` mutation function to update displayName and maxTasks
- Validate user authentication and ownership
- Validate input constraints (e.g., maxTasks >= 1, maxTasks <= 10)
- Return updated user profile after successful update

**Integration:**
- Fetch current user profile on page load
- Submit form data to API endpoint
- Update UI with new values after successful save
- Handle errors gracefully with user-friendly messages

This solution leverages existing infrastructure (Auth.js for authentication, Drizzle ORM for database) while adding minimal new complexity.

## Relevant Files

Use these files to implement the feature:

**Existing Files:**

- **`app/app/settings/page.tsx`** - Current placeholder settings page that needs to be replaced with functional forms. Shows authentication is already required via `requireAuth()`.

- **`app/lib/db/mutations.ts`** - Contains `upsertUser` for login flow. Need to add a new `updateUserProfile` function for updating displayName and maxTasks after account creation.

- **`app/lib/db/queries.ts`** - Contains `getUserProfile` function to fetch user data. Will be used to pre-populate form with current values.

- **`app/lib/auth.ts`** - Contains `requireAuth()` and `getCurrentUser()` functions for authentication. Will use `getCurrentUser()` to identify the user making updates.

- **`app/lib/db/schema.ts`** - Defines users table with displayName and maxTasks fields. No changes needed, but important context for understanding data structure.

- **`app/components/UserNav.tsx`** - Existing navigation component used in settings page. May need updates if we want to display updated displayName immediately.

- **`README.md`** - Project overview and tech stack information for understanding patterns.

### New Files

- **`app/app/api/user/route.ts`** - New API route to handle PATCH requests for updating user profile settings.

- **`app/components/SettingsForm.tsx`** - New client component containing the interactive form for display name and task limit inputs.

- **`tests/app/api/user/route.test.ts`** - Unit tests for the user profile update API endpoint.

- **`tests/components/SettingsForm.test.tsx`** - Unit tests for the SettingsForm component.

## Implementation Plan

### Phase 1: Foundation

Set up the backend infrastructure for profile updates:
- Add `updateUserProfile` mutation function to handle database updates with validation
- Create `/api/user` API route with PATCH method for profile updates
- Implement authentication checks and input validation
- Test API endpoint independently

### Phase 2: Core Implementation

Build the settings form UI:
- Create `SettingsForm` client component with controlled inputs
- Implement form state management and validation
- Add submit handler that calls the API
- Display loading states and error/success messages
- Pre-populate form with current user profile data

### Phase 3: Integration

Integrate the form into the settings page:
- Update `/settings` page to fetch user profile
- Replace placeholder with `SettingsForm` component
- Ensure proper server/client component boundary
- Test the complete flow end-to-end

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Add updateUserProfile Mutation Function

- Open `app/lib/db/mutations.ts`
- Add new function `updateUserProfile`:
  ```typescript
  export async function updateUserProfile(
    userId: string,
    data: { displayName?: string; maxTasks?: number }
  ): Promise<User | null> {
    // Validate maxTasks if provided (must be >= 1 and <= 10)
    if (data.maxTasks !== undefined && (data.maxTasks < 1 || data.maxTasks > 10)) {
      throw new Error('Max tasks must be between 1 and 10');
    }

    const results = await db
      .update(users)
      .set({
        ...(data.displayName !== undefined && { displayName: data.displayName }),
        ...(data.maxTasks !== undefined && { maxTasks: data.maxTasks }),
      })
      .where(eq(users.id, userId))
      .returning();

    return results[0] ?? null;
  }
  ```
- Validate input constraints
- Only update fields that are provided
- Return updated user profile or null if user not found

### 2. Create User Profile API Route

- Create `app/app/api/user/route.ts`
- Implement PATCH handler:
  - Use `getCurrentUser()` to get authenticated user
  - Return 401 if not authenticated
  - Parse request body (displayName, maxTasks)
  - Validate input (displayName max length, maxTasks range)
  - Call `updateUserProfile` mutation
  - Return updated user profile as JSON
  - Handle errors with appropriate status codes
- Export as Next.js App Router API route

### 3. Create SettingsForm Client Component

- Create `app/components/SettingsForm.tsx`
- Mark as client component: `'use client'`
- Accept props: `initialDisplayName`, `initialMaxTasks`, `userId`
- Implement controlled form with:
  - Display Name input (text, max length 50)
  - Max Tasks input (number, min 1, max 10)
  - Save button
  - Loading state during submission
  - Success message after save
  - Error message display
- Use `useState` for form state and submission status
- Implement form submission handler:
  - Prevent default
  - Set loading state
  - Call PATCH `/api/user` with form data
  - Handle response (success/error)
  - Update UI with feedback
- Add client-side validation
- Style with Tailwind CSS to match existing design

### 4. Update Settings Page to Use SettingsForm

- Open `app/app/settings/page.tsx`
- Import `getCurrentUser` and `getUserProfile`
- Fetch current user and profile data in server component
- Pass user profile data to SettingsForm
- Replace placeholder content with SettingsForm component
- Keep UserNav and page structure
- Handle case where user profile is null (shouldn't happen but defensive)

### 5. Write Unit Tests for updateUserProfile

- Create/update `tests/lib/db/mutations.test.ts`
- Add test cases for `updateUserProfile`:
  - Test updating displayName only
  - Test updating maxTasks only
  - Test updating both fields
  - Test validation error for maxTasks < 1
  - Test validation error for maxTasks > 10
  - Test null return when user not found
  - Test partial updates (only provided fields updated)
- Mock database connection and verify correct SQL queries

### 6. Write Unit Tests for API Route

- Create `tests/app/api/user/route.test.ts`
- Mock `getCurrentUser` from auth module
- Test PATCH handler:
  - Test successful profile update
  - Test 401 response when not authenticated
  - Test 400 response for invalid input
  - Test 404 response when user not found
  - Test validation error responses
  - Test JSON response format
- Verify mutation function called with correct parameters

### 7. Write Unit Tests for SettingsForm Component

- Create `tests/components/SettingsForm.test.tsx`
- Test rendering with initial values
- Test form input changes update state
- Test form submission calls API
- Test loading state during submission
- Test success message display
- Test error message display
- Test validation messages for invalid input
- Test form reset after successful save
- Mock fetch API for testing

### 8. Manual Testing

- Start development server: `npm run dev`
- Navigate to `/settings`
- Test display name update:
  - Change display name
  - Click Save
  - Verify success message
  - Refresh page, verify new name persists
- Test max tasks update:
  - Change max tasks value (try 5)
  - Click Save
  - Verify success message
  - Go to dashboard and try creating tasks up to new limit
- Test validation:
  - Try maxTasks = 0 (should show error)
  - Try maxTasks = 11 (should show error)
  - Try very long display name (should show error or truncate)
- Test error handling:
  - Disconnect network and try saving (should show error)

### 9. Run All Validation Commands

Execute all validation commands to ensure no regressions:
- `npm run lint` from `app/` directory
- `npx tsc --noEmit` from `app/` directory
- `npm test` from `app/` directory
- `npm run build` from `app/` directory

## Testing Strategy

### Unit Tests

**updateUserProfile Function:**
1. **Successful updates**: Verify displayName and maxTasks update correctly
2. **Partial updates**: Only provided fields should be updated
3. **Validation**: maxTasks must be 1-10
4. **Not found**: Returns null when user doesn't exist
5. **Type safety**: TypeScript types enforce correct parameters

**API Route (/api/user PATCH):**
1. **Authentication**: Requires authenticated user (401 if not)
2. **Authorization**: User can only update their own profile
3. **Input validation**: Rejects invalid displayName or maxTasks
4. **Success response**: Returns updated user profile with 200
5. **Error responses**: Proper status codes (400, 401, 404, 500)
6. **JSON format**: Response matches expected User type

**SettingsForm Component:**
1. **Rendering**: Displays form with initial values
2. **Input handling**: Form updates when inputs change
3. **Submission**: Calls API with correct data on submit
4. **Loading state**: Shows loading indicator during save
5. **Success feedback**: Displays success message after save
6. **Error feedback**: Displays error message on failure
7. **Validation**: Shows validation errors for invalid input

### Edge Cases

1. **Empty display name**: Should be allowed (revert to default)
2. **Display name with special characters**: Should handle Unicode, emojis
3. **Display name max length**: Enforce max length (50 chars)
4. **maxTasks boundary values**: Test 1 (min) and 10 (max)
5. **maxTasks non-integer**: Should reject decimals like 3.5
6. **Concurrent updates**: Multiple form submissions in quick succession
7. **Network errors**: Handle timeout, connection errors
8. **Database errors**: Handle database connection failures
9. **User deleted during update**: Handle case where user no longer exists
10. **Session expired**: Handle case where auth token expired during form interaction

## Acceptance Criteria

✅ **Settings Page Updated**: `/settings` page shows interactive form instead of placeholder

✅ **Display Name Form Field**:
- Input field pre-populated with current displayName
- Max length validation (50 characters)
- Allows Unicode characters and emojis
- Shows validation errors for invalid input

✅ **Max Tasks Form Field**:
- Number input pre-populated with current maxTasks
- Min value: 1, Max value: 10
- Shows validation errors for out-of-range values
- Only allows integers (no decimals)

✅ **Form Submission**:
- Save button triggers API call
- Loading indicator shown during submission
- Success message displayed after successful save
- Error message displayed on failure
- Form disabled during submission to prevent duplicate requests

✅ **Backend API**:
- `/api/user` PATCH endpoint created
- Requires authentication (401 if not authenticated)
- Validates input (400 for invalid data)
- Updates database successfully
- Returns updated user profile

✅ **Database Updates**:
- `updateUserProfile` mutation updates displayName and/or maxTasks
- Only updates fields that are provided
- Validates maxTasks range (1-10)
- Returns null if user not found

✅ **Persistence**:
- Updated settings persist across page reloads
- Updated maxTasks enforced in task creation
- Updated displayName reflected throughout app (if displayed anywhere)

✅ **Tests Pass**: All unit tests pass for mutations, API route, and component

✅ **No Regressions**: Linting, type checking, existing tests, and production build all succeed

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

```bash
# Navigate to app directory
cd app

# Validate code quality
npm run lint

# Validate TypeScript types
npx tsc --noEmit

# Validate tests pass (includes new tests for settings feature)
npm test

# Validate production build
npm run build

# Manual validation in development:
# 1. Start dev server: npm run dev
# 2. Navigate to http://localhost:3000/settings
# 3. Update display name and save - verify success
# 4. Update max tasks to 5 and save - verify success
# 5. Refresh page - verify values persist
# 6. Go to dashboard and create tasks up to new limit (5)
# 7. Try creating 6th task - should fail with new limit message
# 8. Return to settings and try invalid values:
#    - maxTasks = 0 (should show error)
#    - maxTasks = 11 (should show error)
#    - Very long display name (should show error or truncate)
```

## Notes

### Design Decisions

**Task Limit Range (1-10):**
The plan enforces maxTasks between 1 and 10. This prevents:
- Setting limit to 0 (which would make app unusable)
- Setting extremely high limits that defeat the purpose of "Pick Your Battles"
- Database/performance issues from users creating hundreds of tasks

This range can be adjusted if needed, but provides sensible boundaries.

**Display Name Validation:**
- Max length of 50 characters prevents database issues and UI layout problems
- Allows Unicode/emojis for international users and personalization
- Empty display name could revert to email (or be handled by frontend default)

**Partial Updates:**
The `updateUserProfile` function only updates fields that are provided in the data object. This allows:
- Updating just displayName without touching maxTasks
- Updating just maxTasks without touching displayName
- Frontend flexibility to submit only changed fields

**Client vs Server Components:**
- Settings page is a server component (async, fetches initial data)
- SettingsForm is a client component (uses React hooks, handles form state)
- Clear boundary: server fetches data, client handles interactivity

### Future Enhancements

This feature lays the groundwork for additional user preferences:

1. **Theme Preferences**: Add dark/light/auto mode selector
2. **Email Notifications**: Toggle for task reminders or weekly summaries
3. **Timezone**: Store user's timezone for proper date display
4. **Privacy Settings**: Control what data is shared or displayed
5. **Account Management**: Change password, delete account, export data
6. **Task Display Options**: Sort order, completed task visibility, etc.

The settings page structure can easily accommodate more form sections as these features are added.

### API Design

The `/api/user` endpoint uses PATCH (not PUT) because it performs partial updates. This is semantically correct and follows REST conventions:
- PATCH: Update specific fields
- PUT: Replace entire resource

Future endpoints could include:
- GET `/api/user`: Get current user profile (currently done server-side)
- DELETE `/api/user`: Delete user account
- POST `/api/user/avatar`: Upload profile picture

### Security Considerations

**Authentication:**
- All profile updates require authentication
- `getCurrentUser()` validates session
- Users can only update their own profile (userId from session, not request body)

**Input Validation:**
- Display name max length prevents buffer overflow attacks
- maxTasks range prevents resource exhaustion
- TypeScript types provide compile-time safety
- Runtime validation catches malicious input

**Rate Limiting:**
Consider adding rate limiting to the API endpoint in the future to prevent abuse (e.g., max 10 updates per minute per user).

### TypeScript Type Safety

The implementation leverages Drizzle ORM's automatic type inference:
- `User` type includes displayName and maxTasks
- `updateUserProfile` parameters are type-checked
- API response matches User type
- Component props are typed

This prevents many classes of bugs at compile time.

### Error Handling

**Frontend:**
- Form validation errors shown inline
- API errors shown with toast or alert
- Loading states prevent confusion
- User-friendly error messages

**Backend:**
- Validation errors: 400 Bad Request
- Authentication errors: 401 Unauthorized
- Not found errors: 404 Not Found
- Server errors: 500 Internal Server Error
- All errors include descriptive messages

### Testing Coverage

The testing strategy covers:
- **Unit level**: Individual functions work correctly
- **Integration level**: API routes work with mutations
- **Component level**: UI components render and interact correctly
- **Manual level**: End-to-end user flows work in browser

This multi-level approach ensures confidence in the implementation.

### Accessibility

Consider adding:
- Proper label associations with form inputs
- ARIA attributes for error messages
- Keyboard navigation support
- Focus management after save
- Screen reader announcements for success/error

These can be added during implementation to ensure the feature is accessible to all users.
