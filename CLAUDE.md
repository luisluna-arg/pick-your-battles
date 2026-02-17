# [Project Name]

> [One-line description of what this project does.]

## Tech Stack

- **Language**: [e.g., Python 3.12, TypeScript 5.x]
- **Framework**: [e.g., FastAPI, Next.js, Spring Boot]
- **Database**: [e.g., PostgreSQL, SQLite, none]
- **Package Manager**: [e.g., uv, npm, bun, maven]

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
[your install command, e.g., uv sync / npm install / bun install]

# Run the application
[your run command, e.g., uv run app.py / npm run dev / bun start]

# Run tests
[your test command, e.g., uv run pytest / npm test / bun test]
```

## Conventions

- [e.g., Follow PEP 8 / ESLint config / Google Java Style]
- Write tests for all new features
- Use type hints/annotations
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
[your lint command, e.g., uv run ruff check . / npm run lint]
[your type check command, e.g., bun tsc --noEmit / mypy .]
[your test command, e.g., uv run pytest / npm test]
[your build command, e.g., bun run build / mvn package]
```
