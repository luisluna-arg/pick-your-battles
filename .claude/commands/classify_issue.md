# Github Issue Command Selection

Based on the `Github Issue` below, follow the `Instructions` to select the appropriate command to execute based on the `Command Mapping`.

## Variables

issue_number: $1

## Fetch Issue Data

First, fetch the issue details using gh CLI:

```bash
gh issue view {issue_number} --json title,body,labels
```

Use the fetched issue data to classify the issue according to the instructions below.

## Instructions

- Based on the details in the fetched Github Issue, select the appropriate command to execute.
- Respond exclusively with '/' followed by the command to execute.
- Use the command mapping to help you decide which command to respond with.
- Think hard about the command to execute.

## Command Mapping

- Respond with `/chore` if the issue is a chore.
- Respond with `/bug` if the issue is a bug.
- Respond with `/feature` if the issue is a feature.
- Respond with `0` if the issue isn't any of the above.
