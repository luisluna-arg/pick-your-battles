#!/usr/bin/env -S ts-node
// ADW Build - TypeScript translation of temp/adws/adw_build.py
// Dependencies: dotenv, and local adw_modules implementations

import dotenv from 'dotenv';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Local module imports (assumed to be implemented in the Node codebase)
import { ADWState } from '../adw_modules/state';
import { commitChanges, finalizeGitOperations, getCurrentBranch } from '../adw_modules/git_ops';
import { fetchIssue, makeIssueComment, getRepoUrl, extractRepoPath } from '../adw_modules/github';
import {
  implementPlan,
  createCommit,
  formatIssueMessage,
  AGENT_IMPLEMENTOR,
} from '../adw_modules/workflow_ops';
import { setupLogger } from '../adw_modules/utils';
import type { GitHubIssue } from '../adw_modules/data_types';

function checkEnvVars(logger?: Console) {
  const requiredVars = ['ANTHROPIC_API_KEY', 'CLAUDE_CODE_PATH'];
  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length) {
    const msg = `Error: Missing required environment variables: ${missing.join(', ')}`;
    if (logger) {
      logger.error(msg);
      missing.forEach((v) => logger.error(`  - ${v}`));
    } else {
      console.error(msg);
      missing.forEach((v) => console.error(`  - ${v}`));
    }
    process.exit(1);
  }
}

async function main() {
  dotenv.config();

  const argv = process.argv.slice(2);
  if (argv.length < 2) {
    console.error('Usage: ts-node adw_build.ts <issue-number> <adw-id>');
    console.error('\nError: adw-id is required to locate the plan file created by adw_plan.py');
    console.error('The plan file is stored at: specs/issue-{issue_number}-adw-{adw_id}-*.md');
    process.exit(1);
  }

  let issueNumber = argv[0];
  const adwId = argv[1];

  const tempLogger = setupLogger(adwId, 'adw_build');
  let state: ADWState | null = null;
  try {
    state = ADWState.load(adwId);
  } catch (err) {
    tempLogger.error(`Error loading state: ${String(err)}`);
  }

  if (state) {
    issueNumber = state.get('issue_number') || issueNumber;
    try {
      await makeIssueComment(issueNumber, `${adwId}_ops: 🔍 Found existing state - resuming build\n\`\`\`json\n${JSON.stringify(state.data, null, 2)}\n\`\`\``);
    } catch (e) {
      tempLogger.warn('Failed to post resume comment to issue');
    }
  } else {
    const logger = setupLogger(adwId, 'adw_build');
    logger.error(`No state found for ADW ID: ${adwId}`);
    logger.error('Run adw_plan.py first to create the plan and state');
    console.error(`\nError: No state found for ADW ID: ${adwId}`);
    console.error('Run adw_plan.py first to create the plan and state');
    process.exit(1);
  }

  const logger = setupLogger(adwId, 'adw_build');
  logger.info(`ADW Build starting - ID: ${adwId}, Issue: ${issueNumber}`);

  checkEnvVars(console);

  // Get repo info
  let repoPath: string;
  try {
    const githubRepoUrl = await getRepoUrl();
    repoPath = extractRepoPath(githubRepoUrl);
  } catch (e: any) {
    logger.error(`Error getting repository URL: ${String(e)}`);
    process.exit(1);
    return;
  }

  if (!state.get('branch_name')) {
    const errorMsg = 'No branch name in state - run adw_plan.py first';
    logger.error(errorMsg);
    await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'ops', `❌ ${errorMsg}`));
    process.exit(1);
  }

  if (!state.get('plan_file')) {
    const errorMsg = 'No plan file in state - run adw_plan.py first';
    logger.error(errorMsg);
    await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'ops', `❌ ${errorMsg}`));
    process.exit(1);
  }

  const branchName = state.get('branch_name');
  try {
    execSync(`git checkout ${branchName}`, { stdio: 'inherit' });
    logger.info(`Checked out branch: ${branchName}`);
  } catch (e: any) {
    logger.error(`Failed to checkout branch ${branchName}: ${e.message || e}`);
    await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'ops', `❌ Failed to checkout branch ${branchName}`));
    process.exit(1);
  }

  const planFile = state.get('plan_file');
  logger.info(`Using plan file: ${planFile}`);

  await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'ops', '✅ Starting implementation phase'));

  logger.info('Implementing solution');
  await makeIssueComment(issueNumber, formatIssueMessage(adwId, AGENT_IMPLEMENTOR, '✅ Implementing solution'));

  let implementResponse;
  try {
    implementResponse = await implementPlan(planFile, adwId, logger);
  } catch (err) {
    logger.error(`Error implementing plan: ${String(err)}`);
    await makeIssueComment(issueNumber, formatIssueMessage(adwId, AGENT_IMPLEMENTOR, `❌ Error implementing solution: ${String(err)}`));
    process.exit(1);
  }

  if (!implementResponse || !implementResponse.success) {
    const out = implementResponse ? implementResponse.output : 'No response';
    logger.error(`Error implementing solution: ${out}`);
    await makeIssueComment(issueNumber, formatIssueMessage(adwId, AGENT_IMPLEMENTOR, `❌ Error implementing solution: ${out}`));
    process.exit(1);
  }

  logger.debug && logger.debug(`Implementation response: ${implementResponse.output}`);
  await makeIssueComment(issueNumber, formatIssueMessage(adwId, AGENT_IMPLEMENTOR, '✅ Solution implemented'));

  logger.info('Fetching issue data for commit message');
  let issue: GitHubIssue | null = null;
  try {
    issue = await fetchIssue(issueNumber, repoPath);
  } catch (err) {
    logger.error(`Error fetching issue ${issueNumber}: ${String(err)}`);
  }

  let issueCommand = state.get('issue_class');
  if (!issueCommand) {
    logger.info('No issue classification in state, running classify_issue');
    if (!issue) {
      logger.error('Cannot classify issue: issue data is null');
      issueCommand = '/feature';
      logger.warn('Defaulting to /feature');
    } else {
      try {
        // dynamic import to avoid circulars if not present
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { classifyIssue } = await import('../adw_modules/workflow_ops');
        const [cmd, error] = classifyIssue(issue, adwId, logger);
        if (error) {
          logger.error(`Error classifying issue: ${error}`);
          issueCommand = '/feature';
          logger.warn('Defaulting to /feature after classification error');
        } else {
          issueCommand = cmd;
          state.update({ issue_class: issueCommand });
          await state.save('adw_build');
        }
      } catch (err) {
        logger.error(`Classification failed: ${String(err)}`);
        issueCommand = '/feature';
      }
    }
  }

  logger.info('Creating implementation commit');
  let commitMsg: string;
  try {
    const result = await createCommit(AGENT_IMPLEMENTOR, issue, issueCommand, adwId, logger);
    commitMsg = result[0] || '';
    const commitErr = result[1];
    if (commitErr) {
      throw new Error(commitErr);
    }
  } catch (err: any) {
    logger.error(`Error creating commit message: ${String(err)}`);
    await makeIssueComment(issueNumber, formatIssueMessage(adwId, AGENT_IMPLEMENTOR, `❌ Error creating commit message: ${String(err)}`));
    process.exit(1);
    return;
  }

  // Commit the implementation
  try {
    const [success, error] = await commitChanges(commitMsg);
    if (!success) {
      logger.error(`Error committing implementation: ${error}`);
      await makeIssueComment(issueNumber, formatIssueMessage(adwId, AGENT_IMPLEMENTOR, `❌ Error committing implementation: ${error}`));
      process.exit(1);
    }
  } catch (err: any) {
    logger.error(`Exception during commit: ${String(err)}`);
    await makeIssueComment(issueNumber, formatIssueMessage(adwId, AGENT_IMPLEMENTOR, `❌ Error committing implementation: ${String(err)}`));
    process.exit(1);
  }

  logger.info(`Committed implementation: ${commitMsg}`);
  await makeIssueComment(issueNumber, formatIssueMessage(adwId, AGENT_IMPLEMENTOR, '✅ Implementation committed'));

  // Finalize git operations (push and PR)
  try {
    await finalizeGitOperations(state, logger);
  } catch (err: any) {
    logger.error(`Error finalizing git operations: ${String(err)}`);
  }

  logger.info('Implementation phase completed successfully');
  await makeIssueComment(issueNumber, formatIssueMessage(adwId, 'ops', '✅ Implementation phase completed'));

  // Save final state
  await state.save('adw_build');
}

main().catch((err) => {
  // top-level catch
  // eslint-disable-next-line no-console
  console.error('Fatal error in adw_build:', err);
  process.exit(1);
});
