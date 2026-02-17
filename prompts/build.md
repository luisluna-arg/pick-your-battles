# Build: Quick Patch Workflow

A fast, single-pass workflow for small changes that don't need a full plan.

## Task

$ARGUMENTS

## Instructions

1. **Research** — find the relevant files and understand the current behavior.
2. **Implement** — make the change with minimal, surgical edits.
3. **Validate** — run all project validation commands:
   - [Replace with your commands, e.g.:]
   - `uv run ruff check .`
   - `uv run pytest`
   - `bun tsc --noEmit`
   - `bun run build`
4. **Fix** — if validation fails, analyze and fix. Repeat until clean.
5. **Commit** — `git add . && git commit -m "fix: [descriptive message]"`

## Report

- What was changed and why.
- Files modified with `git diff --stat`.
- Validation results.
