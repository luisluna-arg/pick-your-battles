#!/usr/bin/env python3
"""
Minimal ADW script — Gateway to agentic coding.
Calls an agent CLI with a given prompt file or inline prompt.
Logs output to agents/logs/.

Usage:
    python prompt.py <prompt-file-or-text>
    python prompt.py prompts/build.md "fix the login bug"
"""
import subprocess
import sys
from pathlib import Path
from datetime import datetime


LOG_DIR = Path(__file__).resolve().parent.parent / "agents" / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)


def run_agent(prompt: str) -> tuple[str, bool]:
    """Execute agent with given prompt and return (output, success)."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = LOG_DIR / f"agent_{timestamp}.log"

    # If prompt is a file path, read its contents
    prompt_path = Path(prompt)
    if prompt_path.exists() and prompt_path.is_file():
        prompt = prompt_path.read_text(encoding="utf-8")

    # Call your agent CLI — replace with your actual command
    # Examples:
    #   claude -p "{prompt}"
    #   copilot-cli run "{prompt}"
    result = subprocess.run(
        ["claude", "-p", prompt],
        capture_output=True,
        text=True,
    )

    output = result.stdout + result.stderr
    log_file.write_text(output, encoding="utf-8")
    print(f"Log saved to: {log_file}")

    return output, result.returncode == 0


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python prompt.py <prompt-file-or-text>")
        sys.exit(1)

    prompt_input = " ".join(sys.argv[1:])
    output, success = run_agent(prompt_input)
    print(output)
    sys.exit(0 if success else 1)
