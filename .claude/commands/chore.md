# Chore Planning

Create a new plan to resolve the `Chore` using the exact specified markdown `Plan Format`. Follow the `Instructions` to create the plan use the `Relevant Files` to focus on the right files. Follow the `Report` section to properly report the results of your work.

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

- IMPORTANT: You're writing a plan to resolve a chore based on the `Chore` that will add value to the application.
- IMPORTANT: The `Chore` describes the chore that will be resolved but remember we're not resolving the chore, we're creating the plan that will be used to resolve the chore based on the `Plan Format` below.
- You're writing a plan to resolve a chore, it should be simple but we need to be thorough and precise so we don't miss anything or waste time with any second round of changes.
- Create the plan in the `plans/` directory with filename: `issue-{issue_number}-adw-{adw_id}-sdlc_planner-{descriptive-name}.md`
  - Replace `{descriptive-name}` with a short, descriptive name based on the chore (e.g., "update-readme", "fix-tests", "refactor-auth")
- Use the plan format below to create the plan.
- Research the codebase and put together a plan to accomplish the chore.
- IMPORTANT: Replace every <placeholder> in the `Plan Format` with the requested value. Add as much detail as needed to accomplish the chore.
- Use your reasoning model: THINK HARD about the plan and the steps to accomplish the chore.
- Respect requested files in the `Relevant Files` section.
- Start your research by reading the `README.md` file.
- `adws/*.ts` contain TypeScript scripts for AI Developer Workflows.
- When you finish creating the plan for the chore, follow the `Report` section to properly report the results of your work.

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
# Chore: <chore name>

## Metadata

issue_number: `{issue_number}`
adw_id: `{adw_id}`
issue_json: `{issue_json}`

## Chore Description

<describe the chore in detail>

## Relevant Files

Use these files to resolve the chore:

<find and list the files that are relevant to the chore describe why they are relevant in bullet points. If there are new files that need to be created to accomplish the chore, list them in an h3 'New Files' section.>

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

<list step by step tasks as h3 headers plus bullet points. use as many h3 headers as needed to accomplish the chore. Order matters, start with the foundational shared changes required to fix the chore then move on to the specific changes required to fix the chore.>

**Testing requirement for chores:**
- If the chore involves code changes in `app/` (not just docs/config), tests are REQUIRED
- If no test framework exists and code is being modified, add a step to set up Jest/Vitest in project root
- Write or update tests in `tests/` directory to cover any code changes in `app/`
- Test file structure mirrors app: `app/lib/utils.ts` → `tests/lib/utils.test.ts`
- Run `npm test` from root to ensure all tests pass
- Your last step should be running all `Validation Commands`

## Validation Commands

Execute every command to validate the chore is complete with zero regressions.

<list commands you'll use to validate with 100% confidence the chore is complete with zero regressions. every command must execute without errors so be specific about what you want to run to validate the chore is complete with zero regressions. Don't validate with curl commands.>

- `npm run lint` - Run ESLint to validate code quality
- `npx tsc --noEmit` - Run TypeScript type check to validate no type errors
- `npm test` - Run test suite to validate the chore is complete with zero regressions
- `npm run build` - Run production build to validate the chore is complete with zero regressions

## Notes

<optionally list any additional notes or context that are relevant to the chore that will be helpful to the developer>
```

## Chore

Extract the chore details from the `issue_json` variable (parse the JSON and use the title and body fields).

## Report

After creating the plan file:

1. **Commit the plan to main branch:**
   - Run `git add plans/issue-{issue_number}-adw-{adw_id}-*.md`
   - Commit with message: `docs: Add implementation plan for <chore name>`
   - Include co-author line: `Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>`
   - Push to main: `git push origin main`
   - Plan files are documentation/evidence and should be in main before implementation begins

2. **Return the plan file path:**
   - IMPORTANT: Return exclusively the path to the plan file created and nothing else

## Implementation

After the plan is approved, implement it using this git workflow:

1. **Sync with main:**
   - `git fetch origin && git pull origin main`

2. **Generate and create a branch:**
   - Use `/generate_branch_name` to get a branch name for this issue
   - `git checkout -b <branch-name>`

3. **Implement the chore on the branch:**
   - Follow the Step by Step Tasks in the plan
   - Commit changes on the branch (NOT on main)

4. **Push the branch:**
   - `git push -u origin <branch-name>`

5. **Open a Pull Request:**
   - Use `/pull_request` to open a PR from the branch to main
