---
name: iterate
description: Retry a task until it passes a stated bar, discarding failed attempts. Use when acceptance criteria are given, or when asked to keep trying until something is right.
---

# Iterate

Attempt, check, discard, repeat.

1. Write the pass/fail bar as a short checklist. If it is unstated, ask for it first.
2. Attempt the task.
3. Check the attempt against every item. Mark each pass or fail.
4. On any fail, discard the attempt and try again differently. Do not patch it.
5. Stop at a pass, or after 3 attempts. If all 3 fail, give the closest attempt and what blocked it.

Carry forward only the checklist and what failed last time.

Isolate each pass: a subagent where you have them, otherwise a separate pass
in this conversation. Carry forward only the short result, not the working detail.
