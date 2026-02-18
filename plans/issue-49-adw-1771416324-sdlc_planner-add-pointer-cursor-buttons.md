# Chore: Add pointer cursor on hover for interactive buttons and task actions

## Metadata

issue_number: `49`
adw_id: `1771416324`
issue_json: `{"number":49,"title":"Chore: Add pointer cursor on hover for interactive buttons and task actions","body":"## Goal\n\nImprove UX by adding `cursor-pointer` (hand-shaped cursor) on hover for all interactive buttons and task action elements throughout the app.\n\n## Context\n\nCurrently, several clickable elements in the UI do not show a hand cursor on hover, making it unclear to users that they are interactive. This is a minor but impactful UX polish.\n\n## Affected Elements\n\n- Task slot buttons (add task, focus toggle)\n- Create task / submit actions\n- Any other interactive button or clickable element that is missing the pointer cursor\n\n## Tasks\n\n- [ ] Audit all interactive buttons and clickable elements across components\n- [ ] Add `cursor-pointer` Tailwind class (or equivalent) to any element missing it\n- [ ] Ensure consistency across all pages: dashboard, login, settings\n\n## Acceptance Criteria\n\n- All interactive buttons and task action elements display a hand-shaped cursor on hover\n- No regressions to existing functionality or layout"}`

## Chore Description

Add the `cursor-pointer` Tailwind class to every interactive `<button>` element in the app that is currently missing it. Browsers do not apply a hand cursor to `<button>` elements by default (only to `<a>` tags), so each button needs the class explicitly. This is a pure CSS polish chore — no logic or behavior changes.

**Full audit of affected buttons (8 total):**

| File | Element | Line | Issue |
|---|---|---|---|
| `app/components/TaskSlot.tsx` | Submit "Add" button | ~76 | Missing `cursor-pointer` (has `disabled:cursor-not-allowed` but not the enabled state) |
| `app/components/TaskSlot.tsx` | Cancel button | ~84 | Missing `cursor-pointer` |
| `app/components/TaskSlot.tsx` | "Add Task" empty-slot button | ~107 | Missing `cursor-pointer` |
| `app/components/TaskSlot.tsx` | Focus toggle button | ~148 | Missing `cursor-pointer` |
| `app/components/UserNav.tsx` | Sign Out button | ~46 | Missing `cursor-pointer` |
| `app/components/LandingPage.tsx` | CTA "Sign in with Google" button | ~114 | Missing `cursor-pointer` |
| `app/app/login/page.tsx` | "Sign in with Google" button | ~31 | Missing `cursor-pointer` |
| `app/components/SettingsForm.tsx` | Save Settings button | ~93 | Missing `cursor-pointer` (has `disabled:cursor-not-allowed` but not the enabled state) |

## Relevant Files

- **`app/components/TaskSlot.tsx`** — Contains 4 buttons that need `cursor-pointer`: the Add submit button, Cancel button, "Add Task" empty-slot button, and focus toggle button.
- **`app/components/UserNav.tsx`** — Contains the Sign Out `<button>` which needs `cursor-pointer`. The Settings `<Link>` already renders as `<a>` and gets pointer by default.
- **`app/components/LandingPage.tsx`** — Contains the CTA "Sign in with Google" `<button>` which needs `cursor-pointer`.
- **`app/app/login/page.tsx`** — Contains the "Sign in with Google" `<button>` which needs `cursor-pointer`.
- **`app/components/SettingsForm.tsx`** — Contains the Save Settings `<button>` which needs `cursor-pointer`.
- **`tests/components/TaskSlot.test.tsx`** — Existing tests; update to assert `cursor-pointer` on the Add Task button as a regression check.

## Step by Step Tasks

### Step 1: Update `app/components/TaskSlot.tsx`

Add `cursor-pointer` to four buttons:

- **Submit "Add" button** (~line 76): add `cursor-pointer` to the className alongside the existing `disabled:cursor-not-allowed`
  ```
  className="flex-1 rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
  ```
- **Cancel button** (~line 84): add `cursor-pointer`
  ```
  className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 disabled:opacity-50 cursor-pointer dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700"
  ```
- **"Add Task" empty-slot button** (~line 107): add `cursor-pointer`
  ```
  className="flex flex-col items-center gap-2 text-zinc-400 transition-colors hover:text-zinc-600 cursor-pointer dark:text-zinc-500 dark:hover:text-zinc-300"
  ```
- **Focus toggle button** (~line 148): add `cursor-pointer`
  ```
  className="rounded p-1 hover:bg-zinc-100 cursor-pointer dark:hover:bg-zinc-800"
  ```

### Step 2: Update `app/components/UserNav.tsx`

- **Sign Out button** (~line 46): add `cursor-pointer`
  ```
  className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 cursor-pointer dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
  ```

### Step 3: Update `app/components/LandingPage.tsx`

- **CTA "Sign in with Google" button** (~line 114): add `cursor-pointer`
  ```
  className="inline-flex items-center gap-3 rounded-lg bg-zinc-900 px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-zinc-800 cursor-pointer dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
  ```

### Step 4: Update `app/app/login/page.tsx`

- **"Sign in with Google" button** (~line 31): add `cursor-pointer`
  ```
  className="flex w-full items-center justify-center gap-3 rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-800 cursor-pointer dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
  ```

### Step 5: Update `app/components/SettingsForm.tsx`

- **Save Settings button** (~line 93): add `cursor-pointer`
  ```
  className="inline-flex justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-50"
  ```

### Step 6: Add regression tests

- In `tests/components/TaskSlot.test.tsx`, add a test: `Add Task button has cursor-pointer class`
  - Render TaskSlot with no task and `onAddTask` provided
  - Find the "Add Task" button
  - Assert it has class `cursor-pointer`
- In `tests/components/UserNav.test.tsx`, add a test: `Sign Out button has cursor-pointer class`
  - Find the Sign Out button
  - Assert it has class `cursor-pointer`

### Step 7: Run all validation commands

- Run `npx jest` from project root — all tests must pass
- Run `npx tsc --noEmit` from `app/` — TypeScript must be clean
- Run `npm run lint` from `app/` — ESLint must pass
- Run `npm run build` from `app/` — production build must succeed

## Validation Commands

```bash
# Full test suite (from project root)
npx jest

# TypeScript type check (from app/)
npx tsc --noEmit

# ESLint (from app/)
npm run lint

# Production build (from app/)
npm run build
```

## Notes

- `cursor-pointer` on a button that also has `disabled:cursor-not-allowed` is correct — Tailwind's `disabled:` variant overrides the base `cursor-pointer` when the button is disabled.
- `<Link>` elements (`<a>` tags) already show pointer cursor by default in browsers — no changes needed for the Settings link in UserNav.
- This is a purely additive change to `className` strings; no logic, props, or behavior is modified.
