import fs from "node:fs";
import path from "node:path";

// TanStack Start SPA prerender writes the shell to dist/client/_shell.html.
// For static hosts (Vercel) we need an index.html at the SPA fallback path.
const clientDir = path.resolve("dist/client");
const shell = path.join(clientDir, "_shell.html");
const indexHtml = path.join(clientDir, "index.html");

if (!fs.existsSync(shell)) {
  console.error("[finalize-build] dist/client/_shell.html missing — build failed before prerender.");
  process.exit(1);
}

// Write index.html (SPA fallback for Vercel rewrites)
fs.copyFileSync(shell, indexHtml);
console.log("[finalize-build] Wrote dist/client/index.html from _shell.html");

// Ensure 404.html exists for Vercel's built-in 404 handling
const notFound = path.join(clientDir, "404.html");
if (!fs.existsSync(notFound)) {
  fs.copyFileSync(shell, notFound);
  console.log("[finalize-build] Wrote dist/client/404.html from _shell.html");
}

// Vercel needs _headers file to NOT exist when headers are in vercel.json
// Just log the output directory contents for debugging
const files = fs.readdirSync(clientDir);
console.log(`[finalize-build] dist/client contains: ${files.slice(0, 20).join(", ")}`);
