# Agent patterns as Skills

Seven orchestration patterns from the *Context Management for Claude* deck, each
packaged as a standalone Skill. They are deliberately generic: point any of them
at any prompt and it applies that method to whatever you asked for.

Not sure which one fits? Install `analyze-prompt` and let it choose.

| Skill | What it does |
| --- | --- |
| `analyze-prompt` | Reads the task and names which pattern below to use |
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

## Subagents optional

Where subagents exist, each isolated pass maps onto one. Claude Desktop ships
with Claude Code, so that is available there too. In a plain chat the same steps
run as separate passes in one conversation. Either way the rule is the same:
carry forward the short result and drop the working detail, so the main thread
stays small.

## Keeping them cheap

Each file is under 900 bytes. A skill's `description` sits in context
permanently so Claude knows when to reach for it, and the body loads only when
it fires. Keep edits terse for the same reason.
