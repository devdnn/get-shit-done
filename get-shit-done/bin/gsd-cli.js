#!/usr/bin/env node

/**
 * GSD CLI — Command dispatcher for GitHub Copilot
 * 
 * Maps slash commands to CLI subcommands for Copilot environment.
 * Instead of `/gsd:new-project`, use: node ~/.copilot/gsd/bin/gsd-cli.js new-project
 * 
 * This CLI outputs the workflow content that Copilot should follow.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Parse arguments
const args = process.argv.slice(2);
const command = args[0];
const flags = args.slice(1);

// Get the GSD installation directory
// This script is at: ~/.copilot/gsd/bin/gsd-cli.js
// GSD root is at: ~/.copilot/gsd/
const scriptDir = __dirname;
const gsdRoot = path.dirname(scriptDir);

// Command mappings: CLI command name -> workflow file path (relative to gsd root)
const COMMANDS = {
  // Project initialization
  'new-project': { workflow: 'workflows/new-project.md', command: 'commands/gsd/new-project.md' },
  'map-codebase': { workflow: 'workflows/map-codebase.md', command: 'commands/gsd/map-codebase.md' },
  
  // Phase workflow
  'discuss-phase': { workflow: 'workflows/discuss-phase.md', command: 'commands/gsd/discuss-phase.md' },
  'research-phase': { workflow: 'workflows/research-phase.md', command: 'commands/gsd/research-phase.md' },
  'plan-phase': { workflow: 'workflows/plan-phase.md', command: 'commands/gsd/plan-phase.md' },
  'execute-phase': { workflow: 'workflows/execute-phase.md', command: 'commands/gsd/execute-phase.md' },
  'verify-work': { workflow: 'workflows/verify-work.md', command: 'commands/gsd/verify-work.md' },
  
  // Milestone management
  'audit-milestone': { workflow: 'workflows/audit-milestone.md', command: 'commands/gsd/audit-milestone.md' },
  'complete-milestone': { workflow: 'workflows/complete-milestone.md', command: 'commands/gsd/complete-milestone.md' },
  'new-milestone': { workflow: 'workflows/new-milestone.md', command: 'commands/gsd/new-milestone.md' },
  'plan-milestone-gaps': { workflow: 'workflows/plan-milestone-gaps.md', command: 'commands/gsd/plan-milestone-gaps.md' },
  
  // Phase management
  'add-phase': { workflow: 'workflows/add-phase.md', command: 'commands/gsd/add-phase.md' },
  'insert-phase': { workflow: 'workflows/insert-phase.md', command: 'commands/gsd/insert-phase.md' },
  'remove-phase': { workflow: 'workflows/remove-phase.md', command: 'commands/gsd/remove-phase.md' },
  'list-phase-assumptions': { workflow: 'workflows/list-phase-assumptions.md', command: 'commands/gsd/list-phase-assumptions.md' },
  
  // Quick tasks
  'quick': { workflow: 'workflows/quick.md', command: 'commands/gsd/quick.md' },
  
  // Navigation & info
  'progress': { workflow: 'workflows/progress.md', command: 'commands/gsd/progress.md' },
  'help': { workflow: 'workflows/help.md', command: 'commands/gsd/help.md' },
  'health': { workflow: 'workflows/health.md', command: 'commands/gsd/health.md' },
  
  // Workflow management
  'pause-work': { workflow: 'workflows/pause-work.md', command: 'commands/gsd/pause-work.md' },
  'resume-work': { workflow: 'workflows/resume-work.md', command: 'commands/gsd/resume-work.md' },
  
  // Utilities
  'add-todo': { workflow: 'workflows/add-todo.md', command: 'commands/gsd/add-todo.md' },
  'check-todos': { workflow: 'workflows/check-todos.md', command: 'commands/gsd/check-todos.md' },
  'cleanup': { workflow: 'workflows/cleanup.md', command: 'commands/gsd/cleanup.md' },
  'debug': { workflow: 'workflows/debug.md', command: 'commands/gsd/debug.md' },
  'reapply-patches': { workflow: 'workflows/reapply-patches.md', command: 'commands/gsd/reapply-patches.md' },
  'settings': { workflow: 'workflows/settings.md', command: 'commands/gsd/settings.md' },
  'set-profile': { workflow: 'workflows/set-profile.md', command: 'commands/gsd/set-profile.md' },
  'update': { workflow: 'workflows/update.md', command: 'commands/gsd/update.md' },
  'join-discord': { workflow: 'workflows/join-discord.md', command: 'commands/gsd/join-discord.md' },
};

/**
 * Display help message
 */
function showHelp() {
  const gsdToolsPath = path.join(gsdRoot, 'bin', 'gsd-tools.cjs');
  
  console.log(`
GSD CLI — Get Shit Done for GitHub Copilot

Usage: node ${path.relative(process.cwd(), __filename)} <command> [arguments]

Project Initialization:
  new-project [--auto]         Initialize project: questions → research → requirements → roadmap
  map-codebase                 Analyze existing codebase before new-project

Phase Workflow:
  discuss-phase <N>            Capture implementation decisions for phase N
  research-phase <N>           Research phase N before planning
  plan-phase <N>               Research + plan + verify for phase N
  execute-phase <N>            Execute plans in parallel waves
  verify-work <N>              Manual user acceptance testing

Milestone Management:
  audit-milestone              Verify milestone achieved its goals
  complete-milestone           Archive milestone, tag release
  new-milestone                Start next version
  plan-milestone-gaps          Plan work to complete current milestone

Phase Management:
  add-phase <description>      Add new phase to roadmap
  insert-phase <after> <desc>  Insert decimal phase after existing
  remove-phase <N> [--force]   Remove phase and renumber
  list-phase-assumptions       List all phase assumptions

Quick Tasks:
  quick                        Ad-hoc task with GSD guarantees

Navigation & Info:
  progress                     Show project progress and current state
  help                         Show GSD command reference
  health                       Check .planning/ directory health

Workflow Management:
  pause-work                   Pause work, capture state
  resume-work                  Resume from pause point

Utilities:
  add-todo <description>       Capture idea for later
  check-todos [area]           List pending todos
  cleanup                      Archive completed work
  debug                        Debug workflow issues
  reapply-patches              Merge local modifications after update
  settings                     Configure GSD preferences
  set-profile <name>           Set agent model profile
  update                       Update GSD to latest version
  join-discord                 Get Discord invite link

Low-Level Tools:
  For advanced operations, use:
  node ${path.relative(process.cwd(), gsdToolsPath)} <command> [args]

Examples:
  node ${path.relative(process.cwd(), __filename)} new-project
  node ${path.relative(process.cwd(), __filename)} plan-phase 1
  node ${path.relative(process.cwd(), __filename)} execute-phase 1
  node ${path.relative(process.cwd(), __filename)} progress
  node ${path.relative(process.cwd(), __filename)} quick

For detailed documentation, see:
  ${gsdRoot}/references/
  ${gsdRoot}/workflows/
`);
}

/**
 * Execute a GSD command
 */
function executeCommand(cmd, args) {
  const mapping = COMMANDS[cmd];
  
  if (!mapping) {
    console.error(`Error: Unknown command '${cmd}'`);
    console.error(`Run 'node ${__filename} help' for available commands.`);
    process.exit(1);
  }

  // Try to read the command file first (contains the command definition)
  let contentPath = path.join(gsdRoot, mapping.command);
  let content;
  
  if (fs.existsSync(contentPath)) {
    content = fs.readFileSync(contentPath, 'utf8');
  } else {
    // Fall back to workflow file if command doesn't exist
    contentPath = path.join(gsdRoot, mapping.workflow);
    if (fs.existsSync(contentPath)) {
      content = fs.readFileSync(contentPath, 'utf8');
    } else {
      console.error(`Error: Neither command nor workflow file found for '${cmd}'`);
      console.error(`  Tried: ${mapping.command}`);
      console.error(`  Tried: ${mapping.workflow}`);
      process.exit(1);
    }
  }
  
  // Extract and display the command for Copilot to follow
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`GSD Command: ${cmd}`);
  if (args.length > 0) {
    console.log(`Arguments: ${args.join(' ')}`);
  }
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log();
  console.log(content);
  console.log();
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('Follow the instructions above to execute this GSD workflow.');
  console.log('═══════════════════════════════════════════════════════════════════');
}

/**
 * Main entry point
 */
function main() {
  // No command or help flag
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    return;
  }

  // Execute the command
  executeCommand(command, flags);
}

main();
