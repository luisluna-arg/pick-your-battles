# Pick Your Battles

> A minimalist productivity system that forces you to focus on what truly matters.

## The Concept

**Pick Your Battles** is a task management tool with a radical constraint: you can only have a **limited number of active tasks** at any time (default: 3, configurable by user).

When you try to exceed your task limit, the system blocks you. You must either:
- ✅ Complete one of your current tasks
- 🗑️ Delete a task that isn't a true priority

This constraint forces ruthless prioritization and helps you focus on what actually moves the needle.

---

## Tech Stack

Built with modern, production-ready tools optimized for Vercel deployment:

- **Framework**: [Next.js](https://nextjs.org/) (App Router) — React framework with server components
- **Database**: [Neon](https://neon.tech/) (PostgreSQL) — serverless Postgres, integrates seamlessly with Vercel
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) — utility-first CSS for rapid UI development
- **Deployment**: [Vercel](https://vercel.com/) — zero-config deployment platform

---

## Development Approach

This project is built using **agentic coding practices** — AI agents handle the full development lifecycle from planning to implementation to review. Each commit is authored by an AI agent with human guidance, demonstrating modern AI-assisted development workflows.

---

## Getting Started

### Main Application

```bash
# Navigate to app directory
cd app

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### AI Developer Workflows

The `adws/` directory contains TypeScript scripts for AI-assisted development workflows (planning, building, testing, reviewing).

```bash
# Install ADW dependencies
cd adws
npm install

# Verify TypeScript compilation
npm run type-check

# Build TypeScript to JavaScript
npm run build
```

**Dependencies:**
- Node.js built-in modules (fs, path, child_process)
- External: `glob`, `uuid`, `dotenv`, `@aws-sdk/client-s3`

**Environment Variables:**
Configure in `.env` file:
- `ANTHROPIC_API_KEY` - Required for Claude Code CLI
- `GITHUB_PAT` - GitHub personal access token (for gh CLI)
- `CLAUDE_CODE_PATH` - Path to Claude Code CLI (defaults to `claude`)

---

## Project Structure

```
pick-your-battles/
├── app/               # Next.js application
│   ├── components/    # React components
│   ├── lib/           # Utility functions and shared logic
│   └── ...            # Routes and pages
├── adws/              # AI Developer Workflow scripts
├── plans/             # Tracked implementation plans (evidence)
├── specs/             # Agent-generated artifacts (gitignored)
└── agents/            # Agent execution logs
```

---

## License

MIT
