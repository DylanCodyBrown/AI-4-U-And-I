/* Markdown viewer — renders a curated file from skills/, mcp/, or agents/
   with a download button. Opened as view.html?file=<section>/<name>.md */
(function () {
  "use strict";

  var doc = document.getElementById("doc");
  var dl = document.getElementById("downloadBtn");
  var back = document.getElementById("backLink");

  var SECTIONS = { blog: "Blog", skills: "Skills", mcp: "MCP", agents: "Agents" };

  function fail(msg) {
    doc.innerHTML = '<h1>Not found</h1><p class="muted">' + msg + "</p>";
    dl.style.display = "none";
  }

  // only allow curated same-origin files: <section>/<name>.md, no traversal
  function safePath(p) {
    if (!p) return null;
    if (!/^(blog|skills|mcp|agents)\/(?:[A-Za-z0-9._-]+\/)?[A-Za-z0-9._-]+\.md$/.test(p)) return null;
    if (p.indexOf("..") !== -1) return null;
    return p;
  }

  function stripFrontmatter(text) {
    var m = text.match(/^﻿?---\s*\r?\n[\s\S]*?\r?\n---\s*\r?\n?/);
    return m ? text.slice(m[0].length) : text;
  }

  function titleFromFrontmatter(text) {
    var m = text.match(/^﻿?---\s*\r?\n([\s\S]*?)\r?\n---/);
    if (!m) return null;
    var t = m[1].match(/^\s*title\s*:\s*(.+?)\s*$/m);
    return t ? t[1].replace(/^["']|["']$/g, "") : null;
  }

  var file = safePath(new URLSearchParams(location.search).get("file"));
  if (!file) {
    fail("No valid file was specified.");
    return;
  }

  // section-aware back link
  var folder = file.split("/")[0];
  if (back && SECTIONS[folder]) {
    back.href = folder + ".html";
    back.textContent = "← " + SECTIONS[folder];
  }

  // download button points straight at the raw file
  dl.href = file;
  dl.setAttribute("download", file.split("/").pop());

  fetch(file)
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    })
    .then(function (text) {
      var title = titleFromFrontmatter(text);
      if (title) document.title = title + " · AI-4-U&I";
      var body = stripFrontmatter(text);
      var html = window.marked.parse(body, { mangle: false, headerIds: true });
      doc.innerHTML = window.DOMPurify.sanitize(html);
      doc.querySelectorAll('a[href^="http"]').forEach(function (a) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      });
    })
    .catch(function (e) {
      fail("Could not load this file (" + e.message + ").");
    });
})();
