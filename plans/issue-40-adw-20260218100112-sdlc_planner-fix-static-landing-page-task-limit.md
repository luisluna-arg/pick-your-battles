# Bug: Static landing page text misrepresents dynamic task limit

## Metadata

issue_number: `40`
adw_id: `20260218100112`
issue_json: `{"body":"**Goal:** Update the landing page content to reflect that the task limit is customizable, moving away from the \"fixed 3 tasks\" narrative.\n\n**Context:**\nThe current landing page (root page without an active session) explicitly states a fixed limit of 3 tasks. Since the application now supports dynamic limits via user settings, this text is inaccurate. The presentation needs to be updated to highlight the default constraint while mentioning its adaptability.\n\n**Tasks:**\n\n- [ ] Locate the static text on the landing page referring to the \"3 task limit.\"\n- [ ] Update the copy to mention that the limit is adaptable to the user's needs.\n- [ ] Ensure the value \"3\" is presented as a recommended default rather than an absolute rule.\n\n**Acceptance Criteria:**\n\n- The landing page no longer implies a hardcoded, unchangeable limit.\n- Prospective users are informed that they can customize the number of concurrent tasks.\n- The core value proposition of \"picking your battles\" remains intact despite the focus on adaptability.","number":40,"title":"Bug: Static landing page text misrepresents dynamic task limit"}`

## Bug Description

The landing page (`app/components/LandingPage.tsx`) contains multiple hardcoded references to a "3 task" limit, presenting it as an absolute, unchangeable constraint. However, the application now supports a user-configurable task limit via settings (`maxTasks` field on the user record, default 3). The static landing page copy contradicts the actual behavior of the app, misleading prospective users into thinking the limit is fixed.

**Affected text (current → expected):**

- Hero subtitle: `"Focus on what matters. Limit yourself to 3 tasks at a time."` → should reference a configurable default
- Section heading: `"Why Only 3 Tasks?"` → should reference the configurable default
- Section body: `"...forcing yourself to choose only 3 tasks at a time..."` → should mention adaptability
- How It Works step 2: `"Add up to 3 tasks. The system won't let you add more until you complete one."` → should reflect that the limit is customizable

## Problem Statement

The landing page uses static copy that hardcodes "3 tasks" as a fixed rule. This is inaccurate because users can configure their own task limit via the Settings page. New visitors receive a false impression that the constraint is immutable, and the tests in `tests/components/LandingPage.test.tsx` assert the old hardcoded strings, so they will fail after the fix (requiring test updates too).

## Solution Statement

Update the copy in `app/components/LandingPage.tsx` to frame "3" as the recommended default while communicating that the limit is customizable. Update the corresponding tests in `tests/components/LandingPage.test.tsx` to assert the new text. The core value proposition (forced prioritization, focus, completing tasks to make room for new ones) must remain intact.

## Steps to Reproduce

1. Navigate to the app root `/` while logged out.
2. Observe the hero subtitle reads: `"Focus on what matters. Limit yourself to 3 tasks at a time."`
3. Observe the section heading reads: `"Why Only 3 Tasks?"`
4. Observe the How It Works step 2 reads: `"Add up to 3 tasks. The system won't let you add more until you complete one."`
5. Sign in, go to Settings, change the task limit to e.g. 5, then sign out.
6. Return to the landing page — it still says "3 tasks" everywhere, contradicting what the user just configured.

## Root Cause Analysis

The landing page component was written before dynamic task limits were implemented. When `maxTasks` (configurable per user) was introduced, the landing page copy was never updated. All four occurrences of the hardcoded "3" in `LandingPage.tsx` treat it as an invariant rather than a user-configurable default.

## Relevant Files

- **`app/components/LandingPage.tsx`** — The component containing all hardcoded "3 tasks" copy that needs to be updated.
- **`tests/components/LandingPage.test.tsx`** — Unit tests that assert the current (incorrect) hardcoded strings; must be updated to match the new copy.

## Step by Step Tasks

### Step 1: Write a failing test that reproduces the bug

- Open `tests/components/LandingPage.test.tsx`
- Add a test (or update existing tests) that asserts:
  - The hero subtitle does NOT contain the exact string `"Limit yourself to 3 tasks at a time."` (or asserts the new dynamic copy)
  - The section heading does NOT contain `"Why Only 3 Tasks?"` (or asserts the new heading)
  - How It Works step 2 does NOT contain `"Add up to 3 tasks."` (or asserts the new copy)
- Run `npm test` from the root — these tests should fail because the component still has old copy.

### Step 2: Update landing page copy in `app/components/LandingPage.tsx`

Make the following targeted text changes:

1. **Hero subtitle** (line 13): Change
   ```
   Focus on what matters. Limit yourself to 3 tasks at a time.
   ```
   to:
   ```
   Focus on what matters. Limit yourself to a few tasks at a time — 3 by default, customizable to fit your workflow.
   ```

2. **Section heading** (line 20): Change
   ```
   Why Only 3 Tasks?
   ```
   to:
   ```
   Why Limit Your Tasks?
   ```

3. **Section body paragraph** (lines 22–25): Change
   ```
   Overwhelming task lists lead to paralysis and procrastination. By forcing yourself to
   choose only 3 tasks at a time, you're compelled to ruthlessly prioritize what truly
   matters. Complete a task to make room for the next one.
   ```
   to:
   ```
   Overwhelming task lists lead to paralysis and procrastination. By forcing yourself to
   choose only a few tasks at a time (3 by default), you&apos;re compelled to ruthlessly prioritize what truly
   matters. Complete a task to make room for the next one. Your limit is yours to set.
   ```

4. **How It Works step 2 description** (line 86): Change
   ```
   Add up to 3 tasks. The system won't let you add more until you complete one.
   ```
   to:
   ```
   Add tasks up to your configured limit (default: 3). The system won&apos;t let you add more until you complete one.
   ```

### Step 3: Update tests in `tests/components/LandingPage.test.tsx`

- Update `'renders hero section with app branding'` test: change the asserted subtitle string to match the new hero copy.
- Update `'renders value proposition section'` test: change `'Why Only 3 Tasks?'` assertion to `'Why Limit Your Tasks?'`.
- Update `'has correct structure with multiple sections'` test: change `'Why Only 3 Tasks?'` assertion to `'Why Limit Your Tasks?'`.
- Update any other assertions referencing the old hardcoded "3 tasks" strings.
- Run `npm test` from root — all tests should now pass.

### Step 4: Run Validation Commands

- Run the full validation suite (see Validation Commands section below).

## Validation Commands

Execute every command to validate the bug is fixed with zero regressions.

```bash
# Verify old hardcoded text is gone from the component
grep -n "Why Only 3 Tasks\|Limit yourself to 3 tasks\|Add up to 3 tasks" app/components/LandingPage.tsx
# Expected: no output (strings are removed)

# Verify new copy is present
grep -n "Why Limit Your Tasks\|3 by default\|configured limit" app/components/LandingPage.tsx
# Expected: matches on those lines

npm run lint          # ESLint check — must pass with no errors
npx tsc --noEmit      # TypeScript type check — must pass with no errors
npm test              # Run test suite — all tests must pass
npm run build         # Production build — must complete successfully
```

## Notes

- This is a copy-only change — no logic, no API, no schema modifications needed.
- The E2E `.claude/commands/e2e/` directory was not present, so no E2E test task is included. The unit test coverage in `tests/components/LandingPage.test.tsx` is sufficient for this UI-text-only bug.
- The `LandingPage` component is a server component (uses `'use server'` in the form action and imports `signIn` from `@/auth`) — no client-side state is involved in this fix.
- The section heading wording `"Why Limit Your Tasks?"` preserves the spirit of the original while removing the hardcoded "3".
