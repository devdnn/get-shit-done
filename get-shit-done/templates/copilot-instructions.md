<!-- GSD:BEGIN — Do not edit this section manually. Managed by get-shit-done installer. -->

# GSD — Get Shit Done

## Workflow System

You have the GSD spec-driven development system installed. Use it to build features systematically.

### Available Commands

Run these via bash to manage the development workflow:

```bash
# Project initialization
node ~/.claude/gsd/bin/gsd-cli.js new-project          # Initialize project: questions → research → requirements → roadmap
node ~/.claude/gsd/bin/gsd-cli.js map-codebase          # Analyze existing codebase before new-project

# Phase workflow (repeat for each phase)
node ~/.claude/gsd/bin/gsd-cli.js discuss-phase <N>     # Capture implementation decisions
node ~/.claude/gsd/bin/gsd-cli.js plan-phase <N>        # Research + plan + verify
node ~/.claude/gsd/bin/gsd-cli.js execute-phase <N>     # Execute plans in parallel waves
node ~/.claude/gsd/bin/gsd-cli.js verify-work <N>       # Manual user acceptance testing

# Milestone management
node ~/.claude/gsd/bin/gsd-cli.js audit-milestone       # Verify milestone achieved its goals
node ~/.claude/gsd/bin/gsd-cli.js complete-milestone     # Archive milestone, tag release
node ~/.claude/gsd/bin/gsd-cli.js new-milestone          # Start next version

# Quick tasks
node ~/.claude/gsd/bin/gsd-cli.js quick                 # Ad-hoc task with GSD guarantees

# Navigation
node ~/.claude/gsd/bin/gsd-cli.js progress              # Where am I? What's next?
node ~/.claude/gsd/bin/gsd-cli.js help                   # Show all commands
```

### Workflow Rules

1. **Always read STATE.md** before starting any work — it contains project context, current phase, and decisions.
2. **Follow the phase workflow**: discuss → plan → execute → verify. Do not skip steps.
3. **Atomic commits**: Each task gets its own commit with conventional format: `feat(phase-task): description`.
4. **Stay in scope**: Only implement what the current plan specifies. Capture other ideas with `add-todo`.
5. **Update state**: After completing work, update `.planning/STATE.md` with progress and decisions.

### Planning Directory Structure

```
.planning/
├── PROJECT.md          # Project vision and context
├── REQUIREMENTS.md     # Scoped v1/v2 requirements
├── ROADMAP.md          # Phase structure and progress
├── STATE.md            # Current state, decisions, blockers
├── config.json         # Workflow configuration
├── research/           # Domain research findings
├── todos/              # Captured ideas for later
└── phases/
    ├── 01-feature-name/
    │   ├── 01-CONTEXT.md      # Implementation decisions
    │   ├── 01-RESEARCH.md     # Phase research
    │   ├── 01-01-PLAN.md      # Task plan
    │   ├── 01-01-SUMMARY.md   # Execution summary
    │   └── 01-VERIFICATION.md # Phase verification
    └── 02-next-feature/
        └── ...
```

### Context Engineering

When working on a task:
1. Read the relevant PLAN.md for the current task
2. Read STATE.md for project-wide context
3. Read ROADMAP.md to understand where this fits
4. Follow the plan's `<action>` instructions precisely
5. Run the plan's `<verify>` checks after implementation
6. Create a SUMMARY.md documenting what was done

<!-- GSD:END -->
