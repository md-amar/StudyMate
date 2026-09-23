/* ============================================================
 * StudyMate - dev-server.js
 * Zero-dependency local development server.
 *
 * Serves the static frontend AND mounts the exact same handler
 * the Vercel serverless function uses, so local behavior matches
 * production. No npm install required — Node built-ins only.
 *
 *   node dev-server.js          → http://localhost:3000
 *   PORT=3010 node dev-server.js
 *
 * Environment (loaded from .env when present):
 *   OLLAMA_BASE_URL=http://localhost:11434
 *   OLLAMA_MODEL=llama3.2
 * ============================================================ */

const http = require("http");
const fs = require("fs");
const path = require("path");

// Load .env if present (Node >= 20.6). Missing file is fine — defaults apply.
try { process.loadEnvFile(); } catch (_) { /* no .env — using defaults */ }

const { handleGenerateNotes, getConfig } = require("./api/lib/ollama");

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".md": "text/markdown; charset=utf-8"
};

function serveStatic(pathname, res) {
  let filePath;
  try {
    filePath = path.normalize(path.join(ROOT, decodeURIComponent(pathname)));
  } catch (_) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    return res.end("Bad request");
  }
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    return res.end("Forbidden");
  }
  if (pathname === "/" || pathname === "") {
    filePath = path.join(ROOT, "index.html");
  }
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("Not found");
    }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream"
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname;
  } catch (_) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    return res.end("Bad request");
  }

  if (pathname === "/api/generate-notes") {
    handleGenerateNotes(req, res);
    return;
  }
  serveStatic(pathname, res);
});

server.listen(PORT, () => {
  const { baseUrl, model } = getConfig();
  console.log("StudyMate local development server");
  console.log(`  App:       http://localhost:${PORT}`);
  console.log(`  AI API:    POST http://localhost:${PORT}/api/generate-notes`);
  console.log(`  Ollama:    ${baseUrl}  (model: ${model})`);
  console.log("  Requires:  Ollama running locally with the model pulled.");
});
