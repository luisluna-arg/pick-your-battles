# Pick Your Battles

> A minimalist productivity tool that enforces focus by limiting users to a configurable number of concurrent tasks (default: 3).

## Tech Stack

- **Language**: TypeScript 5.x
- **Framework**: Next.js (App Router)
- **Database**: Neon (PostgreSQL)
- **Styling**: Tailwind CSS
- **Package Manager**: npm
- **Deployment**: Vercel

## Directory Layout

```
project/
├── app/                    # Next.js application (routes, components, lib)
├── .claude/commands/       # Slash commands (bug, feature, chore, classify_issue)
├── adws/                   # AI Developer Workflows (TypeScript automation scripts)
│   ├── adw_modules/        # Core workflow modules
│   └── low_level/          # Executable workflow scripts
├── prompts/                # Workflow templates (build, implement, plan)
├── templates/              # Plan templates (bug, chore, feature)
├── plans/                  # Tracked implementation plans (evidence)
├── specs/                  # Agent-generated artifacts (gitignored)
├── agents/                 # Agent execution logs and state
└── CLAUDE.md               # This file
```

## Getting Started

```bash
# Install dependencies
npm install

# Run the application
npm run dev

# Run tests
npm test
```

## Environment Configuration

- **GitHub Token**: `GH_TOKEN` is automatically available in all shell sessions (loaded from `~/.bashrc`)
  - Use `gh` commands directly without authentication
  - Token is sourced from `.env` but no need to read it manually
- **Git Config**: Local git config is set for this repo only (`user.email` and `user.name`)
  - Commits will automatically use the project-specific credentials
  - Your global git config remains unchanged

## Conventions

- **ALWAYS fetch and pull from main before starting any work** (`git fetch origin && git pull origin main`)
- Follow ESLint config
- Write tests for all new features
- Use TypeScript type annotations
- Document complex logic with inline comments
- Keep files under ~1000 lines
- One responsibility per file

## Available Slash Commands

| Command | Purpose |
|---------|---------|
| `/prime` | Initialize agent understanding of this codebase |
| `/start` | Bootstrap and run the application |
| `/implement` | Execute a plan from `plans/` |
| `/build` | Quick patch: research → implement → test → commit |
| `/plan` | Generate a technical plan from a task description |

## Validation Commands

These commands validate the project has no regressions:

```bash
npm run lint          # ESLint check
npx tsc --noEmit      # TypeScript type check
npm test              # Run test suite
npm run build         # Production build
```

## Deployment

Deploy to Vercel:
```bash
# Connect repo to Vercel dashboard or use CLI
vercel deploy
```
