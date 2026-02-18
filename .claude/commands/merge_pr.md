# Merge Pull Request

Based on the `Instructions` below, take the `Variables` follow the `Run` section to monitor CI/CD checks and merge a pull request. Then follow the `Report` section to report the results of your work.

## Variables

pr_number: $1 (required - the pull request number)
merge_method: $2 (optional - "squash", "merge", or "rebase", defaults to "squash")

## Instructions

1. **Check PR status:**
   - Use `gh pr view <pr_number> --json statusCheckRollup,mergeable,mergeStateStatus,state` to get current status
   - Extract the check statuses and mergeable state

2. **Monitor CI/CD checks:**
   - If checks are still running (status: PENDING or IN_PROGRESS):
     - Wait 30 seconds
     - Check status again
     - Repeat until checks complete
   - If any checks fail (status: FAILURE or ERROR):
     - Use `gh pr checks <pr_number>` to see detailed failure information
     - Analyze the error messages
     - Report the failures to the user with details
     - Ask if they want you to attempt fixes

3. **Handle check failures:**
   - If instructed to fix:
     - Checkout the PR branch: `gh pr checkout <pr_number>`
     - Analyze and fix the errors
     - Commit the fixes with descriptive message
     - Push the fixes: `git push`
     - Return to step 2 (monitor checks again)

4. **Verify PR is mergeable:**
   - Check that all required checks have passed
   - Verify there are no merge conflicts
   - Confirm PR state is "OPEN"
   - If blocked for other reasons (review required, conflicts), report to user

5. **Merge the PR:**
   - If all checks pass and PR is mergeable:
     - Merge using: `gh pr merge <pr_number> --<merge_method> --delete-branch`
     - Confirm merge was successful
   - If blocked, explain why and wait for user action

## Run

1. Fetch PR status using `gh pr view <pr_number> --json statusCheckRollup,mergeable,mergeStateStatus,state`
2. Monitor checks:
   - While checks are pending: wait 30 seconds, then check again
   - If checks fail: show details with `gh pr checks <pr_number>`
   - If checks pass: proceed to merge
3. Verify PR is mergeable (no conflicts, no blocking reviews)
4. Merge the PR with specified method (default: squash)
5. Delete the feature branch after successful merge
6. Checkout main and pull latest changes

## Report

After processing the PR:
1. Show the PR number and title
2. Report check status (passed/failed/pending)
3. If checks failed, list the failing checks and error messages
4. If merged, confirm successful merge and show merge commit
5. If blocked, explain what's blocking the merge (review required, conflicts, etc.)
