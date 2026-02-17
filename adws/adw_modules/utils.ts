import fs from "fs";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";

export function makeAdwId(): string {
  return uuidv4().substring(0, 8);
}

type Logger = {
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug: (...args: any[]) => void;
};

export function setupLogger(
  adwId: string,
  triggerType = "adw_plan_build",
): Logger {
  const projectRoot = path.resolve(__dirname, "..", "..", "..");
  const logDir = path.join(projectRoot, "agents", adwId, triggerType);
  fs.mkdirSync(logDir, { recursive: true });
  const logFile = path.join(logDir, "execution.log");

  function writeFile(level: string, msg: string) {
    const line = `${new Date().toISOString()} - ${level} - ${msg}\n`;
    try {
      fs.appendFileSync(logFile, line);
    } catch (e) {
      // ignore file write errors
    }
  }

  return {
    info: (...args: any[]) => {
      console.log(...args);
      writeFile("INFO", args.map(String).join(" "));
    },
    warn: (...args: any[]) => {
      console.warn(...args);
      writeFile("WARN", args.map(String).join(" "));
    },
    error: (...args: any[]) => {
      console.error(...args);
      writeFile("ERROR", args.map(String).join(" "));
    },
    debug: (...args: any[]) => {
      // Keep debug quiet to console.debug
      console.debug(...args);
      writeFile("DEBUG", args.map(String).join(" "));
    },
  };
}

export function getLogger(adwId: string): Logger {
  return setupLogger(adwId);
}

export function parseJson<T = any>(text: string): T {
  // Try to extract JSON from markdown code fences
  const codeBlock = /```(?:json)?\s*\n([\s\S]*?)\n```/i.exec(text);
  let jsonStr = codeBlock ? codeBlock[1].trim() : text.trim();

  if (!jsonStr.startsWith("{") && !jsonStr.startsWith("[")) {
    const arrStart = jsonStr.indexOf("[");
    const arrEnd = jsonStr.lastIndexOf("]");
    const objStart = jsonStr.indexOf("{");
    const objEnd = jsonStr.lastIndexOf("}");
    if (
      arrStart !== -1 &&
      (objStart === -1 || arrStart < objStart) &&
      arrEnd !== -1
    ) {
      jsonStr = jsonStr.slice(arrStart, arrEnd + 1);
    } else if (objStart !== -1 && objEnd !== -1) {
      jsonStr = jsonStr.slice(objStart, objEnd + 1);
    }
  }

  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    throw new Error(
      `Failed to parse JSON: ${String(e)}. Text: ${jsonStr.slice(0, 200)}`,
    );
  }
}

export function getSafeSubprocessEnv(): Record<string, string> {
  const env: Record<string, string | undefined> = {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    GITHUB_PAT: process.env.GITHUB_PAT,
    CLAUDE_CODE_PATH: process.env.CLAUDE_CODE_PATH || "claude",
    CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR:
      process.env.CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR,
    E2B_API_KEY: process.env.E2B_API_KEY,
    CLOUDFLARED_TUNNEL_TOKEN: process.env.CLOUDFLARED_TUNNEL_TOKEN,
    HOME: process.env.HOME || os.homedir(),
    USER: process.env.USER,
    PATH: process.env.PATH,
    SHELL: process.env.SHELL,
    TERM: process.env.TERM,
    LANG: process.env.LANG,
    LC_ALL: process.env.LC_ALL,
    PYTHONPATH: process.env.PYTHONPATH,
    PYTHONUNBUFFERED: "1",
    PWD: process.cwd(),
  };

  if (process.env.GITHUB_PAT) env.GH_TOKEN = process.env.GITHUB_PAT;

  const filtered: Record<string, string> = {};
  for (const k of Object.keys(env)) {
    const v = env[k as keyof typeof env];
    if (v !== undefined && v !== null) filtered[k] = v;
  }
  return filtered;
}
