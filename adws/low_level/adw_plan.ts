#!/usr/bin/env -S ts-node
import dotenv from 'dotenv';
import { setupLogger } from '../adw_modules/utils';
import { ADWState } from '../adw_modules/state';
import { fetchIssue, makeIssueComment, getRepoUrl, extractRepoPath } from '../adw_modules/github';
import { classifyIssue, generateBranchName, buildPlan, createCommit, formatIssueMessage, ensureAdwId } from '../adw_modules/workflow_ops';
import { createBranch, commitChanges, finalizeGitOperations } from '../adw_modules/git_ops';
import type { GitHubIssue } from '../adw_modules/data_types';

function checkEnvVars(logger?: Console) {
  const required = ['ANTHROPIC_API_KEY', 'CLAUDE_CODE_PATH'];
  const missing = required.filter((v) => !process.env[v]);
  if (missing.length) {
    const msg = `Error: Missing required environment variables: ${missing.join(', ')}`;
    if (logger) logger.error(msg); else console.error(msg);
    process.exit(1);
  }
}

async function main() {
  dotenv.config();
  const argv = process.argv.slice(2);
  if (argv.length < 1) {
    console.error('Usage: ts-node adw_plan.ts <issue-number> [adw-id]');
    process.exit(1);
  }
  const issueNumber = argv[0];
  const adwIdArg = argv[1];

  const tempLogger = setupLogger(adwIdArg || 'temp', 'adw_plan');
  const adwId = ensureAdwId(issueNumber, adwIdArg, tempLogger);
  let state = ADWState.load(adwId);

  if (!state) {
    state = new ADWState(adwId);
  }

  if (!state.get('adw_id')) state.update({ adw_id: adwId });

  const logger = setupLogger(adwId, 'adw_plan');
  logger.info(`ADW Plan starting - ID: ${adwId}, Issue: ${issueNumber}`);
  checkEnvVars(console);

  let repoPath = '';
  try {
    const repoUrl = await getRepoUrl();
    repoPath = extractRepoPath(repoUrl);
  } catch (e: any) {
    logger.error(`Error getting repository URL: ${String(e)}`);
    process.exit(1);
  }

  let issue: GitHubIssue | null = null;
  try {
    issue = await fetchIssue(issueNumber, repoPath);
  } catch (e: any) {
    logger.error(`Error fetching issue: ${String(e)}`);
    process.exit(1);
  }

  await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'ops', '✅ Starting planning phase'));
  await makeIssueComment(issueNumber, `${adwId}_ops: 🔍 Using state\n\`\`\`json\n${JSON.stringify(state.data, null, 2)}\n\`\`\``);

  const [issueCommand, classifyErr] = classifyIssue(issue, adwId, logger);
  if (classifyErr) {
    logger.error(`Error classifying issue: ${classifyErr}`);
    await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'ops', `❌ Error classifying issue: ${classifyErr}`));
    process.exit(1);
  }

  state.update({ issue_class: issueCommand });
  state.save('adw_plan');
  logger.info(`Issue classified as: ${issueCommand}`);
  await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'ops', `✅ Issue classified as: ${issueCommand}`));

  const [branchName, genErr] = generateBranchName(issue, issueCommand as any, adwId, logger);
  if (genErr) {
    logger.error(`Error generating branch name: ${genErr}`);
    await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'ops', `❌ Error generating branch name: ${genErr}`));
    process.exit(1);
  }

  const [created, createErr] = createBranch(branchName as string);
  if (!created) {
    logger.error(`Error creating branch: ${createErr}`);
    await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'ops', `❌ Error creating branch: ${createErr}`));
    process.exit(1);
  }

  state.update({ branch_name: branchName });
  state.save('adw_plan');
  logger.info(`Working on branch: ${branchName}`);
  await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'ops', `✅ Working on branch: ${branchName}`));

  logger.info('Building implementation plan');
  await makeIssueComment(issueNumber, format_issue_message_placeholder(adwId));
  const planResp = buildPlan(issue, issueCommand as any, adwId, logger);
  if (!planResp.success) {
    logger.error(`Error building plan: ${planResp.output}`);
    await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'sdlc_planner', `❌ Error building plan: ${planResp.output}`));
    process.exit(1);
  }

  const planFilePath = planResp.output.trim();
  if (!planFilePath || !require('fs').existsSync(planFilePath)) {
    const err = `Plan file does not exist: ${planFilePath}`;
    logger.error(err);
    await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'ops', `❌ ${err}`));
    process.exit(1);
  }

  state.update({ plan_file: planFilePath });
  state.save('adw_plan');
  logger.info(`Plan file created: ${planFilePath}`);
  await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'ops', `✅ Plan file created: ${planFilePath}`));

  const [commitMsg, commitErr] = createCommit('sdlc_planner', issue, issueCommand as any, adwId, logger);
  if (commitErr) {
    logger.error(`Error creating commit message: ${commitErr}`);
    await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'sdlc_planner', `❌ Error creating commit message: ${commitErr}`));
    process.exit(1);
  }

  const [ok, commitErr2] = commitChanges(commitMsg as string);
  if (!ok) {
    logger.error(`Error committing plan: ${commitErr2}`);
    await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'sdlc_planner', `❌ Error committing plan: ${commitErr2}`));
    process.exit(1);
  }

  logger.info(`Committed plan: ${commitMsg}`);
  await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'sdlc_planner', '✅ Plan committed'));
  await finalizeGitOperations(state, logger);
  logger.info('Planning phase completed successfully');
  await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'ops', '✅ Planning phase completed'));
  state.save('adw_plan');
  await makeIssueComment(issueNumber, `${adwId}_ops: 📋 Final planning state:\n\`\`\`json\n${JSON.stringify(state.data, null, 2)}\n\`\`\``);
}

function format_issue_message_placeholder(adwId: string) {
  return formatIssueMessage(adwId, 'sdlc_planner', '✅ Building implementation plan');
}

main().catch((e) => { console.error('Fatal error in adw_plan:', e); process.exit(1); });
