# Chore: Remove Display Name from settings and schema

## Metadata

issue_number: `41`
adw_id: `1771411014`
issue_json: `{"body":"**Goal:** Eliminate the redundant display_name field across the application since the Google Auth widget already handles user identity display effectively.\n\n**Context:**\nThe current implementation of a custom display name is unnecessary and adds maintenance overhead. Since the Google profile information is sufficient for the UI, we should simplify the data model and settings interface.\n\n**Tasks:**\n\n- [ ] Remove the display_name field from the User settings UI.\n- [ ] Delete the display_name column from the database schema.\n- [ ] Update the user initialization logic to stop defaulting the email to the display name field.\n- [ ] Remove any references to display_name in the application's internal types or interfaces.\n\nAcceptance Criteria:\n\n- The settings page no longer shows the display name input.\n- The database schema is cleaned of the unused column.\n- The application continues to display user identity correctly using Google's native session data.","number":41,"title":"Chore: Remove Display Name from settings and schema"}`

## Chore Description

The `display_name` / `displayName` field exists throughout the app — in the database schema, Drizzle TypeScript types, DB mutation functions, the `/api/user` PATCH route, the `SettingsForm` component, and the `SettingsPage`. Since Google Auth already provides `name` (from the user's Google profile) for identity display, this custom field is redundant and adds unnecessary maintenance burden. The chore removes it completely: from the UI, the API, the TypeScript types, and the database (via a Drizzle migration).

## Relevant Files

Use these files to resolve the chore:

- **`app/lib/db/schema.ts`** — Contains the `users` table definition with the `displayName` column; must be removed so the derived `User` and `InsertUser` TypeScript types no longer include it.
- **`app/lib/db/mutations.ts`** — `upsertUser` defaults `displayName` to `email`; `updateUserProfile` accepts and writes `displayName`. Both must be updated.
- **`app/app/api/user/route.ts`** — PATCH handler reads, validates, and passes `displayName` to `updateUserProfile`. Must be stripped.
- **`app/components/SettingsForm.tsx`** — Renders the Display Name input field and sends `displayName` in the PATCH request body. Must remove the field and the prop.
- **`app/app/settings/page.tsx`** — Passes `initialDisplayName={profile.displayName}` to `SettingsForm`. Must be removed.
- **`app/lib/db/migrations/0000_stiff_silver_fox.sql`** — The existing migration that created `display_name`; no changes needed, but context for the new migration.
- **`app/lib/db/migrations/meta/_journal.json`** — Drizzle migration journal; must be updated to register the new migration entry.
- **`app/lib/db/migrations/meta/0000_snapshot.json`** — Drizzle schema snapshot for the previous migration; used as the base for generating the new snapshot (no changes needed to this file; the new migration will have its own snapshot).
- **`tests/lib/db/mutations.test.ts`** — Contains many tests that include `displayName` in mock user objects and test `displayName`-specific behavior in `upsertUser` and `updateUserProfile`. Must be updated.
- **`tests/app/api/user/route.test.ts`** — `mockUser` includes `displayName`. Must be removed.

### New Files

- **`app/lib/db/migrations/0001_remove_display_name.sql`** — New Drizzle migration SQL that drops the `display_name` column from the `users` table.
- **`app/lib/db/migrations/meta/0001_snapshot.json`** — Drizzle meta snapshot reflecting the updated schema without `display_name`.

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Update the Drizzle schema

In **`app/lib/db/schema.ts`**, remove the `displayName` field from the `users` table:

- Remove line: `displayName: text('display_name'),`
- The `User` and `InsertUser` types are derived via `$inferSelect` / `$inferInsert`, so they will automatically no longer include `displayName` after this change.

### Step 2: Create the Drizzle migration SQL

Create **`app/lib/db/migrations/0001_remove_display_name.sql`** with:

```sql
ALTER TABLE "users" DROP COLUMN "display_name";
```

### Step 3: Update the Drizzle migration journal

In **`app/lib/db/migrations/meta/_journal.json`**, add a new entry to the `entries` array:

```json
{
  "idx": 1,
  "version": "7",
  "when": 1771411014000,
  "tag": "0001_remove_display_name",
  "breakpoints": true
}
```

### Step 4: Create the Drizzle meta snapshot for the new migration

Create **`app/lib/db/migrations/meta/0001_snapshot.json`** — a copy of `0000_snapshot.json` but with the `display_name` column removed from the `public.users` table columns, and with a new `id` UUID. The snapshot should be identical to `0000_snapshot.json` except:
- Change `"id"` to a new UUID (e.g. `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"`)
- Change `"prevId"` to `"8b5c4586-29c8-4ec0-935f-fb604c776124"` (the ID from `0000_snapshot.json`)
- Remove the `"display_name"` entry from `tables["public.users"]["columns"]`

### Step 5: Update `upsertUser` in mutations.ts

In **`app/lib/db/mutations.ts`**, in the `upsertUser` function:

- Remove `displayName: data.displayName || data.email,` from the `.values({...})` call
  - After removal, the values object spreads `data` (which has `id, email, name, image`) and sets `maxTasks: data.maxTasks ?? 3`

### Step 6: Update `updateUserProfile` in mutations.ts

In **`app/lib/db/mutations.ts`**, in the `updateUserProfile` function:

- Change the `data` parameter type from `{ displayName?: string; maxTasks?: number }` to `{ maxTasks?: number }`
- Remove the `if (data.displayName !== undefined) { updateData.displayName = data.displayName; }` block
- Remove the `if (data.displayName !== undefined)` handling — only `maxTasks` remains

### Step 7: Update the `/api/user` PATCH route

In **`app/app/api/user/route.ts`**:

- Remove `displayName` from the destructured body: change `const { displayName, maxTasks } = body;` → `const { maxTasks } = body;`
- Remove the entire `displayName` validation block (the `if (displayName !== undefined) { ... }` block)
- Remove `displayName` from the call to `updateUserProfile`: change `updateUserProfile(user.id!, { displayName, maxTasks })` → `updateUserProfile(user.id!, { maxTasks })`
- Update the JSDoc comment to remove the `displayName` field from the documented request body

### Step 8: Update `SettingsForm` component

In **`app/components/SettingsForm.tsx`**:

- Remove `initialDisplayName: string | null;` from `SettingsFormProps`
- Remove `initialDisplayName` from the function parameter destructuring
- Remove `const [displayName, setDisplayName] = useState(initialDisplayName || '');` state declaration
- Remove `displayName: displayName.trim() || null,` from the `JSON.stringify` body in `handleSubmit`
- Remove the entire Display Name form field block (the `<div>` containing the label, input, and helper `<p>` for Display Name)

### Step 9: Update the Settings page

In **`app/app/settings/page.tsx`**:

- Remove `initialDisplayName={profile.displayName}` from the `<SettingsForm>` props

### Step 10: Update `tests/lib/db/mutations.test.ts`

This file has many `displayName` references spread across `upsertUser` and `updateUserProfile` describe blocks:

**In the `upsertUser` describe block:**
- Test `'creates user with displayName defaulting to email'`:
  - Rename to `'creates user with default maxTasks of 3'`
  - Remove `displayName: 'test@example.com'` from `mockUser`
  - Change the `expect(mockValues).toHaveBeenCalledWith(expect.objectContaining({...}))` assertion: remove `displayName: 'test@example.com'` expectation
- Test `'preserves provided displayName and maxTasks'`:
  - Rename to `'preserves provided maxTasks'`
  - Remove `displayName: 'Custom Name'` from `mockUser`
  - Remove `displayName: 'Custom Name'` from the upsertUser call args
  - Remove `displayName: 'Custom Name'` from the `objectContaining` assertion
- Test `'does not update displayName and maxTasks on conflict'`:
  - Rename to `'does not update maxTasks on conflict'`
  - Remove `displayName: 'Original Display Name'` from `mockUser`
  - Change the `expect.not.objectContaining` assertion: remove `displayName: expect.anything()` (keep only the check that `maxTasks` is not in the conflict set)

**Remove all `displayName` fields from every `mockUser` object** in the `createTask`, `updateTask`, `deleteTask`, and `updateUserProfile` describe blocks.

**In the `updateUserProfile` describe block:**
- Remove test `'updates displayName only'` entirely (it tests behavior that no longer exists)
- Update test `'updates maxTasks only'`: remove `displayName` from `mockUser`
- Remove test `'updates both displayName and maxTasks'` entirely (it tests displayName)
- Update test `'throws error when maxTasks is less than 1'`: no mockUser to change, keep as-is
- Update test `'throws error when maxTasks is greater than 10'`: no mockUser to change, keep as-is
- Update test `'returns null when user not found'`: remove displayName from call args — change `updateUserProfile('nonexistent-user', { displayName: 'Test' })` to `updateUserProfile('nonexistent-user', { maxTasks: 5 })`
- Remove test `'allows empty string for displayName'` entirely
- Update tests `'accepts boundary value maxTasks = 1'` and `'accepts boundary value maxTasks = 10'`: remove `displayName` from `mockUser`

### Step 11: Update `tests/app/api/user/route.test.ts`

In **`tests/app/api/user/route.test.ts`**:

- Remove `displayName: 'Test',` from the `mockUser` constant

### Step 12: Run Validation Commands

Run the full validation suite (see Validation Commands section below) to confirm zero regressions.

## Validation Commands

Execute every command to validate the chore is complete with zero regressions.

```bash
# Verify displayName is fully removed from all app source files
grep -rn "displayName\|display_name" app/lib/db/schema.ts
# Expected: no output

grep -rn "displayName" app/components/SettingsForm.tsx app/app/settings/page.tsx app/app/api/user/route.ts app/lib/db/mutations.ts
# Expected: no output

# TypeScript type check (from app/ directory)
npx tsc --noEmit

# Run full test suite (from repo root)
npx jest --no-coverage

# Production build (from app/ directory)
npm run build
```

- `npx tsc --noEmit` — TypeScript type check — must pass with zero errors
- `npx jest --no-coverage` — Full test suite from repo root — all tests must pass
- `npm run build` (from `app/`) — Production build — must compile successfully

## Notes

- **Database migration**: The new migration file (`0001_remove_display_name.sql`) drops the `display_name` column. The GitHub Actions migrate workflow (`.github/workflows/migrate.yml`) applies pending Drizzle migrations against the Neon database when merged to main. No manual `drizzle-kit migrate` is required in CI.
- **Existing data**: Any `display_name` values already stored in the production database will be discarded when the migration runs — this is intentional per the issue.
- **No data migration needed**: The `name` field on the `users` table already stores the Google account name from Auth.js, which is the preferred identity source going forward.
- **`InsertUser` type**: After removing `displayName` from the schema, TypeScript will enforce that `displayName` cannot be passed to `upsertUser`. The `auth.ts` signIn callback already doesn't pass it, so no changes are needed there.
- **Drizzle meta snapshot**: The `0001_snapshot.json` must be a valid JSON snapshot or `drizzle-kit` will complain. Create it as a stripped-down copy of `0000_snapshot.json` with the `display_name` column removed.
