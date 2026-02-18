# Chore: Implement GitHub Action for CI Test Automation

## Metadata

- **issue_number**: `18`
- **adw_id**: `1771379214`
- **issue_json**:
```json
{
  "title": "Chore 3: Implement GitHub Action for CI Test Automation",
  "number": 18,
  "body": "**Goal:** Automate the execution of unit tests on pull requests and merges to maintain code integrity.\n\n**Context:**\nTo ensure no regressions are introduced into the main branch, we need a Continuous Integration (CI) pipeline. This workflow will automatically run the Jest test suite whenever a contributor opens a PR or pushes code to the main branch.\n\n**Tasks:**\n- [ ] Create a .github/workflows/ci.yml file.\n- [ ] Configure the workflow to trigger on pull_request and push to the main branch.\n- [ ] Set up the job environment with Node.js and caching for npm dependencies.\n- [ ] Implement steps for: npm install and npm test.\n\n**Acceptance Criteria:**\n- GitHub Actions automatically starts a run when a PR is opened.\n- Merges to the main branch trigger a validation run.\n- Pull requests show a \"passed\" or \"failed\" status based on test results, acting as a gatekeeper.\n\n**Technical Details:**\n- Ensure environment variables required for the build (if any) are mocked or handled in the test environment to avoid workflow failure."
}
```

## Chore Description

Implement a GitHub Actions CI/CD pipeline to automatically run unit tests on pull requests and pushes to the main branch. This ensures code integrity by preventing regressions and provides automated validation before code is merged. The workflow will execute the Jest test suite, run linting and TypeScript checks, and report pass/fail status directly on pull requests.

## Relevant Files

### Existing Files

- `app/package.json` - Contains test scripts (`test`, `test:watch`, `test:coverage`) that CI will execute
- `package.json` (root) - Contains Jest dependencies that CI will install
- `jest.config.js` - Jest configuration that CI will use
- `jest.setup.js` - Test setup file with mocks for Next.js and Auth.js
- `tests/` directory - Test files that CI will execute

### New Files

- `.github/workflows/ci.yml` - GitHub Actions workflow configuration for continuous integration

## Step by Step Tasks

### 1. Create GitHub workflows directory

- Create `.github/workflows/` directory structure at project root
- This is the standard location for GitHub Actions workflows
- Directory must be at root level, not inside `app/`

### 2. Create CI workflow file

- Create `.github/workflows/ci.yml` file
- This YAML file defines the entire CI pipeline
- Name the workflow "CI" for clarity in GitHub Actions UI

### 3. Configure workflow triggers

- Set up triggers for:
  - `pull_request` - Run on all PR events (opened, synchronized, reopened)
  - `push` to `main` branch - Run when code is merged to main
- This ensures tests run before and after merging

### 4. Set up Node.js environment

- Use `actions/setup-node@v4` action
- Set Node.js version to match development environment (22.x based on current usage)
- Configure npm caching using `actions/setup-node` built-in cache
- This speeds up CI runs by caching `node_modules`

### 5. Install root-level dependencies

- Run `npm ci` at project root to install Jest and testing dependencies
- Use `npm ci` instead of `npm install` for faster, reproducible builds
- This installs dependencies from `package-lock.json` at root

### 6. Install app-level dependencies

- Change directory to `app/`
- Run `npm ci` to install Next.js and application dependencies
- This installs dependencies from `app/package-lock.json`

### 7. Run linting

- Execute `npm run lint` from `app/` directory
- Fails the build if ESLint finds errors
- Ensures code quality standards

### 8. Run TypeScript type check

- Execute `npx tsc --noEmit` from `app/` directory
- Fails the build if TypeScript finds type errors
- Ensures type safety

### 9. Run test suite

- Execute `npm test` from `app/` directory
- Jest will run all tests in `tests/` directory
- Fails the build if any test fails
- Shows test results in GitHub Actions logs

### 10. Run production build

- Execute `npm run build` from `app/` directory
- Ensures the application can build successfully
- Catches build-time errors before deployment

### 11. Set up environment variables for CI

- Configure environment variables in the workflow:
  - `AUTH_SECRET` - Mock value for testing
  - `GOOGLE_CLIENT_ID` - Mock value for testing
  - `GOOGLE_CLIENT_SECRET` - Mock value for testing
- These are already mocked in `jest.setup.js` but needed for build step
- Use GitHub Actions `env` block to set these

### 12. Test the workflow locally (optional)

- If `act` (GitHub Actions local runner) is installed, test locally
- Otherwise, push to a branch and create a test PR
- Verify all steps execute successfully

### 13. Run validation commands

- Once workflow is created, validate it works by creating a test PR
- Ensure all checks pass
- Verify status is reported on PR

## Validation Commands

Execute every command to validate the chore is complete with zero regressions.

```bash
# Validate YAML syntax
cat .github/workflows/ci.yml | grep -v "^#" | head -50

# Validate workflow file exists and is properly formatted
test -f .github/workflows/ci.yml && echo "✓ CI workflow file exists"

# Run the same commands CI will run to ensure they work locally
cd app

# Run lint (as CI will)
npm run lint

# Run TypeScript check (as CI will)
npx tsc --noEmit

# Run tests (as CI will)
npm test

# Run build (as CI will)
npm run build

# Manual validation (cannot be automated):
# 1. Push branch to GitHub
# 2. Create a test pull request
# 3. Verify GitHub Actions workflow starts automatically
# 4. Check that all jobs complete successfully
# 5. Verify PR shows green checkmark with "All checks have passed"
```

All local validation commands must execute without errors. Final validation requires creating a test PR on GitHub to confirm the workflow triggers and runs correctly.

## Notes

### GitHub Actions Workflow Structure

The workflow should follow this general structure:

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22.x'
          cache: 'npm'

      - name: Install root dependencies
        run: npm ci

      - name: Install app dependencies
        run: npm ci
        working-directory: ./app

      - name: Run linter
        run: npm run lint
        working-directory: ./app

      - name: Run TypeScript check
        run: npx tsc --noEmit
        working-directory: ./app

      - name: Run tests
        run: npm test
        working-directory: ./app
        env:
          AUTH_SECRET: test-secret
          GOOGLE_CLIENT_ID: test-client-id
          GOOGLE_CLIENT_SECRET: test-client-secret

      - name: Build application
        run: npm run build
        working-directory: ./app
        env:
          AUTH_SECRET: test-secret
          GOOGLE_CLIENT_ID: test-client-id
          GOOGLE_CLIENT_SECRET: test-client-secret
```

### Key Configuration Decisions

1. **Node.js Version**: Using 22.x to match development environment
2. **Caching Strategy**: Using `actions/setup-node` built-in npm caching
3. **Install Command**: Using `npm ci` for faster, reproducible builds
4. **Working Directory**: Using `working-directory` for app commands
5. **Environment Variables**: Mocking auth credentials for test/build steps

### Environment Variables

The following environment variables are needed:
- `AUTH_SECRET` - Already mocked in jest.setup.js, but needed for build
- `GOOGLE_CLIENT_ID` - Already mocked in jest.setup.js, but needed for build
- `GOOGLE_CLIENT_SECRET` - Already mocked in jest.setup.js, but needed for build

These are set in the workflow file for test and build steps. No secrets needed in GitHub Settings since these are just mock values for testing.

### CI/CD Best Practices

1. **Fail Fast**: Steps are ordered to fail quickly (lint → type check → test → build)
2. **Caching**: npm cache speeds up subsequent runs
3. **Matrix Testing**: Could add multiple Node.js versions if needed (not required now)
4. **Artifacts**: Could upload test coverage reports (future enhancement)
5. **Status Checks**: PR will show green/red status based on workflow result

### Future Enhancements

1. **Coverage Reports**: Upload coverage to Codecov or Coveralls
2. **Matrix Testing**: Test on multiple Node.js versions
3. **Deployment**: Add deployment step after tests pass
4. **Notifications**: Slack/Discord notifications on failure
5. **Performance**: Add performance regression testing
6. **Security**: Add dependency vulnerability scanning

### Troubleshooting

**If workflow fails with "Module not found":**
- Ensure both root and app dependencies are installed
- Check that `npm ci` runs in correct directories

**If workflow fails with "Command not found":**
- Verify commands use correct `working-directory`
- Check that scripts exist in `app/package.json`

**If workflow doesn't trigger:**
- Verify `.github/workflows/` directory is at repository root
- Check YAML syntax is valid
- Ensure branch protection rules don't block workflows

**If tests fail in CI but pass locally:**
- Check environment variables are set correctly
- Verify Node.js versions match
- Look for race conditions in tests

### GitHub Actions Features Used

- `actions/checkout@v4` - Checks out repository code
- `actions/setup-node@v4` - Sets up Node.js environment with caching
- `working-directory` - Runs commands in specific directories
- `env` - Sets environment variables for steps
- `on: pull_request` - Triggers on PR events
- `on: push: branches: [main]` - Triggers on main branch pushes

### Testing the Workflow

To test the workflow after creating it:

1. Create a new branch
2. Make a small change (e.g., update README)
3. Push the branch
4. Open a pull request
5. GitHub Actions should automatically start
6. Check the "Actions" tab to see workflow progress
7. PR should show status check (green checkmark or red X)
8. Click "Details" to see full workflow logs

### Status Check Requirements

After this is set up, consider adding branch protection rules:
- Require "CI" status check to pass before merging
- This prevents broken code from reaching main
- Configure in: Settings → Branches → Branch protection rules
