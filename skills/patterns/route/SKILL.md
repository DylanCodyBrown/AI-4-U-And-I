---
name: route
description: Route a request to one specialist role instead of answering as a generalist. Use when a task spans several domains, or the user asks to triage, delegate, or pick the right expert.
---

# Route

Pick one role. Answer as that role only.

1. Read the request. Name the 2-5 roles that could own it.
2. Choose the single best fit. State it in one line: `Routing to: <role>`.
3. Answer wholly as that role. Ignore the others.
4. If two roles are genuinely required, do them in sequence, not at once.

Keep the routing note to one line. Do not explain the roles you rejected.

## Works without subagents

Claude Desktop has no subagent tool. Run each pass in this one conversation and
keep only the short result of each, dropping the working detail. In Claude Code,
the same steps map onto real subagents.
