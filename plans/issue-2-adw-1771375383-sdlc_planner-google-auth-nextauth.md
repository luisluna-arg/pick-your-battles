# Feature: Google Authentication with Auth.js

## Metadata

- **issue_number**: `2`
- **adw_id**: `1771375383`
- **issue_json**:
```json
{
  "title": "Issue 2: Google Authentication with Auth.js",
  "number": 2,
  "body": "**Goal:** Implement user identity to allow private and persistent task management.\n\n**Context:**\nSince the tool is meant for daily use, we need to identify users to save their specific tasks and prevent data mixing.\n\n**Tasks:**\n- [ ] Install and configure next-auth.\n- [ ] Set up the Google Provider.\n- [ ] Create a /login page and protect the main route via middleware.\n- [ ] Implement a UserNav component with Sign In/Sign Out functionality.\n\n**Acceptance Criteria:**\n- Users can log in using their Google account.\n- Unauthenticated users are redirected to the login page.\n- Session data is accessible in both Client and Server components."
}
```

## Feature Description

Implement Google OAuth authentication using Auth.js (NextAuth v5) to enable user identification and persistent, private task management. This feature establishes the foundation for multi-user support by allowing users to sign in with their Google account, protecting authenticated routes, and providing session management across both client and server components.

## User Story

As a **daily user of Pick Your Battles**
I want to **sign in with my Google account**
So that **my tasks are saved privately and persist across sessions, without mixing with other users' data**

## Problem Statement

Currently, the application has no user authentication system. Without user identity:
- Tasks cannot be persisted to a database (no way to know which user owns which tasks)
- Multiple users would see and modify the same shared task list
- Users cannot access their tasks from different devices
- There's no privacy or data isolation between users

This prevents the application from being a practical daily-use tool and blocks implementation of database-backed task persistence.

## Solution Statement

Implement Auth.js (NextAuth v5) with Google OAuth provider to establish user identity. This solution:
- Leverages Google's trusted authentication (most users already have Google accounts)
- Provides secure, industry-standard OAuth 2.0 flow
- Integrates seamlessly with Next.js App Router via middleware and route handlers
- Enables session management in both server and client components
- Sets the foundation for database integration (users can be linked to their tasks)
- Requires minimal setup for users (no new account creation needed)

## Relevant Files

### Existing Files

- `app/app/layout.tsx` - Root layout where UserNav component will be integrated
- `app/app/page.tsx` - Main page that will require authentication
- `app/components/Dashboard.tsx` - Dashboard component that will be protected
- `app/package.json` - Where next-auth dependency will be added
- `.env` (root) - Will store Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)

### New Files

- `app/auth.ts` - Auth.js configuration with Google provider setup
- `app/middleware.ts` - Middleware to protect authenticated routes
- `app/app/api/auth/[...nextauth]/route.ts` - Auth.js API route handlers
- `app/app/login/page.tsx` - Login page for unauthenticated users
- `app/components/UserNav.tsx` - Navigation component with Sign In/Sign Out functionality
- `app/lib/auth.ts` - Helper functions for session management and auth utilities

## Implementation Plan

### Phase 1: Foundation - Auth.js Setup

Install and configure Auth.js with Google OAuth provider. Set up the core authentication infrastructure including environment variables, auth configuration, and API routes.

### Phase 2: Core Implementation - Authentication Flow

Implement the login page, middleware for route protection, and UserNav component. Configure session management to work in both server and client components.

### Phase 3: Integration - UI Updates

Integrate UserNav into the layout, protect the dashboard route, and ensure seamless authentication flow from login to dashboard access.

## Step by Step Tasks

### 1. Install Auth.js and dependencies

- Navigate to `app/` directory
- Run `npm install next-auth@beta` (v5 is currently in beta)
- Verify installation in `package.json`
- Auth.js v5 is designed specifically for Next.js App Router

### 2. Set up environment variables

- Create or update root `.env` file with Google OAuth credentials:
  ```env
  AUTH_SECRET="<generate-a-secret>"
  GOOGLE_CLIENT_ID="<from-google-cloud-console>"
  GOOGLE_CLIENT_SECRET="<from-google-cloud-console>"
  ```
- Add `.env` to `.gitignore` if not already present
- Document in README.md that developers need to create Google OAuth credentials
- Note: `AUTH_SECRET` can be generated with `openssl rand -base64 32`

### 3. Create Auth.js configuration

- Create `app/auth.ts` file
- Configure Google provider with environment variables
- Set up session strategy (JWT for serverless compatibility)
- Configure callbacks for session and JWT (to include user email and ID)
- Export `auth`, `signIn`, `signOut` functions
- Example structure:
  ```typescript
  import NextAuth from "next-auth"
  import Google from "next-auth/providers/google"

  export const { auth, signIn, signOut, handlers } = NextAuth({
    providers: [Google],
    // ... configuration
  })
  ```

### 4. Create Auth.js API route handlers

- Create directory: `app/app/api/auth/[...nextauth]/`
- Create `route.ts` in that directory
- Import and export `handlers` from `auth.ts`
- This creates the OAuth callback endpoints: `/api/auth/signin`, `/api/auth/callback/google`, etc.
- Example:
  ```typescript
  export { handlers as GET, handlers as POST } from "@/auth"
  ```

### 5. Create authentication middleware

- Create `app/middleware.ts` file
- Import `auth` function from `./auth`
- Protect routes by redirecting unauthenticated users to `/login`
- Allow public access to `/login` and `/api/auth/*` routes
- Use Next.js middleware matcher to specify protected routes
- Example matcher: `matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"]`

### 6. Create login page

- Create `app/app/login/page.tsx`
- Import `signIn` function from `@/auth`
- Create a clean, centered login UI with:
  - "Pick Your Battles" branding
  - Explanation of why sign-in is needed
  - "Sign in with Google" button
  - Use Tailwind CSS matching existing Dashboard styling
- Implement server action to call `signIn("google")`
- Add proper error handling for failed sign-ins

### 7. Create UserNav component

- Create `app/components/UserNav.tsx`
- Use `auth()` to get session on server-side
- Display user email/name and profile picture when authenticated
- Provide "Sign Out" button that calls `signOut()`
- Style with Tailwind CSS to match application theme
- Position in top-right corner for standard UX
- Include subtle avatar/profile display
- Use form action for sign-out (server action pattern)

### 8. Create auth utility functions

- Create `app/lib/auth.ts`
- Add helper functions:
  - `getSession()` - Get current session (server-side)
  - `requireAuth()` - Throw error if not authenticated
  - `getCurrentUser()` - Get current user object
- Export TypeScript types for User and Session
- These utilities will be useful for future database integration

### 9. Integrate UserNav into layout

- Update `app/app/layout.tsx`
- Import and render `<UserNav />` in the layout
- Position it in a header or top-right corner
- Ensure it's visible on all authenticated pages
- Consider wrapping in a `<header>` element for semantic HTML
- Keep layout clean and minimal

### 10. Test authentication flow

- Start dev server: `npm run dev`
- Navigate to root `/` - should redirect to `/login`
- Click "Sign in with Google"
- Complete Google OAuth flow in browser
- Verify redirect back to dashboard after successful authentication
- Verify UserNav shows user info and sign-out button
- Test sign-out functionality - should redirect to `/login`
- Test direct navigation to `/login` when authenticated (should redirect to dashboard)

### 11. Run validation commands

- Execute all validation commands to ensure no regressions
- Verify TypeScript types are correct
- Ensure ESLint passes
- Confirm production build succeeds

## Testing Strategy

### Unit Tests

Since this is authentication infrastructure, unit tests will focus on:
- Auth utility functions in `lib/auth.ts`
  - `getSession()` returns correct session data
  - `requireAuth()` throws when unauthenticated
  - `getCurrentUser()` returns user object
- Mock NextAuth functions for testing
- Test session callback logic

### Edge Cases

- **Unauthenticated access attempts**: User tries to access `/` without signing in → redirected to `/login`
- **Already authenticated user visiting login page**: Should redirect to dashboard
- **OAuth callback failure**: Google OAuth fails or user cancels → show error message on login page
- **Session expiration**: User's session expires while using app → redirect to login
- **Invalid OAuth credentials**: Wrong `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` → show clear error message
- **Missing environment variables**: App starts without OAuth credentials → provide helpful error message
- **Sign out from login page**: User shouldn't see sign-out option on login page
- **Multiple tabs**: User signs out in one tab → other tabs should reflect signed-out state

## Acceptance Criteria

✅ Users can sign in using their Google account via OAuth flow
✅ Unauthenticated users are automatically redirected to `/login` page
✅ Authenticated users can access the dashboard at `/`
✅ UserNav component displays user information (name/email) when authenticated
✅ Users can sign out successfully and are redirected to `/login`
✅ Session data is accessible in both Server Components (via `auth()`) and Client Components (via `useSession()`)
✅ `/login` page has clear branding and Google sign-in button
✅ Middleware properly protects all routes except `/login` and `/api/auth/*`
✅ OAuth callback flow completes successfully without errors
✅ Environment variables are properly configured and documented
✅ All validation commands pass (lint, tsc, build)

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

```bash
# Navigate to app directory
cd app

# Run ESLint
npm run lint

# Run TypeScript type check
npx tsc --noEmit

# Run production build
npm run build

# Manual validation (cannot be automated):
# 1. Start dev server: npm run dev
# 2. Navigate to http://localhost:3000
# 3. Verify redirect to /login
# 4. Click "Sign in with Google"
# 5. Complete Google OAuth flow
# 6. Verify redirect to dashboard with UserNav showing user info
# 7. Click "Sign Out" and verify redirect to /login
# 8. Verify all routes are protected by middleware
```

## Notes

### Auth.js v5 (NextAuth v5)

Auth.js v5 is currently in beta but is the recommended version for Next.js App Router. Key differences from v4:
- Native support for App Router (no React Context needed)
- Simplified configuration
- Better TypeScript support
- Server-first approach with `auth()` function

### Google OAuth Setup

Developers will need to:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google` (development)
6. For production: Add `https://yourdomain.com/api/auth/callback/google`
7. Copy Client ID and Client Secret to `.env` file

### Environment Variables

Required environment variables:
- `AUTH_SECRET`: Secret key for session encryption (generate with `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID`: From Google Cloud Console
- `GOOGLE_CLIENT_SECRET`: From Google Cloud Console

### Future Considerations

1. **Database Integration**: Once Neon PostgreSQL is connected, Auth.js can store sessions and user data in the database instead of JWT
2. **Additional Providers**: Can easily add GitHub, Email, or other OAuth providers
3. **Role-based Access**: Auth.js supports callbacks to add role information to sessions
4. **Account Linking**: Allow users to link multiple auth providers to one account
5. **Email Verification**: For email-based authentication in the future
6. **Session Duration**: Configure session expiration and refresh token rotation
7. **User Profile Page**: Create a dedicated page for user settings and preferences

### Security Considerations

- `AUTH_SECRET` must be kept secure and never committed to version control
- Use HTTPS in production for OAuth callbacks
- Google OAuth credentials should be rotated periodically
- Consider implementing rate limiting for auth endpoints in production
- Session cookies are httpOnly and secure by default with Auth.js

### Documentation Updates

After implementation, update `README.md` with:
- Section on "Authentication Setup"
- Instructions for creating Google OAuth credentials
- Environment variable requirements
- How to run the app with authentication enabled
