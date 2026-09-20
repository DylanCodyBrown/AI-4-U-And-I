---
title: "Skills vs. MCP: What Your Policy Actually Allows"
category1: Enterprise & Communication
category2: No MCP Needed
description: Why a "no MCP" policy usually still leaves Skills on the table, and how to build your own.
---

# Skills vs. MCP: What Your Policy Actually Allows

"No MCP servers" is a specific rule, not a ban on customizing Claude. It's
worth knowing exactly what it does and doesn't cover before assuming the
whole toolbox is locked.

## The actual difference

| | MCP server | Skill |
|---|---|---|
| What it is | A live connector process that talks to an outside system | A folder of instructions (`SKILL.md`), sometimes with helper scripts |
| Runs where | A server your machine has to reach, often needing install/setup and credentials | Read directly by Claude — no process to install or run |
| What it needs from you | Installing software, granting access to a real system (Slack, a database, a drive) | Adding a folder — nothing to configure or authenticate |
| What it's for | Reaching into something *live and external* | Teaching Claude a repeatable way to do a task it already has the tools for |

A Skill doesn't open a connection to anything. It's closer to a very
detailed instruction sheet than a piece of software — which is exactly why
most "no MCP" policies don't touch it: there's no server to run, no network
connection to a third-party system, and no credentials to manage.

**Check with whoever set the policy before assuming this applies to you** —
this describes the general MCP/Skill distinction, not your specific
company's rules. If in doubt, ask.

## Writing your own

A Skill is one markdown file with a small YAML header:

```markdown
---
name: weekly-status-report
description: Turn my rough notes into our team's status report format.
---

# Weekly Status Report

Given a block of rough notes, produce:
1. A one-line summary
2. What shipped this week
3. What's blocked, and by what
4. Next week's top priority

Keep it to one page. Match the tone of our previous reports if I attach one.
```

Save it, add it in Claude Desktop, and it's available every time — no
install, no server, no approval process beyond whatever your company already
requires for adding a file.

## When you actually do need an MCP

If the task is "reach into a live system and act on it" — post to Slack
automatically, query a production database, keep a file synced as other
people edit it — that's a real MCP use case, and no amount of clever Skill
writing replaces it. Know the difference so you're not stuck reinventing a
connector out of instructions, or assuming you need one when you don't.
