#!/usr/bin/env -S ts-node
import dotenv from 'dotenv';
import { setupLogger } from '../adw_modules/utils';
import { ADWState } from '../adw_modules/state';
import { makeIssueComment } from '../adw_modules/github';
import { formatIssueMessage, createAndImplementPatch, ensureAdwId } from '../adw_modules/workflow_ops';

dotenv.config();

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length < 3) {
    console.error('Usage: ts-node adw_patch.ts <issue-number> <adw-id> <review-change-request> [spec-path]');
    process.exit(1);
  }
  const issueNumber = argv[0];
  const adwIdArg = argv[1];
  const reviewChangeRequest = argv[2];
  const specPath = argv[3];

  const logger = setupLogger(adwIdArg, 'adw_patch');
  const adwId = ensureAdwId(issueNumber, adwIdArg, logger);
  const state = ADWState.load(adwId);

  if (!state) {
    logger.error(`No state found for ADW ID: ${adwId}`);
    process.exit(1);
  }

  logger.info(`ADW Patch starting - ID: ${adwId}, Issue: ${issueNumber}`);

  await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'ops', '✅ Starting patch creation and implementation'));
  const [patchPath, resp] = createAndImplementPatch(adwId, reviewChangeRequest, logger, 'patch_planner', 'patch_implementor', specPath);
  if (!patchPath || !resp || !resp.success) {
    const out = resp ? resp.output : 'No response';
    logger.error(`Patch creation/implementation failed: ${out}`);
    await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'ops', `❌ Patch failed: ${out}`));
    process.exit(1);
  }

  await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'ops', `✅ Patch created and implemented: ${patchPath}`));
  state.save('adw_patch');
}

main().catch((e) => { console.error('Fatal error in adw_patch:', e); process.exit(1); });
