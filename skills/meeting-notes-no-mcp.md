---
title: Meeting Notes to Action Items
category1: Productivity
category2: No MCP Needed
description: Turn a raw transcript or your own scratch notes into structured, assignable action items — no connector required.
---

# Meeting Notes to Action Items

A "meeting notes" MCP would pull a transcript straight from your calendar or
call tool. Without one, you're pasting or attaching instead of connecting —
the output can be just as structured.

## How to do it

1. **Get the raw material into the chat.** Paste a transcript, attach a
   `.txt`/`.docx` export from your call tool, or just type your own rough
   notes as you remember the meeting. Claude doesn't need clean input to
   produce a clean summary.
2. **Ask for a specific shape**, not just "summarize this." A useful prompt
   names the sections you want:
   > Turn this into: a 3-sentence summary, decisions made, and action items
   > with an owner and a rough deadline for each. Flag anything that sounded
   > like a decision but was never confirmed.
3. **Have it flag ambiguity instead of guessing.** Real meetings have
   half-finished sentences and "let's circle back on that." Ask Claude to
   mark unclear ownership or open questions rather than silently assigning
   them to someone.
4. **Ask for a follow-up email draft** in the same pass if you need one —
   Claude can write from the same notes it just structured, so the recap
   and the summary stay consistent with each other.

## Making it repeatable

If you run the same kind of meeting every week, save the shape you want as a
**Skill** (a markdown file with the format you always ask for) instead of
re-typing the instructions every time. A Skill is just a folder Claude reads
— it isn't a server or a connector, so it doesn't run into the same
restriction an MCP install would.

## Where this hits a wall

Anything that needs to *reach into* another system — filing the action items
directly into a ticket tracker, or pulling the transcript automatically the
moment a call ends — needs a live connector. Without one, the human copies
the output over. More steps, but nothing to install.
