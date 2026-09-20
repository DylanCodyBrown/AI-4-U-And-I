---
name: analyze-prompt
description: Pick which agent pattern fits a task before starting it. Use when unsure how to approach a prompt, or when asked which pattern, method or skill to use.
---

# Analyze Prompt

Name the pattern that fits, say why in one line, then run it.

1. Read the task. Identify what makes it hard: breadth, accuracy, choice, or a bar to clear.
2. Match it against the table below. Pick one.
3. State it in one line: `Pattern: <name> - <reason>`.
4. Run that pattern. If its skill is installed, use it.

| Signal in the task | Pattern |
| --- | --- |
| Spans domains, needs one owner | `route` |
| Several independent angles to cover | `fan-out` |
| Must be correct, will be acted on | `critique` |
| Many possible answers, want the best | `shortlist` |
| A fixed set of options, need one winner | `tournament` |
| A clear pass/fail bar to meet | `iterate` |

Nothing matches: answer directly and say so. Two match: run them in sequence, best fit first.
