---
name: presentation-companion
description: Run the live-demo companion for the "Context management for Claude" slide deck. Use when the user wants to present that deck and have its slide buttons drive the local `claude` CLI so demos run live in a terminal. Starts a small local Flask server on 127.0.0.1:8765 that the deck POSTs prompts to.
---

# Context management for Claude — presentation companion

This skill sets up and runs the local companion server for the interactive deck
**"Context management for Claude"**
(https://dylancodybrown.github.io/AI-4-U-And-I/learning/context-management-for-claude.html).

The deck is a static GitHub Pages site. Some slides have "Run it on Claude" and
auto-play buttons that POST a prompt to a small local server, which shells out to
the `claude` CLI in print mode so the output streams into a terminal you keep
visible while presenting. One-way: deck → server → `claude -p "<prompt>"` → your
terminal. Nothing is sent back to the deck except a small ack.

If the server is not running, the deck silently falls back to copying the prompt
to your clipboard, so the talk never breaks.

## Source

Everything lives in the GitHub repo **DylanCodyBrown/AI-4-U-And-I**, folder
`companion/`:

- Server: https://raw.githubusercontent.com/DylanCodyBrown/AI-4-U-And-I/main/companion/server.py
- Requirements: https://raw.githubusercontent.com/DylanCodyBrown/AI-4-U-And-I/main/companion/requirements.txt
- README: https://raw.githubusercontent.com/DylanCodyBrown/AI-4-U-And-I/main/companion/README.md

## Install (once)

1. Get the files. Either clone the repo:
   ```bash
   git clone https://github.com/DylanCodyBrown/AI-4-U-And-I.git
   cd AI-4-U-And-I/companion
   ```
   or download just `server.py` and `requirements.txt` from the raw URLs above
   into a local `presentation-companion/` folder.
2. Create a virtualenv and install Flask:
   ```bash
   python -m venv .venv
   # Windows:        .venv\Scripts\activate
   # macOS / Linux:  source .venv/bin/activate
   pip install -r requirements.txt
   ```
3. Confirm the `claude` CLI is installed and on PATH: `claude --version`.

## Run (before each talk)

```bash
python server.py
```

It listens on http://127.0.0.1:8765 (loopback only). Keep that terminal visible,
open the deck, and present — the slide buttons drive this terminal.

Useful switches:

- Let demos run tools without a permission prompt on stage:
  `CLAUDE_FLAGS="-p --dangerously-skip-permissions" python server.py`
- Hide prompt text from the audience:
  `COMPANION_MASK_PROMPT=true python server.py`
- Health check (another terminal): `curl http://127.0.0.1:8765/health`

## How the deck reaches it

The deck's buttons call `pushClaude(prompt)` which does
`POST http://127.0.0.1:8765/run` with `{"prompt": "..."}`. The server only
accepts the browser origins listed in `COMPANION_ORIGINS` (the Pages site plus
localhost by default) and binds to `127.0.0.1`, so no other machine can reach it.
Prompts are passed to the CLI as a single argument (no shell), so there is no
shell-injection surface.
