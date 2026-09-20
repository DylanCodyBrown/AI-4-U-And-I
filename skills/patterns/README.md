# Agent patterns as Skills

Six orchestration patterns from the *Context Management for Claude* deck, each
packaged as a standalone Skill. They are deliberately generic: point any of them
at any prompt and it applies that method to whatever you asked for.

| Skill | What it does |
| --- | --- |
| `route` | Picks one specialist role and answers as that role only |
| `fan-out` | Works several angles separately, merges only the conclusions |
| `critique` | Drafts, then attacks the draft with fresh eyes before delivering |
| `shortlist` | Generates several candidates, keeps the best one |
| `tournament` | Compares options head-to-head until one wins |
| `iterate` | Retries until the work passes a stated bar |

## Installing

**Claude Desktop / claude.ai** — download the `.zip` and add it as a custom
Skill in Claude's settings. The archive already has the right shape: a folder
named after the skill with `SKILL.md` inside it.

**Claude Code** — unzip into your skills directory instead:

```bash
unzip route.zip -d ~/.claude/skills/     # personal, all projects
unzip route.zip -d .claude/skills/       # this project only
```

Exact menu wording moves around between versions, so follow whatever your
current Claude build calls custom Skills rather than a screenshot.

## They work without subagents

Claude Desktop has no subagent tool, so each skill is written to run its passes
inside one conversation and keep only the short result of each, dropping the
working detail in between. That is what makes the pattern pay off: the main
thread stays small. In Claude Code the same steps map onto real subagents.

## Keeping them cheap

Each file is under 900 bytes. A skill's `description` sits in context
permanently so Claude knows when to reach for it, and the body loads only when
it fires. Keep edits terse for the same reason.
