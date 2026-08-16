# Geeta Learnings

A daily-glance learning dashboard for the Bhagavad Gita. All 18 chapters distilled
into their 3–4 most important teachings — each a concise one-liner paired with its
source verse in Sanskrit (Devanagari + IAST transliteration) and a literal translation.

Built for a mindful minute a day: open it, read the **Teaching of the Day**
(rotates automatically each date), or hit **Another teaching** to explore.

## Features

- **Teaching of the Day** — deterministic daily rotation through all learning points
- **Shuffle** — random exploration, preferring teachings you haven't seen yet
- **18 chapter cards** — each with a hand-drawn symbolic SVG emblem and a tap-through
  view of the chapter's key teachings
- **Sanskrit sources** — every teaching cites its exact verse, with the quotable
  Sanskrit line in Devanagari and IAST plus a literal translation
- **Streak & progress** — local visit streak and "teachings explored" tracker
  (stored only in your browser)
- **Light / dark themes** — follows your system, with a manual toggle
- **Zero dependencies** — plain HTML/CSS/JS static site, no build step

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | Page shell |
| `styles.css` | Design system (light/dark tokens, layout) |
| `data.js` | All 18 chapters' curated learning points |
| `art.js` | 18 symbolic SVG chapter emblems |
| `app.js` | Daily pick, shuffle, chapters modal, streak logic |

## Development

No build step — serve the folder with any static server:

```bash
npx serve .
# or
python3 -m http.server 8000
```

## Deployment

Deployed on [Vercel](https://vercel.com) as a static site (no framework preset needed).
