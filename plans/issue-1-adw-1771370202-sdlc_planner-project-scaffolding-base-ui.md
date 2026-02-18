# Feature: Project Scaffolding & Base UI

## Metadata

- **issue_number**: `1`
- **adw_id**: `1771370202`
- **issue_json**:
```json
{
  "title": "Issue 1: Project Scaffolding & Base UI",
  "number": 1,
  "body": "**Goal:** Set up the foundation with Next.js using the App Router and Tailwind CSS.\n\n**Context:** We need the App Router to leverage server components and modern features, ensuring a clean boilerplate for the app layout.\n\n**Tasks:**\n- [ ] Run npx create-next-app@latest with App Router and Tailwind options.\n- [ ] Clean up default Next.js boilerplate (styles/globals.css and page.tsx).\n- [ ] Create the main Dashboard layout with 3 empty visual slots (placeholders).\n- [ ] Verify dev server runs on localhost:3000.\n\n**Acceptance Criteria:**\n- Next.js dev server starts without errors.\n- Tailwind classes work correctly.\n- The UI displays 3 distinct areas for tasks."
}
```

## Context

This is the foundational feature that bootstraps the entire Pick Your Battles application. Currently, the repository contains development tooling (ADW scripts, slash commands) and documentation, but no Next.js application exists. The `app/` directory needs to be created from scratch.

This feature sets up the technical foundation (Next.js with App Router, Tailwind CSS, TypeScript) and creates the initial Dashboard UI that will serve as the main interface for the task management system. The Dashboard must display 3 distinct visual areas representing the default task slots, reinforcing the core concept of the application: focus on a limited number of tasks.

## Feature Description

Initialize the Next.js application with App Router and Tailwind CSS, then create a clean Dashboard layout with 3 visual placeholders representing task slots. This establishes the technical foundation and core UI structure for the task management application.

## User Story

As a **developer**
I want to **have a Next.js application with App Router and Tailwind CSS configured**
So that **I can build the Pick Your Battles task management interface with modern React patterns and rapid styling**

## Problem Statement

The Pick Your Battles repository currently has no application code - only development tooling and documentation exist. Without a bootstrapped Next.js application, no features can be implemented or deployed. The project needs a clean, modern frontend foundation that supports:
- Server components via Next.js App Router
- Rapid UI development via Tailwind CSS
- TypeScript for type safety
- Clear visual representation of the 3-task limit concept

## Solution Statement

Use `create-next-app` to scaffold a Next.js application with App Router, Tailwind CSS, and TypeScript support. Remove default boilerplate and create a minimal Dashboard component that displays 3 empty task slot placeholders. This provides a clean starting point that visually demonstrates the core constraint of the application while establishing conventions for future development.

## Relevant Files

### Existing Files
- `README.md` - Contains project overview, tech stack details, and directory structure expectations
- `CLAUDE.md` - Defines conventions (TypeScript, ESLint, testing requirements, file size limits)
- `.gitignore` - May need updates to exclude Next.js build artifacts

### New Files

All files will be created in the new `app/` directory:

**Next.js Configuration:**
- `app/package.json` - Next.js dependencies and scripts
- `app/tsconfig.json` - TypeScript configuration for Next.js
- `app/next.config.js` - Next.js configuration (if needed)
- `app/tailwind.config.ts` - Tailwind CSS configuration
- `app/postcss.config.js` - PostCSS configuration for Tailwind

**Application Structure:**
- `app/app/layout.tsx` - Root layout with HTML structure and metadata
- `app/app/page.tsx` - Dashboard page displaying 3 task slots
- `app/app/globals.css` - Global styles with Tailwind directives

**Components:**
- `app/components/Dashboard.tsx` - Main dashboard component with 3 task slot placeholders
- `app/components/TaskSlot.tsx` - Individual task slot placeholder component

## Implementation Plan

### Phase 1: Foundation - Next.js Scaffolding

1. Run `create-next-app` with App Router, Tailwind CSS, and TypeScript options
2. Configure the application to follow project conventions (ESLint, TypeScript strict mode)
3. Clean up default boilerplate (remove unnecessary files, simplify default content)
4. Verify the dev server starts and Tailwind works with a simple test

### Phase 2: Core Implementation - Dashboard UI

1. Create the Dashboard component with a clean, centered layout
2. Implement TaskSlot component as a reusable placeholder
3. Render exactly 3 TaskSlot components in the Dashboard
4. Style with Tailwind to create clear visual distinction between slots
5. Add basic responsive design for mobile and desktop

### Phase 3: Integration - Connect to Root

1. Update the root page (`app/page.tsx`) to render the Dashboard
2. Configure root layout with proper metadata (title, description)
3. Test the complete application flow from root to Dashboard
4. Verify all Tailwind classes render correctly

## Step by Step Tasks

### 1. Bootstrap Next.js Application

- Navigate to project root directory (`D:\_dev\pick-your-battles`)
- Run `npx create-next-app@latest app --typescript --tailwind --app --no-src-dir --import-alias "@/*"`
  - This creates the app in an `app/` directory
  - Enables TypeScript
  - Enables Tailwind CSS
  - Uses App Router
  - No separate `src/` directory
  - Import alias configured as `@/*`
- Accept defaults for ESLint configuration

### 2. Clean Up Default Boilerplate

- Remove or simplify `app/app/page.tsx` (remove all default Next.js demo content)
- Simplify `app/app/globals.css` (keep only Tailwind directives and essential global styles)
- Remove `app/public/vercel.svg` and other unnecessary demo assets
- Update `app/app/layout.tsx` metadata to reflect "Pick Your Battles" branding

### 3. Create TaskSlot Component

- Create `app/components/TaskSlot.tsx`
- Design as a simple placeholder with:
  - Border or background to show visual boundaries
  - Empty state with text like "Task Slot {number}"
  - Tailwind classes for consistent sizing and spacing
  - TypeScript props for slot number
- Keep it minimal - this is just a placeholder for now

### 4. Create Dashboard Component

- Create `app/components/Dashboard.tsx`
- Render exactly 3 TaskSlot components
- Use flexbox or grid layout to arrange slots vertically or in a grid
- Add a header with "Pick Your Battles" title
- Add subtitle explaining the 3-task limit
- Center the dashboard on the page
- Make it responsive for mobile (stack vertically) and desktop (could be horizontal or grid)

### 5. Integrate Dashboard into Root Page

- Update `app/app/page.tsx` to import and render the Dashboard component
- Keep the page component simple - just render the Dashboard
- Verify the page route `/` displays the Dashboard correctly

### 6. Verify Development Server

- Run `cd app && npm run dev`
- Open `http://localhost:3000` in browser
- Verify:
  - Server starts without errors
  - Dashboard renders with 3 distinct task slots
  - Tailwind classes apply correctly (styles render)
  - Page is responsive on mobile and desktop viewports
- Take a screenshot or note the visual layout for documentation

### 7. Run Validation Commands

- Execute all validation commands from the `app/` directory:
  - `npm run lint` - ESLint check
  - `npx tsc --noEmit` - TypeScript type check
  - `npm run build` - Production build test
- Fix any errors that arise
- Ensure all commands pass with zero errors

## Testing Strategy

### Unit Tests

Since this is initial scaffolding focused on visual layout, unit tests are minimal:
- Verify Dashboard component renders without crashing
- Verify Dashboard renders exactly 3 TaskSlot components
- Verify TaskSlot accepts and displays slot number prop

Note: Full testing infrastructure (Jest, React Testing Library) may need to be added. For now, focus on ensuring TypeScript compilation and build succeed.

### Manual Testing

- Visual inspection: 3 task slots are clearly visible and distinct
- Responsive behavior: Layout adapts properly to mobile and desktop
- Tailwind styling: All utility classes render correctly
- Navigation: Root route `/` displays the Dashboard
- Console: No errors in browser console or terminal

### Edge Cases

- Very small mobile screens (320px width) - slots should stack without overflow
- Very large desktop screens (4K) - content should remain centered and readable
- Browser compatibility - test in Chrome, Firefox, Safari

## Acceptance Criteria

✅ Next.js application is created in the `app/` directory with App Router and TypeScript
✅ Tailwind CSS is configured and working (utility classes render styles)
✅ Development server starts without errors (`npm run dev`)
✅ Dashboard component displays exactly 3 distinct, visible task slot placeholders
✅ Root route `/` renders the Dashboard
✅ All validation commands pass with zero errors (lint, tsc, build)
✅ UI is responsive on both mobile and desktop viewports
✅ Code follows project conventions (TypeScript annotations, ESLint compliance)

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions:

```bash
# Navigate to app directory
cd app

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
# Manual check: Open http://localhost:3000 and verify Dashboard with 3 task slots displays

# Run linter
npm run lint

# Run TypeScript type check
npx tsc --noEmit

# Run production build
npm run build

# Optional: Start production server to verify build works
npm start
# Manual check: Open http://localhost:3000 and verify production build works
```

All commands must execute without errors.

## Notes

### Future Considerations

1. **Testing Infrastructure**: This initial scaffolding does not include Jest or React Testing Library. A future task should set up the testing framework and add comprehensive tests.

2. **E2E Testing**: The feature plan template mentions E2E tests (`.claude/commands/e2e/`), but that directory doesn't exist yet. Consider adding Playwright or Cypress in a follow-up task to test user interactions.

3. **Component Library**: TaskSlot is currently a simple placeholder. Future iterations will need interactive components (add task, complete task, delete task buttons).

4. **State Management**: This initial implementation has no state management. Future features will need to handle task state (likely React hooks or a more robust solution like Zustand/Redux).

5. **Database Integration**: The Neon PostgreSQL database mentioned in the tech stack is not connected yet. This will be needed for persisting tasks.

6. **Authentication**: No user authentication is implemented. Future features may require user accounts to save personal task lists.

### Import Alias Configuration

The `create-next-app` command configures `@/*` as an import alias, allowing:
```typescript
import { Dashboard } from '@/components/Dashboard'
```
instead of:
```typescript
import { Dashboard } from '../components/Dashboard'
```

Use this alias consistently throughout the codebase.

### Directory Structure After Implementation

```
app/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Dashboard page
│   └── globals.css         # Global styles
├── components/
│   ├── Dashboard.tsx       # Main dashboard with 3 slots
│   └── TaskSlot.tsx        # Individual task slot placeholder
├── public/
│   └── (assets)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
└── .eslintrc.json
```

### Tailwind Configuration

Ensure `tailwind.config.ts` includes all necessary content paths:
```typescript
content: [
  './app/**/*.{js,ts,jsx,tsx,mdx}',
  './components/**/*.{js,ts,jsx,tsx,mdx}',
]
```

This ensures Tailwind purges unused styles correctly in production builds.
