# Feature Planning

Create a new plan in `specs/*.md` to implement the `Feature` using the exact specified markdown `Plan Format`. Follow the `Instructions` and use the `Relevant Files` to focus on the right files.

## Instructions

- You're writing a plan to implement a net-new feature.
- Research the codebase to understand existing patterns and integration points.
- IMPORTANT: Replace every `<placeholder>` in the `Plan Format` with the requested value.
- Use your reasoning model: THINK HARD about requirements and architecture.
- Start your research by reading `CLAUDE.md`.

## Relevant Files

- [Add paths to files relevant to this type of work]

## Plan Format

```markdown
# Feature: <feature name>

## Feature Description
<describe the feature in detail>

## User Story
As a <type of user>
I want to <action/goal>
So that <benefit/value>

## Requirements
- <requirement 1>
- <requirement 2>

## Relevant Files
<list files to read, modify, or create>

## Implementation Plan

### Phase 1: Foundation
<setup, data models, configuration>

### Phase 2: Core Implementation
<main feature logic>

### Phase 3: Integration
<wire into existing codebase, UI, API>

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. <first task>
- <detail>

### 2. <second task>
- <detail>

## Testing Strategy
- Unit tests: <scenarios>
- Integration tests: <scenarios>
- E2E tests: <scenarios, if applicable>

## Validation Commands
Execute every command to validate the work is complete with zero regressions.

- `[your test command]`
- `[your lint command]`
- `[your build command]`

## Acceptance Criteria
- [ ] <criterion 1>
- [ ] <criterion 2>
- [ ] All tests pass
- [ ] No regressions
```

## Feature

$ARGUMENTS
