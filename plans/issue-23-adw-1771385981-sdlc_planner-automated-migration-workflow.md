# Feature: Automated Migration Workflow with Error Reporting

## Metadata

issue_number: `23`
adw_id: `1771385981`
issue_json: `{"body":"**Goal:** Implement a CI/CD pipeline that automatically executes database migrations on every deployment and generates a Bug Issue if the process fails.\n\n**Context:**\n\nTo ensure the database schema is always in sync with the application code, migrations must run as part of the deployment flow. \n\nAutomating this reduces manual errors, and auto-creating a bug issue ensures that any schema mismatch is tracked and fixed immediately.\n\n**Tasks:**\n- [ ] Create a GitHub Action workflow triggered by successful merges or deployments to main.\n- [ ] Configure the workflow to run the migration command.\n- [ ] Implement a conditional step using the GitHub CLI that triggers only if the migration step fails.\n- [ ] Ensure the generated Bug Issue includes the workflow run link and the error log summary.\n\n**Acceptance Criteria:**\n- Database migrations run automatically after every deployment.\n- If migrations succeed, the deployment continues without interruption.\n- If migrations fail, a new Issue is automatically created in the repository with the label bug and a descriptive title.\n\n**Technical Details:**\n- Database connection string is stored as a repository secret called DATABASE_URL in GitHub Secrets.\n- Ensure the migration command is idempotent to avoid issues with repeated runs.","number":23,"title":"Feature 13: Automated Migration Workflow with Error Reporting"}`

## Feature Description

Implement an automated CI/CD pipeline that executes database migrations on every deployment to main. The workflow will ensure database schema stays in sync with application code automatically. If migrations fail, the system will automatically create a GitHub Issue with the bug label, including the workflow run link and error log summary for immediate tracking and resolution.

This feature eliminates manual migration steps during deployment, reduces human error, and ensures schema issues are immediately visible and tracked in the project's issue tracker.

## User Story

As a **developer deploying to production**
I want **database migrations to run automatically on every deployment**
So that **the database schema stays in sync with the application code without manual intervention, and migration failures are immediately tracked as bug issues**

## Problem Statement

Currently, database migrations must be run manually during deployment, which creates several problems:

1. **Manual Error Risk**: Developers might forget to run migrations after deploying code changes that require schema updates, leading to runtime errors
2. **Silent Failures**: Migration failures during manual execution might not be immediately noticed or tracked
3. **Delayed Response**: When migrations do fail, there's no automatic notification or issue tracking, delaying the response time
4. **Schema Drift**: Different environments (staging, production) might have different schema states if migrations aren't consistently applied
5. **Deployment Complexity**: Manual migration steps add complexity and time to the deployment process

The application already has migration infrastructure (Drizzle ORM, migration scripts) but lacks automation and failure tracking.

## Solution Statement

Create a dedicated GitHub Actions workflow (`migrate.yml`) that:

1. **Triggers automatically** on every push to the main branch (after PR merges or direct commits)
2. **Runs database migrations** using the existing `app/lib/db/migrate.ts` script with DATABASE_URL from GitHub Secrets
3. **Detects failures** using exit codes from the migration script
4. **Auto-creates bug issues** using GitHub CLI when migrations fail, including:
   - Descriptive title indicating migration failure
   - Workflow run URL for easy debugging
   - Error log summary captured from the migration step
   - Automatic `bug` label for issue tracking

The solution leverages existing infrastructure (Drizzle migrations are already idempotent) and integrates seamlessly with the current CI/CD pipeline. The workflow will run independently of the existing `ci.yml` workflow to avoid blocking PR checks, but will block deployment if migrations fail on main.

## Relevant Files

Use these files to implement the feature:

**Existing Files:**

- **`.github/workflows/ci.yml`** - Current CI workflow for reference on workflow structure, Node.js setup, and environment configuration patterns
- **`app/lib/db/migrate.ts`** - Existing migration runner script that will be executed by the new workflow. Already handles errors and exits with code 1 on failure
- **`app/drizzle.config.ts`** - Drizzle configuration showing migration folder location (`./lib/db/migrations`)
- **`app/package.json`** - Contains `db:migrate` script that uses `dotenv-cli` and `tsx` to run migrations with environment variables
- **`DATABASE_SETUP.md`** - Documentation about database setup and migration process (will need updates to reflect automated workflow)
- **`README.md`** - Main project documentation (may need updates to mention automated migrations)

### New Files

- **`.github/workflows/migrate.yml`** - New GitHub Actions workflow for automated database migrations on deployment to main

## Implementation Plan

### Phase 1: Foundation

Set up the GitHub Actions workflow infrastructure for automated migrations:
- Create the workflow file structure
- Configure triggers for main branch pushes
- Set up Node.js environment matching the application requirements (Node 22.x)
- Configure environment variables and secrets

### Phase 2: Core Implementation

Implement the migration execution logic:
- Add steps to install dependencies (root and app)
- Execute the migration script using the existing `app/lib/db/migrate.ts`
- Configure DATABASE_URL from GitHub Secrets
- Capture migration output and error logs
- Handle success and failure cases

### Phase 3: Integration

Integrate failure reporting with GitHub Issues:
- Add conditional step that triggers only on migration failure
- Use GitHub CLI (`gh`) to create bug issues automatically
- Include workflow run URL and error summary in the issue body
- Apply the `bug` label automatically
- Test the complete workflow end-to-end

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Research Existing Workflow Patterns

- Read `.github/workflows/ci.yml` to understand:
  - Node.js setup (version, caching)
  - Dependency installation patterns
  - Environment variable configuration
  - Working directory structure
- Read `app/lib/db/migrate.ts` to understand:
  - How migrations are executed
  - Exit codes on success (0) and failure (1)
  - Error message format
- Read `app/package.json` to verify the `db:migrate` script command

### 2. Create Migration Workflow File

- Create `.github/workflows/migrate.yml`
- Configure workflow name: "Database Migrations"
- Set trigger: `push` to `main` branch only
- Add workflow_dispatch for manual triggering (useful for testing)
- Configure `jobs.migrate` with `runs-on: ubuntu-latest`

### 3. Set Up Node.js Environment

- Add checkout step using `actions/checkout@v4`
- Add Node.js setup using `actions/setup-node@v4`:
  - Node version: '22.x' (match ci.yml)
  - Enable npm caching for faster runs
- Add step to install root dependencies: `npm ci`
- Add step to install app dependencies: `npm ci` in `./app` directory

### 4. Execute Database Migrations

- Add migration step:
  - Name: "Run database migrations"
  - Working directory: `./app`
  - Command: `npm run db:migrate`
  - Environment: `DATABASE_URL: ${{ secrets.DATABASE_URL }}`
  - Use `id: migrate` to reference this step later
  - Allow step to fail so the workflow continues to issue creation: `continue-on-error: true`

### 5. Implement Failure Detection and Issue Creation

- Add conditional step that runs only if migration fails:
  - Condition: `if: steps.migrate.outcome == 'failure'`
  - Name: "Create bug issue on migration failure"
  - Use GitHub CLI (`gh`) to create an issue:
    - Title: "Database migration failed on deployment"
    - Body template:
      ```markdown
      ## Migration Failure

      Database migrations failed during automated deployment to main.

      **Workflow Run:** ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}

      **Commit:** ${{ github.sha }}

      **Error:** See workflow logs for details

      **Action Required:** Investigate and fix the migration issue immediately.
      ```
    - Labels: `bug`
    - Environment: `GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}`

### 6. Add Workflow Exit Step

- Add final step to fail the workflow if migrations failed:
  - Condition: `if: steps.migrate.outcome == 'failure'`
  - Command: `exit 1`
  - This ensures the workflow reports failure status on GitHub

### 7. Update Documentation

- Update `DATABASE_SETUP.md`:
  - Add section "## Automated Migrations in CI/CD"
  - Document that migrations run automatically on push to main
  - Explain that failed migrations create bug issues automatically
  - Note that DATABASE_URL must be configured in GitHub Secrets
- Update `README.md` if needed to mention automated database migrations

### 8. Write Unit Tests (If Applicable)

Note: GitHub Actions workflows are typically tested via execution rather than unit tests. The testing approach will be:
- Manual workflow execution via workflow_dispatch
- Monitoring actual deployments to main
- Intentionally triggering failures to test bug issue creation

No traditional unit tests are needed for this feature, but validation steps below will thoroughly test the workflow.

### 9. Run Validation Commands

Execute all validation commands to ensure no regressions:
- Run linter: `npm run lint` from `app/` directory
- Run TypeScript check: `npx tsc --noEmit` from `app/` directory
- Run test suite: `npm test` from `app/` directory
- Run production build: `npm run build` from `app/` directory

## Testing Strategy

### Manual Testing

Since this feature is a GitHub Actions workflow, testing requires execution in the GitHub Actions environment:

**Test Case 1: Successful Migration**
1. Trigger workflow manually via Actions tab → Database Migrations → Run workflow
2. Verify workflow completes successfully
3. Check workflow logs to confirm migration ran
4. Verify no bug issue was created

**Test Case 2: Failed Migration (Simulated)**
1. Temporarily modify `app/lib/db/migrate.ts` to force a failure (throw error)
2. Commit and push to a test branch
3. Merge to main or manually trigger workflow
4. Verify workflow fails with appropriate error
5. Check that a bug issue was automatically created with:
   - Title: "Database migration failed on deployment"
   - Label: `bug`
   - Body includes workflow run URL
6. Revert the temporary failure code

**Test Case 3: Workflow Trigger on PR Merge**
1. Create a feature branch with any change
2. Create and merge PR to main
3. Verify migrate workflow triggers automatically
4. Confirm migrations run successfully

### Edge Cases

1. **Missing DATABASE_URL Secret**
   - Expected: Workflow fails, but gracefully reports missing secret
   - Test: Temporarily remove DATABASE_URL from GitHub Secrets

2. **Database Connection Timeout**
   - Expected: Migration script times out, workflow creates bug issue
   - Test: Use invalid DATABASE_URL temporarily

3. **Idempotency Check**
   - Expected: Running migrations multiple times doesn't cause errors
   - Test: Trigger workflow multiple times in succession with no schema changes

4. **Concurrent Workflow Runs**
   - Expected: Multiple pushes to main queue workflow runs sequentially
   - Test: Push multiple commits rapidly to main

5. **Empty Migrations Folder**
   - Expected: Migration succeeds with "No migrations to run" message
   - Test: Current state (no migrations generated yet)

## Acceptance Criteria

✅ **Automated Execution**: Database migrations run automatically on every push to main branch

✅ **Success Path**: When migrations succeed, workflow completes successfully without creating issues

✅ **Failure Detection**: When migrations fail, workflow detects the failure via exit code

✅ **Automatic Bug Creation**: Failed migrations automatically create a GitHub Issue with:
- Label: `bug`
- Title: "Database migration failed on deployment"
- Body includes workflow run URL for debugging
- Body includes error context (commit SHA)

✅ **Workflow Status**: Workflow reports failure status on GitHub when migrations fail (blocks deployment visibility)

✅ **Idempotency**: Migration script handles repeated runs gracefully (Drizzle migrations are idempotent by design)

✅ **Documentation Updated**: DATABASE_SETUP.md reflects automated migration process

✅ **No Regressions**: All existing tests pass, linting passes, TypeScript compiles, production build succeeds

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

```bash
# Navigate to app directory
cd app

# Validate code quality
npm run lint

# Validate TypeScript types
npx tsc --noEmit

# Validate tests pass
npm test

# Validate production build
npm run build

# Navigate back to root
cd ..

# Validate workflow file syntax (if yamllint is available)
yamllint .github/workflows/migrate.yml || echo "yamllint not available, skipping YAML validation"

# Manual validation (execute after implementation):
# 1. Push this branch to GitHub
# 2. Merge to main
# 3. Check Actions tab for "Database Migrations" workflow
# 4. Verify workflow runs and completes successfully
# 5. Create a test branch that forces migration failure
# 6. Merge test branch to main
# 7. Verify workflow fails and bug issue is auto-created
# 8. Verify bug issue contains workflow run URL and appropriate labels
```

**Critical Manual Tests:**

After committing the workflow file:

1. **Test successful migration path:**
   ```bash
   # Trigger workflow via GitHub UI: Actions → Database Migrations → Run workflow
   # Expected: Workflow succeeds, no issue created
   ```

2. **Test failure path (requires temporary code change):**
   ```bash
   # Modify app/lib/db/migrate.ts to throw an error
   # Commit and push to main
   # Expected: Workflow fails, bug issue auto-created with workflow run URL
   # Revert the test change
   ```

## Notes

### GitHub Secrets Configuration

Before the workflow can run, ensure `DATABASE_URL` is configured in GitHub repository secrets:

1. Navigate to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `DATABASE_URL`
4. Value: Your Neon PostgreSQL connection string
5. Click "Add secret"

The workflow uses `${{ secrets.DATABASE_URL }}` to access this value securely without exposing it in logs.

### Migration Idempotency

Drizzle ORM migrations are idempotent by design:
- Each migration file is tracked in a `__drizzle_migrations` table
- Already-applied migrations are skipped automatically
- Running migrations multiple times is safe and will not cause duplicate schema changes

This satisfies the requirement from the issue that "the migration command is idempotent."

### Workflow Execution Timing

The workflow triggers on `push` to `main`, which means:
- It runs AFTER PRs are merged (not during PR validation)
- It runs in parallel with other workflows (like `ci.yml`)
- It represents the deployment state of main branch
- Failed migrations block deployment confidence but don't prevent the merge (already happened)

### Alternative Approach: Vercel Integration

For production deployments on Vercel, consider:
- Vercel doesn't natively support pre-deployment migration hooks
- This workflow provides visibility but doesn't block Vercel deployments
- For stricter control, consider:
  - Running migrations as part of Vercel build command
  - Using Vercel's "Deploy Hooks" to trigger migrations before build
  - Implementing a pre-deploy webhook that runs migrations first

For now, this GitHub Actions approach provides automated execution and issue tracking, which satisfies the acceptance criteria.

### Future Enhancements

Potential improvements for future iterations:

1. **Slack/Discord Notifications**: Send real-time alerts when migrations fail
2. **Rollback Strategy**: Implement automatic rollback on migration failure
3. **Migration Approval**: Add manual approval step for production migrations
4. **Migration Dry Run**: Add a step that validates migrations before applying them
5. **Performance Metrics**: Track migration execution time and report in issues
6. **Schema Diff**: Include schema diff in bug issues to show what changed

### Relationship to Existing Workflows

The new `migrate.yml` workflow complements the existing `ci.yml` workflow:

- **ci.yml**: Runs on PRs and main pushes, validates code quality (lint, types, tests, build)
- **migrate.yml**: Runs only on main pushes, executes database schema changes

Both workflows run independently and can succeed/fail independently. This separation ensures:
- PR checks don't require database access (faster feedback)
- Migration failures don't block PR merges (already validated by ci.yml)
- Database operations are isolated to deployment events only
