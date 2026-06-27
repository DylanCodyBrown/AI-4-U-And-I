---
title: Clean Architecture in Practice
category1: App Architecture
description: Keep business rules independent of frameworks, UI, and databases.
---

# Clean Architecture in Practice

Clean architecture organizes code into concentric layers so that **dependencies
point inward** — toward your business rules, away from frameworks and I/O.

## The layers

1. **Entities** — core business objects and rules.
2. **Use cases** — application-specific orchestration of entities.
3. **Interface adapters** — controllers, presenters, gateways.
4. **Frameworks & drivers** — the web, the database, external services.

## The dependency rule

> Source code dependencies only point inward. Nothing in an inner circle knows
> anything about an outer circle.

This is what lets you swap a database or UI without touching business logic.

## A quick smell test

- Can you test your use cases without a database or web server? If not, your
  dependencies are probably pointing the wrong way.
