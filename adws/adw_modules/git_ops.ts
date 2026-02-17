import { spawnSync } from "child_process";
import { getRepoUrl, extractRepoPath, makeIssueComment } from "./github";
import type { ADWState } from "./state";

export function getCurrentBranch(): string {
  const res = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    encoding: "utf8",
  });
  return (res.stdout || "").trim();
}

export function pushBranch(branchName: string): [boolean, string | null] {
  const res = spawnSync("git", ["push", "-u", "origin", branchName], {
    encoding: "utf8",
  });
  if (res.status !== 0) return [false, String(res.stderr || res.stdout)];
  return [true, null];
}

export function checkPrExists(branchName: string): string | null {
  try {
    const repoUrl = getRepoUrl();
    const repoPath = extractRepoPath(repoUrl);
    const res = spawnSync(
      "gh",
      ["pr", "list", "--repo", repoPath, "--head", branchName, "--json", "url"],
      { encoding: "utf8" },
    );
    if (res.status !== 0) return null;
    const prs = JSON.parse(res.stdout || "[]");
    if (prs && prs.length) return prs[0].url;
    return null;
  } catch (e) {
    return null;
  }
}

export function createBranch(branchName: string): [boolean, string | null] {
  let res = spawnSync("git", ["checkout", "-b", branchName], {
    encoding: "utf8",
  });
  if (res.status !== 0) {
    const stderr = String(res.stderr || res.stdout);
    if (stderr.includes("already exists")) {
      res = spawnSync("git", ["checkout", branchName], { encoding: "utf8" });
      if (res.status !== 0) return [false, String(res.stderr || res.stdout)];
      return [true, null];
    }
    return [false, stderr];
  }
  return [true, null];
}

export function commitChanges(message: string): [boolean, string | null] {
  let res = spawnSync("git", ["status", "--porcelain"], { encoding: "utf8" });
  if (!res.stdout || !res.stdout.trim()) return [true, null];
  res = spawnSync("git", ["add", "-A"], { encoding: "utf8" });
  if (res.status !== 0) return [false, String(res.stderr || res.stdout)];
  res = spawnSync("git", ["commit", "-m", message], { encoding: "utf8" });
  if (res.status !== 0) return [false, String(res.stderr || res.stdout)];
  return [true, null];
}

export async function finalizeGitOperations(
  state: ADWState,
  logger: any,
): Promise<void> {
  let branchName = state.get("branch_name");
  if (!branchName) {
    const current = getCurrentBranch();
    if (current && current !== "main") {
      logger.warn(`No branch name in state, using current branch: ${current}`);
      branchName = current;
    } else {
      logger.error(
        "No branch name in state and current branch is main, skipping git operations",
      );
      return;
    }
  }

  const [pushed, pushErr] = pushBranch(branchName);
  if (!pushed) {
    logger.error(`Failed to push branch: ${pushErr}`);
    return;
  }
  logger.info(`Pushed branch: ${branchName}`);

  const prUrl = checkPrExists(branchName);
  const issueNumber = state.get("issue_number");
  const adwId = state.get("adw_id");

  if (prUrl) {
    logger.info(`Found existing PR: ${prUrl}`);
    if (issueNumber && adwId) {
      makeIssueComment(issueNumber, `${adwId}_ops: ✅ Pull request: ${prUrl}`);
    }
  } else {
    // Create PR via workflow_ops.create_pull_request if available
    try {
      // dynamic import
      const { fetchIssue } = await import("./github");
      const { create_pull_request } = await import("./workflow_ops");
      let pr: string | null = null;
      let err: string | null = null;
      if (issueNumber) {
        const repoUrl = getRepoUrl();
        const repoPath = extractRepoPath(repoUrl);
        const issue = fetchIssue(issueNumber, repoPath);
        [pr, err] = create_pull_request(branchName, issue, state, logger);
      } else {
        pr = null;
        err = "No issue number in state";
      }

      if (pr) {
        logger.info(`Created PR: ${pr}`);
        if (issueNumber && adwId)
          makeIssueComment(
            issueNumber,
            `${adwId}_ops: ✅ Pull request created: ${pr}`,
          );
      } else {
        logger.error(`Failed to create PR: ${err}`);
      }
    } catch (e) {
      logger.error(`Failed to create PR: ${e}`);
    }
  }
}
