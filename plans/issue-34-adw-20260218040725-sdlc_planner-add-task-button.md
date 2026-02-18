# Bug: Missing "Add Task" button in Dashboard UI

## Metadata

issue_number: `34`
adw_id: `20260218040725`
issue_json: `{"body":"**Goal:** Ensure users have a visible and functional way to create new tasks within the dashboard.\n\n**Context:**\nThe core functionality of the application is currently blocked because the UI does not provide a button or input to trigger the task creation flow. Even though the backend logic might be ready, the user has no entry point to add their tasks.\n\n**Tasks:**\n- [ ] Implement an \"Add Task\" button or action element within the dashboard slots.\n- [ ] Connect the UI element to the task creation service.\n- [ ] Ensure the button respects the \"active tasks\" limit.\n\n**Acceptance Criteria:**\n- A clear, accessible button to add tasks is visible on the root page.\n- Clicking the button allows the user to successfully create a task.\n- The button is only available to authenticated users.","number":34,"title":"Bug: Missing \"Add Task\" button in Dashboard UI"}`

## Bug Description

The dashboard displays 3 task slots but empty slots only show static "Empty Slot N" text with no interactive element. There is no button, form, or any UI entry point to create a task. The `POST /api/tasks` backend endpoint is fully implemented and functional, but the frontend never calls it — making it impossible for users to add any tasks.

**Expected behavior:** Empty task slots show an "Add Task" button. Clicking it reveals an inline form to enter a task title and submit it.
**Actual behavior:** Empty slots are purely decorative. No task creation is possible from the UI.

## Problem Statement

`TaskSlot` renders empty slots as a static placeholder with no interactivity. `Dashboard` has no handler for creating tasks and never calls `POST /api/tasks`. The UI is entirely disconnected from the task creation backend.

## Solution Statement

1. Extend `TaskSlot` with an `onAddTask` callback prop. When the slot is empty and `onAddTask` is provided, render an "Add Task" button. Clicking it toggles an inline form with a title input field and a Submit button.
2. In `Dashboard`, implement `handleAddTask(position, title)` that calls `POST /api/tasks` and refreshes the task list on success. Pass it as `onAddTask` to each `TaskSlot`.
3. Limit enforcement is handled naturally: the button only appears on empty slots. If all slots are filled, no button is shown. The API also enforces `maxTasks` and returns a 400 if the limit is exceeded.

## Steps to Reproduce

1. Sign in to the application
2. Observe the dashboard — 3 empty slots are shown with "Empty Slot 1/2/3" text
3. There is no button, link, or input to create a task anywhere on the page

## Root Cause Analysis

The `TaskSlot` component (`app/components/TaskSlot.tsx`) only renders static content for empty slots — no action element was ever implemented. The `Dashboard` component (`app/components/Dashboard.tsx`) fetches and displays tasks but has no `handleAddTask` function and never calls `POST /api/tasks`. The backend route exists and is ready; the gap is entirely in the UI layer.

## Relevant Files

Use these files to fix the bug:

- **`app/components/TaskSlot.tsx`** — Root cause location. The empty slot render path needs an "Add Task" button and an inline form. A new optional `onAddTask?: (position: number, title: string) => Promise<void>` prop must be added.
- **`app/components/Dashboard.tsx`** — Needs a `handleAddTask` async function that calls `POST /api/tasks`, then re-fetches tasks on success. Must pass `onAddTask={handleAddTask}` to each `TaskSlot`.
- **`app/app/api/tasks/route.ts`** — Read-only reference. The `POST` handler already accepts `{ title, position, description?, status? }` and enforces `maxTasks`. No changes needed.

### New Files

- **`tests/components/Dashboard.test.tsx`** — New test file for Dashboard add-task flow: mocks `fetch`, verifies `POST /api/tasks` is called with correct payload, and that the task list is refreshed.

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### Step 1: Update TaskSlot to support Add Task interaction

- Open `app/components/TaskSlot.tsx`
- Add `onAddTask?: (position: number, title: string) => Promise<void>` to the `TaskSlotProps` interface
- Add local state inside the component: `isAdding` (boolean, default false) and `newTitle` (string, default '')
- In the empty slot render path:
  - When `!isAdding`: show an "Add Task" button (+ icon or text) that sets `isAdding = true` on click. Only render this button when `onAddTask` is provided.
  - When `isAdding`: replace the empty slot content with an inline form:
    - A text input for the task title (autofocus, placeholder "Task title...")
    - A "Add" submit button
    - A "Cancel" button that resets `isAdding = false` and `newTitle = ''`
    - On form submit: call `await onAddTask(slotNumber, newTitle.trim())`, then reset `isAdding = false` and `newTitle = ''`
    - Disable submit when `newTitle.trim()` is empty
- Style consistently with the existing Tailwind design (zinc color palette, rounded, border)

### Step 2: Update Dashboard to handle task creation

- Open `app/components/Dashboard.tsx`
- Add a `handleAddTask` async function:
  ```typescript
  const handleAddTask = async (position: number, title: string) => {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, position }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to create task');
    }
    // Re-fetch tasks to update the UI
    const updated = await fetch('/api/tasks');
    if (updated.ok) {
      const data = await updated.json();
      setTasks(data);
    }
  };
  ```
- Pass `onAddTask={handleAddTask}` to each of the three `TaskSlot` components

### Step 3: Add tests for the Add Task flow in TaskSlot

- Open `tests/components/TaskSlot.test.tsx`
- Add a new `describe('Add Task')` block with:
  - `renders Add Task button on empty slot when onAddTask provided` — render with no task and `onAddTask={jest.fn()}`, assert button with text "+ Add Task" is present
  - `does not render Add Task button when onAddTask not provided` — render with no task and no `onAddTask`, assert button is absent
  - `shows inline form when Add Task button clicked` — click the button, assert title input and submit button appear
  - `calls onAddTask with correct position and title on submit` — fill input, click submit, assert mock called with `(slotNumber, title)`
  - `disables submit when title is empty` — assert submit button is disabled when input is blank
  - `cancel hides the form` — click cancel, assert form is gone and button returns

### Step 4: Add Dashboard tests for the add task flow

- Create `tests/components/Dashboard.test.tsx`
- Mock `fetch` globally in `beforeEach`
- Test cases:
  - `calls POST /api/tasks and refreshes task list on add` — mock GET returning `[]`, mock POST returning a new task, mock second GET returning the new task, trigger `handleAddTask`, assert POST was called with correct body and tasks state updated
  - `handleAddTask throws on API error` — mock POST returning 400 with `{ error: 'Task limit reached...' }`, assert the error propagates so `TaskSlot` can display it

### Step 5: Run validation commands

- Run all commands listed in the Validation Commands section

## Validation Commands

Execute every command to validate the bug is fixed with zero regressions.

- `npm run lint` - Run ESLint to validate code quality
- `npx tsc --noEmit` - Run TypeScript type check to validate no type errors
- `npm test` - Run test suite to validate the bug is fixed with zero regressions
- `npm run build` - Run production build to validate the bug is fixed with zero regressions

## Notes

- The `POST /api/tasks` endpoint requires `title` (string) and `position` (number). `description` and `status` are optional (defaulting to `null` and `'pending'`).
- Task limit enforcement is done server-side — if the user's `maxTasks` is already reached the API returns `400 { error: "Task limit reached..." }`. The `TaskSlot` inline form should surface this error to the user.
- The `position` field maps directly to the slot number (1, 2, or 3). Since we only show empty-slot Add buttons, a task can only be added to an unoccupied position.
- No changes are needed to the API, auth, DB layer, or middleware.
