# Chore: Add VSCode launch configuration for debugger execution

## Metadata

- **issue_number**: `14`
- **adw_id**: `1771374986`
- **issue_json**:
```json
{
  "title": "Chore 1: Add VSCode launch configuration for debugger execution",
  "number": 14,
  "body": "Goal: Add vscode configuration with launch configurations.\n\nContext: Allow engineers to manually run app with debugger.\n\nTasks:\n- Add minimal vscode settings configurations\n- Add vscode launch configurations file\n- Add a launch configuration to run the app in debugger mode\n\nAcceptance Criteria:\n- VSCode run and debug shows available run configurations "
}
```

## Chore Description

Add VSCode workspace configuration to enable debugging of the Next.js application. This includes creating a `.vscode/` directory with minimal settings and launch configurations that allow engineers to run the app with an attached debugger. The configuration should support debugging both client-side and server-side Next.js code with proper source map support.

## Relevant Files

Use these files to resolve the chore:

- `app/package.json` - Contains npm scripts (`dev`, `build`, `start`) that need to be referenced in launch configurations
- `README.md` - May need to be updated with debugging instructions for developers

### New Files

- `.vscode/settings.json` - Minimal VSCode workspace settings for consistent development environment
- `.vscode/launch.json` - Launch configurations for debugging the Next.js application

## Step by Step Tasks

### 1. Create .vscode directory structure

- Create `.vscode/` directory in the project root
- This directory will contain all VSCode-specific configuration files

### 2. Create minimal settings.json

- Create `.vscode/settings.json` file
- Add minimal workspace settings:
  - TypeScript SDK configuration to use workspace version
  - File exclude patterns if needed (node_modules, .next, etc.)
  - Editor formatting preferences aligned with project ESLint config
  - Keep it minimal to avoid conflicts with user preferences

### 3. Create launch.json with Next.js debug configuration

- Create `.vscode/launch.json` file
- Add a launch configuration for debugging Next.js development server:
  - **Name**: "Next.js: debug server-side" or similar descriptive name
  - **Type**: `node`
  - **Request**: `launch`
  - **Command**: `npm run dev` (executed from `app/` directory)
  - **Working directory**: `${workspaceFolder}/app`
  - **Server ready action**: Auto-open browser when dev server is ready
  - **Source maps**: Enable for proper breakpoint support
  - **Skip files**: Exclude node_modules from debugging
- Consider adding a second configuration for client-side debugging if needed:
  - **Type**: `chrome` or `msedge`
  - **URL**: `http://localhost:3000`
  - **Web root**: `${workspaceFolder}/app`

### 4. Test the launch configuration

- Open VSCode
- Navigate to Run and Debug panel (Ctrl+Shift+D)
- Verify that the launch configuration appears in the dropdown
- Start debugging session to ensure:
  - Dev server starts correctly
  - Breakpoints can be set in TypeScript/JSX files
  - Source maps work correctly
  - Debugger attaches without errors

### 5. Run validation commands

- Verify no syntax errors in JSON configuration files
- Test that the existing npm scripts still work correctly
- Ensure VSCode recognizes the configurations

## Validation Commands

Execute every command to validate the chore is complete with zero regressions.

```bash
# Validate JSON syntax in VSCode configuration files
npx jsonlint .vscode/settings.json
npx jsonlint .vscode/launch.json

# Verify existing npm scripts still work
cd app && npm run lint
cd app && npx tsc --noEmit
cd app && npm run build

# Manual validation (cannot be automated):
# 1. Open VSCode
# 2. Open Run and Debug panel (Ctrl+Shift+D)
# 3. Verify launch configuration appears in dropdown
# 4. Start debug session and verify debugger attaches
# 5. Set a breakpoint in app/app/page.tsx and verify it hits
```

## Notes

### Next.js Debugging Considerations

- **Server-side debugging**: Next.js runs Node.js processes for server-side rendering and API routes. The debugger needs to attach to the Node process.
- **Client-side debugging**: React components run in the browser, requiring a browser debugging configuration.
- **Turbopack**: Next.js 16 uses Turbopack by default. Ensure source maps are properly configured for Turbopack.
- **Port**: Default Next.js dev server runs on port 3000, but may auto-increment if port is in use.

### VSCode Launch Configuration Options

The launch.json should support:
- Automatic server startup (no need to manually run `npm run dev`)
- Proper working directory (`app/` subdirectory)
- Auto-open browser when server is ready
- Source map support for TypeScript debugging
- Skip node_modules to avoid stepping into dependencies

### Optional Enhancements (Future)

These can be added later if needed:
- Compound launch configuration to debug both server and client simultaneously
- Environment variable configuration for different debugging scenarios
- PreLaunchTask to ensure dependencies are installed
- PostDebugTask to clean up processes

### Documentation

Consider adding a "Debugging" section to README.md with:
- How to start a debugging session
- How to set breakpoints
- Tips for debugging server vs client code
- Common troubleshooting steps
