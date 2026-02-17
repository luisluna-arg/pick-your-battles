import fs from "fs";
import path from "path";
import { ADWStateData } from "./data_types";

export class ADWState {
  static STATE_FILENAME = "adw_state.json";
  adw_id: string;
  data: Partial<ADWStateData> = {};

  constructor(adwId: string) {
    if (!adwId) throw new Error("adw_id is required for ADWState");
    this.adw_id = adwId;
    this.data = { adw_id: this.adw_id };
  }

  update(obj: Partial<ADWStateData>) {
    const core = [
      "adw_id",
      "issue_number",
      "branch_name",
      "plan_file",
      "issue_class",
    ];
    for (const k of Object.keys(obj)) {
      if (core.includes(k)) {
        // @ts-ignore
        this.data[k as keyof ADWStateData] = obj[k as keyof ADWStateData];
      }
    }
  }

  get<T = any>(key: keyof ADWStateData | string, def?: T): any {
    // @ts-ignore
    return this.data[key] ?? def;
  }

  getStatePath(): string {
    const projectRoot = path.resolve(__dirname, "..", "..", "..");
    return path.join(
      projectRoot,
      "agents",
      this.adw_id,
      ADWState.STATE_FILENAME,
    );
  }

  save(workflowStep?: string) {
    const statePath = this.getStatePath();
    fs.mkdirSync(path.dirname(statePath), { recursive: true });
    const out: ADWStateData = {
      adw_id: this.adw_id,
      issue_number: this.data.issue_number ?? null,
      branch_name: this.data.branch_name ?? null,
      plan_file: this.data.plan_file ?? null,
      issue_class: this.data.issue_class ?? null,
    };
    fs.writeFileSync(statePath, JSON.stringify(out, null, 2));
    // simple console logging - real logger should be used by caller
    console.log(`Saved state to ${statePath}`);
    if (workflowStep) console.log(`State updated by: ${workflowStep}`);
  }

  static load(adwId: string): ADWState | null {
    const projectRoot = path.resolve(__dirname, "..", "..", "..");
    const statePath = path.join(
      projectRoot,
      "agents",
      adwId,
      ADWState.STATE_FILENAME,
    );
    if (!fs.existsSync(statePath)) return null;
    try {
      const raw = fs.readFileSync(statePath, "utf8");
      const data = JSON.parse(raw) as ADWStateData;
      const st = new ADWState(data.adw_id);
      st.data = data;
      console.log(`🔍 Found existing state from ${statePath}`);
      console.log(JSON.stringify(data, null, 2));
      return st;
    } catch (e) {
      console.error(`Failed to load state from ${statePath}: ${e}`);
      return null;
    }
  }

  static fromStdin(): ADWState | null {
    // Check if stdin is available (piped input)
    if (process.stdin.isTTY) {
      return null;
    }

    try {
      // Read from stdin synchronously
      const fs = require("fs");
      const inputData = fs.readFileSync(0, "utf-8"); // 0 is stdin file descriptor

      if (!inputData.trim()) {
        return null;
      }

      const data = JSON.parse(inputData) as ADWStateData;
      const state = new ADWState(data.adw_id);
      state.data = data;
      console.log("🔍 Loaded state from stdin");
      console.log(JSON.stringify(data, null, 2));
      return state;
    } catch (e) {
      // Invalid JSON or EOF - return null
      return null;
    }
  }

  toStdout() {
    const output = {
      adw_id: this.data.adw_id,
      issue_number: this.data.issue_number ?? null,
      branch_name: this.data.branch_name ?? null,
      plan_file: this.data.plan_file ?? null,
      issue_class: this.data.issue_class ?? null,
    };
    console.log(JSON.stringify(output, null, 2));
  }
}
