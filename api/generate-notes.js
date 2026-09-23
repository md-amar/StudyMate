/* ============================================================
 * StudyMate - api/generate-notes.js
 * Vercel serverless function: POST /api/generate-notes
 * All logic lives in ./lib/ollama.js (shared with dev-server.js).
 * ============================================================ */

const { handleGenerateNotes } = require("./lib/ollama");

module.exports = handleGenerateNotes;
