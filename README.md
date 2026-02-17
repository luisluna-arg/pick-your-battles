# Pick Your Battles

> A minimalist productivity system that forces you to focus on what truly matters.

## The Concept

**Pick Your Battles** is a task management tool with a radical constraint: you can only have **3 active tasks** at any time.

When you try to add a fourth task, the system blocks you. You must either:
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

```bash
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

---

## Project Structure

```
pick-your-battles/
├── app/               # Next.js app router pages and components
├── components/        # React components
├── lib/               # Utility functions and shared logic
├── public/            # Static assets
├── adws/              # AI Developer Workflow scripts
├── specs/             # Implementation plans and specifications
└── agents/logs/       # Agent execution logs
```

---

## License

MIT
