# AI-4-U&I

A small, dependency-free GitHub Pages site with a terminal/CLI aesthetic and a
Claude-Code-style command bar that makes the whole site navigable by slash
command.

## Pages

| Command     | Page           | File           |
| ----------- | -------------- | -------------- |
| `/home`     | Home / hub     | `index.html`   |
| `/blog`     | Weekly stories | `blog.html`    |
| `/mcp`      | MCP            | `mcp.html`     |
| `/skills`   | Skills         | `skills.html`  |
| `/agents`   | Agents         | `agents.html`  |
| `/learning` | Learning       | `learning.html`|

## The command bar

Every page mounts the command bar into `<div id="cmdbar"></div>` via `app.js`.

- Type `/` to list everything; keep typing to filter (by command, title, or keyword).
- `↑ ↓` to select, `↵` to go, `esc` to clear. Pressing `/` anywhere focuses it.

### Making more links searchable

The command bar searches a central registry — the `SITE` array at the top of
`app.js`. To add a destination, add one entry:

```js
{ cmd: "/notes", title: "Notes", desc: "Scratch notes", url: "notes.html",
  keys: ["notes", "scratch"] }
```

You can also make any in-page link searchable without touching `app.js` by
tagging the anchor:

```html
<a href="guide.html" data-cmd="/guide" data-desc="Getting started"
   data-keys="guide start setup">Guide</a>
```

## Local preview

```bash
python3 -m http.server
# open http://localhost:8000
```

## Deploy

In **Settings → Pages**, set the source to this branch, root (`/`).
