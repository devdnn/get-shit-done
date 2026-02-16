# Copilot CLI Integration Plan

> Making GSD work with GitHub Copilot — same developer workflow, new runtime.

---

## Overview

GitHub Copilot (Coding Agent and Copilot Chat in IDE) operates differently from Claude Code, OpenCode, and Gemini CLI. Rather than terminal-based slash commands, Copilot uses:

- **`.github/copilot-instructions.md`** — Custom instructions loaded into every Copilot session
- **GitHub Issues & PRs** — Copilot Coding Agent receives work via issues
- **IDE Chat** — Copilot Chat in VS Code / JetBrains with `@workspace` context
- **Bash/CLI tools** — Available in Copilot Coding Agent's sandbox

### Design Principle

**The developer workflow stays the same.** The GSD planning structure (`.planning/`, phases, plans, state) is runtime-agnostic. Only the *invocation mechanism* changes:

| Runtime | Invocation | Format |
|---------|-----------|--------|
| Claude Code | `/gsd:command` slash commands | Markdown + YAML frontmatter |
| OpenCode | `/gsd-command` flat commands | Markdown + YAML (converted) |
| Gemini CLI | `/gsd:command` slash commands | TOML agents |
| **Copilot** | `node ~/.copilot/gsd/gsd-cli.js <command>` | CLI + instructions |

---

## Phases

### Phase 1: Installer Support (Foundation)

**Goal:** Add `--copilot` flag to the installer, handle Copilot's config directory, and copy GSD files.

**Why first:** Everything else depends on files being in the right place.

#### Tasks

| # | Task | Files | Dependencies |
|---|------|-------|-------------|
| 1.1 | Add `--copilot` CLI flag and runtime detection | `bin/install.js` | None |
| 1.2 | Implement `getDirName('copilot')` → `.copilot` | `bin/install.js` | 1.1 |
| 1.3 | Implement `getGlobalDir('copilot')` → `~/.copilot/` (supports `COPILOT_CONFIG_DIR` env var) | `bin/install.js` | 1.1 |
| 1.4 | Add Copilot to interactive runtime prompt (option 4) | `bin/install.js` | 1.1 |
| 1.5 | Copy GSD workflow/reference/template files to `gsd/` subdirectory | `bin/install.js` | 1.2, 1.3 |
| 1.6 | Generate `copilot-instructions.md` with GSD workflow instructions | `bin/install.js` | 1.5 |
| 1.7 | Update `--all` flag to include copilot | `bin/install.js` | 1.1 |
| 1.8 | Add uninstall support for Copilot | `bin/install.js` | 1.5 |

---

### Phase 2: Command Adaptation (CLI Bridge)

**Goal:** Create a CLI entry point that mirrors slash commands, so Copilot can invoke GSD workflows via bash.

**Why second:** Copilot doesn't have slash commands — it needs a CLI bridge to trigger the same workflows.

#### Tasks

| # | Task | Files | Dependencies |
|---|------|-------|-------------|
| 2.1 | Create `gsd-cli.js` — CLI dispatcher that maps commands to workflows | `get-shit-done/bin/gsd-cli.js` | Phase 1 |
| 2.2 | Map all GSD commands to CLI subcommands | `get-shit-done/bin/gsd-cli.js` | 2.1 |
| 2.3 | Add `--help` output listing all available commands | `get-shit-done/bin/gsd-cli.js` | 2.1 |
| 2.4 | Wire CLI to existing `gsd-tools.cjs` for state/config operations | `get-shit-done/bin/gsd-cli.js` | 2.1 |

---

### Phase 3: Instructions Generation (Context Engineering)

**Goal:** Generate `.github/copilot-instructions.md` that teaches Copilot the GSD workflow, so it naturally follows the discuss → plan → execute → verify cycle.

**Why third:** Copilot's behavior is shaped by instructions — this is the equivalent of slash command definitions.

#### Tasks

| # | Task | Files | Dependencies |
|---|------|-------|-------------|
| 3.1 | Create instructions template with GSD workflow overview | `get-shit-done/templates/copilot-instructions.md` | None |
| 3.2 | Include CLI command reference in instructions | `get-shit-done/templates/copilot-instructions.md` | 2.2 |
| 3.3 | Add `.planning/` directory conventions to instructions | `get-shit-done/templates/copilot-instructions.md` | 3.1 |
| 3.4 | Add state management rules (read STATE.md, update after changes) | `get-shit-done/templates/copilot-instructions.md` | 3.1 |
| 3.5 | Add commit conventions (atomic commits, conventional format) | `get-shit-done/templates/copilot-instructions.md` | 3.1 |
| 3.6 | Installer merges template into existing `copilot-instructions.md` | `bin/install.js` | 3.1, Phase 1 |

---

### Phase 4: Documentation & Testing

**Goal:** Update all user-facing docs and add tests for the new runtime.

**Why last:** Docs describe what exists — write them after the implementation is stable.

#### Tasks

| # | Task | Files | Dependencies |
|---|------|-------|-------------|
| 4.1 | Update README.md — add Copilot to runtime list, install examples | `README.md` | Phase 1 |
| 4.2 | Update USER-GUIDE.md — add Copilot section | `docs/USER-GUIDE.md` | Phase 1-3 |
| 4.3 | Add installer tests for `--copilot` flag | `get-shit-done/bin/gsd-tools.test.cjs` | Phase 1 |
| 4.4 | Update CHANGELOG.md | `CHANGELOG.md` | Phase 1-3 |
| 4.5 | Update `package.json` keywords | `package.json` | Phase 1 |

---

## Architecture Notes

### Install Locations

Copilot follows the same pattern as other runtimes:

| Install Type | Directory | Example |
|-------------|-----------|---------|
| Global | `~/.copilot/` | `npx get-shit-done-cc --copilot --global` |
| Local | `.copilot/` | `npx get-shit-done-cc --copilot --local` |

Supports `COPILOT_CONFIG_DIR` environment variable for custom locations.

### File Layout

```
~/.copilot/              # or .copilot/ for local installs
├── copilot-instructions.md    # Custom instructions (GSD section appended)
└── gsd/                       # GSD runtime files
    ├── workflows/             # Workflow definitions
    ├── references/            # Reference docs
    ├── templates/             # File templates
    └── bin/                   # CLI tools (gsd-tools.cjs, gsd-cli.js)
```

### Workflow Equivalence

| GSD Workflow | Claude Code | Copilot |
|-------------|-------------|---------|
| New project | `/gsd:new-project` | `node ~/.copilot/gsd/bin/gsd-cli.js new-project` |
| Discuss phase | `/gsd:discuss-phase 1` | `node ~/.copilot/gsd/bin/gsd-cli.js discuss-phase 1` |
| Plan phase | `/gsd:plan-phase 1` | `node ~/.copilot/gsd/bin/gsd-cli.js plan-phase 1` |
| Execute phase | `/gsd:execute-phase 1` | `node ~/.copilot/gsd/bin/gsd-cli.js execute-phase 1` |
| Verify work | `/gsd:verify-work 1` | `node ~/.copilot/gsd/bin/gsd-cli.js verify-work 1` |
| Quick task | `/gsd:quick` | `node ~/.copilot/gsd/bin/gsd-cli.js quick` |
| Progress | `/gsd:progress` | `node ~/.copilot/gsd/bin/gsd-cli.js progress` |

### Team Independence

Each phase is designed to be worked on by an independent team:

- **Phase 1 team** only touches `bin/install.js` — pure file operations
- **Phase 2 team** creates new files in `get-shit-done/bin/` — no existing file conflicts
- **Phase 3 team** creates new template files — no existing file conflicts
- **Phase 4 team** only adds content to existing docs — append-only changes

No phase blocks another except sequentially: 1 → 2 → 3 → 4. Within each phase, tasks are parallelizable.
