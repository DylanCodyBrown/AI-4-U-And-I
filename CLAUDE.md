# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

AI-4-U&I is a dependency-free GitHub Pages site: a browsable, agent-crawlable
knowledge base of AI skills, MCP servers, agents, blog posts, and interactive
learning docs, fronted by a Claude-Code-style command bar. Pure static
HTML/CSS/vanilla JS — no build system, no npm, no framework.

## Common commands

```bash
# Local preview (no build step — just serve the files)
python3 -m http.server            # then open http://localhost:8000

# Rebuild every manifest: <section>/index.json + site.json + llms.txt
#                         + sitemap.xml + robots.txt (and *.popular.json)
node scripts/build-index.mjs

# Fetch popular skills' content into skills/popular/ (openly-licensed only),
# then rebuild manifests so skills/popular.json picks them up
node scripts/ingest-popular.mjs
node scripts/build-index.mjs
```

There is no test suite and nothing to compile. A **Build indexes** GitHub Action
reruns `build-index.mjs` on push to `main`, so committing content is enough —
regenerating manifests locally is only needed to preview them before pushing.

## Architecture

**Static Pages site.** Every page is hand-written HTML that loads the shared
`app.js` and `styles.css`. Deploy is Settings → Pages, source `main`, folder `/`.

**Command bar (`app.js`).** Every page mounts the bar into
`<div id="cmdbar"></div>`. It is driven by a single `SITE` registry array at the
top of `app.js` — that array is the source of truth for every navigable
destination. Add a page by adding a `SITE` entry, or index an in-page link by
tagging it with `data-cmd` / `data-desc` (the bar scoops those up on load).

**Content is folder-driven.** Each browsable section is a folder you curate:

| Section  | Folder      | File type | Metadata source                                   |
| -------- | ----------- | --------- | ------------------------------------------------- |
| Blog     | `blog/`     | `.md`     | YAML frontmatter (+ `published`)                  |
| Skills   | `skills/`   | `.md`     | YAML frontmatter; popular content in `skills/popular/` |
| MCP      | `mcp/`      | `.md`     | YAML frontmatter                                  |
| Agents   | `agents/`   | `.md`     | YAML frontmatter                                  |
| Learning | `learning/` | `.html`   | `<title>` + `<meta name="intro\|category1\|category2">` |

Frontmatter contract for markdown sections: `title`, `category1`, `category2`,
`description`. Learning docs are self-contained interactive HTML and carry their
metadata in the `<head>` instead. Files starting with `_` and `README.md` are
skipped. Markdown renders through `view.html?file=<path>`; learning HTML opens
directly.

**Generated manifests + agent breadcrumbs (`scripts/build-index.mjs`).** The
script scans the section folders and writes machine-readable indexes so the site
is crawlable without scraping or JS:

- `<section>/index.json` — one manifest per section (and `<section>/popular.json`
  where a `popular/` subfolder exists).
- `site.json` — one aggregate manifest; every item has an `open` URL (rendered
  viewer) and a `download` URL (the raw, directly-fetchable file).
- `llms.txt` — the conventional LLM-facing map (llmstxt.org).
- `sitemap.xml` + `robots.txt` — crawl discovery; robots points agents at
  `llms.txt` / `site.json`. Each page also links `<link rel="alternate"
  type="application/json" href="site.json">`.

`BASE_URL` at the top of `build-index.mjs` sets the absolute URLs in every
generated artifact — **change it if the site domain changes** (e.g. a custom
domain).

**Presentation companion (`companion/`).** A small **local** Flask server
(`companion/server.py`) that an interactive learning deck POSTs prompts to, so a
demo runs live in a terminal during a talk. It is a local dev tool bound to
`127.0.0.1` and is **not** part of the deployed site.
