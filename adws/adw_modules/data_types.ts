// Type definitions translated from Python data_types.py

export type IssueClassSlashCommand = "/chore" | "/bug" | "/feature";

export type ADWWorkflow =
  | "adw_plan"
  | "adw_build"
  | "adw_test"
  | "adw_review"
  | "adw_document"
  | "adw_patch"
  | "adw_plan_build"
  | "adw_plan_build_test"
  | "adw_plan_build_test_review"
  | "adw_sdlc";

export type SlashCommand =
  | "/chore"
  | "/bug"
  | "/feature"
  | "/classify_issue"
  | "/classify_adw"
  | "/generate_branch_name"
  | "/commit"
  | "/pull_request"
  | "/implement"
  | "/test"
  | "/resolve_failed_test"
  | "/test_e2e"
  | "/resolve_failed_e2e_test"
  | "/review"
  | "/patch"
  | "/document";

export interface GitHubUser {
  id?: string | null;
  login: string;
  name?: string | null;
  is_bot?: boolean;
}

export interface GitHubLabel {
  id: string;
  name: string;
  color: string;
  description?: string | null;
}

export interface GitHubMilestone {
  id: string;
  number: number;
  title: string;
  description?: string | null;
  state: string;
}

export interface GitHubComment {
  id: string;
  author: GitHubUser;
  body: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface GitHubIssueListItem {
  number: number;
  title: string;
  body: string;
  labels: GitHubLabel[];
  createdAt: string;
  updatedAt: string;
}

export interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  state: string;
  author: GitHubUser;
  assignees: GitHubUser[];
  labels: GitHubLabel[];
  milestone?: GitHubMilestone | null;
  comments: GitHubComment[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string | null;
  url: string;
}

export interface AgentPromptRequest {
  prompt: string;
  adw_id: string;
  agent_name?: string;
  model?: "sonnet" | "opus";
  dangerously_skip_permissions?: boolean;
  output_file: string;
}

export interface AgentPromptResponse {
  output: string;
  success: boolean;
  session_id?: string | null;
}

export interface AgentTemplateRequest {
  agent_name: string;
  slash_command: SlashCommand;
  args: string[];
  adw_id: string;
  model?: "sonnet" | "opus";
}

export interface ClaudeCodeResultMessage {
  type: string;
  subtype: string;
  is_error: boolean;
  duration_ms: number;
  duration_api_ms: number;
  num_turns: number;
  result: string;
  session_id: string;
  total_cost_usd: number;
}

export interface TestResult {
  test_name: string;
  passed: boolean;
  execution_command: string;
  test_purpose: string;
  error?: string | null;
}

export interface E2ETestResult {
  test_name: string;
  status: "passed" | "failed";
  test_path: string;
  screenshots: string[];
  error?: string | null;
}

export interface ADWStateData {
  adw_id: string;
  issue_number?: string | null;
  branch_name?: string | null;
  plan_file?: string | null;
  issue_class?: IssueClassSlashCommand | null;
}

export interface ReviewIssue {
  review_issue_number: number;
  screenshot_path: string;
  screenshot_url?: string | null;
  issue_description: string;
  issue_resolution: string;
  issue_severity: "skippable" | "tech_debt" | "blocker";
}

export interface ReviewResult {
  success: boolean;
  review_summary: string;
  review_issues: ReviewIssue[];
  screenshots: string[];
  screenshot_urls: string[];
}

export interface DocumentationResult {
  success: boolean;
  documentation_created: boolean;
  documentation_path?: string | null;
  error_message?: string | null;
}
