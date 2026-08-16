/* Geeta Learnings — dashboard logic */

(function () {
  "use strict";

  var chapters = (window.GITA_DATA && window.GITA_DATA.chapters) || [];
  var art = window.GITA_ART || {};

  /* Flatten every learning point with a stable id and back-reference */
  var points = [];
  chapters.forEach(function (ch) {
    ch.points.forEach(function (pt, i) {
      points.push({ id: ch.number + "-" + i, chapter: ch, point: pt });
    });
  });

  /* ————— Persistent state (localStorage) ————— */
  var STORE_KEY = "geeta-learnings-v1";

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }
  function saveState(s) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(s));
    } catch (e) { /* private mode etc. — non-fatal */ }
  }

  var state = loadState();
  state.seen = state.seen || [];

  /* Visit streak: consecutive calendar days with at least one visit */
  function todayKey() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function yesterdayKey() {
    var d = new Date();
    d.setDate(d.getDate() - 1);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  var today = todayKey();
  if (state.lastVisit !== today) {
    state.streak = state.lastVisit === yesterdayKey() ? (state.streak || 0) + 1 : 1;
    state.lastVisit = today;
    saveState(state);
  }

  function markSeen(id) {
    if (state.seen.indexOf(id) === -1) {
      state.seen.push(id);
      saveState(state);
    }
    renderProgress();
  }

  /* ————— Theme ————— */
  var root = document.documentElement;

  function applyTheme(mode) {
    if (mode === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
  }

  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  applyTheme(state.theme || (prefersDark.matches ? "dark" : "light"));

  document.getElementById("theme-toggle").addEventListener("click", function () {
    var dark = root.getAttribute("data-theme") === "dark";
    state.theme = dark ? "light" : "dark";
    applyTheme(state.theme);
    saveState(state);
  });

  prefersDark.addEventListener("change", function (e) {
    if (!state.theme) applyTheme(e.matches ? "dark" : "light");
  });

  /* ————— Daily pick: deterministic by date, shuffle for more ————— */
  function hashString(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return h;
  }

  var dailyIndex = points.length ? hashString(today) % points.length : 0;
  var currentIndex = dailyIndex;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function lensHTML(pt) {
    if (!pt.audiences) return "";
    return (
      '<div class="lens-row" role="group" aria-label="See what this means for different people">' +
        '<button class="lens-chip" data-lens="teen">For a teen</button>' +
        '<button class="lens-chip" data-lens="adult">For an adult</button>' +
        '<button class="lens-chip" data-lens="trader">For a trader</button>' +
      "</div>" +
      '<p class="lens-line" hidden></p>'
    );
  }

  function cardHTML(entry) {
    var ch = entry.chapter, pt = entry.point;
    return (
      '<div class="daily-art">' + (art[ch.number] || "") + "</div>" +
      '<button class="daily-chapter" data-chapter="' + ch.number + '">Chapter ' + ch.number + " · " + esc(ch.nameTranslit) + "</button>" +
      '<h1 class="daily-title">' + esc(pt.title) + "</h1>" +
      '<p class="daily-text">' + esc(pt.text) + "</p>" +
      '<div class="sanskrit-block">' +
        '<p class="sanskrit-deva" lang="sa">' + esc(pt.sanskritDevanagari) + "</p>" +
        '<p class="sanskrit-translit">' + esc(pt.sanskritTranslit) + "</p>" +
        '<p class="sanskrit-meaning">“' + esc(pt.verseTranslation) + "”</p>" +
      "</div>" +
      lensHTML(pt) +
      '<div><span class="verse-chip">Bhagavad Gita ' + esc(pt.verse) + "</span></div>"
    );
  }

  function wireLenses(pt) {
    var line = dailyCard.querySelector(".lens-line");
    var chips = dailyCard.querySelectorAll(".lens-chip");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var lens = chip.dataset.lens;
        var isActive = chip.classList.contains("active");
        chips.forEach(function (c) { c.classList.remove("active"); });
        if (isActive) {
          line.hidden = true;
        } else {
          chip.classList.add("active");
          line.textContent = pt.audiences[lens];
          line.hidden = false;
        }
      });
    });
  }

  var dailyCard = document.getElementById("daily-card");
  var heroKicker = document.getElementById("hero-kicker");

  function showPoint(index, kicker) {
    currentIndex = index;
    var entry = points[index];
    if (!entry) return;
    dailyCard.innerHTML = cardHTML(entry);
    heroKicker.textContent = kicker;
    markSeen(entry.id);
    var chBtn = dailyCard.querySelector(".daily-chapter");
    if (chBtn) chBtn.addEventListener("click", function () { openChapter(Number(chBtn.dataset.chapter)); });
    if (entry.point.audiences) wireLenses(entry.point);
  }

  function swapTo(index, kicker) {
    dailyCard.classList.add("swapping");
    setTimeout(function () {
      showPoint(index, kicker);
      dailyCard.classList.remove("swapping");
    }, 220);
  }

  document.getElementById("shuffle-btn").addEventListener("click", function () {
    if (points.length < 2) return;
    /* Prefer teachings not yet seen; fall back to any other than current */
    var unseen = [];
    for (var i = 0; i < points.length; i++) {
      if (i !== currentIndex && state.seen.indexOf(points[i].id) === -1) unseen.push(i);
    }
    var pool = unseen.length ? unseen : null;
    var next;
    if (pool) next = pool[Math.floor(Math.random() * pool.length)];
    else {
      do { next = Math.floor(Math.random() * points.length); } while (next === currentIndex);
    }
    swapTo(next, "A teaching for this moment");
  });

  /* Expose the current teaching for the shareable card (card.js) */
  window.GEETA = {
    current: function () { return points[currentIndex]; }
  };

  /* ————— Progress line ————— */
  function renderProgress() {
    var el = document.getElementById("progress-line");
    var seenCount = 0;
    points.forEach(function (p) { if (state.seen.indexOf(p.id) !== -1) seenCount++; });
    el.textContent = seenCount + " of " + points.length + " teachings explored";
    document.getElementById("streak-count").textContent = state.streak || 1;
  }

  /* ————— Chapter grid ————— */
  var grid = document.getElementById("chapter-grid");
  chapters.forEach(function (ch) {
    var card = document.createElement("button");
    card.className = "chapter-card";
    card.setAttribute("aria-haspopup", "dialog");
    card.innerHTML =
      '<div class="chapter-art">' + (art[ch.number] || "") + "</div>" +
      '<div class="chapter-num">Chapter ' + ch.number + "</div>" +
      '<div class="chapter-name">' + esc(ch.nameEnglish) + "</div>" +
      '<div class="chapter-sub">' + esc(ch.nameTranslit) + "</div>" +
      '<p class="chapter-essence">' + esc(ch.essence) + "</p>" +
      '<span class="chapter-count">' + ch.points.length + (ch.points.length === 1 ? " teaching" : " teachings") + "</span>";
    card.addEventListener("click", function () { openChapter(ch.number); });
    grid.appendChild(card);
  });

  /* ————— Chapter modal ————— */
  var modal = document.getElementById("chapter-modal");
  var modalInner = document.getElementById("modal-inner");

  function pointRowHTML(pt) {
    return (
      '<div class="point-row">' +
        "<h4>" + esc(pt.title) + "</h4>" +
        '<p class="pt-text">' + esc(pt.text) + "</p>" +
        '<div class="sanskrit-block">' +
          '<p class="sanskrit-deva" lang="sa">' + esc(pt.sanskritDevanagari) + "</p>" +
          '<p class="sanskrit-translit">' + esc(pt.sanskritTranslit) + "</p>" +
          '<p class="sanskrit-meaning">“' + esc(pt.verseTranslation) + "”</p>" +
        "</div>" +
        '<span class="verse-chip">BG ' + esc(pt.verse) + "</span>" +
      "</div>"
    );
  }

  function openChapter(num) {
    var ch = null;
    for (var i = 0; i < chapters.length; i++) if (chapters[i].number === num) ch = chapters[i];
    if (!ch) return;
    modalInner.innerHTML =
      '<div class="modal-head">' +
        '<button class="modal-close" id="modal-close" aria-label="Close">✕</button>' +
        '<div class="modal-art">' + (art[ch.number] || "") + "</div>" +
        '<p class="modal-deva" lang="sa">' + esc(ch.nameDevanagari) + "</p>" +
        '<h3 class="modal-title" id="modal-title">' + esc(ch.nameEnglish) + "</h3>" +
        '<p class="modal-sub">' + esc(ch.nameTranslit) + " · Chapter " + ch.number + "</p>" +
        '<p class="modal-essence">' + esc(ch.essence) + "</p>" +
      "</div>" +
      '<div class="modal-points">' + ch.points.map(pointRowHTML).join("") + "</div>";
    modal.showModal();
    document.getElementById("modal-close").addEventListener("click", function () { modal.close(); });
    /* Reading a chapter counts its teachings as explored */
    ch.points.forEach(function (pt, i) { markSeen(ch.number + "-" + i); });
  }

  modal.addEventListener("click", function (e) {
    if (e.target === modal) modal.close();  /* backdrop click */
  });

  /* ————— Boot ————— */
  if (points.length) {
    showPoint(dailyIndex, "Teaching of the day");
  } else {
    dailyCard.innerHTML = '<p class="daily-text">Content is loading…</p>';
  }
  renderProgress();
})();
