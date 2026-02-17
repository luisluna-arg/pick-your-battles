# Bug Planning

Create a new plan in `specs/*.md` to fix the `Bug` using the exact specified markdown `Plan Format`. Follow the `Instructions` and use the `Relevant Files` to focus on the right files.

## Instructions

- Research the codebase to understand the bug's context and root cause.
- IMPORTANT: Replace every `<placeholder>` in the `Plan Format` with the requested value.
- Use your reasoning model: THINK HARD about root cause analysis.
- Start your research by reading `CLAUDE.md`.

## Relevant Files

- [Add paths to files relevant to this type of work]

## Plan Format

```markdown
# Bug: <bug name>

## Problem Statement
<clearly define the specific problem>

## Steps to Reproduce
<list exact steps to reproduce the bug>

## Root Cause Analysis
<analyze and explain the root cause>

## Solution
<describe the fix approach>

## Relevant Files
<list files to read or modify>

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. <first task>
- <detail>

### 2. <second task>
- <detail>

## Validation Commands
Execute every command to validate the bug is fixed with zero regressions.

- `[your test command]`
- `[your lint command]`

<If the bug affects UI or user interactions:>
- Create an E2E test to prevent regression.
```

## Bug

$ARGUMENTS
