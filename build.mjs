// Vercel build: copy the static site files into dist/.
// The Vercel project builds with `node build.mjs` and serves dist/.
import { mkdir, copyFile } from "node:fs/promises";

const FILES = ["index.html", "styles.css", "app.js", "art.js", "data.js"];

await mkdir("dist", { recursive: true });
for (const f of FILES) {
  await copyFile(f, `dist/${f}`);
  console.log(`copied ${f}`);
}
console.log("build complete");
