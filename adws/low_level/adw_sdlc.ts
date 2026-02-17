#!/usr/bin/env -S ts-node
import { spawnSync } from 'child_process';
import path from 'path';

function runScript(script: string, args: string[]) {
  const scriptPath = path.join(__dirname, script);
  const cmd = ['-r', 'ts-node/register', scriptPath, ...args];
  const res = spawnSync('node', cmd, { stdio: 'inherit' });
  return res.status === 0;
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.length < 2) {
    console.error('Usage: ts-node adw_sdlc.ts <command> <issue-number> [adw-id] ...');
    console.error('Commands: plan, build, test, review, document, patch');
    process.exit(1);
  }
  const cmd = argv[0];
  const rest = argv.slice(1);

  switch (cmd) {
    case 'plan':
      runScript('adw_plan.ts', rest);
      break;
    case 'build':
      runScript('adw_build.ts', rest);
      break;
    case 'test':
      runScript('adw_test.ts', rest);
      break;
    case 'review':
      runScript('adw_review.ts', rest);
      break;
    case 'document':
      runScript('adw_document.ts', rest);
      break;
    case 'patch':
      runScript('adw_patch.ts', rest);
      break;
    default:
      console.error(`Unknown command: ${cmd}`);
      process.exit(1);
  }
}

main();
