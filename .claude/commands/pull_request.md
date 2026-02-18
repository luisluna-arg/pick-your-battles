# Create Pull Request

Based on the `Instructions` below, take the `Variables` follow the `Run` section to create a pull request. Then follow the `Report` section to report the results of your work.

## Variables

issue_number: $1 (required - the GitHub issue number)
plan_file: $2 (optional - path to the implementation plan file, defaults to `plans/issue-<issue_number>.md`)

## Instructions

1. **Fetch the GitHub issue:**
   - Use `gh issue view <issue_number> --json number,title,body,labels` to fetch the issue details
   - Extract the issue number, title, body, and labels from the JSON response

2. **Get current branch information:**
   - Use `git rev-parse --abbrev-ref HEAD` to get the current branch name
   - Extract the adw_id from the branch name (format: `<type>-<issue>-<adw_id>-<name>`)
   - If branch doesn't follow the format, generate adw_id using `date +%s`

3. **Determine the issue type:**
   - Check the issue labels for "bug", "feature", or "chore" keywords
   - If no clear label exists, analyze the issue title and body to classify it:
     - `bug` - fixes, errors, issues, problems
     - `feat` - new features, additions, enhancements
     - `chore` - maintenance, refactoring, documentation, dependencies
   - Default to `feat` if classification is unclear

4. **Review the changes:**
   - Run `git diff origin/main...HEAD --stat` to see changed files summary
   - Run `git log origin/main..HEAD --oneline` to see commits
   - Run `git diff origin/main...HEAD --name-only` to list all changed files

5. **Generate PR title:**
   - Format: `<issue_type>: #<issue_number> - <issue_title>`
   - Examples:
     - `feat: #123 - Add user authentication`
     - `bug: #456 - Fix login validation error`
     - `chore: #789 - Update dependencies`

6. **Generate PR body:**
   - Include the following sections:
     ```markdown
     ## Summary
     Closes #<issue_number>

     [Brief description from issue or plan]

     ## Implementation
     - [Key change 1]
     - [Key change 2]
     - [Key change 3]

     ## Plan
     Implementation plan: [Link to plan file if exists]

     ## Testing
     - [Testing performed]

     ## Metadata
     - ADW ID: `<adw_id>`
     - Issue: #<issue_number>

     🤖 Generated with [Claude Code](https://claude.com/claude-code)
     ```

## Run

1. Fetch the GitHub issue using `gh issue view`
2. Get the current branch name using `git rev-parse --abbrev-ref HEAD`
3. Extract or generate the adw_id
4. Classify the issue type from labels or content
5. Review the changes:
   - `git diff origin/main...HEAD --stat`
   - `git log origin/main..HEAD --oneline`
   - `git diff origin/main...HEAD --name-only`
6. Generate the PR title and body with:
   - Issue summary and context
   - Key implementation changes
   - Link to plan file (if provided or if exists at default path)
   - Testing notes
   - Metadata (ADW ID, issue number)
7. Push the branch: `git push -u origin <branch_name>`
8. Create the PR: `gh pr create --title "<pr_title>" --body "<pr_body>" --base main`

## Report

After creating the pull request:
1. Show the PR title
2. Show the PR URL
3. Confirm it references the correct issue