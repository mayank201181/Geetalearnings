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

  async function renderCard(entry) {
    await ensureFonts();
    var ch = entry.chapter, pt = entry.point;
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
    var contentWidth = 840;

    /* ——— measure pass ——— */
    ctx.textAlign = "center";
    ctx.font = '600 76px ' + SERIF;
    var titleLines = wrapText(ctx, pt.title, 900);
    ctx.font = '400 40px ' + SANS;
    var textLines = wrapText(ctx, pt.text, contentWidth);

    var blockW = 900, blockPad = 46, blockInnerW = blockW - blockPad * 2 - 10;
    ctx.font = '400 44px ' + DEVA;
    var devaLines = wrapText(ctx, pt.sanskritDevanagari, blockInnerW);
    ctx.font = 'italic 500 38px ' + SERIF;
    var translitLines = wrapText(ctx, pt.sanskritTranslit, blockInnerW);
    ctx.font = '400 32px ' + SANS;
    var meaningLines = wrapText(ctx, "“" + pt.verseTranslation + "”", blockInnerW);

    var blockH = blockPad + devaLines.length * 62 + 10 + translitLines.length * 54 + 12 + meaningLines.length * 46 + blockPad - 14;

    var emblemSize = 240;
    var hTotal =
      emblemSize + 44 +          /* emblem + gap */
      44 + 46 +                  /* chapter pill + gap */
      titleLines.length * 88 + 30 +
      textLines.length * 58 + 46 +
      blockH + 50 +
      64;                        /* verse chip */
    var top = Math.max(70, (H - 90 - hTotal) / 2);

    /* ——— draw pass ——— */
    var y = top;
    var emblem = await loadEmblem(ch.number, emblemSize);
    if (emblem) ctx.drawImage(emblem, CX - emblemSize / 2, y, emblemSize, emblemSize);
    y += emblemSize + 44;

    /* chapter pill */
    var pillText = "CHAPTER " + ch.number + "  ·  " + ch.nameTranslit.toUpperCase();
    ctx.font = '600 28px ' + SANS;
    var pillTextW = ctx.measureText(pillText).width + 30; /* letter-spacing approximation */
    var pillW = pillTextW + 64, pillH = 56;
    ctx.fillStyle = C.bgSoft;
    roundRect(ctx, CX - pillW / 2, y - pillH / 2 - 8, pillW, pillH, pillH / 2);
    ctx.fill();
    ctx.fillStyle = C.gold;
    drawSpaced(ctx, pillText, CX, y + 2, 3);
    y += 46 + 44;

    /* title */
    ctx.fillStyle = C.ink;
    ctx.font = '600 76px ' + SERIF;
    for (var i = 0; i < titleLines.length; i++) {
      ctx.fillText(titleLines[i], CX, y + 62);
      y += 88;
    }
    y += 30;

    /* teaching text */
    ctx.fillStyle = C.inkSoft;
    ctx.font = '400 40px ' + SANS;
    for (i = 0; i < textLines.length; i++) {
      ctx.fillText(textLines[i], CX, y + 40);
      y += 58;
    }
    y += 46;

    /* sanskrit block */
    var bx = CX - blockW / 2;
    ctx.fillStyle = C.bgSoft;
    roundRect(ctx, bx, y, blockW, blockH, 18);
    ctx.fill();
    ctx.fillStyle = C.gold;
    ctx.fillRect(bx, y + 14, 6, blockH - 28);

    var ty = y + blockPad + 24;
    ctx.textAlign = "left";
    var tx = bx + blockPad + 10;
    ctx.fillStyle = C.ink;
    ctx.font = '400 44px ' + DEVA;
    for (i = 0; i < devaLines.length; i++) { ctx.fillText(devaLines[i], tx, ty); ty += 62; }
    ty += 10;
    ctx.fillStyle = C.gold;
    ctx.font = 'italic 500 38px ' + SERIF;
    for (i = 0; i < translitLines.length; i++) { ctx.fillText(translitLines[i], tx, ty); ty += 54; }
    ty += 12;
    ctx.fillStyle = C.inkFaint;
    ctx.font = '400 32px ' + SANS;
    for (i = 0; i < meaningLines.length; i++) { ctx.fillText(meaningLines[i], tx, ty); ty += 46; }
    ctx.textAlign = "center";
    y += blockH + 50;

    /* verse chip */
    var chipText = "BHAGAVAD GITA " + pt.verse;
    ctx.font = '600 30px ' + SANS;
    var chipW = ctx.measureText(chipText).width + 40 + 70, chipH = 64;
    ctx.fillStyle = C.accentSoft;
    roundRect(ctx, CX - chipW / 2, y, chipW, chipH, chipH / 2);
    ctx.fill();
    ctx.fillStyle = C.accent;
    drawSpaced(ctx, chipText, CX, y + 42, 4);

    /* footer */
    ctx.fillStyle = C.inkFaint;
    ctx.font = '400 30px ' + SANS;
    ctx.fillText("geetalearnings.vercel.app", CX, H - 62);

    return canvas;
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

  function captionFor(entry) {
    var pt = entry.point;
    return pt.title + " — " + pt.text + " (Bhagavad Gita " + pt.verse + ")\n" + SITE_URL;
  }

  async function currentCardBlob() {
    var entry = window.GEETA && window.GEETA.current();
    if (!entry) return null;
    var canvas = await renderCard(entry);
    return canvasBlob(canvas);
  }

  function busy(btn, on) {
    btn.disabled = on;
    btn.style.opacity = on ? "0.6" : "";
  }

  var waBtn = document.getElementById("whatsapp-btn");
  var saveBtn = document.getElementById("savecard-btn");

  if (waBtn) waBtn.addEventListener("click", async function () {
    var entry = window.GEETA && window.GEETA.current();
    if (!entry) return;
    busy(waBtn, true);
    try {
      var blob = await currentCardBlob();
      var file = blob && new File([blob], "geeta-teaching.png", { type: "image/png" });
      var caption = captionFor(entry);
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: caption });
      } else {
        window.open("https://wa.me/?text=" + encodeURIComponent(caption), "_blank", "noopener");
      }
    } catch (e) { /* user cancelled the share sheet — fine */ }
    busy(waBtn, false);
  });

  if (saveBtn) saveBtn.addEventListener("click", async function () {
    busy(saveBtn, true);
    try {
      var blob = await currentCardBlob();
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
  });

  /* test hook: data URL of the current card */
  if (window.GEETA) {
    window.GEETA.cardDataURL = async function () {
      var entry = window.GEETA.current();
      var canvas = await renderCard(entry);
      return canvas.toDataURL("image/png");
    };
  }
})();
