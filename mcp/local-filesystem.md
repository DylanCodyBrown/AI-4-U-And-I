---
title: Filesystem
category1: Local
category2: Files
description: Read and write files on your own machine from your assistant.
---

# Filesystem MCP

Gives an assistant scoped access to read and write files in directories you
allow — entirely on your machine.

## Why use it

- Let the assistant read project files for context
- Generate or edit files in a sandboxed folder

## Setup

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/you/allow"]
    }
  }
}
```

Only the directories you list are accessible.
