/* Shareable teaching card: renders the current teaching to a 1080×1350 PNG
   and shares it (share sheet with image on mobile, WhatsApp text link +
   downloadable card on desktop). Pure canvas — no dependencies. */

(function () {
  "use strict";

  var SITE_URL = "https://geetalearnings.vercel.app";
  var W = 1080, H = 1350;

  var C = {
    bg: "#faf6ee",
    bgSoft: "#f3ecdd",
    card: "#fffdf7",
    edge: "#e8dfc9",
    ink: "#2b2419",
    inkSoft: "#6b5f4b",
    inkFaint: "#9a8d74",
    accent: "#c2410c",
    accentSoft: "#f6d9c3",
    gold: "#a97b12"
  };

  var SERIF = '"Cormorant Garamond", Georgia, serif';
  var SANS = '"Inter", -apple-system, "Segoe UI", sans-serif';
  var DEVA = '"Noto Serif Devanagari", serif';

  /* Emblem SVGs use CSS classes; inline fixed colors for standalone rasterization */
  var CLASS_STYLES = {
    "em-ring": 'fill="none" stroke="#e8dfc9" stroke-width="1.5"',
    "em-l": 'fill="none" stroke="#b45309" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"',
    "em-l2": 'fill="none" stroke="#3b4a6b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"',
    "em-lt": 'fill="none" stroke="#b45309" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"',
    "em-f": 'fill="rgba(217,119,6,0.16)" stroke="none"',
    "em-fl": 'fill="rgba(217,119,6,0.16)" stroke="#b45309" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"',
    "em-dot": 'fill="#b45309" stroke="none"',
    "em-dot2": 'fill="#3b4a6b" stroke="none"',
    "em-dash": 'fill="none" stroke="#b45309" stroke-width="1.6" stroke-dasharray="3 5" stroke-linecap="round"',
    "em-txt": 'fill="#b45309" font-family="serif" font-weight="600"'
  };

  function loadEmblem(chapterNum, size) {
    return new Promise(function (resolve) {
      var svg = (window.GITA_ART && window.GITA_ART[chapterNum]) || "";
      if (!svg) return resolve(null);
      svg = svg.replace(/class="(em-[a-z0-9]+)"/g, function (m, cls) {
        return CLASS_STYLES[cls] || "";
      });
      svg = svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" ');
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    });
  }

  function wrapText(ctx, text, maxWidth) {
    var words = String(text).split(/\s+/);
    var lines = [], line = "";
    for (var i = 0; i < words.length; i++) {
      var probe = line ? line + " " + words[i] : words[i];
      if (ctx.measureText(probe).width > maxWidth && line) {
        lines.push(line);
        line = words[i];
      } else {
        line = probe;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function ensureFonts() {
    var wanted = [
      '600 84px ' + SERIF,
      '400 40px ' + SANS,
      '600 30px ' + SANS,
      '400 46px ' + DEVA,
      'italic 500 40px ' + SERIF
    ];
    return Promise.all(wanted.map(function (f) {
      try { return document.fonts.load(f, "अ Gītā"); } catch (e) { return Promise.resolve(); }
    })).then(function () { return document.fonts.ready; }).catch(function () {});
  }

  /* Layout metrics; the compact set is used when normal metrics overflow */
  var METRICS = {
    normal: {
      emblem: 240, emblemInterp: 216, gEmblem: 44, pillFont: 28, pillArea: 90,
      titleFont: 76, titleLH: 88, gTitle: 30, textFont: 40, textLH: 58, gText: 46,
      blockPad: 46, devaFont: 44, devaLH: 62, translitFont: 38, translitLH: 54,
      meaningFont: 32, meaningLH: 46, gInterp: 34, interpLabel: 24, interpFont: 36,
      interpLH: 50, gChip: 50, chipFont: 30, chipH: 64
    },
    compact: {
      emblem: 176, emblemInterp: 176, gEmblem: 30, pillFont: 26, pillArea: 76,
      titleFont: 64, titleLH: 74, gTitle: 22, textFont: 36, textLH: 52, gText: 34,
      blockPad: 36, devaFont: 40, devaLH: 56, translitFont: 34, translitLH: 48,
      meaningFont: 29, meaningLH: 42, gInterp: 26, interpLabel: 22, interpFont: 32,
      interpLH: 44, gChip: 36, chipFont: 28, chipH: 58
    }
  };

  function measureLayout(ctx, pt, interp, M) {
    var blockW = 900, blockInnerW = blockW - M.blockPad * 2 - 10;
    ctx.font = '600 ' + M.titleFont + 'px ' + SERIF;
    var titleLines = wrapText(ctx, pt.title, 900);
    ctx.font = '400 ' + M.textFont + 'px ' + SANS;
    var textLines = wrapText(ctx, pt.text, 840);
    ctx.font = '400 ' + M.devaFont + 'px ' + DEVA;
    var devaLines = wrapText(ctx, pt.sanskritDevanagari, blockInnerW);
    ctx.font = 'italic 500 ' + M.translitFont + 'px ' + SERIF;
    var translitLines = wrapText(ctx, pt.sanskritTranslit, blockInnerW);
    ctx.font = '400 ' + M.meaningFont + 'px ' + SANS;
    var meaningLines = wrapText(ctx, "“" + pt.verseTranslation + "”", blockInnerW);
    var blockH = M.blockPad + devaLines.length * M.devaLH + 10 +
      translitLines.length * M.translitLH + 12 + meaningLines.length * M.meaningLH +
      M.blockPad - 14;
    var interpLines = [], interpH = 0;
    if (interp) {
      ctx.font = 'italic 500 ' + M.interpFont + 'px ' + SERIF;
      interpLines = wrapText(ctx, interp, blockInnerW);
      interpH = 36 + 32 + interpLines.length * M.interpLH + 34;
    }
    var emblemSize = interp ? M.emblemInterp : M.emblem;
    var hTotal = emblemSize + M.gEmblem + M.pillArea +
      titleLines.length * M.titleLH + M.gTitle +
      textLines.length * M.textLH + M.gText +
      blockH + (interp ? M.gInterp + interpH : 0) + M.gChip + M.chipH;
    return {
      blockW: blockW, titleLines: titleLines, textLines: textLines,
      devaLines: devaLines, translitLines: translitLines, meaningLines: meaningLines,
      blockH: blockH, interpLines: interpLines, interpH: interpH,
      emblemSize: emblemSize, hTotal: hTotal
    };
  }

  async function renderCard(entry, audience) {
    await ensureFonts();
    var ch = entry.chapter, pt = entry.point;
    var interp = audience && pt.audiences ? pt.audiences[audience] : null;
    var canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext("2d");

    /* Background */
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    var glow = ctx.createRadialGradient(W / 2, -200, 100, W / 2, -200, 900);
    glow.addColorStop(0, C.bgSoft);
    glow.addColorStop(1, "rgba(243,236,221,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, 700);

    /* Frame */
    ctx.strokeStyle = C.edge;
    ctx.lineWidth = 2;
    roundRect(ctx, 28, 28, W - 56, H - 56, 26);
    ctx.stroke();

    var CX = W / 2;
    var usable = H - 170;  /* keep clear of the footer line */

    ctx.textAlign = "center";
    var M = METRICS.normal;
    var L = measureLayout(ctx, pt, interp, M);
    if (L.hTotal > usable) {
      M = METRICS.compact;
      L = measureLayout(ctx, pt, interp, M);
    }
    var top = Math.max(54, 54 + (usable - L.hTotal) / 2);

    /* ——— draw ——— */
    var y = top;
    var emblem = await loadEmblem(ch.number, L.emblemSize);
    if (emblem) ctx.drawImage(emblem, CX - L.emblemSize / 2, y, L.emblemSize, L.emblemSize);
    y += L.emblemSize + M.gEmblem;

    /* chapter pill */
    var pillText = "CHAPTER " + ch.number + "  ·  " + ch.nameTranslit.toUpperCase();
    ctx.font = '600 ' + M.pillFont + 'px ' + SANS;
    var pillTextW = ctx.measureText(pillText).width + 30;
    var pillW = pillTextW + 64, pillH = M.pillFont * 2;
    ctx.fillStyle = C.bgSoft;
    roundRect(ctx, CX - pillW / 2, y - pillH / 2 - 8, pillW, pillH, pillH / 2);
    ctx.fill();
    ctx.fillStyle = C.gold;
    drawSpaced(ctx, pillText, CX, y + 2, 3);
    y += M.pillArea;

    /* title */
    ctx.fillStyle = C.ink;
    ctx.font = '600 ' + M.titleFont + 'px ' + SERIF;
    for (var i = 0; i < L.titleLines.length; i++) {
      ctx.fillText(L.titleLines[i], CX, y + Math.round(M.titleFont * 0.82));
      y += M.titleLH;
    }
    y += M.gTitle;

    /* teaching text */
    ctx.fillStyle = C.inkSoft;
    ctx.font = '400 ' + M.textFont + 'px ' + SANS;
    for (i = 0; i < L.textLines.length; i++) {
      ctx.fillText(L.textLines[i], CX, y + M.textFont);
      y += M.textLH;
    }
    y += M.gText;

    /* sanskrit block */
    var bx = CX - L.blockW / 2;
    ctx.fillStyle = C.bgSoft;
    roundRect(ctx, bx, y, L.blockW, L.blockH, 18);
    ctx.fill();
    ctx.fillStyle = C.gold;
    ctx.fillRect(bx, y + 14, 6, L.blockH - 28);

    var ty = y + M.blockPad + Math.round(M.devaFont * 0.55);
    ctx.textAlign = "left";
    var tx = bx + M.blockPad + 10;
    ctx.fillStyle = C.ink;
    ctx.font = '400 ' + M.devaFont + 'px ' + DEVA;
    for (i = 0; i < L.devaLines.length; i++) { ctx.fillText(L.devaLines[i], tx, ty); ty += M.devaLH; }
    ty += 10;
    ctx.fillStyle = C.gold;
    ctx.font = 'italic 500 ' + M.translitFont + 'px ' + SERIF;
    for (i = 0; i < L.translitLines.length; i++) { ctx.fillText(L.translitLines[i], tx, ty); ty += M.translitLH; }
    ty += 12;
    ctx.fillStyle = C.inkFaint;
    ctx.font = '400 ' + M.meaningFont + 'px ' + SANS;
    for (i = 0; i < L.meaningLines.length; i++) { ctx.fillText(L.meaningLines[i], tx, ty); ty += M.meaningLH; }
    ctx.textAlign = "center";
    y += L.blockH;

    /* interpretation strip */
    if (interp) {
      y += M.gInterp;
      ctx.fillStyle = "#eef0f6";
      roundRect(ctx, bx, y, L.blockW, L.interpH, 18);
      ctx.fill();
      ctx.fillStyle = "#3b4a6b";
      ctx.fillRect(bx, y + 14, 6, L.interpH - 28);
      ctx.textAlign = "left";
      var itx = bx + M.blockPad + 10;
      var ity = y + 36 + M.interpLabel * 0.8;
      ctx.font = '600 ' + M.interpLabel + 'px ' + SANS;
      drawSpacedLeft(ctx, "WHAT THIS MEANS FOR YOU", itx, ity, 3);
      ity += 32 + Math.round(M.interpFont * 0.55);
      ctx.fillStyle = "#3f3a2f";
      ctx.font = 'italic 500 ' + M.interpFont + 'px ' + SERIF;
      for (i = 0; i < L.interpLines.length; i++) { ctx.fillText(L.interpLines[i], itx, ity); ity += M.interpLH; }
      ctx.textAlign = "center";
      y += L.interpH;
    }
    y += M.gChip;

    /* verse chip */
    var chipText = "BHAGAVAD GITA " + pt.verse;
    ctx.font = '600 ' + M.chipFont + 'px ' + SANS;
    var chipW = ctx.measureText(chipText).width + 40 + 70;
    ctx.fillStyle = C.accentSoft;
    roundRect(ctx, CX - chipW / 2, y, chipW, M.chipH, M.chipH / 2);
    ctx.fill();
    ctx.fillStyle = C.accent;
    drawSpaced(ctx, chipText, CX, y + Math.round(M.chipH * 0.65), 4);

    /* footer */
    ctx.fillStyle = C.inkFaint;
    ctx.font = '400 30px ' + SANS;
    ctx.fillText("geetalearnings.vercel.app", CX, H - 58);

    return canvas;
  }

  /* left-aligned text with manual letter-spacing */
  function drawSpacedLeft(ctx, text, x, y, spacing) {
    ctx.save();
    ctx.textAlign = "left";
    for (var i = 0; i < text.length; i++) {
      ctx.fillText(text[i], x, y);
      x += ctx.measureText(text[i]).width + spacing;
    }
    ctx.restore();
  }

  /* centered text with manual letter-spacing */
  function drawSpaced(ctx, text, cx, y, spacing) {
    var total = ctx.measureText(text).width + spacing * (text.length - 1);
    var x = cx - total / 2;
    ctx.save();
    ctx.textAlign = "left";
    for (var i = 0; i < text.length; i++) {
      ctx.fillText(text[i], x, y);
      x += ctx.measureText(text[i]).width + spacing;
    }
    ctx.restore();
  }

  function canvasBlob(canvas) {
    return new Promise(function (resolve) { canvas.toBlob(resolve, "image/png"); });
  }

  function captionFor(entry, audience) {
    var pt = entry.point;
    var caption = pt.title + " — " + pt.text;
    var interp = audience && pt.audiences ? pt.audiences[audience] : null;
    if (interp) caption += "\n\nWhat this means for you: " + interp;
    return caption + "\n(Bhagavad Gita " + pt.verse + ")\n" + SITE_URL;
  }

  async function cardBlobFor(entry, audience) {
    var canvas = await renderCard(entry, audience);
    return canvasBlob(canvas);
  }

  function busy(btn, on) {
    btn.disabled = on;
    btn.style.opacity = on ? "0.6" : "";
  }

  var waBtn = document.getElementById("whatsapp-btn");
  var saveBtn = document.getElementById("savecard-btn");
  var audModal = document.getElementById("audience-modal");

  async function doShare(entry, audience) {
    busy(waBtn, true);
    try {
      var blob = await cardBlobFor(entry, audience);
      var file = blob && new File([blob], "geeta-teaching.png", { type: "image/png" });
      var caption = captionFor(entry, audience);
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: caption });
      } else {
        window.open("https://wa.me/?text=" + encodeURIComponent(caption), "_blank", "noopener");
      }
    } catch (e) { /* user cancelled the share sheet — fine */ }
    busy(waBtn, false);
  }

  async function doSave(entry, audience) {
    busy(saveBtn, true);
    try {
      var blob = await cardBlobFor(entry, audience);
      if (blob) {
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "geeta-teaching.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
      }
    } catch (e) { /* non-fatal */ }
    busy(saveBtn, false);
  }

  /* Audience chooser: pick who the card is for, then run the pending action */
  var pendingAction = null;

  function chooseAudience(entry, action) {
    var pt = entry.point;
    if (!pt.audiences || !audModal) {
      /* no interpretations available — plain card */
      return action === "share" ? doShare(entry, null) : doSave(entry, null);
    }
    pendingAction = action;
    ["teen", "adult", "trader"].forEach(function (aud) {
      var el = audModal.querySelector('[data-aud-line="' + aud + '"]');
      if (el) el.textContent = pt.audiences[aud] || "";
    });
    audModal.showModal();
  }

  if (audModal) {
    audModal.querySelectorAll(".aud-opt").forEach(function (btn) {
      btn.addEventListener("click", function () {
        audModal.close();
        var entry = window.GEETA && window.GEETA.current();
        if (!entry) return;
        var audience = btn.dataset.aud === "none" ? null : btn.dataset.aud;
        if (pendingAction === "share") doShare(entry, audience);
        else if (pendingAction === "save") doSave(entry, audience);
        pendingAction = null;
      });
    });
    var cancel = document.getElementById("aud-cancel");
    if (cancel) cancel.addEventListener("click", function () { audModal.close(); pendingAction = null; });
    audModal.addEventListener("click", function (e) {
      if (e.target === audModal) { audModal.close(); pendingAction = null; }
    });
  }

  if (waBtn) waBtn.addEventListener("click", function () {
    var entry = window.GEETA && window.GEETA.current();
    if (entry) chooseAudience(entry, "share");
  });

  if (saveBtn) saveBtn.addEventListener("click", function () {
    var entry = window.GEETA && window.GEETA.current();
    if (entry) chooseAudience(entry, "save");
  });

  /* test hook: data URL of the current card, optionally with an audience lens */
  if (window.GEETA) {
    window.GEETA.cardDataURL = async function (audience) {
      var entry = window.GEETA.current();
      var canvas = await renderCard(entry, audience || null);
      return canvas.toDataURL("image/png");
    };
  }
})();
