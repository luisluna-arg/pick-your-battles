# Agentic Coding Template

A GitHub **template repository** for bootstrapping projects that use AI agents to handle the software development lifecycle. Click "Use this template" to create a new repo with the full agentic scaffold — no forking, no commit history carried over.

Based on the [Tactical Agentic Coding](https://github.com) course (Lessons 1–8).

---

## Using This Template

**From GitHub:**
1. Click the green **"Use this template"** button at the top of this repo.
2. Name your new project and create the repository.
3. Clone it locally and start customizing.

**From the CLI:**
```bash
gh repo create my-new-project --template luisluna-arg/agentic-coding-template
```

---

## What's Inside

```
agentic-coding-template/
├── CLAUDE.md              # Agent onboarding doc (customize per project)
├── prompts/               # Reusable slash commands
│   ├── prime.md           # Initialize agent's codebase understanding
│   ├── start.md           # Bootstrap and run the application
│   ├── implement.md       # Higher-order prompt — executes a plan
│   ├── build.md           # Quick patch: research → implement → test → commit
│   └── plan.md            # Generate a plan from a task description
├── templates/             # Meta prompts (prompts that generate plans)
│   ├── chore_template.md  # Routine fixes, config changes, dependency updates
│   ├── bug_template.md    # Bugs with reproduction steps and root cause analysis
│   └── feature_template.md# New functionality with phases and acceptance criteria
├── adws/                  # AI Developer Workflow scripts
│   ├── prompt.py          # Python — agent CLI wrapper
│   ├── prompt.sh          # Bash — agent CLI wrapper
│   ├── prompt.ts          # TypeScript — agent CLI wrapper
│   └── prompt.ps1         # PowerShell — agent CLI wrapper
├── specs/                 # Generated plans land here (gitkeep only)
└── agents/logs/           # Agent execution logs (gitkeep only)
```

---

## Quick Start

1. **Create a repo** from this template (see above).
2. **Edit `CLAUDE.md`** — replace every `[placeholder]` with your project's details.
3. **Edit validation commands** in each template under `templates/` to match your toolchain (e.g., `pytest` → `go test`, `bun run build` → `mvn package`).
4. **Edit `prompts/start.md`** — set your actual startup command.
5. **Add your application code** (e.g., in an `app/` directory).
6. Start working:
   - Classify your task as chore, bug, or feature.
   - Run the matching template to generate a plan into `specs/`.
   - Run `/implement specs/your-plan.md` in a fresh agent session.
   - Let the agent execute, test, and commit.

---

## The Workflow Cycle

For every task you pick up, repeat this loop:

```
Classify → Plan → Build → Test → Review → Document
```

- **Classify**: Is this a chore, bug, or feature?
- **Plan**: Run the matching template → generates a spec in `specs/`.
- **Build**: `/implement specs/plan.md` in a fresh agent session.
- **Test**: Agent runs validation commands embedded in the plan.
- **Review**: Verify output matches the spec. Patch blockers if needed.
- **Document**: Update docs, changelog, README.

---

## Customization Checklist

- [ ] `CLAUDE.md` — project name, tech stack, conventions, directory layout
- [ ] `prompts/prime.md` — adjust to reference your key files and structure
- [ ] `prompts/start.md` — your actual startup command
- [ ] `templates/*.md` — validation commands for your toolchain
- [ ] `adws/prompt.*` — pick your preferred language and delete the rest (or keep all)

---

## When to Level Up

Once you've run the Plan → Build → Test → Review cycle manually several times:

1. **Automate shipping** — have the agent create PRs automatically.
2. **Parallelize** — use Git worktrees to run multiple agents on separate tasks.
3. **Add triggers** — connect GitHub webhooks or cron jobs to fire ADW scripts.
4. **Target Zero Touch** — agents ship to production; you only provide the prompt.

---

## License

MIT — use freely, modify as needed.
