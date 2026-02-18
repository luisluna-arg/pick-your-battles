# Plan: Generate Technical Specification

Create a technical plan for the following task. Research the codebase first, then write a detailed plan to `specs/`.

## Task

$ARGUMENTS

## Instructions

- Research the codebase to understand existing patterns, relevant files, and conventions.
- Read `CLAUDE.md` and `README.md` for project context.
- Use your reasoning model: THINK HARD about the approach.
- Determine if this is a **chore**, **bug**, or **feature** and structure accordingly.
- Write the plan to `plans/[descriptive-name].md`.

## Plan Structure

```markdown
# [Task Title]

## Description
[What needs to be done and why]

## Relevant Files
[Files that will be read or modified]

## Step by Step Tasks
[Ordered list of implementation steps]

## Validation Commands
[Commands to verify the work is complete with zero regressions]
```

## Output

Return the file path of the generated plan so it can be passed to `/implement`.
