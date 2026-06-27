#!/usr/bin/env node
/* Scans each browsable section folder and writes <section>/index.json.
   Markdown sections (skills/mcp/agents) read YAML-ish frontmatter.
   HTML sections (learning) read <title> and <meta name="..."> tags.
   No dependencies. */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Public base URL of the deployed site (GitHub Pages project site). Used to emit
// absolute URLs in the agent-facing artifacts (llms.txt, site.json, sitemap).
// Change this if the site moves (e.g. a custom domain).
const BASE_URL = "https://dylancodybrown.github.io/AI-4-U-And-I/";

// human-facing page per section + a short label
const PAGES = {
  blog: "Blog — weekly stories",
  skills: "Skills — browsable library + popular (stored locally)",
  mcp: "MCP — servers by Local/Community/Homebrewed",
  agents: "Agents — browsable library",
  learning: "Learning — interactive HTML docs (downloadable)",
};

// section name -> file type it holds
const SECTIONS = {
  blog: "md",
  skills: "md",
  mcp: "md",
  agents: "md",
  learning: "html",
};

function parseFrontmatter(text) {
  const m = text.match(/^﻿?---\s*\r?\n([\s\S]*?)\r?\n---/);
  const data = {};
  if (!m) return data;
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^([A-Za-z0-9_]+)\s*:\s*(.*)$/);
    if (!mm) continue;
    let v = mm[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    data[mm[1]] = v;
  }
  return data;
}

// pull <title> and <meta name="x" content="y"> from an HTML head
function parseHtmlMeta(text) {
  const head = text.slice(0, 8000); // metadata lives at the top
  const data = {};
  const t = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (t) data.title = t[1].trim();
  const re = /<meta\s+name=["']([^"']+)["']\s+content=["']([^"']*)["']/gi;
  let m;
  while ((m = re.exec(head))) data[m[1].toLowerCase()] = m[2].trim();
  return data;
}

const titleFromFile = (file) =>
  basename(file, extname(file)).replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const abs = (rel) => BASE_URL + String(rel).replace(/^\/+/, "");

// accumulates every section's items for the aggregate agent artifacts
const site = [];

for (const [section, type] of Object.entries(SECTIONS)) {
  const dir = join(root, section);
  let names;
  try {
    names = await readdir(dir);
  } catch {
    continue; // section folder doesn't exist yet
  }

  const ext = type === "html" ? ".html" : ".md";
  const files = names
    .filter((f) => f.endsWith(ext))
    .filter((f) => !f.startsWith("_") && f.toLowerCase() !== "readme.md")
    .sort();

  const items = [];
  for (const f of files) {
    const text = await readFile(join(dir, f), "utf8");
    const meta = type === "html" ? parseHtmlMeta(text) : parseFrontmatter(text);
    const item = {
      file: `${section}/${f}`,
      title: meta.title || titleFromFile(f),
      category1: meta.category1 || "Uncategorized",
      category2: meta.category2 || "",
      description: meta.intro || meta.description || "",
    };
    if (meta.published) item.published = meta.published; // blog posts
    items.push(item);
  }

  if (section === "blog") {
    // newest first by published timestamp
    items.sort((a, b) => String(b.published || "").localeCompare(String(a.published || "")));
  } else {
    items.sort((a, b) =>
      (a.category1 + a.category2 + a.title).localeCompare(b.category1 + b.category2 + b.title)
    );
  }

  const out = { section, type, generated: true, count: items.length, items };
  await writeFile(join(dir, "index.json"), JSON.stringify(out, null, 2) + "\n");
  console.log(`Wrote ${section}/index.json with ${items.length} item(s).`);

  // Ingested "popular" content: locally-stored files under <section>/popular/.
  // These render in the right column and open in the local viewer (not links).
  let popItems = [];
  let popNames;
  try {
    popNames = await readdir(join(dir, "popular"));
  } catch {
    popNames = null;
  }
  if (popNames) {
    const popFiles = popNames
      .filter((f) => f.endsWith(".md"))
      .filter((f) => !f.startsWith("_") && f.toLowerCase() !== "readme.md")
      .sort();
    for (const f of popFiles) {
      const fm = parseFrontmatter(await readFile(join(dir, "popular", f), "utf8"));
      popItems.push({
        file: `${section}/popular/${f}`,
        title: fm.title || titleFromFile(f),
        category1: fm.category1 || "",
        category2: fm.category2 || "",
        description: fm.description || "",
        source: fm.source || "",
      });
    }
    popItems.sort((a, b) =>
      (a.category1 + a.category2 + a.title).localeCompare(b.category1 + b.category2 + b.title)
    );
    const popOut = { section, stored: true, count: popItems.length, items: popItems };
    await writeFile(join(dir, "popular.json"), JSON.stringify(popOut, null, 2) + "\n");
    console.log(`Wrote ${section}/popular.json with ${popItems.length} item(s).`);
  }

  site.push({ section, type, page: `${section}.html`, label: PAGES[section] || section, items, popItems });
}

/* ----------------------------------------------------------------------------
   Agent-facing artifacts — a discoverable "breadcrumb trail" for AI agents.
   Generated from the same data so they never drift.
   ---------------------------------------------------------------------------- */

// open-able URL for an item: markdown opens via the viewer, html opens directly
const openUrl = (sec, it) =>
  sec.type === "html" ? abs(it.file) : abs("view.html?file=" + encodeURIComponent(it.file));
const downloadUrl = (it) => abs(it.file); // raw file is always directly fetchable

// --- site.json : one aggregate manifest with absolute, directly-fetchable URLs
const siteJson = {
  name: "AI-4-U&I",
  base: BASE_URL,
  generated: true,
  note: "Machine-readable index. Every 'download' URL is a raw, directly-fetchable file.",
  sections: site.map((sec) => ({
    section: sec.section,
    page: abs(sec.page),
    label: sec.label,
    items: sec.items.map((it) => ({
      title: it.title,
      category1: it.category1,
      category2: it.category2,
      description: it.description,
      ...(it.published ? { published: it.published } : {}),
      open: openUrl(sec, it),
      download: downloadUrl(it),
    })),
    popular: sec.popItems.map((it) => ({
      title: it.title,
      category1: it.category1,
      category2: it.category2,
      description: it.description,
      source: it.source,
      open: abs("view.html?file=" + encodeURIComponent(it.file)),
      download: downloadUrl(it),
    })),
  })),
};
await writeFile(join(root, "site.json"), JSON.stringify(siteJson, null, 2) + "\n");
console.log("Wrote site.json");

// --- llms.txt : the conventional LLM-facing map (llmstxt.org)
let llms = "";
llms += "# AI-4-U&I\n\n";
llms += "> A browsable knowledge base of AI skills, MCP servers, agents, and interactive learning docs. ";
llms += "Everything is stored in this site and directly downloadable.\n\n";
llms += "For a complete machine-readable index with absolute download URLs, fetch ";
llms += `[site.json](${abs("site.json")}). Each section also exposes ` +
  "`<section>/index.json`. Markdown files open rendered via `view.html?file=<path>` " +
  "but the raw file is always directly fetchable at its path.\n\n";
for (const sec of site) {
  llms += `## ${sec.label}\n\n`;
  for (const it of sec.items) {
    const d = it.description ? ` — ${it.description}` : "";
    llms += `- [${it.title}](${downloadUrl(it)})${d}\n`;
  }
  if (sec.popItems.length) {
    llms += `\n### Popular (stored locally)\n\n`;
    for (const it of sec.popItems) {
      const d = it.description ? ` — ${it.description}` : "";
      llms += `- [${it.title}](${downloadUrl(it)})${d}\n`;
    }
  }
  llms += "\n";
}
await writeFile(join(root, "llms.txt"), llms);
console.log("Wrote llms.txt");

// --- sitemap.xml + robots.txt : classic crawl discovery (pages + raw files)
const urls = [BASE_URL];
for (const sec of site) {
  urls.push(abs(sec.page));
  for (const it of sec.items) urls.push(downloadUrl(it));
  for (const it of sec.popItems) urls.push(downloadUrl(it));
}
const sitemap =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map((u) => `  <url><loc>${u.replace(/&/g, "&amp;")}</loc></url>`).join("\n") +
  "\n</urlset>\n";
await writeFile(join(root, "sitemap.xml"), sitemap);
console.log(`Wrote sitemap.xml with ${urls.length} URL(s).`);

const robots =
  "User-agent: *\nAllow: /\n\n" +
  `# Agents: start at ${abs("llms.txt")} or ${abs("site.json")}\n` +
  `Sitemap: ${abs("sitemap.xml")}\n`;
await writeFile(join(root, "robots.txt"), robots);
console.log("Wrote robots.txt");
