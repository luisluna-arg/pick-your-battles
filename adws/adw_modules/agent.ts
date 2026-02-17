import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { getSafeSubprocessEnv } from "./utils";
import type {
  AgentPromptRequest,
  AgentPromptResponse,
  AgentTemplateRequest,
} from "./data_types";

const CLAUDE_PATH = process.env.CLAUDE_CODE_PATH || "claude";

const SLASH_COMMAND_MODEL_MAP: Record<string, string> = {
  "/classify_issue": "sonnet",
  "/classify_adw": "sonnet",
  "/generate_branch_name": "sonnet",
  "/implement": "opus",
  "/test": "sonnet",
  "/resolve_failed_test": "sonnet",
  "/test_e2e": "sonnet",
  "/resolve_failed_e2e_test": "sonnet",
  "/review": "opus",
  "/document": "sonnet",
  "/commit": "sonnet",
  "/pull_request": "sonnet",
  "/chore": "sonnet",
  "/bug": "opus",
  "/feature": "opus",
  "/patch": "opus",
};

export function getModelForSlashCommand(slashCommand: string, def = "sonnet") {
  return SLASH_COMMAND_MODEL_MAP[slashCommand] || def;
}

export function checkClaudeInstalled(): string | null {
  try {
    const res = spawnSync(CLAUDE_PATH, ["--version"], { encoding: "utf8" });
    if (res.status !== 0)
      return `Error: Claude Code CLI is not installed. Expected at: ${CLAUDE_PATH}`;
    return null;
  } catch (e) {
    return `Error: Claude Code CLI is not installed. Expected at: ${CLAUDE_PATH}`;
  }
}

function parseJsonlFile(outputFile: string): {
  messages: any[];
  resultMessage?: any;
} {
  try {
    const raw = fs.readFileSync(outputFile, "utf8");
    const lines = raw.split("\n").filter(Boolean);
    const messages = lines.map((l) => JSON.parse(l));
    let resultMessage: any = undefined;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].type === "result") {
        resultMessage = messages[i];
        break;
      }
    }
    return { messages, resultMessage };
  } catch (e) {
    return { messages: [] };
  }
}

export function savePrompt(prompt: string, adwId: string, agentName = "ops") {
  const match = /^(\/\w+)/.exec(prompt);
  if (!match) return; // Skip if no slash command

  const slashCommand = match[1];
  const commandName = slashCommand.slice(1); // Remove leading slash

  const projectRoot = path.resolve(__dirname, "..", "..", "..");
  const promptDir = path.join(
    projectRoot,
    "agents",
    adwId,
    agentName,
    "prompts",
  );
  fs.mkdirSync(promptDir, { recursive: true });
  const file = path.join(promptDir, `${commandName}.txt`);
  fs.writeFileSync(file, prompt);
  console.log(`Saved prompt to: ${file}`);
}

export function promptClaudeCode(
  request: AgentPromptRequest,
): AgentPromptResponse {
  const errMsg = checkClaudeInstalled();
  if (errMsg) return { output: errMsg, success: false };

  savePrompt(request.prompt, request.adw_id, request.agent_name || "ops");
  const outDir = path.dirname(request.output_file);
  if (outDir) fs.mkdirSync(outDir, { recursive: true });

  const cmd = [
    "-p",
    request.prompt,
    "--model",
    request.model || "sonnet",
    "--output-format",
    "stream-json",
    "--verbose",
  ];
  if (request.dangerously_skip_permissions)
    cmd.push("--dangerously-skip-permissions");

  const env = getSafeSubprocessEnv();
  try {
    const child = spawnSync(CLAUDE_PATH, cmd, {
      encoding: "utf8",
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    fs.writeFileSync(request.output_file, child.stdout || "");
    if (child.status !== 0) {
      return { output: String(child.stderr || "claude error"), success: false };
    }
    const { messages, resultMessage } = parseJsonlFile(request.output_file);
    // write JSON array file side-effect
    try {
      fs.writeFileSync(
        request.output_file.replace(/\.jsonl$/, ".json"),
        JSON.stringify(messages, null, 2),
      );
    } catch {}
    if (resultMessage) {
      const session = resultMessage.session_id;
      const isError = resultMessage.is_error || false;
      const subtype = resultMessage.subtype || "";
      if (subtype === "error_during_execution")
        return {
          output: "Error during execution: Agent encountered an error",
          success: false,
          session_id: session,
        };
      return {
        output: resultMessage.result || "",
        success: !isError,
        session_id: session,
      };
    }
    return { output: child.stdout || "", success: true };
  } catch (e: any) {
    return {
      output: `Error executing Claude Code: ${String(e)}`,
      success: false,
    };
  }
}

export function executeTemplate(
  request: AgentTemplateRequest,
): AgentPromptResponse {
  const mappedModel =
    SLASH_COMMAND_MODEL_MAP[request.slash_command] || "sonnet";
  const prompt = `${request.slash_command} ${request.args.join(" ")}`;
  const projectRoot = path.resolve(__dirname, "..", "..", "..");
  const outputDir = path.join(
    projectRoot,
    "agents",
    request.adw_id,
    request.agent_name,
  );
  fs.mkdirSync(outputDir, { recursive: true });
  const outputFile = path.join(outputDir, "raw_output.jsonl");
  const req = {
    prompt,
    adw_id: request.adw_id,
    agent_name: request.agent_name,
    model: mappedModel as any,
    dangerously_skip_permissions: true,
    output_file: outputFile,
  } as AgentPromptRequest;
  return promptClaudeCode(req);
}
