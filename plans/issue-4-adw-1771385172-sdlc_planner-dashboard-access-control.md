# Feature: Dashboard Access Control

## Metadata

- **issue_number**: `4`
- **adw_id**: `1771385172`
- **issue_json**:
```json
{
  "title": "Feat. 4: Dashboard Access Control",
  "number": 4,
  "body": "**Goal:** Secure application access at the root.\n\n**Context:** The root page should handle both authenticated (dashboard) and unauthenticated (landing/login) states.\n\n**Tasks:**\n- [ ] Implement conditional rendering on the root page based on auth state.\n- [ ] Protect /settings and API routes via middleware.\n\n**Acceptance Criteria:**\n- Logged-out users see a landing/login state.\n- Logged-in users see their personal task dashboard."
}
```

## Feature Description

Implement conditional rendering on the root page (/) based on authentication state, allowing the application to serve both unauthenticated landing/login UI and authenticated dashboard UI from the same route. This provides a seamless user experience where visitors can immediately understand the value proposition and sign in, while authenticated users go straight to their dashboard.

## User Story

As a **visitor to Pick Your Battles**
I want to **see what the app offers and easily sign in when I visit the root page**
So that **I can quickly understand the value and access my personalized dashboard**

As an **authenticated user**
I want to **immediately see my task dashboard when I visit the root page**
So that **I can quickly get to work without extra navigation**

## Problem Statement

Currently, the middleware protects the root page `/` by redirecting unauthenticated users to `/login`. This creates a disjointed experience where:
- New visitors don't see any landing page at the root URL
- Users must navigate to `/login` explicitly
- The root page only serves one purpose (dashboard for authenticated users)
- There's no clear entry point or value proposition for new users

The issue requests that `/` handle both authenticated and unauthenticated states, providing a unified entry point.

## Solution Statement

Update the root page to be a conditional server component that checks authentication state and renders appropriate UI:
- **Unauthenticated users**: Display a landing page with app description, value proposition, and prominent "Sign in with Google" button
- **Authenticated users**: Display the personalized task dashboard with their tasks

Update middleware configuration to exclude `/` from protection while maintaining security for `/settings` and API routes. Create a new `/settings` page (placeholder for now) and ensure it's properly protected.

## Relevant Files

### Existing Files

- `app/app/page.tsx` - Currently always renders Dashboard; needs conditional logic based on auth state
- `app/middleware.ts` - Currently protects `/` (root); needs to be updated to exclude root but protect /settings
- `app/app/login/page.tsx` - Existing login page with Google sign-in UI; can be used as reference for landing page design
- `app/auth.ts` - Auth.js configuration with Google OAuth provider
- `app/lib/auth.ts` - Contains `getCurrentUser()` utility for checking auth state server-side
- `app/components/Dashboard.tsx` - Existing dashboard component, will be rendered for authenticated users
- `app/components/UserNav.tsx` - User navigation component shown in authenticated state

### New Files

- `app/components/LandingPage.tsx` - Landing page component for unauthenticated users with value proposition and sign-in button
- `app/app/settings/page.tsx` - Settings page placeholder (protected by middleware)
- `tests/app/page.test.tsx` - Unit tests for root page conditional rendering
- `tests/components/LandingPage.test.tsx` - Unit tests for LandingPage component

## Implementation Plan

### Phase 1: Foundation

**Update Middleware Configuration:**
- Modify `app/middleware.ts` to exclude root page `/` from protection
- Keep `/settings` and API routes protected
- Verify `/login` remains accessible to unauthenticated users

**Create Settings Page Placeholder:**
- Create `/settings` route as a protected page
- Simple placeholder UI to verify middleware protection works
- Will be expanded in future features

### Phase 2: Core Implementation

**Create LandingPage Component:**
- Design landing page UI with app branding and value proposition
- Explain the 3-task limit concept clearly
- Include prominent "Sign in with Google" button
- Match design system (Tailwind classes, dark mode support)
- Reuse UI patterns from existing login page

**Update Root Page with Conditional Rendering:**
- Make root page a server component that checks auth state
- Use `getCurrentUser()` from `app/lib/auth.ts` to get session
- If user is authenticated: render Dashboard
- If user is not authenticated: render LandingPage
- Ensure proper TypeScript typing

### Phase 3: Integration

**Testing:**
- Write unit tests for conditional rendering logic
- Test LandingPage component (rendering, sign-in button)
- Verify middleware protection works correctly
- Manual testing of user flows (logged out → sign in → dashboard)

**UI Polish:**
- Ensure smooth transitions between states
- Verify dark mode works for both landing and dashboard
- Mobile responsive design for landing page
- Accessibility checks (ARIA labels, keyboard navigation)

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Middleware Configuration

- Open `app/middleware.ts`
- Update the `matcher` config to exclude root page `/` from protection
- Ensure it still protects `/settings` and other routes
- Current matcher: `["/((?!api|_next/static|_next/image|favicon.ico|login).*)"]`
- New matcher should allow `/` but protect `/settings`
- Example: `["/settings/:path*"]` or update existing regex to exclude root
- Keep `/login` accessible (already working)

### 2. Create Settings Page Placeholder

- Create `app/app/settings/page.tsx`
- Use `requireAuth()` to ensure only authenticated users can access
- Create simple placeholder UI:
  - Page title: "Settings"
  - Subtitle: "Manage your Pick Your Battles preferences"
  - Placeholder text: "Settings coming soon..."
- Add UserNav component at top for consistent navigation
- This validates middleware protection is working

### 3. Create LandingPage Component

- Create `app/components/LandingPage.tsx`
- Include the following sections:
  - **Hero Section**: App name, tagline, brief description
  - **Value Proposition**: Explain the 3-task limit concept and benefits
  - **How It Works**: Simple 3-step explanation (Sign in → Add tasks → Stay focused)
  - **Sign In CTA**: Prominent "Sign in with Google" button
- Use server action for sign-in (import from `@/auth`)
- Style with Tailwind CSS matching existing design system
- Support dark mode
- Mobile-responsive layout
- Reference `app/app/login/page.tsx` for design patterns

### 4. Update Root Page with Conditional Rendering

- Open `app/app/page.tsx`
- Import `getCurrentUser` from `@/lib/auth`
- Import `LandingPage` component
- Import `Dashboard` component
- Make page async (server component)
- Call `getCurrentUser()` to check auth state
- If `user` exists: render `<Dashboard />`
- If `user` is null: render `<LandingPage />`
- Add proper TypeScript types
- Ensure it's a server component (no 'use client' directive)

### 5. Write Unit Tests for Root Page

- Create `tests/app/page.test.tsx`
- Mock `getCurrentUser` from `@/lib/auth`
- Test case: "renders LandingPage when user is not authenticated"
  - Mock `getCurrentUser` to return null
  - Render the page component
  - Assert LandingPage elements are present
- Test case: "renders Dashboard when user is authenticated"
  - Mock `getCurrentUser` to return user object
  - Render the page component
  - Assert Dashboard elements are present

### 6. Write Unit Tests for LandingPage Component

- Create `tests/components/LandingPage.test.tsx`
- Test case: "renders hero section with app branding"
  - Verify "Pick Your Battles" heading exists
  - Verify tagline is displayed
- Test case: "renders value proposition and how it works sections"
  - Check for key content about 3-task limit
- Test case: "renders sign in button"
  - Verify "Sign in with Google" button is present
  - Check button has proper attributes
- Test case: "has correct styling and responsive classes"
  - Verify Tailwind classes are applied

### 7. Manual Testing - Unauthenticated Flow

- Clear browser cookies/session
- Visit root URL `/`
- Verify LandingPage is displayed (not dashboard)
- Verify "Sign in with Google" button is visible
- Click sign-in button
- Complete OAuth flow
- Verify redirect back to `/` shows Dashboard
- Verify tasks load correctly

### 8. Manual Testing - Authenticated Flow

- Ensure you're signed in
- Visit root URL `/`
- Verify Dashboard is displayed immediately (no landing page)
- Verify tasks are visible
- Sign out
- Verify LandingPage is displayed again

### 9. Manual Testing - Settings Page Protection

- While logged out, try to visit `/settings`
- Should redirect to `/login` (middleware protection)
- Sign in
- Visit `/settings`
- Should show settings placeholder page
- Verify UserNav is displayed

### 10. Run All Validation Commands

- Run all validation commands to ensure zero regressions
- Fix any issues that arise
- Ensure all tests pass

## Testing Strategy

### Unit Tests

**Root Page (`tests/app/page.test.tsx`):**
- Test conditional rendering based on auth state
- Mock `getCurrentUser` to return authenticated/unauthenticated states
- Verify correct component (Dashboard vs LandingPage) is rendered

**LandingPage Component (`tests/components/LandingPage.test.tsx`):**
- Test that hero section renders with app branding
- Test that value proposition content is displayed
- Test that sign-in button renders correctly
- Test responsive design classes are applied
- Test dark mode support (if testable)

**Settings Page:**
- Could add tests for settings page if needed (lower priority)
- Manual testing sufficient for placeholder

### Edge Cases

- **User signs in while on landing page**: Should redirect to dashboard after OAuth
- **User signs out while on dashboard**: Should show landing page
- **User navigates to `/` while already authenticated**: Should skip landing page and show dashboard immediately
- **User tries to access `/settings` while logged out**: Should be redirected to `/login` by middleware
- **User bookmarks `/` and visits later**: Should show appropriate UI based on current auth state
- **OAuth callback failures**: Should handle gracefully (existing Auth.js error handling)
- **Slow database queries**: Landing page should load instantly (no database calls for unauthenticated users)
- **Multiple tabs**: If user signs in in one tab, other tabs should reflect auth state on refresh

## Acceptance Criteria

✅ **Root page (`/`) handles both authenticated and unauthenticated states**
✅ **Unauthenticated users see landing page with:**
  - App branding and name
  - Clear value proposition explaining the 3-task limit concept
  - "How it works" section
  - Prominent "Sign in with Google" button
✅ **Authenticated users see their personal task dashboard immediately**
✅ **Sign-in button on landing page works correctly:**
  - Redirects to Google OAuth
  - Returns to dashboard after successful authentication
✅ **Settings page (`/settings`) is created and protected:**
  - Unauthenticated users are redirected to login
  - Authenticated users can access the page
✅ **Middleware properly protects routes:**
  - Root `/` is NOT protected (accessible to everyone)
  - `/settings` IS protected (requires authentication)
  - API routes remain protected
✅ **All unit tests pass (12+ tests total)**
✅ **No regressions in existing functionality:**
  - Dashboard still works for authenticated users
  - Tasks still load and display correctly
  - Sign in/out flow works
✅ **All validation commands pass (lint, tsc, test, build)**
✅ **Landing page is mobile responsive and supports dark mode**

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

```bash
# Navigate to app directory
cd app

# Run linter
npm run lint

# Run TypeScript type check
npx tsc --noEmit

# Run test suite
npm test

# Run production build
npm run build

# Manual validation steps:
# 1. Clear browser cookies/storage
# 2. Visit http://localhost:3000/
# 3. Verify landing page is displayed (not redirected)
# 4. Click "Sign in with Google" button
# 5. Complete OAuth flow
# 6. Verify you're redirected to dashboard with your tasks
# 7. Visit http://localhost:3000/settings
# 8. Verify settings page loads (you're authenticated)
# 9. Sign out via UserNav
# 10. Visit http://localhost:3000/
# 11. Verify landing page is displayed again
# 12. Try to visit http://localhost:3000/settings
# 13. Verify you're redirected to /login (not authenticated)
```

All commands must execute without errors. Manual testing confirms the conditional rendering works correctly in both states.

## Notes

### Current Middleware Behavior

The existing middleware uses Auth.js's `auth` function as middleware, which:
- Automatically redirects unauthenticated users to `/login`
- Protects all routes except those in the matcher exclusion list
- Current exclusions: `/api`, `/_next/static`, `/_next/image`, `/favicon.ico`, `/login`

### Middleware Update Strategy

Two approaches for allowing root page access:

**Option A: Exclude root from middleware (Recommended)**
- Update matcher to exclude `/` from protection
- Root page handles its own auth checking and conditional rendering
- Simpler, more explicit
- Example matcher: `["/settings/:path*"]` or exclude `/` specifically

**Option B: Keep middleware, use auth checks in page**
- Middleware stays as-is (protects root)
- Use `auth()` in root page to check state before redirect
- More complex, maintains centralized protection

**Recommendation**: Option A (exclude root from middleware) for clarity and simplicity.

### Landing Page Content Suggestions

**Hero Section:**
- **Headline**: "Pick Your Battles"
- **Subheadline**: "Focus on what matters. Limit yourself to 3 tasks at a time."
- **Description**: Brief explanation of the concept (2-3 sentences)

**Value Proposition:**
- **Problem**: Overwhelming task lists lead to paralysis and procrastination
- **Solution**: Forced prioritization through a 3-task limit
- **Benefit**: Achieve more by doing less

**How It Works:**
1. **Sign in** - Quick Google authentication
2. **Add tasks** - Pick your top 3 priorities
3. **Stay focused** - Complete before adding more

### Design Consistency

Reuse existing design patterns:
- Color scheme: zinc for neutrals, match Dashboard styling
- Dark mode support using Tailwind's `dark:` classes
- Typography: Match existing headings and body text styles
- Button styles: Match existing Google sign-in button from `/login`
- Spacing and layout: Consistent with Dashboard component

### Settings Page Future Enhancements

The placeholder settings page created in this feature will be expanded later with:
- User preferences (task limit configuration)
- Theme selection (light/dark/system)
- Account management (delete account, export data)
- Notification preferences

For now, it serves as a test case for route protection.

### Security Considerations

- **Root page is public**: Anyone can view the landing page (this is intentional)
- **Dashboard data is protected**: Even though root page is public, the Dashboard component still requires auth to fetch tasks via API
- **Settings requires auth**: Protected by middleware, unauthenticated users redirected
- **API routes remain protected**: Middleware still protects `/api/tasks` and other API routes
- **No sensitive data on landing page**: Landing page is purely informational

### Performance Considerations

- **Server component**: Root page is a server component, auth check happens server-side
- **Fast landing page**: Unauthenticated users get instant load (no database queries)
- **Dashboard caching**: Consider adding caching headers for authenticated dashboard
- **Static generation**: Landing page content could be statically generated (not user-specific)

### Accessibility

Landing page should include:
- Proper heading hierarchy (h1, h2, etc.)
- ARIA labels for sign-in button
- Keyboard navigation support
- Sufficient color contrast for text
- Alt text for any images/icons
- Focus indicators for interactive elements

### Mobile Responsiveness

Landing page should:
- Stack vertically on mobile devices
- Use larger tap targets for buttons (min 44x44px)
- Readable font sizes on small screens
- Proper viewport meta tag
- Test on various screen sizes (320px, 768px, 1024px+)

### Future Enhancements

1. **Landing page animations**: Subtle fade-in or slide-in effects
2. **Demo mode**: Show example tasks without signing in
3. **Feature showcase**: Carousel or tabs showing key features
4. **Testimonials**: User quotes about how the app helped them
5. **FAQ section**: Common questions about the 3-task limit
6. **Video demo**: Short video explaining the concept
7. **Pricing page**: If monetization is added later
8. **Blog/Resources**: Link to productivity tips and strategies

### Testing Notes

- **Server component testing**: Testing server components can be tricky; focus on integration tests
- **Auth mocking**: Use Jest to mock `getCurrentUser` function
- **Component isolation**: Test LandingPage as a standalone component (client component)
- **E2E tests**: Consider Playwright for full user flow testing (future enhancement)

### Deployment Considerations

When deploying to Vercel:
- Landing page will be server-rendered on each request (dynamic route)
- Consider adding ISR (Incremental Static Regeneration) if content becomes static
- Ensure environment variables are set (DATABASE_URL, AUTH_SECRET, OAuth credentials)
- Test the full OAuth flow in production environment
- Monitor performance of root page (should be fast even under load)
