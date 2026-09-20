#!/usr/bin/env node
/* One-time (re-runnable) ingestion of popular skills AND agents.
   Fetches each item's markdown from the web and stores the CONTENT in this
   repo under <section>/popular/ (section is "skills" or "agents"), with
   attribution frontmatter. Run again to refresh:
     node scripts/ingest-popular.mjs
   Then rebuild manifests:  node scripts/build-index.mjs */
import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDirFor = (section) => join(root, section, "popular");

// Curated set of popular, openly-licensed skills pulled from various sources.
// Each entry names its own repo/branch/path since sources differ in layout.
// Source-available (non-open) skills are intentionally excluded — e.g.
// anthropics/skills' docx/pdf/pptx/xlsx are "source-available", not Apache-2.0,
// so link to them instead of copying.
const raw = (repo, branch, path) =>
  `https://raw.githubusercontent.com/${repo}/${branch}/${path}`;
const human = (repo, branch, path) =>
  `https://github.com/${repo}/blob/${branch}/${path}`;

const ANTHROPIC_SKILLS = (name, category1, category2) => ({
  section: "skills", name, category1, category2,
  repo: "anthropics/skills", branch: "main", path: `skills/${name}/SKILL.md`,
  author: "Anthropic", license: "Apache-2.0",
});

const SKILLS = [
  ANTHROPIC_SKILLS("algorithmic-art",       "Creative & Design",          "Generative Art"),
  ANTHROPIC_SKILLS("brand-guidelines",      "Creative & Design",          "Branding"),
  ANTHROPIC_SKILLS("canvas-design",         "Creative & Design",          "Visual Design"),
  ANTHROPIC_SKILLS("theme-factory",         "Creative & Design",          "Theming"),
  ANTHROPIC_SKILLS("frontend-design",       "Development & Technical",    "Frontend"),
  ANTHROPIC_SKILLS("web-artifacts-builder", "Development & Technical",    "Web"),
  ANTHROPIC_SKILLS("webapp-testing",        "Development & Technical",    "Testing"),
  ANTHROPIC_SKILLS("mcp-builder",           "Development & Technical",    "MCP"),
  ANTHROPIC_SKILLS("skill-creator",         "Development & Technical",    "Tooling"),
  ANTHROPIC_SKILLS("claude-api",            "Development & Technical",    "API"),
  ANTHROPIC_SKILLS("doc-coauthoring",       "Enterprise & Communication", "Docs"),
  ANTHROPIC_SKILLS("internal-comms",        "Enterprise & Communication", "Comms"),
  ANTHROPIC_SKILLS("slack-gif-creator",     "Enterprise & Communication", "Slack"),
  {
    section: "skills", name: "company-valuation", category1: "Finance", category2: "Valuation",
    repo: "himself65/finance-skills", branch: "main",
    path: "plugins/market-analysis/skills/company-valuation/SKILL.md",
    author: "Alex Yang (himself65)", license: "MIT",
  },
  {
    section: "skills", name: "yfinance-data", category1: "Finance", category2: "Market Data",
    repo: "himself65/finance-skills", branch: "main",
    path: "plugins/market-analysis/skills/yfinance-data/SKILL.md",
    author: "Alex Yang (himself65)", license: "MIT",
  },
  {
    section: "skills", name: "excel-ops", category1: "Development & Technical", category2: "Excel / Python",
    repo: "agentui-ai/excel-ops", branch: "main",
    path: "skills/excel-ops/SKILL.md",
    author: "AgentUI", license: "MIT",
  },
  {
    section: "skills", name: "jupyter-notebook", category1: "Development & Technical", category2: "Jupyter",
    repo: "antquinonez/jupyter-notebook-skill", branch: "master",
    path: "skills/jupyter-notebook/SKILL.md",
    author: "Antonio Quinonez", license: "MIT",
  },
  {
    section: "skills", name: "voice-memo-sync", category1: "Productivity", category2: "Claude Desktop",
    repo: "ying-wen/voice-memo-sync", branch: "main",
    path: "SKILL.md",
    author: "Ying Wen", license: "MIT",
  },
  {
    section: "agents", name: "data-analyst", category1: "Data & Analytics", category2: "Business Intelligence",
    repo: "VoltAgent/awesome-claude-code-subagents", branch: "main",
    path: "categories/05-data-ai/data-analyst.md",
    author: "VoltAgent", license: "MIT",
  },
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
        // YAML block scalar — fold every indented continuation line into one
        // string (basic ">" folding: join with spaces, blank line = paragraph break)
        const parts = [];
        for (let j = i + 1; j < lines.length; j++) {
          if (/^\s+\S/.test(lines[j])) { parts.push(lines[j].trim()); i = j; }
          else if (lines[j].trim() === "") { parts.push("\n"); }
          else break; // next top-level key
        }
        val = parts.join(" ").replace(/ ?\n ?/g, "\n").trim();
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

const outDirsUsed = new Set(SKILLS.map((s) => s.section || "skills"));
for (const section of outDirsUsed) await mkdir(outDirFor(section), { recursive: true });

let ok = 0;
for (const s of SKILLS) {
  try {
    const section = s.section || "skills";
    const res = await fetch(raw(s.repo, s.branch, s.path));
    if (!res.ok) throw new Error("HTTP " + res.status);
    const text = await res.text();
    const { data, body } = parseFrontmatter(text);

    const title = prettify(data.name || s.name);
    const description = (data.description || "").replace(/\s+/g, " ").trim();
    const src = human(s.repo, s.branch, s.path);

    const front =
      "---\n" +
      `title: ${yaml(title)}\n` +
      `category1: ${yaml(s.category1)}\n` +
      `category2: ${yaml(s.category2)}\n` +
      `description: ${yaml(description)}\n` +
      `source: ${yaml(src)}\n` +
      `author: ${yaml(s.author)}\n` +
      `license: ${yaml(s.license)}\n` +
      "---\n\n";

    const label = section === "agents" ? "Popular agent" : "Popular skill";
    const attribution =
      `> **${label}** — content stored locally for reference.\n` +
      `> Source: [${s.repo}](${src}) · License: ${s.license}\n\n`;

    await writeFile(join(outDirFor(section), s.name + ".md"), front + attribution + body.trimStart() + "\n");
    console.log(`✓ [${section}] ${s.name}`);
    ok++;
  } catch (e) {
    console.error(`✗ ${s.name}: ${e.message}`);
  }
}

console.log(`\nStored ${ok}/${SKILLS.length} item(s) across: ${[...outDirsUsed].map((s) => s + "/popular/").join(", ")}`);
console.log("Now run: node scripts/build-index.mjs");
