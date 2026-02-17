#!/usr/bin/env npx tsx
/**
 * Minimal ADW script — Gateway to agentic coding.
 * Calls an agent CLI with a given prompt file or inline prompt.
 * Logs output to agents/logs/.
 *
 * Usage:
 *     npx tsx prompt.ts <prompt-file-or-text>
 *     npx tsx prompt.ts prompts/build.md "fix the login bug"
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, resolve, dirname } from "path";

const SCRIPT_DIR = dirname(resolve(process.argv[1]));
const LOG_DIR = join(SCRIPT_DIR, "..", "agents", "logs");
mkdirSync(LOG_DIR, { recursive: true });

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("Usage: npx tsx prompt.ts <prompt-file-or-text>");
  process.exit(1);
}

let prompt = args.join(" ");
const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 15);
const logFile = join(LOG_DIR, `agent_${timestamp}.log`);

// If first argument is a file, read its contents
if (existsSync(args[0])) {
  prompt = readFileSync(args[0], "utf-8");
}

// Call your agent CLI — replace with your actual command
try {
  const output = execSync(`claude -p "${prompt.replace(/"/g, '\\"')}"`, {
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  });

  writeFileSync(logFile, output);
  console.log(`Log saved to: ${logFile}`);
  console.log(output);
} catch (err: any) {
  const output = (err.stdout || "") + (err.stderr || "");
  writeFileSync(logFile, output);
  console.log(`Log saved to: ${logFile}`);
  console.error(output);
  process.exit(1);
}
