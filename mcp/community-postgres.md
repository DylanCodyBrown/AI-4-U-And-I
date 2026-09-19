---
title: PostgreSQL
category1: Community
category2: Databases
description: Give an assistant read access to a Postgres database's schema and rows.
---

# PostgreSQL MCP

A community server that connects to a Postgres database and exposes its schema
and query results as MCP tools, so an assistant can inspect tables and answer
questions about the data directly.

## Why use it

- Ask questions about your data in plain language instead of writing SQL by hand
- Let the model inspect a schema before it writes a query, instead of guessing
- Read-only by default, so exploration can't accidentally change data

## Setup

Point the server at a connection string for the database you want to expose.
Use a read-only role scoped to the schemas you actually want visible — don't
hand over a superuser connection.
