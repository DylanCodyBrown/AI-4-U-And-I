---
title: Google Drive
category1: Community
category2: Productivity
description: Search and read Docs, Sheets, and files from a Google Drive account.
---

# Google Drive MCP

A community server that connects to a Google Drive account so an assistant
can search for files and read Docs and Sheets content as context.

## Why use it

- Pull a doc or spreadsheet straight into a conversation instead of
  copy-pasting it
- Search across a shared drive for the file that answers a question
- Keep a running project's source docs one query away instead of re-uploaded
  every time

## Setup

Create OAuth credentials in Google Cloud Console scoped to Drive (read-only
is enough for most uses), then authenticate the server with them. Limit the
scope to the drives or folders you actually want exposed.
