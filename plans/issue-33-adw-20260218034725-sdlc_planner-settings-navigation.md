# Feature: Navigation to Personal Settings

## Metadata

issue_number: `33`
adw_id: `20260218034725`
issue_json: `{"body":"**Goal:** Provide a clear path for users to access and manage their personal configurations from the main dashboard.\n\n**Context:**\nUsers need to be able to reach the settings page easily to update their display name or task limits. This link serves as the primary navigation point between the workspace and the profile management area.\n\n**Tasks:**\n- [ ] Add a navigation link or icon to the root dashboard.\n- [ ] Ensure the link is only visible to authenticated users.\n- [ ] Implement the redirect logic to the /settings page.\n- [ ] Add a link to the /settings page to go back to the main dashboard\n \n**Acceptance Criteria:**\n- The link is clearly visible on the main page.\n- Clicking the link correctly redirects the user to their settings.\n- The navigation element follows the existing UI style.\n- The link to return to dashboard is clearly visible on the settings page.","number":33,"title":"Feat. 13: Navigation to Personal Settings"}`

## Feature Description

Add bidirectional navigation between the dashboard and the settings page:

1. **Dashboard → Settings**: A "Settings" link added to `UserNav` (already rendered in the top-right corner of every page via the root layout). Since `UserNav` only renders for authenticated users, the link is automatically gated.
2. **Settings → Dashboard**: A "← Dashboard" back link added to the settings page header so users can return to their workspace.

## User Story

As an authenticated user
I want to navigate easily between my dashboard and settings page
So that I can update my display name or task limit without having to manually type a URL

## Problem Statement

There is no navigation link between the main dashboard and the settings page. Users who want to change their display name or task limit have no visible way to reach `/settings`, and once there, no visible way to return to `/`.

## Solution Statement

Add a "Settings" link to the existing `UserNav` component (which already appears top-right on every page for authenticated users), and add a "← Dashboard" link to the settings page header. Both links use Next.js `Link` for client-side navigation and match the existing Tailwind UI style.

## Relevant Files

Use these files to implement the feature:

- **`app/components/UserNav.tsx`** — Server component rendered in the top-right corner of every page. Already checks authentication (`if (!session?.user) return null`). Add a "Settings" link here so it only appears for authenticated users. Requires importing `Link` from `next/link`.
- **`app/app/settings/page.tsx`** — The settings page. Add a "← Dashboard" link to the header area so users can return to `/`.
- **`app/app/layout.tsx`** — Read-only reference. Confirms `UserNav` is mounted in the root layout, so any link added there will appear on the dashboard automatically.

### New Files

- **`tests/components/UserNav.test.tsx`** — Unit tests verifying the Settings link renders when authenticated and is absent when not authenticated.

## Implementation Plan

### Phase 1: Foundation

No new dependencies or infrastructure needed. `next/link` is already available.

### Phase 2: Core Implementation

Add the Settings link to `UserNav` and the Dashboard link to the settings page.

### Phase 3: Integration

Write unit tests for `UserNav`. Verify the full navigation flow passes all validation commands.

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Add Settings link to UserNav

- Open `app/components/UserNav.tsx`
- Import `Link` from `next/link`
- Add a "Settings" link before the Sign Out button, styled to match the existing sign-out button style (border, rounded, text-sm):

```tsx
<Link
  href="/settings"
  className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
>
  Settings
</Link>
```

### Step 2: Add Dashboard back link to Settings page

- Open `app/app/settings/page.tsx`
- Import `Link` from `next/link`
- Add a "← Dashboard" link at the top of the settings content area, above the `<h1>`, styled as a subtle text link:

```tsx
<Link
  href="/"
  className="mb-6 inline-flex items-center text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
>
  ← Dashboard
</Link>
```

### Step 3: Write unit tests for UserNav

- Create `tests/components/UserNav.test.tsx`
- Mock `@/auth` to return a session with a user (authenticated case) and null (unauthenticated case)
- Mock `next/image` (used for the avatar) and `next/link`
- Test cases:
  - When authenticated: renders the "Settings" link pointing to `/settings`
  - When authenticated: renders the "Sign Out" button
  - When not authenticated: renders nothing (returns null)

### Step 4: Run validation commands

- Run all commands listed in the Validation Commands section

## Testing Strategy

### Unit Tests

- **`tests/components/UserNav.test.tsx`**:
  - `renders Settings link for authenticated users` — mock `auth()` to return a session, assert a link with text "Settings" and `href="/settings"` is in the document
  - `does not render for unauthenticated users` — mock `auth()` to return `null`, assert the component renders nothing
  - `renders Sign Out button for authenticated users` — existing behaviour regression check

### Edge Cases

- User has no avatar image: Settings link still renders (avatar is optional)
- User has no display name: Settings link still renders (name is optional)

## Acceptance Criteria

- [ ] A "Settings" link is clearly visible in the top-right nav on the main dashboard for authenticated users
- [ ] The "Settings" link navigates to `/settings`
- [ ] The "Settings" link is NOT visible to unauthenticated users
- [ ] A "← Dashboard" link is clearly visible on the `/settings` page
- [ ] The "← Dashboard" link navigates to `/`
- [ ] Both links follow the existing Tailwind UI style
- [ ] All existing tests continue to pass

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

- `npm run lint` - Run ESLint to validate code quality
- `npx tsc --noEmit` - Run TypeScript type check to validate no type errors
- `npm test` - Run test suite to validate the feature works with zero regressions
- `npm run build` - Run production build to validate the feature works with zero regressions

## Notes

- `UserNav` is a **server component** (uses `async/await` and calls `auth()` directly). Testing it with React Testing Library requires mocking `@/auth`. Use `jest.mock('@/auth')` and `mockResolvedValue` — the same pattern used in `tests/lib/auth.test.ts`.
- The "Settings" link in `UserNav` will appear on both the dashboard (`/`) and the settings page (`/settings`) itself, since `UserNav` is in the root layout. This is acceptable — it's a standard nav pattern.
- No changes to the middleware or auth config are needed; the existing auth guard on `/settings` already handles unauthenticated access.
