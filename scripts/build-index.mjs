#!/usr/bin/env node
/* Scans each browsable section folder and writes <section>/index.json.
   Markdown sections (skills/mcp/agents) read YAML-ish frontmatter.
   HTML sections (learning) read <title> and <meta name="..."> tags.
   No dependencies. */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

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
    const popItems = [];
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
}
