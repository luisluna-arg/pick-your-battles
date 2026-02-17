import { spawnSync } from "child_process";
import path from "path";
import fs from "fs";
import { GitHubIssue, GitHubIssueListItem, GitHubComment } from "./data_types";

export const ADW_BOT_IDENTIFIER = "[ADW-BOT]";

function getGithubEnv(): NodeJS.ProcessEnv | undefined {
  const githubPat = process.env.GITHUB_PAT;
  if (!githubPat) return undefined;
  return {
    GH_TOKEN: githubPat,
    PATH: process.env.PATH || "",
  } as NodeJS.ProcessEnv;
}

export function getRepoUrl(): string {
  try {
    const res = spawnSync("git", ["remote", "get-url", "origin"], {
      encoding: "utf8",
    });
    if (res.status !== 0) throw new Error(String(res.stderr || res.stdout));
    return (res.stdout || "").trim();
  } catch (e) {
    throw new Error(
      "No git remote 'origin' found. Ensure you're in a git repo with a remote.",
    );
  }
}

export function extractRepoPath(githubUrl: string): string {
  return githubUrl.replace("https://github.com/", "").replace(".git", "");
}

export function fetchIssue(issueNumber: string, repoPath: string): GitHubIssue {
  const cmd = [
    "issue",
    "view",
    issueNumber,
    "-R",
    repoPath,
    "--json",
    "number,title,body,state,author,assignees,labels,milestone,comments,createdAt,updatedAt,closedAt,url",
  ];
  const env = getGithubEnv();
  const res = spawnSync("gh", cmd, { encoding: "utf8", env: env || undefined });
  if (res.status !== 0) {
    throw new Error(res.stderr || res.stdout || "gh error");
  }
  const data = JSON.parse(res.stdout || "{}");
  return data as GitHubIssue;
}

export function makeIssueComment(issueId: string, comment: string): void {
  const repoUrl = getRepoUrl();
  const repoPath = extractRepoPath(repoUrl);
  const cmd = ["issue", "comment", issueId, "-R", repoPath, "--body", comment];
  const env = getGithubEnv();
  const res = spawnSync("gh", cmd, { encoding: "utf8", env: env || undefined });
  if (res.status !== 0) {
    throw new Error(String(res.stderr || res.stdout));
  }
}

export function markIssueInProgress(issueId: string): void {
  const repoUrl = getRepoUrl();
  const repoPath = extractRepoPath(repoUrl);
  const env = getGithubEnv();
  spawnSync(
    "gh",
    ["issue", "edit", issueId, "-R", repoPath, "--add-label", "in_progress"],
    { env: env || undefined },
  );
  spawnSync(
    "gh",
    ["issue", "edit", issueId, "-R", repoPath, "--add-assignee", "@me"],
    { env: env || undefined },
  );
}

export function fetchOpenIssues(repoPath: string): GitHubIssueListItem[] {
  try {
    const env = getGithubEnv();
    const res = spawnSync(
      "gh",
      [
        "issue",
        "list",
        "--repo",
        repoPath,
        "--state",
        "open",
        "--json",
        "number,title,body,labels,createdAt,updatedAt",
        "--limit",
        "1000",
      ],
      { encoding: "utf8", env: env || undefined },
    );
    if (res.status !== 0) return [];
    const data = JSON.parse(res.stdout || "[]");
    return data as GitHubIssueListItem[];
  } catch (e) {
    return [];
  }
}

export function fetchIssueComments(
  repoPath: string,
  issueNumber: number,
): any[] {
  try {
    const env = getGithubEnv();
    const res = spawnSync(
      "gh",
      [
        "issue",
        "view",
        String(issueNumber),
        "--repo",
        repoPath,
        "--json",
        "comments",
      ],
      { encoding: "utf8", env: env || undefined },
    );
    if (res.status !== 0) return [];
    const data = JSON.parse(res.stdout || "{}");
    const comments = data.comments || [];
    comments.sort((a: any, b: any) =>
      (a.createdAt || "").localeCompare(b.createdAt || ""),
    );
    return comments;
  } catch (e) {
    return [];
  }
}

export function findKeywordFromComment(
  keyword: string,
  issue: GitHubIssue,
): GitHubComment | null {
  const sorted = (issue.comments || [])
    .slice()
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  for (const c of sorted) {
    if (c.body && c.body.includes(ADW_BOT_IDENTIFIER)) continue;
    if (c.body && c.body.includes(keyword)) return c;
  }
  return null;
}
