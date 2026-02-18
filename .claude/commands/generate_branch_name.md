# Generate Git Branch Name

Based on the `Instructions` below, take the `Variables` follow the `Run` section to generate a concise Git branch name following the specified format. Then follow the `Report` section to report the results of your work.

## Variables

issue_number: $1 (required - the GitHub issue number)

## Instructions

1. **Fetch the GitHub issue:**
   - Use `gh issue view <issue_number> --json number,title,body,labels` to fetch the issue details
   - Extract the issue number, title, body, and labels from the JSON response

2. **Determine the issue class:**
   - Check the issue labels for "bug", "feature", or "chore" keywords
   - If no clear label exists, analyze the issue title and body to classify it:
     - `bug` - fixes, errors, issues, problems
     - `feat` - new features, additions, enhancements
     - `chore` - maintenance, refactoring, documentation, dependencies
   - Default to `feat` if classification is unclear

3. **Generate the adw_id:**
   - Create a timestamp-based ID using: `date +%s` (Unix timestamp in seconds)

4. **Create the concise name:**
   - Extract key words from the issue title
   - Convert to lowercase
   - Replace spaces with hyphens
   - Keep 3-6 words maximum
   - Remove special characters (keep only letters, numbers, and hyphens)
   - Examples:
     - "Add user authentication" → `add-user-auth`
     - "Fix login error on mobile" → `fix-login-error-mobile`
     - "Update dependencies and docs" → `update-dependencies-docs`

5. **Generate the branch name:**
   - Format: `<issue_class>-<issue_number>-<adw_id>-<concise_name>`
   - Examples:
     - `feat-123-1708234567-add-user-auth`
     - `bug-456-1708234890-fix-login-error`
     - `chore-789-1708235123-update-dependencies`

## Run

1. Fetch the GitHub issue and extract details
2. Classify the issue type
3. Generate the adw_id timestamp
4. Create the concise name from the issue title
5. Build the complete branch name
6. Run `git checkout main` to switch to the main branch
7. Run `git fetch origin` to fetch all remote changes
8. Run `git pull origin main` to pull the latest changes from the main branch
9. Run `git checkout -b <branch_name>` to create and switch to the new branch

## Report

After generating and creating the branch:
1. Show the issue title for context
2. Show the generated branch name
3. Confirm the branch was created and checked out successfully