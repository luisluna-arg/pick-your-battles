<#
.SYNOPSIS
    Minimal ADW script — Gateway to agentic coding.
    Calls an agent CLI with a given prompt file or inline prompt.
    Logs output to agents/logs/.

.EXAMPLE
    .\prompt.ps1 "fix the login bug"
    .\prompt.ps1 prompts\build.md
#>

param(
    [Parameter(Mandatory, Position = 0, ValueFromRemainingArguments)]
    [string[]]$PromptArgs
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$LogDir = Join-Path $ScriptDir "..\agents\logs"
if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir -Force | Out-Null }

$Prompt = $PromptArgs -join " "
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$LogFile = Join-Path $LogDir "agent_$Timestamp.log"

# If first argument is a file, read its contents
if (Test-Path $PromptArgs[0] -PathType Leaf) {
    $Prompt = Get-Content $PromptArgs[0] -Raw
}

# Call your agent CLI — replace with your actual command
# Examples:
#   claude -p $Prompt
#   copilot-cli run $Prompt
try {
    $Output = claude -p $Prompt 2>&1 | Out-String
    $Output | Set-Content -Path $LogFile -Encoding UTF8
    Write-Host "Log saved to: $LogFile"
    Write-Host $Output
    exit 0
}
catch {
    $Output = $_.Exception.Message
    $Output | Set-Content -Path $LogFile -Encoding UTF8
    Write-Host "Log saved to: $LogFile"
    Write-Error $Output
    exit 1
}
