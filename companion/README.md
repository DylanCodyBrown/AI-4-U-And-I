# Claude presentation companion

A tiny local server that lets a slide button in *"Are You Smarter Than Claude?"*
push a prompt to your **local** `claude` CLI so the demo runs live in a terminal
you keep visible. One-way: the deck sends → Claude Code runs → you read the
terminal. Nothing comes back into the deck except a small ack.

```
deck (GitHub Pages)  ──POST /run {prompt}──▶  this server (127.0.0.1:8765)  ──▶  claude -p "<prompt>"
                                                                                     │
                                                          you watch the output ◀─────┘
```

Why a wrapper at all? Claude Code only makes **outbound** HTTPS calls — it has no
inbound port the browser could hit. This server is the missing inbound endpoint.

## Run

```bash
cd companion
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python server.py
```

You'll see a banner and it will listen on `http://127.0.0.1:8765` (loopback only).
Keep that terminal visible while presenting.

Quick check (in another terminal):

```bash
curl -s http://127.0.0.1:8765/health
curl -s -X POST http://127.0.0.1:8765/run \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"say hello in one line"}'
```

## Configuration (environment variables)

| Variable                 | Default                              | What it does |
| ------------------------ | ------------------------------------ | ------------ |
| `COMPANION_HOST`         | `127.0.0.1`                          | Bind address (keep it loopback). |
| `COMPANION_PORT`         | `8765`                               | Port. |
| `CLAUDE_BIN`             | `claude`                             | Path to the CLI. |
| `CLAUDE_FLAGS`           | `-p`                                 | Flags before the prompt. Add `--dangerously-skip-permissions` to let demos run tools without prompting (auto-approves everything — your call). |
| `COMPANION_TIMEOUT`      | `600`                                | Max seconds per run. |
| `COMPANION_MASK_PROMPT`  | `false`                              | If `true`, hide prompt text in the terminal by default. |
| `COMPANION_TOKEN`        | _(unset)_                            | If set, the deck must send the same value (`X-Companion-Token` header or `"token"` in the body). |
| `COMPANION_ORIGINS`      | Pages + localhost                    | Comma-separated browser origins allowed to call. |

### Masking the prompt

For a surprise demo, hide the prompt text from the audience:

- Globally: `COMPANION_MASK_PROMPT=true python server.py` → banner shows
  `[prompt hidden — N chars]` instead of the text.
- Per slide: send `{"prompt":"...","mask":true}` (overrides the default for that
  one request).

## Endpoints

- `GET /health` → `{status, busy}` — lets a button grey out if the server is down.
- `POST /run` → body `{ "prompt": "...", "mask": true|false (optional), "token": "..." (optional) }`
  - `409 busy` if a demo is already running, `400/415` on bad input,
    `401` bad token, `403` disallowed origin.

## How the deck will call it (next step)

```js
fetch("http://127.0.0.1:8765/run", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt: "Summarize today's agenda", mask: false }),
}).catch(() => {/* companion not running — ignore on stage */});
```

## Safety notes

- Binds to `127.0.0.1` only — never reachable off this machine.
- Cross-origin JSON POSTs trigger a browser preflight; only `COMPANION_ORIGINS`
  pass, so random sites can't drive your Claude. Set `COMPANION_TOKEN` for a
  second factor.
- Prompts are passed to the CLI as a single argument (no shell), so there's no
  shell-injection surface. Prompts are author-controlled (baked into your slides).
- This folder is a **local dev tool**. It isn't part of the deployed site even
  though it lives in the repo.
