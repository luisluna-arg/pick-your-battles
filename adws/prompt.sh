#!/usr/bin/env bash
#
# Minimal ADW script — Gateway to agentic coding.
# Calls an agent CLI with a given prompt file or inline prompt.
# Logs output to agents/logs/.
#
# Usage:
#     ./prompt.sh <prompt-file-or-text>
#     ./prompt.sh prompts/build.md "fix the login bug"

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$SCRIPT_DIR/../agents/logs"
mkdir -p "$LOG_DIR"

if [ $# -lt 1 ]; then
    echo "Usage: ./prompt.sh <prompt-file-or-text>"
    exit 1
fi

PROMPT="$*"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/agent_${TIMESTAMP}.log"

# If first argument is a file, read its contents
if [ -f "$1" ]; then
    PROMPT=$(cat "$1")
fi

# Call your agent CLI — replace with your actual command
# Examples:
#   claude -p "$PROMPT"
#   copilot-cli run "$PROMPT"
OUTPUT=$(claude -p "$PROMPT" 2>&1) || EXIT_CODE=$?
EXIT_CODE=${EXIT_CODE:-0}

echo "$OUTPUT" > "$LOG_FILE"
echo "Log saved to: $LOG_FILE"
echo "$OUTPUT"

exit $EXIT_CODE
