import fs from "fs";
import path from "path";
import { glob } from "glob";
import { executeTemplate } from "./agent";
import { parseJson, makeAdwId } from "./utils";
import type {
  GitHubIssue,
  AgentPromptResponse,
  AgentTemplateRequest,
  IssueClassSlashCommand,
} from "./data_types";
import { getCurrentBranch } from "./git_ops";

export const AGENT_PLANNER = "sdlc_planner";
export const AGENT_IMPLEMENTOR = "sdlc_implementor";
export const AGENT_CLASSIFIER = "issue_classifier";
export const AGENT_BRANCH_GENERATOR = "branch_generator";
export const AGENT_PR_CREATOR = "pr_creator";

export const AVAILABLE_ADW_WORKFLOWS = [
  "adw_plan",
  "adw_build",
  "adw_test",
  "adw_review",
  "adw_document",
  "adw_patch",
  "adw_plan_build",
  "adw_plan_build_test",
  "adw_plan_build_test_review",
  "adw_sdlc",
];

export function formatIssueMessage(
  adwId: string,
  agentName: string,
  message: string,
  sessionId?: string,
) {
  if (sessionId)
    return `[ADW-BOT] ${adwId}_${agentName}_${sessionId}: ${message}`;
  return `[ADW-BOT] ${adwId}_${agentName}: ${message}`;
}

export function extractAdwInfo(
  text: string,
  tempAdwId: string,
): [string | null, string | null] {
  const req: AgentTemplateRequest = {
    agent_name: "adw_classifier",
    slash_command: "/classify_adw",
    args: [text],
    adw_id: tempAdwId,
  };
  try {
    const res = executeTemplate(req);
    if (!res.success) return [null, null];
    const data = parseJson<any>(res.output);
    const adwCommand = (data.adw_slash_command || "").replace("/", "");
    const adwId = data.adw_id;
    if (adwCommand && AVAILABLE_ADW_WORKFLOWS.includes(adwCommand))
      return [adwCommand, adwId];
    return [null, null];
  } catch (e) {
    return [null, null];
  }
}

export function classifyIssue(
  issue: GitHubIssue,
  adwId: string,
  logger: any,
): [IssueClassSlashCommand | null, string | null] {
  const minimal = JSON.stringify({
    number: issue.number,
    title: issue.title,
    body: issue.body,
  });
  const req: AgentTemplateRequest = {
    agent_name: AGENT_CLASSIFIER,
    slash_command: "/classify_issue",
    args: [minimal],
    adw_id: adwId,
  };
  logger.debug && logger.debug(`Classifying issue: ${issue.title}`);
  const response = executeTemplate(req);
  logger.debug &&
    logger.debug(`Classification response: ${JSON.stringify(response)}`);
  if (!response.success) return [null, response.output];
  const out = response.output.trim();
  const m = out.match(/(\/chore|\/bug|\/feature|0)/);
  let issueCommand = m ? m[1] : out;
  if (issueCommand === "0")
    return [null, `No command selected: ${response.output}`];
  if (!["/chore", "/bug", "/feature"].includes(issueCommand))
    return [null, `Invalid command selected: ${response.output}`];
  return [issueCommand as IssueClassSlashCommand, null];
}

export function buildPlan(
  issue: GitHubIssue,
  command: string,
  adwId: string,
  logger: any,
): AgentPromptResponse {
  const minimal = JSON.stringify({
    number: issue.number,
    title: issue.title,
    body: issue.body,
  });
  const req: AgentTemplateRequest = {
    agent_name: AGENT_PLANNER,
    slash_command: command as any,
    args: [String(issue.number), adwId, minimal],
    adw_id: adwId,
  };
  return executeTemplate(req);
}

export function implementPlan(
  planFile: string,
  adwId: string,
  logger: any,
  agentName?: string,
): AgentPromptResponse {
  const implName = agentName || AGENT_IMPLEMENTOR;
  const req: AgentTemplateRequest = {
    agent_name: implName,
    slash_command: "/implement",
    args: [planFile],
    adw_id: adwId,
  };
  return executeTemplate(req);
}

export function generateBranchName(
  issue: GitHubIssue,
  issueClass: IssueClassSlashCommand,
  adwId: string,
  logger: any,
): [string | null, string | null] {
  const issueType = issueClass.replace("/", "");
  const minimal = JSON.stringify({
    number: issue.number,
    title: issue.title,
    body: issue.body,
  });
  const req: AgentTemplateRequest = {
    agent_name: AGENT_BRANCH_GENERATOR,
    slash_command: "/generate_branch_name",
    args: [issueType, adwId, minimal],
    adw_id: adwId,
  };
  const res = executeTemplate(req);
  if (!res.success) return [null, res.output];
  return [res.output.trim(), null];
}

export function createCommit(
  agentName: string,
  issue: GitHubIssue | null,
  issueClass: IssueClassSlashCommand,
  adwId: string,
  logger: any,
): [string | null, string | null] {
  const issueType = issueClass.replace("/", "");
  const uniqueAgent = `${agentName}_committer`;
  const minimal = issue
    ? JSON.stringify({
        number: issue.number,
        title: issue.title,
        body: issue.body,
      })
    : "{}";
  const req: AgentTemplateRequest = {
    agent_name: uniqueAgent,
    slash_command: "/commit",
    args: [agentName, issueType, minimal],
    adw_id: adwId,
  };
  const res = executeTemplate(req);
  if (!res.success) return [null, res.output];
  return [res.output.trim(), null];
}

export function create_pull_request(
  branchName: string,
  issue: GitHubIssue | null,
  state: any,
  logger: any,
): [string | null, string | null] {
  const planFile = state.get("plan_file") || "No plan file (test run)";
  const adwId = state.get("adw_id");
  let issueJson = "{}";
  if (!issue) {
    const issueData = state.get("issue") || {};
    issueJson = JSON.stringify(issueData);
  } else if (typeof issue === "object") {
    issueJson = JSON.stringify({
      number: issue.number,
      title: issue.title,
      body: issue.body,
    });
  }
  const req: AgentTemplateRequest = {
    agent_name: AGENT_PR_CREATOR,
    slash_command: "/pull_request",
    args: [branchName, issueJson, planFile, adwId],
    adw_id: adwId,
  };
  const res = executeTemplate(req);
  if (!res.success) return [null, res.output];
  return [res.output.trim(), null];
}

export function ensurePlanExists(state: any, issueNumber: string): string {
  if (state.get("plan_file")) return state.get("plan_file");
  const branch = getCurrentBranch();
  if (branch.includes(`-${issueNumber}-`)) {
    const plans = glob.sync(`specs/*${issueNumber}*.md`);
    if (plans.length) return plans[0];
  }
  throw new Error(
    `No plan found for issue ${issueNumber}. Run adw_plan first.`,
  );
}

export function ensureAdwId(
  issueNumber: string,
  adwId?: string,
  logger?: any,
): string {
  const { ADWState } = require("./state");
  if (adwId) {
    const st = ADWState.load(adwId);
    if (st) {
      logger && logger.info(`Found existing ADW state for ID: ${adwId}`);
      return adwId;
    }
    const s = new ADWState(adwId);
    s.update({ adw_id: adwId, issue_number: issueNumber });
    s.save("ensure_adw_id");
    return adwId;
  }
  const newId = makeAdwId();
  const s = new (require("./state").ADWState)(newId);
  s.update({ adw_id: newId, issue_number: issueNumber });
  s.save("ensure_adw_id");
  logger && logger.info(`Created new ADW ID and state: ${newId}`);
  return newId;
}

export function find_existing_branch_for_issue(
  issueNumber: string,
  adwId?: string,
): string | null {
  const res = require("child_process").spawnSync("git", ["branch", "-a"], {
    encoding: "utf8",
  });
  if (res.status !== 0) return null;
  const branches = (res.stdout || "")
    .split("\n")
    .map((b: string) =>
      b.trim().replace("* ", "").replace("remotes/origin/", ""),
    );
  for (const b of branches) {
    if (b.includes(`-issue-${issueNumber}-`)) {
      if (adwId && b.includes(`-adw-${adwId}-`)) return b;
      if (!adwId) return b;
    }
  }
  return null;
}

export function findPlanForIssue(
  issueNumber: string,
  adwId?: string,
): string | null {
  const projectRoot = path.resolve(__dirname, "..", "..", "..");
  const agentsDir = path.join(projectRoot, "agents");
  if (!fs.existsSync(agentsDir)) return null;
  if (adwId) {
    const planPath = path.join(agentsDir, adwId, AGENT_PLANNER, "plan.md");
    if (fs.existsSync(planPath)) return planPath;
  }
  for (const id of fs.readdirSync(agentsDir)) {
    const p = path.join(agentsDir, id, AGENT_PLANNER, "plan.md");
    if (fs.existsSync(p)) return p;
  }
  return null;
}

export function createOrFindBranch(
  issueNumber: string,
  issue: GitHubIssue,
  state: any,
  logger: any,
): [string, string | null] {
  let branchName =
    state.get("branch_name") ||
    (state.get("branch") && state.get("branch").name);
  if (branchName) {
    logger.info(`Found branch in state: ${branchName}`);
    const current = getCurrentBranch();
    if (current !== branchName) {
      const res = require("child_process").spawnSync(
        "git",
        ["checkout", branchName],
        { encoding: "utf8" },
      );
      if (res.status !== 0) {
        const res2 = require("child_process").spawnSync(
          "git",
          ["checkout", "-b", branchName, `origin/${branchName}`],
          { encoding: "utf8" },
        );
        if (res2.status !== 0)
          return [
            "",
            `Failed to checkout branch: ${res2.stderr || res2.stdout}`,
          ];
      }
    }
    return [branchName, null];
  }
  const adwId = state.get("adw_id");
  const existing = find_existing_branch_for_issue(issueNumber, adwId);
  if (existing) {
    logger.info(`Found existing branch: ${existing}`);
    const res = require("child_process").spawnSync(
      "git",
      ["checkout", existing],
      { encoding: "utf8" },
    );
    if (res.status !== 0)
      return ["", `Failed to checkout branch: ${res.stderr || res.stdout}`];
    state.update({ branch_name: existing });
    return [existing, null];
  }
  logger.info("No existing branch found, creating new one");
  const [issueCommand, err] = classifyIssue(issue, adwId, logger);
  if (err) return ["", `Failed to classify issue: ${err}`];
  state.update({ issue_class: issueCommand });
  const [generated, genErr] = generateBranchName(
    issue,
    issueCommand as IssueClassSlashCommand,
    adwId,
    logger,
  );
  if (genErr) return ["", `Failed to generate branch name: ${genErr}`];
  const { createBranch } = require("./git_ops");
  const [success, createErr] = createBranch(generated as string);
  if (!success) return ["", `Failed to create branch: ${createErr}`];
  state.update({ branch_name: generated });
  logger.info(`Created and checked out new branch: ${generated}`);
  return [generated as string, null];
}

export function findSpecFile(state: any, logger: any): string | null {
  const specFile = state.get("plan_file");
  if (specFile && fs.existsSync(specFile)) {
    logger.info(`Using spec file from state: ${specFile}`);
    return specFile;
  }
  logger.info("Looking for spec file in git diff");
  const res = require("child_process").spawnSync(
    "git",
    ["diff", "origin/main", "--name-only"],
    { encoding: "utf8" },
  );
  if (res.status === 0) {
    const files = (res.stdout || "").trim().split("\n");
    const specFiles = files.filter(
      (f: string) => f.startsWith("spec/") && f.endsWith(".md"),
    );
    if (specFiles.length) {
      logger.info(`Found spec file: ${specFiles[0]}`);
      return specFiles[0];
    }
  }
  const branchName = state.get("branch_name");
  if (branchName) {
    const m = branchName.match(/issue-(\d+)/);
    if (m) {
      const issueNum = m[1];
      const adwId = state.get("adw_id");
      const pattern = `spec/issue-${issueNum}-adw-${adwId}*.md`;
      const files = glob.sync(pattern);
      if (files.length) return files[0];
    }
  }
  logger.warn("No spec file found");
  return null;
}

export function createAndImplementPatch(
  adwId: string,
  reviewChangeRequest: string,
  logger: any,
  agentNamePlanner: string,
  agentNameImplementor: string,
  specPath?: string,
  issueScreenshots?: string,
): [string | null, AgentPromptResponse | null] {
  const args: string[] = [adwId, reviewChangeRequest];
  if (specPath) args.push(specPath);
  else args.push("");
  args.push(agentNamePlanner);
  if (issueScreenshots) args.push(issueScreenshots);
  const req: AgentTemplateRequest = {
    agent_name: agentNamePlanner,
    slash_command: "/patch",
    args,
    adw_id: adwId,
  };
  const response = executeTemplate(req);
  if (!response.success) {
    const errorResponse: AgentPromptResponse = {
      output: `Failed to create patch plan: ${response.output}`,
      success: false,
      session_id: response.session_id || null,
    };
    return [null, errorResponse];
  }
  const patchFilePath = response.output.trim();
  if (
    !patchFilePath.startsWith("specs/patch/") ||
    !patchFilePath.endsWith(".md")
  ) {
    const errorResponse: AgentPromptResponse = {
      output: `Invalid patch plan path: ${patchFilePath}`,
      success: false,
      session_id: response.session_id || null,
    };
    return [null, errorResponse];
  }
  const implResp = implementPlan(
    patchFilePath,
    adwId,
    logger,
    agentNameImplementor,
  );
  return [patchFilePath, implResp];
}
