---
title: Finite State Machines for Game AI
category1: Game Development
category2: AI & Behavior
description: Model enemy and NPC behavior with clean, debuggable state machines.
---

# Finite State Machines for Game AI

A finite state machine (FSM) models behavior as a set of **states** and the
**transitions** between them. They're a reliable first tool for enemy and NPC AI.

## Core idea

- An entity is always in exactly one state (e.g. `Idle`, `Patrol`, `Chase`, `Attack`).
- Transitions fire on conditions (player spotted, health low, target lost).

```text
Idle ──see player──▶ Chase ──in range──▶ Attack
  ▲                    │                    │
  └──────lost target───┴────────────────────┘
```

## Minimal implementation

```csharp
enum State { Idle, Chase, Attack }
State state = State.Idle;

void Tick() {
    switch (state) {
        case State.Idle:   if (CanSeePlayer())  state = State.Chase;  break;
        case State.Chase:  if (InAttackRange()) state = State.Attack; break;
        case State.Attack: if (!InAttackRange()) state = State.Chase; break;
    }
}
```

## When to reach for something else

- Many overlapping behaviors → consider a **behavior tree**.
- Planning toward goals → consider **GOAP** or **utility AI**.
