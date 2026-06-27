#!/usr/bin/env node
/* One-time (re-runnable) ingestion of popular skills.
   Fetches each skill's SKILL.md from the web and stores the CONTENT in this
   repo under skills/popular/, with attribution frontmatter. Run again to
   refresh:  node scripts/ingest-popular.mjs
   Then rebuild manifests:  node scripts/build-index.mjs */
import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "skills", "popular");

// Curated set of popular, openly-licensed (Apache-2.0) skills from the official
// Anthropic skills collection. Source-available document skills (docx/pdf/pptx/
// xlsx) are intentionally excluded — link to them instead of copying.
const REPO = "anthropics/skills";
const BRANCH = "main";
const raw = (name) =>
  `https://raw.githubusercontent.com/${REPO}/${BRANCH}/skills/${name}/SKILL.md`;
const human = (name) =>
  `https://github.com/${REPO}/tree/${BRANCH}/skills/${name}`;

const SKILLS = [
  { name: "algorithmic-art",      category1: "Creative & Design",          category2: "Generative Art" },
  { name: "brand-guidelines",     category1: "Creative & Design",          category2: "Branding" },
  { name: "canvas-design",        category1: "Creative & Design",          category2: "Visual Design" },
  { name: "theme-factory",        category1: "Creative & Design",          category2: "Theming" },
  { name: "frontend-design",      category1: "Development & Technical",     category2: "Frontend" },
  { name: "web-artifacts-builder",category1: "Development & Technical",     category2: "Web" },
  { name: "webapp-testing",       category1: "Development & Technical",     category2: "Testing" },
  { name: "mcp-builder",          category1: "Development & Technical",     category2: "MCP" },
  { name: "skill-creator",        category1: "Development & Technical",     category2: "Tooling" },
  { name: "claude-api",           category1: "Development & Technical",     category2: "API" },
  { name: "doc-coauthoring",      category1: "Enterprise & Communication",  category2: "Docs" },
  { name: "internal-comms",       category1: "Enterprise & Communication",  category2: "Comms" },
  { name: "slack-gif-creator",    category1: "Enterprise & Communication",  category2: "Slack" },
];

function parseFrontmatter(text) {
  const m = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/);
  const data = {};
  let body = text;
  if (m) {
    body = text.slice(m[0].length);
    const lines = m[1].split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const mm = lines[i].match(/^([A-Za-z0-9_]+)\s*:\s*(.*)$/);
      if (!mm) continue;
      let val = mm[2].trim();
      if (/^[|>][-+]?$/.test(val)) {
        // YAML block scalar — take the first indented content line as the value
        let first = "";
        for (let j = i + 1; j < lines.length; j++) {
          if (/^\s+\S/.test(lines[j])) { first = lines[j].trim(); break; }
          if (/^\S/.test(lines[j])) break; // next key
        }
        val = first;
      }
      data[mm[1]] = val;
    }
  }
  return { data, body };
}

const prettify = (s) =>
  s.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// escape a value for safe single-line YAML (we quote with double quotes)
const yaml = (s) => '"' + String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';

await mkdir(outDir, { recursive: true });

let ok = 0;
for (const s of SKILLS) {
  try {
    const res = await fetch(raw(s.name));
    if (!res.ok) throw new Error("HTTP " + res.status);
    const text = await res.text();
    const { data, body } = parseFrontmatter(text);

    const title = prettify(data.name || s.name);
    const description = (data.description || "").replace(/\s+/g, " ").trim();
    const src = human(s.name);

    const front =
      "---\n" +
      `title: ${yaml(title)}\n` +
      `category1: ${yaml(s.category1)}\n` +
      `category2: ${yaml(s.category2)}\n` +
      `description: ${yaml(description)}\n` +
      `source: ${yaml(src)}\n` +
      `author: ${yaml("Anthropic")}\n` +
      `license: ${yaml("Apache-2.0")}\n` +
      "---\n\n";

    const attribution =
      `> **Popular skill** — content stored locally for reference.\n` +
      `> Source: [${REPO}/${s.name}](${src}) · License: Apache-2.0\n\n`;

    await writeFile(join(outDir, s.name + ".md"), front + attribution + body.trimStart() + "\n");
    console.log(`✓ ${s.name}`);
    ok++;
  } catch (e) {
    console.error(`✗ ${s.name}: ${e.message}`);
  }
}

console.log(`\nStored ${ok}/${SKILLS.length} skills in skills/popular/.`);
console.log("Now run: node scripts/build-index.mjs");
