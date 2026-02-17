# Pick Your Battles

> A minimalist productivity tool that enforces focus by strictly limiting users to three concurrent tasks.

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
├── app/               # Application source code
├── tests/             # Test files (mirrors app/ structure)
├── adws/              # AI Developer Workflows (automation scripts)
├── prompts/           # Reusable slash commands
├── templates/         # Meta prompts that generate plans
├── specs/             # Generated plans
├── agents/logs/       # Agent execution logs
└── CLAUDE.md          # This file
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

## Conventions

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
| `/implement` | Execute a plan from `specs/` |
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
