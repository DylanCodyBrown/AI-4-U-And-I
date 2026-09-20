---
name: critique
description: Draft an answer, then attack it with fresh eyes before delivering. Use when accuracy matters, when asked for a review or sanity check, or when the work will be acted on.
---

# Critique

Two passes. The second one tries to break the first.

1. Draft the answer.
2. Start a clean pass. Judge the draft only on what it says, not on how it was made.
3. Hunt for wrong claims, missed constraints, unstated assumptions, edge cases.
4. List the flaws. Fix each, or state why it stands.
5. Deliver the corrected answer and one line on what changed.

In step 2, do not defend the draft. Assume it has at least one real flaw.

## Works without subagents

Claude Desktop has no subagent tool. Run each pass in this one conversation and
keep only the short result of each, dropping the working detail. In Claude Code,
the same steps map onto real subagents.
