/* Browsable section page — builds the left-hand tree from <section>/index.json
   and the right-hand "popular" list from <section>/popular.json.
   The section is read from the #browseTree element's data-section attribute. */
(function () {
  "use strict";

  var treeEl = document.getElementById("browseTree");
  var popEl = document.getElementById("popularList");
  var section = (treeEl && treeEl.dataset.section) || "skills";

  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  };

  // ---------- left column: tree ----------
  function buildTree(items) {
    var groups = {};
    items.forEach(function (s) {
      var c1 = s.category1 || "Uncategorized";
      var c2 = s.category2 || "";
      groups[c1] = groups[c1] || { _direct: [], subs: {} };
      if (c2) {
        groups[c1].subs[c2] = groups[c1].subs[c2] || [];
        groups[c1].subs[c2].push(s);
      } else {
        groups[c1]._direct.push(s);
      }
    });

    function leaf(s) {
      var url = "view.html?file=" + encodeURIComponent(s.file);
      return (
        '<a class="leaf" href="' + url + '" target="_blank" rel="noopener"' +
        (s.description ? ' title="' + esc(s.description) + '"' : "") + ">" +
        '<span class="leaf-ico">&#9656;</span>' + esc(s.title) + "</a>"
      );
    }

    var c1names = Object.keys(groups).sort();
    if (!c1names.length) {
      return '<p class="muted">No items yet. Drop markdown files in <code>' + esc(section) + "/</code>.</p>";
    }

    return c1names
      .map(function (c1) {
        var g = groups[c1];
        var inner = "";
        Object.keys(g.subs)
          .sort()
          .forEach(function (c2) {
            inner +=
              '<details class="node cat2" open><summary>' + esc(c2) + "</summary>" +
              '<div class="children">' + g.subs[c2].map(leaf).join("") + "</div></details>";
          });
        inner += g._direct.map(leaf).join("");
        return (
          '<details class="node cat1" open><summary>' + esc(c1) + "</summary>" +
          '<div class="children">' + inner + "</div></details>"
        );
      })
      .join("");
  }

  if (treeEl) {
    fetch(section + "/index.json")
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (data) {
        treeEl.innerHTML = buildTree(data.items || []);
      })
      .catch(function () {
        treeEl.innerHTML =
          '<p class="muted">Could not load the index. Run ' +
          "<code>node scripts/build-index.mjs</code>.</p>";
      });
  }

  // ---------- right column: popular ----------
  function renderPopular(data) {
    var items = (data && data.items) || [];
    if (!items.length) return '<p class="muted">No data yet.</p>';
    var updated = data.updated
      ? '<p class="muted updated">Updated ' + esc(data.updated) + "</p>"
      : "";
    var list = items
      .map(function (it, i) {
        return (
          '<a class="pop-item" href="' + esc(it.url) + '" target="_blank" rel="noopener">' +
          '<span class="pop-rank">' + (i + 1) + "</span>" +
          '<span class="pop-main">' +
            '<span class="pop-name">' + esc(it.name) + "</span>" +
            (it.source ? '<span class="pop-src">' + esc(it.source) + "</span>" : "") +
            (it.note ? '<span class="pop-note">' + esc(it.note) + "</span>" : "") +
          "</span>" +
          (it.metric ? '<span class="pop-metric">' + esc(it.metric) + "</span>" : "") +
          "</a>"
        );
      })
      .join("");
    return list + updated;
  }

  if (popEl) {
    fetch(section + "/popular.json")
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (data) {
        popEl.innerHTML = renderPopular(data);
      })
      .catch(function () {
        popEl.innerHTML = '<p class="muted">Popular data not available yet.</p>';
      });
  }
})();
