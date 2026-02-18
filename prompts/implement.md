# Implement the Following Plan

Follow the `Instructions` to implement the `Plan`, then `Report` the completed work.

## Instructions

### Before Implementation
- **ALWAYS start by fetching and pulling latest changes:**
  - Run `git fetch origin` to fetch all remote changes
  - Run `git pull origin main` to ensure main is up to date
  - This prevents merge conflicts and ensures you're working with the latest code
- Read the plan carefully. Think hard about the plan, then implement it step by step.
- Extract the `issue_number` from the plan metadata (if available)
- Check if you're on a feature branch:
  - Run `git rev-parse --abbrev-ref HEAD` to get current branch
  - If on `main` or `master`, create a feature branch using `/generate_branch_name <issue_number>`
  - If no issue_number exists, create a descriptive branch name manually

### During Implementation
- Research the codebase for relevant files and existing patterns before writing code.
- Include useful logging for potential error debugging
- **CRITICAL: Write tests for all new code:**
  - For every logic change or new feature, you MUST create or update a corresponding test file
  - **Test files location**: `tests/` directory at project root (NOT inside `app/`)
  - Test file structure should mirror app structure: `app/components/Foo.tsx` → `tests/components/Foo.test.tsx`
  - If no test framework exists (Jest, Vitest), set it up FIRST before writing code
  - Tests must cover:
    - Core functionality and happy paths
    - Edge cases and error handling
    - Integration points with other modules
  - Run `npm test` from project root after writing tests to ensure they pass
  - **DO NOT proceed to commit without passing tests**
- You must check the runtime logs or console output to ensure there are no silent failures or regressions.
- Run all validation commands listed in the plan after implementation.
- If validation fails, analyze the error and fix it. Repeat until all checks pass.

### After Implementation
1. **Commit all changes:**
   - Run `git status` to see all changed and untracked files
   - Run `git diff --stat` to review changes
   - Add all relevant files: `git add <files>`
   - Commit with descriptive message following git conventions
   - Include co-author line: `Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>`

2. **Push the branch:**
   - Run `git push -u origin <branch_name>` to push your feature branch

3. **Open a pull request:**
   - If `issue_number` exists in plan metadata, use `/pull_request <issue_number>`
   - Otherwise, manually create PR with `gh pr create` with descriptive title and body
   - Extract the PR number from the PR URL (e.g., `https://github.com/user/repo/pull/13` → PR #13)

4. **Monitor CI/CD checks and merge:**
   - Use `gh pr view <pr_number> --json statusCheckRollup,mergeable,mergeStateStatus` to check PR status
   - Wait for all status checks to complete:
     - If checks are still running, wait 30 seconds and check again
     - If checks fail:
       - Analyze the failure using `gh pr checks <pr_number>`
       - Fix the errors in your code
       - Commit and push the fixes
       - Return to monitoring checks
     - If checks pass and PR is mergeable:
       - Merge the PR using `gh pr merge <pr_number> --squash --delete-branch`
       - Confirm merge was successful
   - If the PR is blocked for non-check reasons (e.g., review required), report this to the user and wait for their action

## Plan

$ARGUMENTS

## Report

- Summarize the work you've done in a concise bullet point list.
- Report the files and total lines changed with `git diff --stat`.
- List any validation commands that were run and their results.
- Confirm the branch name used
- Provide the pull request URL if created
- Report CI/CD check results and merge status:
  - If checks passed and PR was merged, confirm successful merge
  - If checks failed and were fixed, summarize what was fixed
  - If PR is blocked pending review, notify the user
