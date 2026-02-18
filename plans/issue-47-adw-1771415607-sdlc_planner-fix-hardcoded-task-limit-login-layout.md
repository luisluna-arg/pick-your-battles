# Bug: Hardcoded task limit of 3 on login page and layout metadata

## Metadata

issue_number: `47`
adw_id: `1771415607`
issue_json: `{"number":47,"title":"Bug: Hardcoded task limit of 3 on login page and layout metadata","body":"## Description\n\nTwo pages still contain hardcoded references to a fixed limit of 3 tasks, misrepresenting the app's configurable task limit feature.\n\n## Affected Files\n\n### `app/app/login/page.tsx` — line 13\n**Current:**\n```\nFocus on what matters. Limit yourself to 3 tasks at a time.\n```\n**Problem:** Hardcodes 3 — new users see this before signing in and will expect exactly 3, not a configurable limit.\n\n### `app/app/layout.tsx` — line 18\n**Current:**\n```\ndescription: \"A minimalist productivity tool that enforces focus by limiting users to 3 concurrent tasks.\"\n```\n**Problem:** This is the SEO meta description shown in search results and browser tabs. It hardcodes 3.\n\n## Expected Behavior\n\nBoth references should reflect that the limit is configurable (defaulting to 3), consistent with the rest of the app's messaging established in bug #40.\n\n## Steps to Reproduce\n\n1. Navigate to `/login` — tagline reads \"Limit yourself to 3 tasks at a time.\"\n2. Inspect page `<meta name=\"description\">` — reads \"limiting users to 3 concurrent tasks\""}`

## Bug Description

Two user-facing strings in the app still hardcode "3" as the task limit, contradicting the configurable nature of the feature:

1. **`app/app/login/page.tsx` line 13** — The login page tagline reads:
   > "Focus on what matters. Limit yourself to **3 tasks** at a time."
   New users see this before signing in. They expect exactly 3 tasks, not a configurable default.

2. **`app/app/layout.tsx` line 18** — The global SEO meta description reads:
   > "A minimalist productivity tool that enforces focus by limiting users to **3 concurrent tasks**."
   This appears in search results, browser tabs, and link previews.

**Expected:** Both strings describe the limit as configurable, consistent with the copy established in bug #40 (e.g., "a few tasks at a time — 3 by default").
**Actual:** Both strings say exactly "3", implying a fixed, non-configurable limit.

## Problem Statement

The login page tagline and the global layout metadata description hardcode the number 3 instead of describing the limit as a configurable default.

## Solution Statement

Update the two hardcoded strings to use language consistent with the rest of the app (established in bug #40):
- Login page tagline: replace "3 tasks" with phrasing that conveys a configurable default
- Layout meta description: replace "3 concurrent tasks" with phrasing that conveys a configurable default

## Steps to Reproduce

1. Open the app in a logged-out browser
2. Navigate to `/login` — tagline reads "Limit yourself to 3 tasks at a time."
3. View page source or DevTools → `<meta name="description">` reads "limiting users to 3 concurrent tasks"

## Root Cause Analysis

These two strings were not updated when bug #40 fixed similar hardcoded references in `LandingPage.tsx`. The login page and root layout were missed because they are separate files from the landing page component and contain independent copies of the tagline/description text.

## Relevant Files

- **`app/app/login/page.tsx`** — Contains the hardcoded tagline `"Limit yourself to 3 tasks at a time."` on line 13. Must be updated to reflect configurable default.
- **`app/app/layout.tsx`** — Contains the hardcoded meta description `"limiting users to 3 concurrent tasks"` on line 18. Must be updated.
- **`tests/app/login/page.test.tsx`** — New test file to add a regression test asserting the login tagline does not contain the hardcoded "3 tasks".

### New Files

- `tests/app/login/page.test.tsx` — Regression test for the login page tagline copy.

## Step by Step Tasks

### Step 1: Write a failing regression test for the login page

- Create `tests/app/login/page.test.tsx`
- Mock `@/auth` (signIn)
- Render `LoginPage`
- Write test: `does not show hardcoded task limit of 3 in tagline`
  - Assert `screen.queryByText(/limit yourself to 3 tasks/i)` returns null
  - Assert tagline contains "default" or "configurable" or "few" — something non-specific to 3
- Run `npx jest tests/app/login/page.test.tsx` — should **fail** because the current tagline still says "3 tasks"

### Step 2: Fix the login page tagline

- In `app/app/login/page.tsx`, update line 13:
  - **Before:** `Focus on what matters. Limit yourself to 3 tasks at a time.`
  - **After:** `Focus on what matters. Limit yourself to a few tasks at a time.`
- This matches the pattern established by `LandingPage.tsx` after bug #40

### Step 3: Fix the layout meta description

- In `app/app/layout.tsx`, update line 18:
  - **Before:** `"A minimalist productivity tool that enforces focus by limiting users to 3 concurrent tasks."`
  - **After:** `"A minimalist productivity tool that enforces focus by limiting users to a configurable number of concurrent tasks."`

### Step 4: Verify the regression test now passes

- Run `npx jest tests/app/login/page.test.tsx` — all tests should pass
- Run the full suite: `npx jest` from project root — all tests must pass

### Step 5: Run all validation commands

- `npx tsc --noEmit` from `app/` — TypeScript must type-check clean
- `npm run lint` from `app/` — ESLint must pass
- `npx jest` from project root — all tests pass
- `npm run build` from `app/` — production build succeeds

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

- The replacement copy "a few tasks at a time" for the login tagline exactly mirrors the hero subtitle already used in `LandingPage.tsx` (set in bug #40), keeping messaging consistent across the unauthenticated flow.
- No database migrations or API changes are needed — this is a pure copy/text fix.
- `layout.tsx` metadata is static and cannot be dynamically set per-user, so "configurable number" is the correct generic description.
