# AI-4-U&I

A small, dependency-free GitHub Pages site with a terminal/CLI aesthetic. It's a
browsable, structured knowledge base — explorable by humans and agents alike. A
Claude-Code-style command bar at the bottom of every page navigates the whole
site by slash command.

## Pages

| Command     | Page     | What it is                                            |
| ----------- | -------- | ----------------------------------------------------- |
| `/home`     | Home     | Hub / landing                                         |
| `/blog`     | Blog     | Weekly stories                                        |
| `/skills`   | Skills   | Browsable skill library (tree + popular)              |
| `/mcp`      | MCP      | Browsable MCP servers, by Local / Community / Homebrewed |
| `/agents`   | Agents   | Browsable agents (same layout as Skills)              |
| `/learning` | Learning | Interactive HTML learning docs                        |

## How content is organized

Each browsable section is backed by a **folder you curate**. Drop a file in,
and it shows up — a generated `index.json` manifest is the machine-readable
index (also handy for agents crawling the site).

| Section    | Folder      | File type | Grouped by                          | Opens in viewer        |
| ---------- | ----------- | --------- | ----------------------------------- | ---------------------- |
| Skills     | `skills/`   | `.md`     | `category1 → category2`             | `view.html` (rendered) |
| MCP        | `mcp/`      | `.md`     | Local / Community / Homebrewed      | `view.html` (rendered) |
| Agents     | `agents/`   | `.md`     | `category1 → category2`             | `view.html` (rendered) |
| Learning   | `learning/` | `.html`   | optional `category1 / category2`    | the doc itself, new tab|

- **Markdown sections** (skills/mcp/agents): metadata comes from YAML frontmatter
  (`title`, `category1`, `category2`, `description`). See each folder's `README.md`.
- **Learning**: self-contained interactive HTML docs. Metadata comes from the
  `<head>` (`<title>`, `<meta name="intro|category1|category2">`).

### Popular skills (ingested content)

The Skills page's right column isn't links — it's popular skills whose **content
is stored in this repo** under `skills/popular/`, openable in the local viewer.
Refresh them (one-time, re-runnable):

```bash
node scripts/ingest-popular.mjs   # fetch popular skills' content into skills/popular/
node scripts/build-index.mjs      # rebuild manifests (incl. skills/popular.json)
```

Each ingested file keeps `source` / `author` / `license` frontmatter pointing back
to the original. Only openly-licensed (Apache-2.0) skills are copied.

### For AI agents (the breadcrumb trail)

The site is built to be crawled by agents, not just people. `node scripts/build-index.mjs`
also emits, at the site root:

- **`llms.txt`** — the conventional LLM-facing map ([llmstxt.org](https://llmstxt.org)):
  a markdown list of every resource with absolute, directly-downloadable URLs.
- **`site.json`** — one aggregate manifest: every section + item with both an
  `open` URL (rendered viewer) and a `download` URL (the raw, directly-fetchable file).
- **`sitemap.xml`** + **`robots.txt`** — crawl discovery; robots points agents at
  `llms.txt` / `site.json`.
- Each page also carries `<link rel="alternate" type="application/json" href="site.json">`
  so an agent reading HTML is pointed straight at the JSON.

An agent can fetch `site.json` once and download anything directly — no scraping,
no JS. The deployed base URL is set via `BASE_URL` at the top of
`scripts/build-index.mjs` (change it for a custom domain).

### Rebuilding the manifests

Manifests regenerate automatically via the **Build indexes** GitHub Action on
push, or locally:

```bash
node scripts/build-index.mjs
```

## The command bar

Every page mounts the bar into `<div id="cmdbar"></div>` via `app.js`, driven by
the central `SITE` registry. Type `/` to list everything; `↑ ↓` select, `↵` go,
`esc` clear. Pressing `/` anywhere focuses it. Add a destination by adding a
registry entry, or tag any link with `data-cmd` / `data-desc` to index it.

## Local preview

```bash
python3 -m http.server
# open http://localhost:8000
```

## Presentation companion (local)

`companion/` is a small **local** Flask server that lets a slide button in an
interactive learning doc push a prompt to your own `claude` CLI, so a demo runs
live in a terminal you keep visible while presenting. One-way: the deck sends →
Claude Code runs → you watch the terminal. It is a local dev tool and is **not**
part of the deployed site.

Why it exists: Claude Code only makes *outbound* HTTPS calls — it has no inbound
port a browser could hit. This server is that missing inbound endpoint.

```
deck (GitHub Pages) ──POST /run {prompt}──▶ companion (127.0.0.1:8765) ──▶ claude -p "<prompt>"
```

### Setup

Requires Python 3.10+ and the `claude` CLI installed & authenticated.

```bash
cd companion
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python server.py                 # listens on http://127.0.0.1:8765 (loopback only)
```

Keep that terminal visible while presenting. Smoke-test it from another terminal:

```bash
curl -s http://127.0.0.1:8765/health
curl -s -X POST http://127.0.0.1:8765/run \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"say hello in one line"}'
```

### Useful options (env vars)

| Variable                | Default     | Purpose                                                        |
| ----------------------- | ----------- | -------------------------------------------------------------- |
| `COMPANION_MASK_PROMPT` | `false`     | Hide prompt text in the terminal (or per request `"mask":true`). |
| `CLAUDE_FLAGS`          | `-p`        | Add `--dangerously-skip-permissions` to let demos run tools unattended (auto-approves everything). |
| `COMPANION_TOKEN`       | _(unset)_   | Shared secret the deck must send (second factor).              |
| `COMPANION_ORIGINS`     | Pages + localhost | Browser origins allowed to call.                         |

Full docs, endpoints, and safety notes: [`companion/README.md`](companion/README.md).

## Deploy

**Settings → Pages**, source = `main`, folder `/ (root)`.
