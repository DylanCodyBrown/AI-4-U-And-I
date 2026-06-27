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

## Deploy

**Settings → Pages**, source = `main`, folder `/ (root)`.
