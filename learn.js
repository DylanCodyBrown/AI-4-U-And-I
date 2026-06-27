/* Learning page — a single centered, scrollable column of intro cards.
   Each card links to a self-contained interactive HTML doc in learning/,
   opened in a new tab. Built from learning/index.json. */
(function () {
  "use strict";

  var col = document.getElementById("learnCol");
  if (!col) return;

  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  };

  function card(it) {
    var tag =
      esc(it.category1 || "Learning") + (it.category2 ? " · " + esc(it.category2) : "");
    return (
      '<a class="learn-card" href="' + esc(it.file) + '" target="_blank" rel="noopener">' +
        '<div class="learn-tag">' + tag + "</div>" +
        '<h3 class="learn-title">' + esc(it.title) + "</h3>" +
        (it.description ? '<p class="learn-intro">' + esc(it.description) + "</p>" : "") +
        '<span class="learn-open">open in new tab &#8599;</span>' +
      "</a>"
    );
  }

  fetch("learning/index.json")
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(function (data) {
      var items = (data && data.items) || [];
      if (!items.length) {
        col.innerHTML = '<p class="muted">No learning docs yet. Drop interactive ' +
          "<code>.html</code> files in <code>learning/</code>.</p>";
        return;
      }
      col.innerHTML = items.map(card).join("");
    })
    .catch(function () {
      col.innerHTML =
        '<p class="muted">Could not load the learning index. Run ' +
        "<code>node scripts/build-index.mjs</code>.</p>";
    });
})();
