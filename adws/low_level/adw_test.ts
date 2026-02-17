#!/usr/bin/env -S ts-node
import dotenv from 'dotenv';
import { setupLogger } from '../adw_modules/utils';
import { ADWState } from '../adw_modules/state';
import { makeIssueComment } from '../adw_modules/github';
import { formatIssueMessage, ensurePlanExists, ensureAdwId } from '../adw_modules/workflow_ops';
import { executeTemplate } from '../adw_modules/agent';

dotenv.config();

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length < 2) {
    console.error('Usage: ts-node adw_test.ts <issue-number> <adw-id>');
    process.exit(1);
  }
  const issueNumber = argv[0];
  const adwIdArg = argv[1];
  const logger = setupLogger(adwIdArg, 'adw_test');

  const adwId = ensureAdwId(issueNumber, adwIdArg, logger);
  const state = ADWState.load(adwId);

  if (!state) {
    logger.error(`No state found for ADW ID: ${adwId}`);
    process.exit(1);
  }

  logger.info(`ADW Test starting - ID: ${adwId}, Issue: ${issueNumber}`);

  let planFile: string;
  try {
    planFile = ensurePlanExists(state, issueNumber);
  } catch (e: any) {
    logger.error(`No plan found: ${String(e)}`);
    await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'ops', `❌ No plan found: ${String(e)}`));
    process.exit(1);
    return;
  }

  await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'ops', '✅ Starting test phase'));

  // Run test agent once
  const req = { agent_name: 'ops', slash_command: '/test', args: [planFile], adw_id: adwId } as any;
  const resp = executeTemplate(req);

  if (!resp.success) {
    logger.error(`Tests failed: ${resp.output}`);
    await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'tester', `❌ Tests failed: ${resp.output}`));
    // Try resolution once
    const resolveReq = { agent_name: 'ops', slash_command: '/resolve_failed_test', args: [resp.output], adw_id: adwId } as any;
    const res2 = executeTemplate(resolveReq);
    if (res2.success) {
      await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'tester', '✅ Resolved failed tests, re-running tests'));
      const resp3 = executeTemplate(req);
      if (resp3.success) {
        await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'tester', `✅ Tests passed: ${resp3.output}`));
      } else {
        await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'tester', `❌ Tests still failing: ${resp3.output}`));
        process.exit(1);
      }
    } else {
      await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'tester', `❌ Failed to resolve tests: ${res2.output}`));
      process.exit(1);
    }
  } else {
    await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'tester', `✅ Tests completed: ${resp.output}`));
  }

  state.save('adw_test');
}

main().catch((e) => { console.error('Fatal error in adw_test:', e); process.exit(1); });
