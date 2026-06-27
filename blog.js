/* Blog page — a tree organized by publish day (newest first). Each post is a
   leaf showing its title and time, opening the rendered markdown in a new tab.
   Built from blog/index.json. */
(function () {
  "use strict";

  var col = document.getElementById("blogTree");
  if (!col) return;

  var MONTHS = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];

  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  };

  // parse "YYYY-MM-DD HH:MM" (or ISO) without timezone surprises
  function parts(published) {
    var m = String(published || "").match(/(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
    if (!m) return null;
    return { y: +m[1], mo: +m[2], d: +m[3], hh: m[4] || "", mm: m[5] || "", key: m[1] + "-" + m[2] + "-" + m[3] };
  }

  function dayLabel(p) {
    return MONTHS[p.mo - 1] + " " + p.d + ", " + p.y;
  }

  function timeLabel(p) {
    return p.hh ? p.hh + ":" + p.mm : "";
  }

  function buildTree(items) {
    // group posts by day key
    var days = {};
    var order = [];
    items.forEach(function (it) {
      var p = parts(it.published);
      var key = p ? p.key : "undated";
      if (!days[key]) { days[key] = { p: p, posts: [] }; order.push(key); }
      days[key].posts.push({ it: it, p: p });
    });

    // newest day first; undated last
    order.sort(function (a, b) {
      if (a === "undated") return 1;
      if (b === "undated") return -1;
      return b.localeCompare(a);
    });

    if (!order.length) {
      return '<p class="muted">No posts yet. Drop markdown files in <code>blog/</code>.</p>';
    }

    return order
      .map(function (key) {
        var day = days[key];
        // newest post first within the day
        day.posts.sort(function (a, b) {
          return String(b.it.published || "").localeCompare(String(a.it.published || ""));
        });
        var heading = day.p ? dayLabel(day.p) : "Undated";
        var leaves = day.posts
          .map(function (post) {
            var it = post.it;
            var url = "view.html?file=" + encodeURIComponent(it.file);
            var t = post.p ? timeLabel(post.p) : "";
            return (
              '<a class="leaf" href="' + url + '" target="_blank" rel="noopener"' +
              (it.description ? ' title="' + esc(it.description) + '"' : "") + ">" +
              '<span class="leaf-ico">&#9656;</span>' +
              '<span class="leaf-title">' + esc(it.title) + "</span>" +
              (t ? '<span class="leaf-time">' + esc(t) + "</span>" : "") +
              "</a>"
            );
          })
          .join("");
        return (
          '<details class="node cat1"><summary>' + esc(heading) + "</summary>" +
          '<div class="children">' + leaves + "</div></details>"
        );
      })
      .join("");
  }

  fetch("blog/index.json")
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(function (data) {
      col.innerHTML = buildTree((data && data.items) || []);
    })
    .catch(function () {
      col.innerHTML =
        '<p class="muted">Could not load the blog index. Run ' +
        "<code>node scripts/build-index.mjs</code>.</p>";
    });
})();
