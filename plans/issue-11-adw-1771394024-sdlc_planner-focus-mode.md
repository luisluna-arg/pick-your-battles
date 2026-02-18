# Feature: Focus Mode

## Metadata

- **issue_number**: `11`
- **adw_id**: `1771394024`
- **issue_json**:
```json
{
  "title": "Feat. 12: Focus Mode",
  "number": 11,
  "body": "**Goal:** Implement visual task isolation.\n\n**Context:** Help users concentrate on one task by dimming the rest of the UI.\n\n**Tasks:**\n- [ ] Implement a focus toggle for task slots.\n- [ ] Apply visual cues (blur/dim) to non-focused tasks.\n\n**Acceptance Criteria:**\n- Only one task is emphasized at a time when focus is active."
}
```

## Feature Description

Implement a Focus Mode that allows users to visually isolate a single task by dimming and blurring all other tasks. When a user clicks a focus toggle button on a task, that task remains clearly visible while all other tasks (including empty slots) are visually de-emphasized using blur and reduced opacity effects. This helps users concentrate on one task at a time without the distraction of other open tasks, reinforcing the "Pick Your Battles" philosophy of intense focus.

## User Story

As a **user viewing my active tasks on the dashboard**
I want to **activate focus mode on a specific task to visually isolate it**
So that **I can concentrate solely on that task without distraction from other tasks**

## Problem Statement

The current dashboard displays all 3 task slots with equal visual weight. When users want to focus deeply on a single task, the presence of other tasks can be distracting. Users need a way to:
- Temporarily hide or de-emphasize non-relevant tasks
- Maintain awareness of other tasks without them being visually distracting
- Quickly toggle focus mode on and off
- Have only one task focused at a time (mutual exclusivity)

Without focus mode, users may struggle to maintain deep concentration on a single priority task.

## Solution Statement

Add focus mode functionality to the Dashboard and TaskSlot components using client-side React state management. Implement a focus toggle button (icon) on each TaskSlot that, when clicked, activates focus mode for that task. Use Tailwind CSS utilities (`blur`, `opacity`, `grayscale`) to visually de-emphasize unfocused tasks. Store the focused task ID in Dashboard state and pass it to TaskSlot components to determine their visual styling. Only one task can be focused at a time - clicking focus on a different task switches focus, and clicking the already-focused task deactivates focus mode entirely.

## Relevant Files

### Existing Files

- **app/components/Dashboard.tsx** - Main dashboard component (client component)
  - Line 1-78: Already fetches tasks and renders TaskSlots
  - Line 7-10: Current state management (tasks, loading, error)
  - **NEEDS MODIFICATION**: Add focusedTaskId state
  - **NEEDS MODIFICATION**: Add handleFocusToggle function
  - **NEEDS MODIFICATION**: Pass focus props to TaskSlot components
  - Line 69-73: Renders 3 TaskSlot components in grid

- **app/components/TaskSlot.tsx** - Individual task slot component
  - Line 1-51: Displays task or empty slot
  - Line 32-50: Filled slot rendering with status badge
  - **NEEDS MODIFICATION**: Add focus toggle button
  - **NEEDS MODIFICATION**: Apply blur/dim styles when not focused
  - **NEEDS MODIFICATION**: Accept isFocused and onFocusToggle props

- **tests/components/Dashboard.test.tsx** (if exists) - Dashboard tests
  - May need to add or update focus mode tests

- **tests/components/TaskSlot.test.tsx** - TaskSlot tests
  - Line 1-52: Existing tests for empty and filled slots
  - **NEEDS MODIFICATION**: Add tests for focus mode

### New Files

None required - all changes can be made to existing components

## Implementation Plan

### Phase 1: Foundation

Add focus state management to the Dashboard component:
1. Add `focusedTaskId` state (number | null)
2. Add `handleFocusToggle` function to toggle focus
3. Determine when a task is focused vs unfocused

### Phase 2: Core Implementation

Modify TaskSlot to support focus mode:
1. Add focus toggle button (eye icon or similar)
2. Apply conditional Tailwind classes for blur/dim effects
3. Connect to Dashboard's focus state via props

### Phase 3: Integration

Integrate focus mode throughout the UI:
1. Pass focus props from Dashboard to all TaskSlots
2. Ensure only one task can be focused at a time
3. Test all interactions and edge cases

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Add Focus State to Dashboard Component

- Open `app/components/Dashboard.tsx`
- Import `useState` (already imported)
- Add new state after existing state declarations (around line 10):
  ```typescript
  const [focusedTaskId, setFocusedTaskId] = useState<number | null>(null);
  ```
- Add focus toggle handler function (before return statement):
  ```typescript
  const handleFocusToggle = (taskId: number) => {
    setFocusedTaskId((prev) => (prev === taskId ? null : taskId));
  };
  ```
- This function toggles focus: clicking focused task unfocuses, clicking unfocused task focuses it

### 2. Pass Focus Props to TaskSlot Components

- In `Dashboard.tsx`, update TaskSlot rendering (around line 70-72):
  ```typescript
  <TaskSlot
    slotNumber={1}
    task={getTaskForSlot(1)}
    focusedTaskId={focusedTaskId}
    onFocusToggle={handleFocusToggle}
  />
  // Repeat for slots 2 and 3
  ```
- Each TaskSlot now knows which task (if any) is focused and can toggle itself

### 3. Update TaskSlot Props Interface

- Open `app/components/TaskSlot.tsx`
- Update the `TaskSlotProps` interface (around line 3-6):
  ```typescript
  interface TaskSlotProps {
    slotNumber: number;
    task?: Task;
    focusedTaskId?: number | null;
    onFocusToggle?: (taskId: number) => void;
  }
  ```
- Update function signature to destructure new props:
  ```typescript
  export default function TaskSlot({
    slotNumber,
    task,
    focusedTaskId,
    onFocusToggle,
  }: TaskSlotProps) {
  ```

### 4. Add Focus Toggle Button to TaskSlot

- In `TaskSlot.tsx`, determine if this task is focused:
  ```typescript
  const isFocused = task && focusedTaskId === task.id;
  const isFocusMode = focusedTaskId !== null;
  const shouldDim = isFocusMode && !isFocused;
  ```
- Add focus button inside the filled slot (after status badge, around line 36):
  ```typescript
  {task && onFocusToggle && (
    <button
      onClick={() => onFocusToggle(task.id)}
      className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
      aria-label={isFocused ? 'Unfocus task' : 'Focus on this task'}
    >
      {isFocused ? (
        <svg className="h-5 w-5 text-zinc-600 dark:text-zinc-400" /* Eye icon */ />
      ) : (
        <svg className="h-5 w-5 text-zinc-400 dark:text-zinc-500" /* Eye-off icon */ />
      )}
    </button>
  )}
  ```
- Use SVG icons (eye when focused, eye-off when not focused)

### 5. Apply Blur/Dim Effects When Not Focused

- Update the main div className for filled slots to include focus effects:
  ```typescript
  <div className={`flex flex-col rounded-lg border-2 p-6 shadow-sm transition-all ${
    shouldDim
      ? 'border-zinc-200 bg-zinc-50 opacity-40 blur-sm dark:border-zinc-800 dark:bg-zinc-900/30'
      : 'border-zinc-300 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600'
  }`}>
  ```
- This applies blur and opacity when `shouldDim` is true
- Empty slots should also dim during focus mode:
  ```typescript
  <div className={`flex items-center justify-center rounded-lg border-2 border-dashed p-8 shadow-sm transition-all ${
    isFocusMode
      ? 'border-zinc-200 bg-zinc-50/50 opacity-30 blur-sm dark:border-zinc-800 dark:bg-zinc-900/20'
      : 'border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50'
  }`}>
  ```

### 6. Add Unit Tests for Focus Mode in TaskSlot

- Open `tests/components/TaskSlot.test.tsx`
- Add tests for focus functionality:
  ```typescript
  describe('Focus Mode', () => {
    it('calls onFocusToggle when focus button clicked', () => {
      const mockOnFocusToggle = jest.fn();
      const mockTask = {
        id: 1,
        userId: 'user-1',
        title: 'Test Task',
        description: null,
        status: 'pending',
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      render(
        <TaskSlot
          slotNumber={1}
          task={mockTask}
          focusedTaskId={null}
          onFocusToggle={mockOnFocusToggle}
        />
      );

      const focusButton = screen.getByLabelText(/focus on this task/i);
      fireEvent.click(focusButton);

      expect(mockOnFocusToggle).toHaveBeenCalledWith(1);
    });

    it('applies dim styles when another task is focused', () => {
      const mockTask = {
        id: 1,
        userId: 'user-1',
        title: 'Test Task',
        description: null,
        status: 'pending',
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { container } = render(
        <TaskSlot
          slotNumber={1}
          task={mockTask}
          focusedTaskId={2} // Different task is focused
          onFocusToggle={jest.fn()}
        />
      );

      const taskDiv = container.firstChild;
      expect(taskDiv).toHaveClass('opacity-40', 'blur-sm');
    });

    it('does not apply dim styles when this task is focused', () => {
      const mockTask = {
        id: 1,
        userId: 'user-1',
        title: 'Test Task',
        description: null,
        status: 'pending',
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { container } = render(
        <TaskSlot
          slotNumber={1}
          task={mockTask}
          focusedTaskId={1} // This task is focused
          onFocusToggle={jest.fn()}
        />
      );

      const taskDiv = container.firstChild;
      expect(taskDiv).not.toHaveClass('opacity-40', 'blur-sm');
    });

    it('does not apply dim styles when focus mode is off', () => {
      const mockTask = {
        id: 1,
        userId: 'user-1',
        title: 'Test Task',
        description: null,
        status: 'pending',
        position: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { container } = render(
        <TaskSlot
          slotNumber={1}
          task={mockTask}
          focusedTaskId={null} // No focus active
          onFocusToggle={jest.fn()}
        />
      );

      const taskDiv = container.firstChild;
      expect(taskDiv).not.toHaveClass('opacity-40', 'blur-sm');
    });
  });
  ```

### 7. Add Integration Tests for Dashboard Focus Behavior

- Create or update `tests/components/Dashboard.test.tsx`
- Test that only one task can be focused at a time
- Test that clicking a focused task unfocuses it
- Test that clicking a different task switches focus

### 8. Manual Testing

- Start dev server: `npm run dev`
- Login and view dashboard with tasks
- Test focus toggle:
  - Click focus button on Task 1 → Task 1 emphasized, others dimmed
  - Click focus button on Task 2 → Task 2 emphasized, Task 1 and 3 dimmed
  - Click focus button on Task 2 again → All tasks back to normal
  - Click focus with no tasks → verify empty slots also dim properly
- Verify visual effects:
  - Check blur effect is applied
  - Check opacity reduction is visible
  - Check focus button icon changes (eye vs eye-off)
- Test edge cases:
  - Focus with only 1 task present
  - Focus with all 3 slots filled
  - Focus with empty slots

### 9. Run All Validation Commands

- From app directory:
  - `npm run lint` - ESLint check
  - `npx tsc --noEmit` - TypeScript type check
  - `npm test` - Run test suite (all tests must pass)
  - `npm run build` - Production build (must succeed)

## Testing Strategy

### Unit Tests

**TaskSlot Component**:
- Renders focus button when task and onFocusToggle provided
- Calls onFocusToggle with correct taskId when clicked
- Applies dim/blur styles when another task is focused
- Does not apply dim/blur when this task is focused
- Does not apply dim/blur when focus mode is inactive
- Shows correct icon (eye vs eye-off) based on focus state
- Empty slots dim during focus mode

**Dashboard Component**:
- Focus state initializes as null (no focus)
- handleFocusToggle activates focus on a task
- handleFocusToggle deactivates focus when same task clicked again
- handleFocusToggle switches focus when different task clicked
- Passes correct focusedTaskId to all TaskSlot components

### Edge Cases

- User focuses a task then that task is completed/deleted (focus should clear)
- User focuses an empty slot (should not be possible - button only on filled slots)
- Multiple rapid clicks on focus button (debouncing not required for MVP)
- Focus state persists or clears on task data refresh (currently clears - acceptable)
- Keyboard navigation for focus button (a11y consideration)
- Screen reader announces focus state changes (aria-label provided)

## Acceptance Criteria

✅ Focus toggle button appears on each filled task slot
✅ Clicking focus button on a task activates focus mode for that task
✅ Only one task can be focused at a time (mutual exclusivity)
✅ Clicking focus button on already-focused task deactivates focus mode
✅ Unfocused tasks are visually de-emphasized (blur + reduced opacity)
✅ Empty slots are also dimmed during focus mode
✅ Focus button shows different icon for focused vs unfocused state
✅ Focus state is managed in Dashboard and passed to TaskSlots via props
✅ All existing functionality continues to work (no regressions)
✅ Unit tests cover focus toggle behavior and visual states
✅ All validation commands pass with zero errors
✅ Manual testing confirms focus mode works as expected

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

```bash
# Navigate to app directory
cd app

# Run linter
npm run lint

# Run TypeScript type check
npx tsc --noEmit

# Run test suite (all tests must pass)
npm test

# Run production build
npm run build
```

**Manual Validation**:
1. Start dev server: `npm run dev`
2. Login and view dashboard with tasks
3. Click focus button on first task → verify others dim/blur
4. Click focus button on second task → verify focus switches
5. Click focus button on focused task → verify all tasks return to normal
6. Test with 1, 2, and 3 tasks present
7. Verify empty slots also dim during focus mode
8. Verify focus button icon changes (eye vs eye-off)
9. Test keyboard navigation (tab to button, enter to click)

## Notes

### Design Decisions

**Focus State Location**: Stored in Dashboard component (parent) rather than in each TaskSlot. This ensures only one task can be focused at a time and makes state management clearer.

**Visual Effects**: Using Tailwind utilities for simplicity:
- `blur-sm` - subtle blur effect (not too strong)
- `opacity-40` - 40% opacity for dimmed tasks
- `transition-all` - smooth transitions between states
- Alternative: Could use `grayscale` for additional de-emphasis

**Icon Choice**: Eye icon represents "focus on this" (looking at it), eye-off represents "not focused". Could alternatively use:
- Target/crosshair icon for focus
- Pin icon for "pin to focus"
- Star icon for "highlight"

### Accessibility

- Focus button has `aria-label` describing current state
- Button is keyboard accessible (native button element)
- Consider adding `aria-live` region to announce focus changes
- Ensure blur/dim doesn't make text completely unreadable for low vision users

### Future Enhancements

1. **Persistent Focus**: Save focus state to localStorage or user preferences
2. **Keyboard Shortcuts**: Press 'F' to toggle focus on selected task
3. **Focus Timer**: Track how long user focuses on each task (analytics)
4. **Focus Lock**: Prevent task switching while in focus mode (deep work)
5. **Animations**: Smooth zoom/scale effect when focusing
6. **Focus History**: Show which tasks were focused recently
7. **Multi-device Sync**: Sync focus state across devices via database
8. **Focus Sounds**: Optional audio cue when entering/exiting focus mode

### Related Issues

- **Issue #1**: Project Scaffolding (created Dashboard and TaskSlot components)
- **Issue #10**: Dynamic Task Constraint (task limit enforcement)
- **Issue #12**: Task Completion Logic (completing focused task should clear focus)

### Dependencies

No new dependencies required. Using existing:
- `react` - useState for state management
- `tailwindcss` - CSS utilities for blur/dim effects
- Heroicons or similar for icon SVGs (can use inline SVGs if needed)

### CSS Classes Reference

**Blur/Dim Effect** (unfocused):
```css
opacity-40        /* 40% opacity */
blur-sm           /* 4px blur */
transition-all    /* Smooth transitions */
```

**Normal State** (focused or no focus mode):
```css
opacity-100       /* Full opacity (default) */
blur-none         /* No blur (default) */
```

**Focus Button**:
```css
rounded p-1                              /* Button padding and rounding */
hover:bg-zinc-100 dark:hover:bg-zinc-800 /* Hover effect */
```

### Performance Considerations

- Focus state is local (not persisted to database) so no API calls needed
- CSS blur effect is GPU-accelerated (performant)
- State updates are minimal (single number or null)
- No performance concerns for 3 task slots

### Browser Compatibility

- CSS `blur()` filter: Supported in all modern browsers
- `opacity`: Universal support
- Tailwind `transition-all`: Uses CSS transitions (universal support)

No compatibility issues expected.
