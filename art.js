/* Chapter emblems: symbolic line art, one motif per chapter.
   All drawn in a 120×120 viewBox with a shared outer ring; colors come
   from CSS variables so every emblem adapts to light/dark themes. */

(function () {
  function emblem(inner, label) {
    return (
      '<svg viewBox="0 0 120 120" role="img" aria-label="' + label + '">' +
      '<circle class="em-ring" cx="60" cy="60" r="54"/>' +
      inner +
      "</svg>"
    );
  }

  var ART = {
    /* 1 — Arjuna's despair: the great bow lowered, arrow set down */
    1: emblem(
      '<path class="em-l" d="M30 86 Q 72 82 90 36"/>' +
      '<path class="em-lt" d="M30 86 L90 36"/>' +
      '<path class="em-l2" d="M34 96 L82 92"/>' +
      '<path class="em-l2" d="M82 92 L74 88 M82 92 L75 97"/>' +
      '<path class="em-dash" d="M44 30 Q 56 24 68 28"/>',
      "A lowered bow with an arrow laid on the ground"
    ),

    /* 2 — The eternal Self: a steady inner flame with a halo */
    2: emblem(
      '<circle class="em-dash" cx="60" cy="60" r="34"/>' +
      '<path class="em-fl" d="M60 34 C 47 52 44 63 49 76 C 53 86 67 86 71 76 C 76 63 73 52 60 34 Z"/>' +
      '<path class="em-l2" d="M60 58 C 55 66 55 71 58 76 C 60 79 64 78 65 74 C 66 69 64 64 60 58 Z"/>' +
      '<path class="em-l" d="M42 94 L78 94"/>',
      "An eternal flame within a halo"
    ),

    /* 3 — Karma yoga: the turning wheel of action */
    3: emblem(
      '<circle class="em-l" cx="60" cy="60" r="27"/>' +
      '<circle class="em-fl" cx="60" cy="60" r="6"/>' +
      '<path class="em-lt" d="M60 33 V54 M60 66 V87 M33 60 H54 M66 60 H87 M41 41 L56 56 M64 64 L79 79 M79 41 L64 56 M56 64 L41 79"/>' +
      '<path class="em-dash" d="M92 46 A 34 34 0 0 1 92 74"/>',
      "A turning wheel with eight spokes"
    ),

    /* 4 — The fire of knowledge: flame upon a stepped altar */
    4: emblem(
      '<path class="em-l" d="M38 88 H82 M43 80 H77 M48 72 H72"/>' +
      '<path class="em-fl" d="M60 34 C 51 46 49 54 53 63 C 56 70 64 70 67 63 C 71 54 69 46 60 34 Z"/>' +
      '<circle class="em-dot" cx="43" cy="52" r="2"/>' +
      '<circle class="em-dot" cx="78" cy="46" r="2"/>' +
      '<circle class="em-dot" cx="72" cy="30" r="1.6"/>',
      "A sacred flame burning on a stepped altar"
    ),

    /* 5 — Untouched like a lotus leaf: a drop resting above the leaf */
    5: emblem(
      '<path class="em-fl" d="M24 72 Q 60 50 96 72 Q 60 90 24 72 Z"/>' +
      '<path class="em-lt" d="M60 61 V80"/>' +
      '<path class="em-l2" d="M60 40 C 55 47 53 51 55 55 C 57 59 63 59 65 55 C 67 51 65 47 60 40 Z"/>' +
      '<path class="em-l" d="M52 96 Q 60 90 68 96"/>',
      "A water drop resting untouched on a lotus leaf"
    ),

    /* 6 — Dhyana: the meditator, steady as a lamp in a windless place */
    6: emblem(
      '<path class="em-dash" d="M36 44 A 26 26 0 0 1 84 44"/>' +
      '<circle class="em-fl" cx="60" cy="40" r="9"/>' +
      '<path class="em-l" d="M60 52 C 47 55 42 64 38 78 L 82 78 C 78 64 73 55 60 52 Z"/>' +
      '<path class="em-l2" d="M30 86 H90"/>' +
      '<path class="em-lt" d="M47 68 Q 60 74 73 68"/>',
      "A person seated in meditation"
    ),

    /* 7 — All strung on Him: pearls on a thread, one jewel at heart */
    7: emblem(
      '<path class="em-l2" d="M20 68 C 40 48 80 48 100 68"/>' +
      '<circle class="em-fl" cx="34" cy="59" r="4.5"/>' +
      '<circle class="em-fl" cx="47" cy="53.5" r="4.5"/>' +
      '<circle class="em-fl" cx="73" cy="53.5" r="4.5"/>' +
      '<circle class="em-fl" cx="86" cy="59" r="4.5"/>' +
      '<path class="em-l" d="M60 42 L69 52 L60 62 L51 52 Z"/>' +
      '<path class="em-dash" d="M48 80 Q 60 87 72 80"/>',
      "Pearls strung on a single thread with a jewel at the center"
    ),

    /* 8 — The imperishable: Om, remembered at the final hour */
    8: emblem(
      '<circle class="em-dash" cx="60" cy="58" r="36"/>' +
      '<text class="em-txt" x="60" y="74" font-size="46" text-anchor="middle">&#2384;</text>',
      "The sacred syllable Om"
    ),

    /* 9 — The royal secret: a crown held in the open sky */
    9: emblem(
      '<path class="em-fl" d="M38 74 L38 56 L49 66 L60 46 L71 66 L82 56 L82 74 Z"/>' +
      '<circle class="em-dot" cx="38" cy="50" r="2.6"/>' +
      '<circle class="em-dot" cx="60" cy="40" r="2.6"/>' +
      '<circle class="em-dot" cx="82" cy="50" r="2.6"/>' +
      '<path class="em-l" d="M38 82 H82"/>' +
      '<path class="em-dash" d="M30 94 H90"/>',
      "A crown beneath the open sky"
    ),

    /* 10 — Divine glories: the peacock feather */
    10: emblem(
      '<path class="em-l" d="M60 94 C 57 76 58 62 60 48"/>' +
      '<ellipse class="em-fl" cx="60" cy="40" rx="11" ry="14"/>' +
      '<ellipse class="em-l2" cx="60" cy="42" rx="6" ry="8"/>' +
      '<circle class="em-dot" cx="60" cy="44" r="2.6"/>' +
      '<path class="em-lt" d="M60 78 Q 49 74 44 66 M60 70 Q 52 67 48 60 M60 78 Q 71 74 76 66 M60 70 Q 68 67 72 60"/>',
      "A peacock feather"
    ),

    /* 11 — The cosmic form: a thousand suns blazing at once */
    11: emblem(
      '<circle class="em-l" cx="60" cy="60" r="14"/>' +
      '<circle class="em-dash" cx="60" cy="60" r="25"/>' +
      '<path class="em-l" d="M60 22 V30 M60 90 V98 M22 60 H30 M90 60 H98 M33 33 L39 39 M81 81 L87 87 M87 33 L81 39 M39 81 L33 87"/>' +
      '<circle class="em-dot2" cx="60" cy="42" r="2.2"/>' +
      '<circle class="em-dot2" cx="78" cy="60" r="2.2"/>' +
      '<circle class="em-dot2" cx="60" cy="78" r="2.2"/>' +
      '<circle class="em-dot2" cx="42" cy="60" r="2.2"/>',
      "A radiant cosmic sun with countless rays"
    ),

    /* 12 — Bhakti: the lotus offered in devotion */
    12: emblem(
      '<path class="em-fl" d="M60 36 C 54 48 54 60 60 70 C 66 60 66 48 60 36 Z"/>' +
      '<path class="em-l" d="M60 70 C 50 66 44 56 44 44 C 53 49 58 58 60 70 Z"/>' +
      '<path class="em-l" d="M60 70 C 70 66 76 56 76 44 C 67 49 62 58 60 70 Z"/>' +
      '<path class="em-l2" d="M60 72 C 47 72 38 66 32 58 C 44 58 54 63 60 72 Z"/>' +
      '<path class="em-l2" d="M60 72 C 73 72 82 66 88 58 C 76 58 66 63 60 72 Z"/>' +
      '<path class="em-lt" d="M42 84 Q 60 92 78 84"/>',
      "A blooming lotus offered in devotion"
    ),

    /* 13 — The field and its knower: a sprout watched by the witness eye */
    13: emblem(
      '<path class="em-l" d="M28 80 H92"/>' +
      '<path class="em-lt" d="M36 88 H50 M56 88 H70 M76 88 H84"/>' +
      '<path class="em-l" d="M60 80 V62"/>' +
      '<path class="em-fl" d="M60 66 C 52 64 47 58 46 50 C 54 52 59 58 60 66 Z"/>' +
      '<path class="em-fl" d="M60 66 C 68 64 73 58 74 50 C 66 52 61 58 60 66 Z"/>' +
      '<path class="em-l2" d="M44 36 Q 60 24 76 36 Q 60 46 44 36 Z"/>' +
      '<circle class="em-dot2" cx="60" cy="35" r="3.4"/>',
      "A sprout in a field beneath a witnessing eye"
    ),

    /* 14 — The three gunas: three interwoven strands */
    14: emblem(
      '<path class="em-l" d="M26 46 C 38 38 48 54 60 46 C 72 38 82 54 94 46"/>' +
      '<path class="em-l2" d="M26 62 C 38 54 48 70 60 62 C 72 54 82 70 94 62"/>' +
      '<path class="em-dash" d="M26 78 C 38 70 48 86 60 78 C 72 70 82 86 94 78"/>' +
      '<circle class="em-dot" cx="22" cy="46" r="2.4"/>' +
      '<circle class="em-dot2" cx="22" cy="62" r="2.4"/>' +
      '<circle class="em-dot" cx="22" cy="78" r="2.4"/>',
      "Three interwoven strands"
    ),

    /* 15 — The inverted banyan: roots above, branches below */
    15: emblem(
      '<path class="em-l" d="M60 44 V78"/>' +
      '<path class="em-l" d="M60 44 C 50 40 42 36 34 34 M60 44 C 56 36 54 30 53 24 M60 44 C 64 36 66 30 67 24 M60 44 C 70 40 78 36 86 34"/>' +
      '<path class="em-lt" d="M44 39 C 42 34 41 30 41 26 M76 39 C 78 34 79 30 79 26 M34 34 C 31 31 29 28 28 25 M86 34 C 89 31 91 28 92 25"/>' +
      '<path class="em-l2" d="M60 78 C 52 82 44 86 36 88 M60 78 C 56 86 54 91 53 96 M60 78 C 64 86 66 91 67 96 M60 78 C 68 82 76 86 84 88"/>' +
      '<circle class="em-dot2" cx="36" cy="90" r="2.2"/>' +
      '<circle class="em-dot2" cx="53" cy="98" r="2.2"/>' +
      '<circle class="em-dot2" cx="67" cy="98" r="2.2"/>' +
      '<circle class="em-dot2" cx="84" cy="90" r="2.2"/>' +
      '<circle class="em-dot" cx="53" cy="22" r="2.2"/>' +
      '<circle class="em-dot" cx="67" cy="22" r="2.2"/>' +
      '<circle class="em-dot" cx="28" cy="23" r="2.2"/>' +
      '<circle class="em-dot" cx="92" cy="23" r="2.2"/>',
      "The cosmic banyan tree with roots above and branches below"
    ),

    /* 16 — Two destinies: the rising path and the falling path */
    16: emblem(
      '<path class="em-l" d="M28 76 C 44 74 54 68 64 56 C 70 49 76 44 84 40"/>' +
      '<path class="em-dash" d="M28 76 C 46 78 62 82 78 92"/>' +
      '<circle class="em-l" cx="90" cy="34" r="7"/>' +
      '<path class="em-lt" d="M90 22 V26 M90 42 V46 M78 34 H82 M98 34 H102"/>' +
      '<circle class="em-dot2" cx="82" cy="95" r="2.4"/>',
      "A path forking upward toward light and downward into shadow"
    ),

    /* 17 — Threefold faith: three flames on one lamp */
    17: emblem(
      '<path class="em-fl" d="M34 74 Q 60 90 86 74 L 82 82 Q 60 94 38 82 Z"/>' +
      '<path class="em-fl" d="M60 36 C 54 46 52 53 55 60 C 58 66 62 66 65 60 C 68 53 66 46 60 36 Z"/>' +
      '<path class="em-l" d="M42 52 C 39 58 38 62 40 66 C 42 70 46 70 48 66 C 50 62 48 57 42 52 Z"/>' +
      '<path class="em-l" d="M78 52 C 75 58 74 62 76 66 C 78 70 82 70 84 66 C 86 62 84 57 78 52 Z"/>',
      "Three flames rising from one lamp"
    ),

    /* 18 — Moksha: birds released, rising toward the sun */
    18: emblem(
      '<circle class="em-fl" cx="66" cy="38" r="14"/>' +
      '<path class="em-lt" d="M66 17 V22 M45 38 H50 M82 38 H87 M51 23 L54 26 M81 23 L78 26"/>' +
      '<path class="em-l2" d="M30 72 Q 36 65 42 72 Q 48 65 54 72"/>' +
      '<path class="em-l2" d="M52 58 Q 56.5 53 61 58 Q 65.5 53 70 58"/>' +
      '<path class="em-dash" d="M32 92 Q 60 86 88 92"/>',
      "Birds rising free toward the sun"
    ),
  };

  window.GITA_ART = ART;
})();
