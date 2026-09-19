---
title: Puppeteer
category1: Community
category2: Browser Automation
description: Drive a real browser — navigate, click, fill forms, take screenshots.
---

# Puppeteer MCP

A community server that drives a headless Chromium browser through Puppeteer,
exposing navigation, clicking, form-filling, and screenshotting as MCP tools.

## Why use it

- Test a web app the same way a person would, not just via an API
- Pull content off a page that only renders after JavaScript runs
- Capture a screenshot as visual proof of what a page actually shows

## Setup

Point your client at the server; it launches its own browser instance, so
there's no extra service to run. Keep it scoped to trusted sites — it will
click and type wherever the model tells it to.
