# Feature Planning

Create a new plan to implement the `Feature` using the exact specified markdown `Plan Format`. Follow the `Instructions` to create the plan use the `Relevant Files` to focus on the right files.

## Variables

issue_number: $1
adw_id: (auto-generated from timestamp)

## Fetch Issue Data

Before creating the plan, fetch the issue details using gh CLI:

```bash
gh issue view {issue_number} --json title,body,number
```

Store the result as `issue_json` to use throughout the plan.

## Instructions

- IMPORTANT: You're writing a plan to implement a net new feature based on the `Feature` that will add value to the application.
- IMPORTANT: The `Feature` describes the feature that will be implemented but remember we're not implementing a new feature, we're creating the plan that will be used to implement the feature based on the `Plan Format` below.
- Create the plan in the `plans/` directory with filename: `issue-{issue_number}-adw-{adw_id}-sdlc_planner-{descriptive-name}.md`
  - Replace `{descriptive-name}` with a short, descriptive name based on the feature (e.g., "add-auth-system", "implement-search", "create-dashboard")
- Use the `Plan Format` below to create the plan.
- Research the codebase to understand existing patterns, architecture, and conventions before planning the feature.
- IMPORTANT: Replace every <placeholder> in the `Plan Format` with the requested value. Add as much detail as needed to implement the feature successfully.
- Use your reasoning model: THINK HARD about the feature requirements, design, and implementation approach.
- Follow existing patterns and conventions in the codebase. Don't reinvent the wheel.
- Design for extensibility and maintainability.
- If you need a new library, use `npm install` and be sure to report it in the `Notes` section of the `Plan Format`.
- IMPORTANT: If the feature includes UI components or user interactions:
  - Add a task in the `Step by Step Tasks` section to create a separate E2E test file in `.claude/commands/e2e/test_<descriptive_name>.md` based on examples in that directory
  - Add E2E test validation to your Validation Commands section
  - IMPORTANT: When you fill out the `Plan Format: Relevant Files` section, add an instruction to read `.claude/commands/test_e2e.md`, and `.claude/commands/e2e/test_basic_query.md` to understand how to create an E2E test file. List your new E2E test file to the `Plan Format: New Files` section.
  - To be clear, we're not creating a new E2E test file, we're creating a task to create a new E2E test file in the `Plan Format` below
- Respect requested files in the `Relevant Files` section.
- Start your research by reading the `README.md` file.

## Relevant Files

Focus on the following files:

- `README.md` - Contains the project overview and instructions.
- `app/**` - Contains the Next.js application (routes, pages, API routes).
- `app/components/**` - Contains React components.
- `app/lib/**` - Contains utility functions and shared logic.
- `adws/**` - Contains the AI Developer Workflow (ADW) TypeScript scripts.

- Read `.claude/commands/conditional_docs.md` to check if your task requires additional documentation
- If your task matches any of the conditions listed, include those documentation files in the `Plan Format: Relevant Files` section of your plan

Ignore all other files in the codebase.

## Plan Format

```md
# Feature: <feature name>

## Metadata

issue_number: `{issue_number}`
adw_id: `{adw_id}`
issue_json: `{issue_json}`

## Feature Description

<describe the feature in detail, including its purpose and value to users>

## User Story

As a <type of user>
I want to <action/goal>
So that <benefit/value>

## Problem Statement

<clearly define the specific problem or opportunity this feature addresses>

## Solution Statement

<describe the proposed solution approach and how it solves the problem>

## Relevant Files

Use these files to implement the feature:

<find and list the files that are relevant to the feature describe why they are relevant in bullet points. If there are new files that need to be created to implement the feature, list them in an h3 'New Files' section.>

## Implementation Plan

### Phase 1: Foundation

<describe the foundational work needed before implementing the main feature>

### Phase 2: Core Implementation

<describe the main implementation work for the feature>

### Phase 3: Integration

<describe how the feature will integrate with existing functionality>

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

<list step by step tasks as h3 headers plus bullet points. use as many h3 headers as needed to implement the feature. Order matters, start with the foundational shared changes required then move on to the specific implementation.>

**CRITICAL: Include testing as explicit steps:**
- If no test framework exists, add a step EARLY in the plan to set up Jest/Vitest
- After implementing each major piece of functionality, add a step to write tests for it
- Tests should be written DURING implementation, not after
- **Test files location**: `tests/` directory at project root (mirrors `app/` structure)
- Example structure:
  - Step 1: Set up test framework in project root (if needed)
  - Step 2-4: Implement core functionality in `app/`
  - Step 5: Write unit tests in `tests/` for core functionality (REQUIRED)
  - Step 6-8: Implement additional features in `app/`
  - Step 9: Write unit tests in `tests/` for additional features (REQUIRED)
  - Step 10: Run all validation commands including `npm test` from root

<If the feature affects UI, include a task to create a E2E test file (like `.claude/commands/e2e/test_basic_query.md` and `.claude/commands/e2e/test_complex_query.md`) as one of your early tasks. That e2e test should validate the feature works as expected, be specific with the steps to demonstrate the new functionality. We want the minimal set of steps to validate the feature works as expected and screen shots to prove it if possible.>

<Your last step should be running the `Validation Commands` to validate the feature works correctly with zero regressions.>

## Testing Strategy

### Unit Tests

<describe unit tests needed for the feature>

### Edge Cases

<list edge cases that need to be tested>

## Acceptance Criteria

<list specific, measurable criteria that must be met for the feature to be considered complete>

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

<list commands you'll use to validate with 100% confidence the feature is implemented correctly with zero regressions. every command must execute without errors so be specific about what you want to run to validate the feature works as expected. Include commands to test the feature end-to-end.>

<If you created an E2E test, include the following validation step: `Read .claude/commands/test_e2e.md`, then read and execute your new E2E `.claude/commands/e2e/test_<descriptive_name>.md` test file to validate this functionality works.>

- `npm run lint` - Run ESLint to validate code quality
- `npx tsc --noEmit` - Run TypeScript type check to validate no type errors
- `npm test` - Run test suite to validate the feature works with zero regressions
- `npm run build` - Run production build to validate the feature works with zero regressions

## Notes

<optionally list any additional notes, future considerations, or context that are relevant to the feature that will be helpful to the developer>
```

## Feature

Extract the feature details from the `issue_json` variable (parse the JSON and use the title and body fields).

## Report

After creating the plan file:

1. **Commit the plan to main branch:**
   - Run `git add plans/issue-{issue_number}-adw-{adw_id}-*.md`
   - Commit with message: `docs: Add implementation plan for <feature name>`
   - Include co-author line: `Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>`
   - Push to main: `git push origin main`
   - Plan files are documentation/evidence and should be in main before implementation begins

2. **Return the plan file path:**
   - IMPORTANT: Return exclusively the path to the plan file created and nothing else

## Implementation

After creating the plan, immediately implement it — do not wait for user confirmation. Use this git workflow:

1. **Sync with main:**
   - `git fetch origin && git pull origin main`

2. **Generate and create a branch:**
   - Use `/generate_branch_name` to get a branch name for this issue
   - `git checkout -b <branch-name>`

3. **Implement the feature on the branch:**
   - Follow the Step by Step Tasks in the plan
   - Commit changes on the branch (NOT on main)

4. **Push the branch:**
   - `git push -u origin <branch-name>`

5. **Open a Pull Request:**
   - Use `/pull_request` to open a PR from the branch to main

6. **Wait for checks and merge:**
   - Run `gh pr checks <pr_number>` and wait until all checks pass
   - Merge: `gh pr merge <pr_number> --squash --delete-branch`
   - Pull main: `git checkout main && git pull origin main`

7. **Close the issue:**
   - `gh issue close <issue_number>`
