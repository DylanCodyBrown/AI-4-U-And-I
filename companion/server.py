"""
Presentation companion server for "Are You Smarter Than Claude?".

A slide button POSTs a prompt here; we shell out to the local `claude` CLI in
print mode and let its output stream straight into the terminal you keep visible
while presenting. One-way push: the deck sends, Claude Code runs, you read the
terminal. Nothing is sent back to the deck except a small ack.

Run:
    pip install -r requirements.txt
    python server.py

Then it listens on http://127.0.0.1:8765 (localhost only).

C#/.NET note: think of this as a tiny minimal-API host (like
`WebApplication.CreateBuilder`) bound to loopback, where each endpoint shells out
to an external process via `Process.Start`.
"""
from __future__ import annotations

import os
import shlex
import subprocess
import sys
import threading
from datetime import datetime
from typing import Final

from flask import Flask, Response, jsonify, request

# --- Configuration (env-overridable) ----------------------------------------
# In C# these would be appsettings.json / IConfiguration values.
HOST: Final[str] = os.environ.get("COMPANION_HOST", "127.0.0.1")
PORT: Final[int] = int(os.environ.get("COMPANION_PORT", "8765"))
CLAUDE_BIN: Final[str] = os.environ.get("CLAUDE_BIN", "claude")
# Flags passed to claude before the prompt. Default is headless print mode.
# Add "--dangerously-skip-permissions" here ONLY if you want demos to run tools
# without prompting (convenient on stage, but it auto-approves everything).
CLAUDE_FLAGS: Final[str] = os.environ.get("CLAUDE_FLAGS", "-p")
# Hard ceiling so a hung run never blocks the next slide.
TIMEOUT_SECONDS: Final[int] = int(os.environ.get("COMPANION_TIMEOUT", "600"))
# Default for hiding the prompt text in the terminal banner (so the audience
# watching your screen doesn't read it). A request can override per-slide with
# a JSON "mask": true/false.
MASK_PROMPT: Final[bool] = os.environ.get("COMPANION_MASK_PROMPT", "false").lower() in (
    "1",
    "true",
    "yes",
    "on",
)
# Optional shared secret. If set, the deck must send the same value (header
# X-Companion-Token or JSON "token"); otherwise the request is rejected.
TOKEN: Final[str | None] = os.environ.get("COMPANION_TOKEN") or None
# Browser origins allowed to call us. The browser enforces this on cross-origin
# JSON POSTs (they trigger a preflight), which keeps random websites from
# driving your Claude. Comma-separated; override with COMPANION_ORIGINS.
ALLOWED_ORIGINS: Final[frozenset[str]] = frozenset(
    o.strip()
    for o in os.environ.get(
        "COMPANION_ORIGINS",
        "https://dylancodybrown.github.io,"
        "http://localhost:8000,http://127.0.0.1:8000",
    ).split(",")
    if o.strip()
)

app = Flask(__name__)

# Only one demo runs at a time. `Lock` here is like C#'s `lock`/SemaphoreSlim;
# we try to acquire without blocking so a second click returns "busy" instead of
# queueing up mid-presentation.
_run_lock = threading.Lock()


# --- CORS helpers ------------------------------------------------------------
def _origin_allowed(origin: str | None) -> bool:
    return origin is not None and origin in ALLOWED_ORIGINS


def _apply_cors(resp: Response, origin: str | None) -> Response:
    """Echo back the caller's origin if we trust it (the spec wants an exact
    origin, not '*', when credentials/preflights are involved)."""
    if _origin_allowed(origin):
        resp.headers["Access-Control-Allow-Origin"] = origin  # type: ignore[assignment]
        resp.headers["Vary"] = "Origin"
        resp.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        resp.headers["Access-Control-Allow-Headers"] = "Content-Type, X-Companion-Token"
        resp.headers["Access-Control-Max-Age"] = "600"
    return resp


@app.after_request
def add_cors(resp: Response) -> Response:  # runs for every response
    return _apply_cors(resp, request.headers.get("Origin"))


# --- Terminal output ---------------------------------------------------------
def _banner(prompt: str, masked: bool) -> None:
    ts = datetime.now().strftime("%H:%M:%S")
    bar = "─" * 64
    # When masked, show only that a prompt ran (and its length) — never the text.
    shown = f"[prompt hidden — {len(prompt)} chars]" if masked else prompt
    print(f"\n\033[38;5;208m{bar}\033[0m", flush=True)
    print(f"\033[38;5;208m▶ [{ts}] running prompt\033[0m", flush=True)
    print(f"\033[2m{shown}\033[0m", flush=True)
    print(f"\033[38;5;208m{bar}\033[0m\n", flush=True)


def _footer(returncode: int) -> None:
    ok = returncode == 0
    mark = "\033[32m✔ done\033[0m" if ok else f"\033[31m✘ exited {returncode}\033[0m"
    print(f"\n{mark}\n", flush=True)


def _run_claude(prompt: str, masked: bool) -> int:
    """Invoke the claude CLI, inheriting our stdout/stderr so its output streams
    directly into this terminal. Args are passed as a list (never a shell
    string), so the prompt can't be interpreted by a shell — no injection."""
    cmd: list[str] = [CLAUDE_BIN, *shlex.split(CLAUDE_FLAGS), prompt]
    _banner(prompt, masked)
    try:
        # stdout/stderr default to inheriting the parent's — exactly what we want
        # for a live "watch it in my terminal" feel. Like Process.Start with
        # redirect disabled so the child writes to the same console.
        proc = subprocess.run(cmd, timeout=TIMEOUT_SECONDS, check=False)
        _footer(proc.returncode)
        return proc.returncode
    except FileNotFoundError:
        print(f"\033[31m✘ '{CLAUDE_BIN}' not found on PATH\033[0m", flush=True)
        return 127
    except subprocess.TimeoutExpired:
        print(f"\033[31m✘ timed out after {TIMEOUT_SECONDS}s\033[0m", flush=True)
        return 124


# --- Routes ------------------------------------------------------------------
@app.route("/health", methods=["GET", "OPTIONS"])
def health() -> Response:
    """Lets the deck check we're alive (so a button can grey out if not)."""
    return jsonify(status="ok", service="claude-companion", busy=_run_lock.locked())


@app.route("/run", methods=["POST", "OPTIONS"])
def run() -> Response | tuple[Response, int]:
    if request.method == "OPTIONS":
        return Response(status=204)  # CORS preflight; headers added in after_request

    origin = request.headers.get("Origin")
    if origin is not None and not _origin_allowed(origin):
        return jsonify(error="origin not allowed"), 403

    if TOKEN is not None:
        sent = request.headers.get("X-Companion-Token") or (
            request.json.get("token") if request.is_json else None
        )
        if sent != TOKEN:
            return jsonify(error="bad or missing token"), 401

    if not request.is_json:
        return jsonify(error="expected application/json"), 415

    data = request.get_json(silent=True) or {}
    prompt = data.get("prompt")
    if not isinstance(prompt, str) or not prompt.strip():
        return jsonify(error="missing 'prompt'"), 400

    # Per-request mask flag overrides the server default; otherwise use the default.
    mask_raw = data.get("mask")
    masked = bool(mask_raw) if isinstance(mask_raw, bool) else MASK_PROMPT

    # Non-blocking acquire: if a demo is already running, tell the deck we're busy
    # rather than stacking prompts.
    if not _run_lock.acquire(blocking=False):
        return jsonify(error="busy", message="a prompt is already running"), 409
    try:
        returncode = _run_claude(prompt.strip(), masked)
    finally:
        _run_lock.release()

    return jsonify(status="ok", returncode=returncode)


def _startup_banner() -> None:
    print("\033[38;5;208m" + "═" * 64 + "\033[0m")
    print("\033[1m  Claude presentation companion\033[0m")
    print(f"  listening on   http://{HOST}:{PORT}")
    print(f"  claude command {CLAUDE_BIN} {CLAUDE_FLAGS} \"<prompt>\"")
    print(f"  allowed origins {', '.join(sorted(ALLOWED_ORIGINS)) or '(none)'}")
    print(f"  token required  {'yes' if TOKEN else 'no'}")
    print(f"  mask prompts    {'yes (default)' if MASK_PROMPT else 'no (per-request opt-in)'}")
    print("  keep this terminal visible while you present.")
    print("\033[38;5;208m" + "═" * 64 + "\033[0m", flush=True)


if __name__ == "__main__":
    _startup_banner()
    # threaded=True so /health stays responsive even while a demo runs.
    # Bound to 127.0.0.1 only — never exposed beyond this machine.
    app.run(host=HOST, port=PORT, threaded=True)
