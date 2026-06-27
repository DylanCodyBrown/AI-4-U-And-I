/* ============================================================
   AI-4-U&I — command bar
   Central site registry + Claude-Code-style terminal navigation.
   To add a destination, add an entry to SITE below (or tag an
   in-page link with  data-cmd="/name" data-desc="...").
   ============================================================ */
(function () {
  "use strict";

  // ---- single source of truth for every navigable destination ----
  var SITE = [
    { cmd: "/home",     title: "Home",     desc: "Back to start",            url: "index.html",    keys: ["home", "start", "index", "hub"] },
    { cmd: "/blog",     title: "Blog",     desc: "Weekly stories",           url: "blog.html",     keys: ["blog", "stories", "weekly", "posts", "news", "writing"] },
    { cmd: "/mcp",      title: "MCP",      desc: "Model Context Protocol",   url: "mcp.html",      keys: ["mcp", "model context protocol", "servers", "tools", "connect"] },
    { cmd: "/skills",   title: "Skills",   desc: "Agent skills",             url: "skills.html",   keys: ["skills", "abilities", "slash", "commands"] },
    { cmd: "/agents",   title: "Agents",   desc: "AI agents & subagents",    url: "agents.html",   keys: ["agents", "subagents", "automation", "bots"] },
    { cmd: "/learning", title: "Learning", desc: "Guides & resources",       url: "learning.html", keys: ["learning", "learn", "guides", "tutorials", "resources", "docs"] },
    // utility commands
    { cmd: "/help",     title: "Help",     desc: "List all commands",        action: "help",  keys: ["help", "commands", "?"] },
    { cmd: "/clear",    title: "Clear",    desc: "Clear the prompt",         action: "clear", keys: ["clear", "reset"] }
  ];

  // markup for the command bar — pinned to the bottom of every page.
  // suggestions sit ABOVE the prompt so the dropdown opens upward.
  var TEMPLATE =
    '<div class="cmdbar-fixed">' +
      '<fieldset class="box term">' +
        '<legend>Navigation — type / to navigate</legend>' +
        '<ul class="suggestions" id="suggestions" role="listbox"></ul>' +
        '<div class="term-line" id="termLine">' +
          '<span class="prompt">&gt;</span>' +
          '<span class="echo" id="echo"></span>' +
          '<span class="cursor" id="cursor"></span>' +
          '<input id="cmdInput" class="cmd-input" autocomplete="off" autocapitalize="off" ' +
                 'spellcheck="false" aria-label="Site command bar" />' +
        '</div>' +
        '<div class="status">' +
          '<span class="dot"></span> ready' +
          '<span class="seg">·</span> <kbd>&uarr;</kbd><kbd>&darr;</kbd> select' +
          '<span class="seg">·</span> <kbd>&crarr;</kbd> go' +
          '<span class="seg">·</span> <kbd>esc</kbd> clear' +
        '</div>' +
      '</fieldset>' +
    '</div>';

  function init() {
    var mount = document.getElementById("cmdbar");
    if (!mount) return;
    mount.innerHTML = TEMPLATE;

    // pull in any in-page links tagged for search: data-cmd / data-desc
    var extra = document.querySelectorAll("a[data-cmd]");
    Array.prototype.forEach.call(extra, function (a) {
      SITE.push({
        cmd: a.getAttribute("data-cmd"),
        title: a.getAttribute("data-title") || a.textContent.trim(),
        desc: a.getAttribute("data-desc") || "",
        url: a.getAttribute("href"),
        keys: (a.getAttribute("data-keys") || a.textContent).toLowerCase().split(/\s+/)
      });
    });

    var input = document.getElementById("cmdInput");
    var echo = document.getElementById("echo");
    var list = document.getElementById("suggestions");
    var line = document.getElementById("termLine");

    var matches = [];
    var sel = 0;

    function score(item, v) {
      // returns true if item matches query v (already lowercased, no need for trim)
      if (v.charAt(0) === "/") {
        return item.cmd.indexOf(v) === 0;
      }
      if (item.cmd.slice(1).indexOf(v) === 0) return true;
      if (item.title.toLowerCase().indexOf(v) !== -1) return true;
      return item.keys.some(function (k) { return k.indexOf(v) !== -1; });
    }

    function render() {
      echo.textContent = input.value;
      var v = input.value.trim().toLowerCase();

      if (v === "") {
        matches = [];
      } else if (v === "/") {
        matches = SITE.slice();
      } else {
        matches = SITE.filter(function (it) { return score(it, v); });
      }

      if (sel >= matches.length) sel = 0;

      if (!matches.length) {
        list.className = "suggestions";
        list.innerHTML = "";
        return;
      }

      list.innerHTML = matches.map(function (it, i) {
        return '<li class="' + (i === sel ? "active" : "") + '" data-i="' + i + '" role="option">' +
                 '<span class="s-cmd">' + it.cmd + '</span>' +
                 '<span class="s-desc">' + it.desc + "</span>" +
               "</li>";
      }).join("");
      list.className = "suggestions open";
    }

    function activate(item) {
      if (!item) return;
      if (item.action === "clear") { input.value = ""; render(); return; }
      if (item.action === "help") { input.value = "/"; sel = 0; render(); return; }
      if (item.url) { window.location.href = item.url; }
    }

    input.addEventListener("input", function () { sel = 0; render(); });

    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (matches.length) { sel = (sel + 1) % matches.length; render(); }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (matches.length) { sel = (sel - 1 + matches.length) % matches.length; render(); }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (matches.length) {
          activate(matches[sel]);
        } else {
          // exact command typed with no dropdown
          var v = input.value.trim().toLowerCase();
          var hit = SITE.filter(function (it) { return it.cmd === v; })[0];
          activate(hit);
        }
      } else if (e.key === "Tab") {
        if (matches.length) {
          e.preventDefault();
          input.value = matches[sel].cmd + " ";
          sel = 0;
          render();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        input.value = "";
        render();
      }
    });

    // click a suggestion (mousedown keeps input focus)
    list.addEventListener("mousedown", function (e) {
      var li = e.target.closest("li[data-i]");
      if (!li) return;
      e.preventDefault();
      activate(matches[+li.getAttribute("data-i")]);
    });

    // keep focus on the prompt
    line.addEventListener("mousedown", function (e) {
      if (e.target.tagName !== "INPUT") {
        e.preventDefault();
        input.focus();
      }
    });

    // global "/" focuses the bar from anywhere
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && document.activeElement !== input) {
        input.focus();
      }
    });

    input.focus();
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
