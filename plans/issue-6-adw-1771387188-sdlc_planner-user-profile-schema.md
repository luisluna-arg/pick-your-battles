# Feature: User Profile Schema

## Metadata

issue_number: `6`
adw_id: `1771387188`
issue_json: `{"body":"**Goal:** Define the user data structure.\n\n**Context:** We need to store user configs like display name and custom task limits.\n\n**Tasks:**\n- [ ] Create the Users table/schema.\n- [ ] Implement logic to default display_name to email and max_tasks to 3 on first login.\n\n**Acceptance Criteria:**\n- New users are provisioned with default settings in the DB upon sign-up.","number":6,"title":"Feat. 6: User Profile Schema"}`

## Feature Description

Extend the existing users schema to support user-specific configuration by adding `display_name` and `max_tasks` fields. These fields allow users to customize their display name (defaulting to their email) and set a personalized task limit (defaulting to 3 tasks).

This feature transforms the application from a one-size-fits-all task limit to a user-configurable system, laying the foundation for future user preferences and settings management.

## User Story

As a **user signing up for the first time**
I want **my profile to be automatically configured with sensible defaults**
So that **I can start using the application immediately without manual setup, while having the flexibility to customize my settings later**

## Problem Statement

Currently, the application has limitations in user configuration:

1. **No Display Name Field**: The `name` field from Auth.js is used directly, but there's no dedicated `display_name` field that defaults to email for users who don't provide a name
2. **Hardcoded Task Limit**: The task limit is hardcoded to 3 in `mutations.ts` (`DEFAULT_TASK_LIMIT = 3`), making it impossible to customize per user
3. **No User Preferences**: There's no infrastructure for storing user-specific configuration or preferences
4. **Inflexible Defaults**: New users cannot have different default settings based on their needs

The existing users table (created in Issue #3) has basic fields: `id`, `email`, `name`, `image`, `createdAt`. While functional, this doesn't support user-specific configuration or preferences.

## Solution Statement

Extend the users schema with two new fields:

1. **`display_name`** (text, nullable):
   - Defaults to user's email on first login if not provided
   - Can be customized later through user settings
   - Provides a fallback display value when `name` from Auth.js is null

2. **`max_tasks`** (integer, default: 3):
   - Stores the user's personal task limit
   - Defaults to 3 for new users (maintaining current behavior)
   - Can be customized per user in future settings UI
   - Replaces the hardcoded `DEFAULT_TASK_LIMIT` constant

Update the `upsertUser` function to:
- Set `display_name` to email if not provided during user creation
- Set `max_tasks` to 3 for new users
- Preserve existing values on subsequent logins (onConflictDoUpdate)

Update the `createTask` function to:
- Check the user's `max_tasks` value instead of the hardcoded constant
- Query the user's profile to get their specific task limit

This approach maintains backward compatibility while enabling future extensibility for user preferences.

## Relevant Files

Use these files to implement the feature:

**Existing Files:**

- **`app/lib/db/schema.ts`** - Contains the users and tasks table definitions. Need to add `display_name` and `max_tasks` fields to the users table.

- **`app/lib/db/mutations.ts`** - Contains `upsertUser` function that syncs users on login. Need to update to set default values for new users and modify `createTask` to use user's `max_tasks`.

- **`app/lib/db/queries.ts`** - Contains database query functions. May need to add a function to fetch user profile with task limit.

- **`app/auth.ts`** - Contains Auth.js configuration that calls `upsertUser` on sign-in. No changes needed but important context for understanding the user creation flow.

- **`app/drizzle.config.ts`** - Drizzle configuration for migrations. No changes needed but referenced for generating migrations.

- **`app/package.json`** - Contains `db:generate` and `db:migrate` scripts for schema migrations.

### New Files

None. All changes are modifications to existing files.

**Testing Files:**

- **`tests/lib/db/mutations.test.ts`** - Existing test file that needs updates to cover new default value logic in `upsertUser` and user-specific task limits in `createTask`.

## Implementation Plan

### Phase 1: Foundation

Update the database schema with new user configuration fields:
- Add `display_name` and `max_tasks` columns to users table
- Generate and run migration to update the database
- Update TypeScript types to reflect new schema

### Phase 2: Core Implementation

Implement default value logic for new users:
- Update `upsertUser` to set `display_name` (email fallback) and `max_tasks` (3) for new users
- Modify `createTask` to check user's `max_tasks` instead of hardcoded constant
- Add query function to fetch user profile with task limit

### Phase 3: Integration

Ensure the changes integrate seamlessly:
- Verify existing users are not affected (no breaking changes)
- Test the complete flow: sign-up → defaults set → task limit enforced
- Update tests to cover new behavior

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Database Schema

- Open `app/lib/db/schema.ts`
- Add `display_name` field to users table:
  - Type: `text('display_name')`
  - Nullable (use `.default()` with SQL expression or set in application logic)
- Add `max_tasks` field to users table:
  - Type: `integer('max_tasks').notNull().default(3)`
  - Default value: 3 (maintains current behavior)
- Verify TypeScript types (`User` and `InsertUser`) automatically include new fields

### 2. Generate Database Migration

- Run migration generation command:
  ```bash
  cd app && npm run db:generate
  ```
- Verify the generated SQL migration in `app/lib/db/migrations/`
- Review the migration SQL to ensure:
  - `display_name` column added as nullable text
  - `max_tasks` column added as integer with default 3
  - Migration is safe to run on existing data

### 3. Update upsertUser Function

- Open `app/lib/db/mutations.ts`
- Modify `upsertUser` function:
  - For INSERT (new users):
    - Set `display_name` to `data.email` if `display_name` not provided
    - Set `max_tasks` to `3` if `max_tasks` not provided
  - For UPDATE (existing users):
    - Only update `email`, `name`, `image` (preserve `display_name` and `max_tasks`)
- Implementation approach:
  ```typescript
  export async function upsertUser(data: InsertUser): Promise<User> {
    const results = await db
      .insert(users)
      .values({
        ...data,
        display_name: data.display_name || data.email, // Default to email
        max_tasks: data.max_tasks ?? 3, // Default to 3
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: data.email,
          name: data.name,
          image: data.image,
          // Do NOT update display_name and max_tasks on conflict
        },
      })
      .returning();

    return results[0];
  }
  ```

### 4. Add Query Function for User Profile

- Open `app/lib/db/queries.ts`
- Add new function `getUserProfile` (or similar):
  ```typescript
  export async function getUserProfile(userId: string): Promise<User | null> {
    const results = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return results[0] ?? null;
  }
  ```
- This function retrieves the full user profile including `max_tasks`

### 5. Update createTask to Use User's max_tasks

- Open `app/lib/db/mutations.ts`
- Modify `createTask` function:
  - Remove the hardcoded `DEFAULT_TASK_LIMIT` constant (or keep for backward compatibility documentation)
  - Fetch user's `max_tasks` from database
  - Use user's `max_tasks` value for limit check
- Implementation approach:
  ```typescript
  export async function createTask(
    userId: string,
    data: Omit<InsertTask, 'userId'>
  ): Promise<Task> {
    // Fetch user profile to get task limit
    const user = await getUserProfile(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check user's personal task limit
    const currentCount = await getTaskCount(userId);
    if (currentCount >= user.max_tasks) {
      throw new Error(
        `Task limit reached. You can only have ${user.max_tasks} tasks at a time.`
      );
    }

    // Create task
    const results = await db
      .insert(tasks)
      .values({
        ...data,
        userId,
      })
      .returning();

    return results[0];
  }
  ```

### 6. Write Unit Tests for New Schema Fields

- Open `tests/lib/db/mutations.test.ts`
- Add test cases for `upsertUser` default values:
  - Test: new user without display_name defaults to email
  - Test: new user without max_tasks defaults to 3
  - Test: new user with display_name preserves provided value
  - Test: new user with max_tasks preserves provided value
  - Test: existing user update preserves display_name and max_tasks
- Add test cases for `createTask` with user-specific limits:
  - Test: user with max_tasks=3 can create up to 3 tasks
  - Test: user with max_tasks=5 can create up to 5 tasks (simulating future customization)
  - Test: task creation fails when user's max_tasks limit is reached
  - Test: error message includes user's specific max_tasks value

### 7. Run Database Migration

- Run migration command:
  ```bash
  cd app && npm run db:migrate
  ```
- Verify migration completes successfully
- Check that:
  - `display_name` column added to users table
  - `max_tasks` column added with default value 3
  - Existing users have max_tasks=3 (from default)

### 8. Manual Testing

- Start development server: `npm run dev`
- Test new user flow:
  - Sign out if logged in
  - Sign in with a new Google account (or use test account)
  - Verify user created in database with:
    - `display_name` set to email
    - `max_tasks` set to 3
- Test existing user flow:
  - Sign in with an existing account
  - Verify `display_name` and `max_tasks` preserved from previous login
- Test task limit enforcement:
  - Create tasks up to user's max_tasks limit
  - Verify error message when limit reached includes correct max_tasks value

### 9. Run All Validation Commands

Execute all validation commands to ensure no regressions:
- `npm run lint` from `app/` directory
- `npx tsc --noEmit` from `app/` directory
- `npm test` from `app/` directory (should run from root via package.json script)
- `npm run build` from `app/` directory

## Testing Strategy

### Unit Tests

**upsertUser Function Tests:**
1. **New user with minimal data**: Verify `display_name` defaults to email and `max_tasks` defaults to 3
2. **New user with display_name provided**: Verify provided value is used
3. **New user with max_tasks provided**: Verify provided value is used
4. **Existing user update**: Verify `display_name` and `max_tasks` are NOT overwritten on subsequent logins
5. **User with null name from Auth.js**: Verify `display_name` still defaults to email

**createTask Function Tests:**
1. **Task creation within limit**: User with max_tasks=3, creating first task succeeds
2. **Task creation at limit**: User with max_tasks=3, already has 3 tasks, creation fails
3. **Custom task limit**: User with max_tasks=5, can create up to 5 tasks (future-proofing)
4. **Error message accuracy**: Error message includes user's specific max_tasks value

**getUserProfile Function Tests:**
1. **Existing user**: Returns user with all fields including display_name and max_tasks
2. **Non-existent user**: Returns null
3. **Type safety**: Returned type matches User schema

### Edge Cases

1. **User with no email (shouldn't happen with Google OAuth)**: Ensure graceful handling
2. **User updates display_name to empty string**: Should preserve empty string, not revert to email
3. **max_tasks set to 0**: Should prevent any task creation (edge case for future admin use)
4. **max_tasks set to negative value**: Should be validated (or use database constraint)
5. **Concurrent task creation at limit**: Race condition where two tasks created simultaneously when at limit-1
6. **Database migration on existing data**: All existing users get max_tasks=3 default
7. **User profile query fails during createTask**: Proper error handling

## Acceptance Criteria

✅ **Schema Updated**: Users table includes `display_name` (text, nullable) and `max_tasks` (integer, default 3) fields

✅ **Migration Generated and Applied**: Database migration successfully adds new columns to users table

✅ **Default Values for New Users**:
- `display_name` defaults to user's email if not provided
- `max_tasks` defaults to 3 if not provided
- Auth.js sign-in callback creates users with correct defaults

✅ **Existing Users Preserved**:
- Existing users retain their display_name and max_tasks on subsequent logins
- No breaking changes for existing user data

✅ **Task Limit Per User**:
- `createTask` uses user's `max_tasks` value instead of hardcoded constant
- Error message reflects user's specific task limit

✅ **Type Safety**: TypeScript types updated automatically to include new fields

✅ **Tests Pass**: All unit tests pass including new tests for default values and user-specific limits

✅ **No Regressions**: Linting, type checking, existing tests, and production build all succeed

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

```bash
# Navigate to app directory
cd app

# Generate migration (manual step, confirm migration looks correct)
npm run db:generate

# Run migration (manual step, confirm migration succeeds)
npm run db:migrate

# Validate code quality
npm run lint

# Validate TypeScript types
npx tsc --noEmit

# Validate tests pass
npm test

# Validate production build
npm run build

# Manual validation in development:
# 1. Start dev server: npm run dev
# 2. Sign in with a test account
# 3. Check database to confirm display_name and max_tasks set correctly
# 4. Create tasks up to limit and verify enforcement
```

## Notes

### Database Migration Considerations

This feature requires a database migration to add new columns. Important considerations:

1. **Existing Users**: The migration will add `max_tasks` column with default value 3 to all existing users, maintaining current behavior
2. **display_name Nullable**: The `display_name` field is nullable to handle cases where it hasn't been set, though the application logic ensures it's set on first login
3. **Idempotency**: Drizzle migrations are idempotent, so running the migration multiple times is safe

### Future Extensibility

This feature lays the groundwork for future user preferences:

1. **Settings UI**: Add a `/settings` page (already exists as placeholder) where users can:
   - Change their display_name
   - Request increased task limits (with admin approval)
   - Configure other preferences (theme, notifications, etc.)

2. **Additional User Fields**: Easy to extend with more fields:
   - `email_notifications` (boolean)
   - `theme_preference` (text: 'light' | 'dark' | 'auto')
   - `timezone` (text)

3. **Admin Controls**: Future admin panel could:
   - Adjust user task limits
   - View user profiles
   - Generate usage reports

### Default Value Strategy

The implementation uses two strategies for defaults:

1. **Database-level default**: `max_tasks` uses `.default(3)` in schema, ensuring the column always has a value
2. **Application-level default**: `display_name` defaults to email in `upsertUser` logic, providing more flexibility

This dual approach balances database integrity with application logic flexibility.

### Task Limit Flexibility

While the default remains 3 tasks, the infrastructure now supports:
- Different limits for different users (e.g., premium users could have higher limits)
- Administrative overrides for specific users
- A/B testing different default limits for new user cohorts

### TypeScript Type Safety

Drizzle ORM automatically generates TypeScript types from the schema:
- `User` type includes `display_name: string | null` and `max_tasks: number`
- `InsertUser` type includes optional `display_name` and `max_tasks` fields
- No manual type updates needed

### Backward Compatibility

The changes maintain full backward compatibility:
- Existing users automatically get `max_tasks=3` (same as before)
- Existing code that doesn't reference new fields continues to work
- The task limit behavior remains unchanged for all existing users
