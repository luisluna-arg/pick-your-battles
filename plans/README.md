# Implementation Plans & Specifications

This directory contains detailed implementation plans for features, bugs, and chores in the Pick Your Battles project.

## Purpose

Plans stored in this directory serve as:
- **Evidence of AI-assisted development**: Each plan documents the reasoning, research, and decision-making process
- **Implementation guides**: Detailed step-by-step instructions for executing features
- **Historical record**: Documentation of why and how features were implemented
- **Quality control**: Plans are reviewed before implementation begins

## Naming Convention

Plans follow this naming pattern:

```
issue-{issue_number}-adw-{timestamp}-sdlc_planner-{descriptive-name}.md
```

**Example:**
```
issue-1-adw-1771370202-sdlc_planner-project-scaffolding-base-ui.md
```

Where:
- `{issue_number}` - The GitHub issue number being implemented
- `{timestamp}` - Unix timestamp when the plan was created (serves as unique ID)
- `{descriptive-name}` - Short kebab-case description of the feature/bug/chore

## Plan Structure

Each plan includes:

1. **Metadata** - Issue number, timestamp, and issue JSON
2. **Context** - Why this change is needed and what problem it solves
3. **Feature/Bug/Chore Description** - Detailed explanation of the work
4. **User Story** - The user perspective and value delivered
5. **Problem & Solution Statements** - Clear definition of the problem and proposed solution
6. **Relevant Files** - Existing files to modify and new files to create
7. **Implementation Plan** - Phased approach (Foundation, Core, Integration)
8. **Step by Step Tasks** - Ordered, executable tasks
9. **Testing Strategy** - Unit tests, edge cases, and manual testing approach
10. **Acceptance Criteria** - Measurable success criteria
11. **Validation Commands** - Commands to verify zero regressions
12. **Notes** - Future considerations and additional context

## Workflow

1. **Create Plan** - Use `/feature`, `/bug`, or `/chore` slash commands to generate plans
2. **Review Plan** - Human review and approval before implementation
3. **Implement** - Use `/implement {plan_file}` to execute the plan
4. **Validate** - Run validation commands to ensure quality
5. **Commit** - Plans are committed to the repository as evidence

## Accessing Plans

Plans are tracked in git and visible in the repository for transparency. To list all plans:

```bash
ls -la specs/issue-*.md
```

To read a specific plan:

```bash
cat specs/issue-1-adw-1771370202-sdlc_planner-project-scaffolding-base-ui.md
```

## Integration with ADW (AI Developer Workflows)

The `adws/` directory contains TypeScript scripts that can generate and execute plans programmatically. Plans in `specs/` are consumed by:
- `adws/low_level/adw_plan.ts` - Plan generation
- `adws/low_level/adw_build.ts` - Implementation execution
- `adws/low_level/adw_review.ts` - Plan and code review

This creates a traceable development lifecycle managed by AI agents with human oversight.
