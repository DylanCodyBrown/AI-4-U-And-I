---
title: Slack
category1: Community
category2: Communication
description: Read channels, search history, and post messages through MCP.
---

# Slack MCP

A community server that wires an assistant into a Slack workspace — listing
channels, reading message history, and posting replies as tools it can call.

## Why use it

- Summarize a channel's activity without opening Slack
- Draft and send a reply, or react to a message, from a conversation
- Search across channel history for a decision or thread

## Setup

Create a Slack app with a bot token scoped to the channels you want exposed,
then point your client at the server with that token. Start with read scopes
only and add posting scopes once you trust the workflow.
