# Chore: Setup Jest and React Testing Library

## Metadata

- **issue_number**: `17`
- **adw_id**: `1771378405`
- **issue_json**:
```json
{
  "title": "Chore 2: Setup Jest and React Testing Library",
  "number": 17,
  "body": "**Goal:** Implement a robust unit testing framework to ensure the reliability of the core logic and UI components.\n\n**Context:**\nAs the project grows in logic, we need an automated way to verify that new changes don't break existing functionality. We'll use Jest for the runner and React Testing Library for component testing.\n\n**Tasks:**\n- [ ] Install Jest, React Testing Library, and necessary dependencies.\n- [ ] Configure jest.config.js and jest.setup.js for Next.js and App Router compatibility.\n- [ ] Add test and test:watch scripts to package.json.\n- [ ] Create a sample test for a basic utility function or component to verify the setup.\n\n**Acceptance Criteria:**\n- Running npm test executes the test suite successfully.\n- The environment correctly handles TypeScript and Tailwind CSS classes in tests.\n- CI-ready output for future automation.\n- The `root/tests` path should be ready to add new unit tests in the future\n\n**Technical Details:**\n- Ensure the configuration supports Next.js Server Components.\n- Mock the database and authentication providers to keep unit tests isolated and fast."
}
```

## Chore Description

Set up a robust unit testing framework using Jest as the test runner and React Testing Library for component testing. This establishes the foundation for automated testing to ensure new changes don't break existing functionality. The setup must be compatible with Next.js 16 App Router, support TypeScript and Tailwind CSS, handle Server Components, and provide mocking capabilities for Auth.js authentication.

## Relevant Files

### Existing Files to Modify

- `app/package.json` - Add Jest, React Testing Library, and related dependencies; add test scripts
- `app/tsconfig.json` - May need to reference jest config for path mappings
- `.gitignore` - Ensure test coverage reports are ignored

### New Files

- `jest.config.js` (project root) - Jest configuration for Next.js and TypeScript
- `jest.setup.js` (project root) - Setup file for global test configuration and mocks
- `tests/` directory (project root) - Root directory for all test files
- `tests/lib/auth.test.ts` - Sample test for auth utility functions to verify setup
- `tests/components/TaskSlot.test.tsx` - Sample test for React component to verify RTL setup

## Step by Step Tasks

### 1. Install Jest and React Testing Library dependencies

- Navigate to `app/` directory
- Install core testing packages:
  ```bash
  npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
  ```
- Install Jest environment and Next.js integration:
  ```bash
  npm install --save-dev jest-environment-jsdom @types/jest
  ```
- Install TypeScript support for Jest:
  ```bash
  npm install --save-dev ts-jest @jest/globals
  ```

### 2. Create Jest configuration file

- Create `jest.config.js` at project root (not in `app/`)
- Configure for Next.js App Router and TypeScript:
  - Set up `ts-jest` preset for TypeScript
  - Configure `testEnvironment: 'jsdom'` for React components
  - Set up module name mapper for `@/` imports (matching Next.js alias)
  - Configure paths to find tests in `tests/` directory
  - Set up transform for `.tsx?` files
  - Configure coverage directory and collection
  - Add setup files path
- Example structure:
  ```javascript
  module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/app/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    collectCoverageFrom: [
      'app/**/*.{js,jsx,ts,tsx}',
      '!app/**/*.d.ts',
      '!app/**/layout.tsx',
    ],
    transform: {
      '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'app/tsconfig.json' }],
    },
  }
  ```

### 3. Create Jest setup file

- Create `jest.setup.js` at project root
- Import `@testing-library/jest-dom` for extended matchers
- Set up global mocks for Next.js modules:
  - Mock `next/navigation` (useRouter, usePathname, useSearchParams)
  - Mock `next/image` component
  - Mock `next-auth` (auth function, signIn, signOut)
- Configure environment variables for tests
- Add any global test utilities or helpers

### 4. Add test scripts to package.json

- Update `app/package.json` scripts section:
  ```json
  {
    "scripts": {
      "dev": "next dev",
      "build": "next build",
      "start": "next start",
      "lint": "eslint",
      "test": "jest",
      "test:watch": "jest --watch",
      "test:coverage": "jest --coverage"
    }
  }
  ```
- Ensure scripts run from `app/` directory but jest config is at root

### 5. Create tests directory structure

- Create `tests/` directory at project root
- Create subdirectories mirroring `app/` structure:
  - `tests/lib/` for utility function tests
  - `tests/components/` for component tests
  - `tests/app/` for page tests (if needed)
- This structure makes it easy to find corresponding tests

### 6. Write sample test for auth utility functions

- Create `tests/lib/auth.test.ts`
- Test the utility functions from `app/lib/auth.ts`:
  - Test `getCurrentUser()` returns user when authenticated
  - Test `getCurrentUser()` returns null when not authenticated
  - Test `requireAuth()` returns session when authenticated
  - Test `requireAuth()` throws error when not authenticated
- Mock the `auth()` function from next-auth
- Use Jest's mocking capabilities
- Verify tests pass with `npm test`

### 7. Write sample test for TaskSlot component

- Create `tests/components/TaskSlot.test.tsx`
- Test the TaskSlot component from `app/components/TaskSlot.tsx`:
  - Test component renders with correct slot number
  - Test component displays "Task Slot {number}" text
  - Test component has correct styling classes
  - Test component structure (border, background, padding)
- Use React Testing Library's `render` and `screen` utilities
- Use `@testing-library/jest-dom` matchers (toBeInTheDocument, toHaveTextContent)
- Verify tests pass with `npm test`

### 8. Update .gitignore for test coverage

- Open root `.gitignore` file
- Add coverage directory to ignored files:
  ```
  # Test coverage
  coverage/
  .nyc_output/
  *.lcov
  ```

### 9. Run all tests to verify setup

- Run `npm test` from `app/` directory (or root with proper working directory)
- Verify both sample tests pass
- Check that TypeScript types are resolved correctly
- Confirm no configuration errors
- Verify coverage can be generated with `npm run test:coverage`

### 10. Run validation commands

- Execute all validation commands to ensure no regressions
- Ensure existing build/lint/tsc commands still work
- Verify test command works end-to-end

## Validation Commands

Execute every command to validate the chore is complete with zero regressions.

```bash
# Navigate to app directory for all commands
cd app

# Run test suite (should pass with sample tests)
npm test

# Run tests in watch mode (manually verify it works, then exit)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Verify existing commands still work
npm run lint
npx tsc --noEmit
npm run build

# Verify dev server still works
npm run dev
# Manual check: Server should start without errors
```

All commands must execute without errors. The test suite should pass with 2 sample tests (auth utility and TaskSlot component).

## Notes

### Jest Configuration for Next.js 16

Next.js 16 uses React 19 and the App Router with Server Components. Key configuration considerations:

1. **Module Resolution**: Use `moduleNameMapper` to alias `@/` imports
2. **Transform**: Use `ts-jest` to handle TypeScript
3. **Test Environment**: Use `jsdom` for component tests
4. **Mocking**: Mock Next.js modules (navigation, image, auth) in jest.setup.js

### Mocking Strategy

For isolated, fast unit tests:

1. **Next.js Modules**: Mock `next/navigation`, `next/image` in jest.setup.js
2. **Auth.js**: Mock the `auth()` function to return fake sessions
3. **Database**: Not needed yet, but will mock Neon/PostgreSQL when added
4. **Environment Variables**: Set test-specific env vars in jest.setup.js

### React Testing Library Best Practices

1. **Query Priority**: Use `getByRole` > `getByLabelText` > `getByText` > `getByTestId`
2. **User-Centric**: Test what users see and do, not implementation details
3. **Accessibility**: RTL encourages testing accessible HTML structure
4. **Async**: Use `waitFor`, `findBy` queries for async operations

### Coverage Configuration

The configuration collects coverage from `app/**/*.{js,jsx,ts,tsx}` but excludes:
- Type definition files (`.d.ts`)
- Layout files (often just wrappers)
- Add more exclusions as needed (e.g., config files, constants)

Target: Start with baseline coverage, gradually improve to 80%+

### Future Considerations

1. **E2E Tests**: This setup is for unit tests. Consider Playwright/Cypress for E2E
2. **Integration Tests**: Test multiple components/modules together
3. **CI/CD Integration**: Jest output is CI-ready (JUnit XML, coverage reports)
4. **Test Performance**: Keep tests fast (<1s per test) by mocking external dependencies
5. **Snapshot Testing**: Useful for component regression testing (use sparingly)

### TypeScript Configuration

The setup uses `ts-jest` which reads `app/tsconfig.json`. Ensure:
- Path mappings match (`@/*` → `./app/*`)
- Strict mode is enabled for better type safety
- Types are properly installed (`@types/jest`, `@types/testing-library`)

### Sample Test Examples

**Auth Utility Test Structure:**
```typescript
import { getCurrentUser, requireAuth } from '@/lib/auth'
import { auth } from '@/auth'

jest.mock('@/auth')

describe('getCurrentUser', () => {
  it('returns user when authenticated', async () => {
    // Mock auth to return user
    // Call getCurrentUser
    // Assert user is returned
  })
})
```

**Component Test Structure:**
```typescript
import { render, screen } from '@testing-library/react'
import TaskSlot from '@/components/TaskSlot'

describe('TaskSlot', () => {
  it('renders with correct slot number', () => {
    render(<TaskSlot slotNumber={1} />)
    expect(screen.getByText('Task Slot 1')).toBeInTheDocument()
  })
})
```

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- tests/lib/auth.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="getCurrentUser"
```

### CI/CD Ready

Jest is configured for CI environments:
- Exit codes (0 = pass, 1 = fail)
- Can output JUnit XML for CI tools
- Coverage reports can be uploaded to Codecov/Coveralls
- Silent output mode available with `--silent`
