# Bug: Duplicate User Profile and Logout section in Settings page

## Metadata

issue_number: `36`
adw_id: `1771414846`
issue_json: `{"number":36,"title":"Bug: Duplicate User Profile and Logout section in Settings page","body":"**Goal:** Remove the redundant User/Logout UI block from the settings page to ensure a clean and consistent layout.\n\n**Context:**\nThe UI element that displays the user's information and the sign-out option is currently appearing twice when navigating to the settings route. This clutter affects the user experience and breaks the visual hierarchy of the page.\n\n**Tasks:**\n- [ ] Identify and remove the duplicate user profile and logout component in the settings view.\n- [ ] Ensure the component only renders once, ideally as part of a shared global layout.\n\n**Acceptance Criteria:**\n- The user profile and logout section appears only once on the settings page.\n- Layout consistency is maintained across the root and settings pages.\n- Logout functionality remains fully operational after the fix."}`

## Bug Description

The `UserNav` component (user name, email, avatar, Settings link, Sign Out button) renders twice on the `/settings` page:

1. Once from `app/app/layout.tsx` — the root layout renders `<UserNav />` inside a `<header className="fixed right-0 top-0 z-50 p-4">` that wraps every page.
2. Once from `app/app/settings/page.tsx` — the settings page renders its own `<UserNav />` inside a full-width border-bottom header bar at the top of the page.

**Expected:** `UserNav` appears exactly once on the settings page.
**Actual:** `UserNav` appears twice — once as a fixed overlay in the top-right corner (from layout) and once inside a full-width header bar (from the settings page itself).

## Problem Statement

`settings/page.tsx` redundantly renders `<UserNav />` even though the root layout already provides it globally on every page.

## Solution Statement

Remove the `<UserNav />` import and its containing header `<div>` block from `settings/page.tsx`. The root layout handles global navigation; individual pages should not re-render it.

## Steps to Reproduce

1. Log in with Google OAuth
2. Navigate to `/settings`
3. Observe two user profile + sign-out sections: one fixed in the top-right corner, one in the page-level header bar

## Root Cause Analysis

`app/app/layout.tsx` already renders `<UserNav />` globally inside a fixed `<header>` for all routes. When `settings/page.tsx` was created, a page-specific header with `<UserNav />` was added to provide navigation context, but this duplicates what the layout already provides. The fix is to remove the redundant instance from the settings page.

## Relevant Files

- **`app/app/settings/page.tsx`** — Contains the duplicate `<UserNav />` render and its wrapping `<div>` block. The `UserNav` import and the entire "User Navigation" section (lines 30–35) must be removed.
- **`app/app/layout.tsx`** — The root layout that already renders `<UserNav />` globally. No changes needed here — confirms the component is already provided.
- **`app/components/UserNav.tsx`** — The `UserNav` component itself. No changes needed.
- **`tests/components/UserNav.test.tsx`** — Existing UserNav unit tests. No changes needed.

### New Files

- `tests/app/settings/page.test.tsx` — New regression test confirming the settings page does not render `UserNav` directly (prevents future re-introduction of the duplicate).

## Step by Step Tasks

### Step 1: Write a failing regression test

- Create `tests/app/settings/page.test.tsx`
- Mock dependencies: `@/lib/auth` (getCurrentUser), `@/lib/db/queries` (getUserProfile), `@/lib/db/mutations` (upsertUser), `@/auth` (auth — used by UserNav), `next/navigation` (redirect)
- Write a test: `renders settings page without a duplicate UserNav`
  - Mock `getCurrentUser` to return a logged-in user
  - Mock `getUserProfile` to return a mock user profile
  - Render the `SettingsPage` server component
  - Assert that the `Settings` link (rendered by UserNav) appears at most once in the settings page output — confirming UserNav is not rendered directly by the page
- Run `npx jest tests/app/settings/page.test.tsx` — this test will initially fail if UserNav is still in the page (or pass trivially if the layout mock doesn't render UserNav — either way establishes the regression baseline)

### Step 2: Remove duplicate `UserNav` from `settings/page.tsx`

- Remove the `UserNav` import from the top of `app/app/settings/page.tsx`:
  ```ts
  // Remove this line:
  import UserNav from '@/components/UserNav';
  ```
- Remove the entire "User Navigation" `<div>` block (the border-bottom header containing `<UserNav />`):
  ```tsx
  // Remove these lines:
  {/* User Navigation */}
  <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
    <div className="mx-auto max-w-7xl px-4 py-4">
      <UserNav />
    </div>
  </div>
  ```
- The outer wrapper `<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">` and all other content remains unchanged

### Step 3: Verify the regression test passes

- Run `npx jest tests/app/settings/page.test.tsx` — the test should now pass
- Run the full test suite: `npx jest` from project root — all 85+ tests must pass

### Step 4: Run all validation commands

- Run `npx tsc --noEmit` from `app/` — TypeScript must type-check clean (removing the unused import eliminates a potential TS warning)
- Run `npm run lint` from `app/` — ESLint must pass
- Run `npx jest` from project root — all tests pass
- Run `npm run build` from `app/` — production build succeeds

## Validation Commands

```bash
# TypeScript type check (from app/)
npx tsc --noEmit

# ESLint (from app/)
npm run lint

# Full test suite (from project root)
npx jest

# Production build (from app/)
npm run build
```

## Notes

- The root layout (`app/app/layout.tsx`) renders `UserNav` in a `position: fixed` overlay in the top-right corner. After removing the settings page's own header, users will still see UserNav via the layout — no functionality is lost.
- No changes are needed to `UserNav.tsx`, `layout.tsx`, or any other component.
- This is a pure subtraction fix — the only change to application code is removing ~6 lines from `settings/page.tsx`.
