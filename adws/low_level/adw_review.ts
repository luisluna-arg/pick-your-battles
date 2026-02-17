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
    console.error('Usage: ts-node adw_review.ts <issue-number> <adw-id>');
    process.exit(1);
  }
  const issueNumber = argv[0];
  const adwIdArg = argv[1];
  const logger = setupLogger(adwIdArg, 'adw_review');

  const adwId = ensureAdwId(issueNumber, adwIdArg, logger);
  const state = ADWState.load(adwId);

  if (!state) {
    logger.error(`No state found for ADW ID: ${adwId}`);
    process.exit(1);
  }

  logger.info(`ADW Review starting - ID: ${adwId}, Issue: ${issueNumber}`);

  let planFile: string;
  try {
    planFile = ensurePlanExists(state, issueNumber);
  } catch (e: any) {
    logger.error(`No plan found: ${String(e)}`);
    await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'ops', `❌ No plan found: ${String(e)}`));
    process.exit(1);
    return;
  }

  await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'ops', '✅ Starting review phase'));

  const req = { agent_name: 'ops', slash_command: '/review', args: [planFile], adw_id: adwId } as any;
  const resp = executeTemplate(req);
  if (!resp.success) {
    logger.error(`Review failed: ${resp.output}`);
    await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'reviewer', `❌ Review failed: ${resp.output}`));
    process.exit(1);
  }
  await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'reviewer', `✅ Review completed: ${resp.output}`));
  state.save('adw_review');
}

main().catch((e) => { console.error('Fatal error in adw_review:', e); process.exit(1); });
