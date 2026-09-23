/* ============================================================
 * StudyMate - api/lib/ollama.js
 * Server-side helper for the AI note-generation endpoint.
 *
 * Responsibilities:
 *   1. Read OLLAMA_BASE_URL / OLLAMA_MODEL from process.env
 *      (sensible local defaults only when the env vars are absent).
 *   2. Validate the /api/generate-notes request.
 *   3. Build a StudyMate-specific, mastery-adaptive educational prompt.
 *   4. Call ${OLLAMA_BASE_URL}/api/generate (stream:false) server-side.
 *   5. Map every failure to a friendly message + proper status code.
 *
 * This module is shared by:
 *   - api/generate-notes.js  (Vercel serverless function)
 *   - dev-server.js          (zero-dependency local dev server)
 *
 * No browser APIs, no external packages — Node built-ins only.
 * ============================================================ */

const DEFAULT_OLLAMA_BASE_URL = "http://localhost:11434";
const DEFAULT_OLLAMA_MODEL = "llama3.2";
const OLLAMA_TIMEOUT_MS = 120000;  // local CPU generation can be slow
const MAX_BODY_BYTES = 1000000;    // 1 MB request cap

/** Read config fresh on every call so env changes apply without redeploy. */
function getConfig() {
  const baseUrl = (process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_BASE_URL).replace(/\/+$/, "");
  const model = process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL;
  return { baseUrl, model };
}

/* ============================================================
 * Request validation
 * ============================================================ */

function isFiniteNumber(value) {
  return typeof value === "number" && isFinite(value);
}

function cleanString(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

/**
 * Validate the request body and fill safe defaults for optional fields.
 * Returns { ok: true, payload } or { ok: false, status, error }.
 */
function validateRequest(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, status: 400, error: "Request body must be a JSON object." };
  }

  const topic = cleanString(body.topic, 200);
  if (!topic) {
    return {
      ok: false,
      status: 400,
      error: 'A learning gap "topic" is required and must be a non-empty string.'
    };
  }

  for (const field of ["currentMastery", "targetMastery", "sessionDuration"]) {
    if (body[field] !== undefined && body[field] !== null && body[field] !== "" && !isFiniteNumber(body[field])) {
      return { ok: false, status: 400, error: `"${field}" must be a number.` };
    }
  }

  const clamp = (n, min, max) => Math.min(max, Math.max(min, Math.round(n)));

  return {
    ok: true,
    payload: {
      topic,
      subject: cleanString(body.subject, 100) || "General",
      currentMastery: body.currentMastery === undefined || body.currentMastery === null || body.currentMastery === ""
        ? 50 : clamp(body.currentMastery, 0, 100),
      targetMastery: body.targetMastery === undefined || body.targetMastery === null || body.targetMastery === ""
        ? 85 : clamp(body.targetMastery, 0, 100),
      priority: cleanString(body.priority, 30) || "Moderate",
      urgency: isFiniteNumber(body.urgency)
        ? `${clamp(body.urgency, 0, 100)}/100`
        : (cleanString(body.urgency, 30) || "High"),
      examName: cleanString(body.examName, 150) || "Upcoming Exam",
      examDate: cleanString(body.examDate, 30),
      resourceName: cleanString(body.resourceName, 200),
      resourceType: cleanString(body.resourceType, 50),
      sessionDuration: body.sessionDuration === undefined || body.sessionDuration === null || body.sessionDuration === ""
        ? 60 : clamp(body.sessionDuration, 15, 180)
    }
  };
}

/* ============================================================
 * Prompt construction (StudyMate-specific, mastery-adaptive)
 * ============================================================ */

function masteryTier(currentMastery) {
  if (currentMastery < 40) return "LOW";
  if (currentMastery < 70) return "MEDIUM";
  return "HIGH";
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  if (isNaN(diff)) return null;
  return Math.max(0, Math.ceil(diff / 86400000));
}

function buildPrompt(p) {
  const tier = masteryTier(p.currentMastery);
  const days = daysUntil(p.examDate);
  const examLine = p.examDate
    ? `${p.examName} on ${p.examDate}${days !== null ? ` (${days} day${days === 1 ? "" : "s"} away)` : ""}`
    : p.examName;

  const tierInstructions = {
    LOW: `The student's mastery is LOW (${p.currentMastery}%). Therefore:
- Start from the fundamentals and briefly explain every prerequisite concept before using it.
- Use simple, everyday language and intuitive analogies before formal definitions.
- Build understanding step by step; assume no prior exposure to this specific topic.
- Prefer small, concrete examples over dense formalism.`,

    MEDIUM: `The student's mastery is MEDIUM (${p.currentMastery}%). Therefore:
- Focus on the core concepts and how they connect, rather than re-teaching basics from zero.
- Emphasize problem-solving strategy: how to recognize which technique applies and why.
- Include worked examples and explicitly cover the most common mistakes and misconceptions.
- Connect the material to how it is typically examined.`,

    HIGH: `The student's mastery is HIGH (${p.currentMastery}%). Therefore:
- Skip beginner explanations; focus on advanced concepts, subtle distinctions and edge cases.
- Include exam-level and trick-style problems with rigorous reasoning.
- Highlight the details that separate a good answer from a perfect one.
- Make the revision summary fast and information-dense.`
  }[tier];

  const resourceLine = p.resourceName
    ? `- Suggested resource: "${p.resourceName}"${p.resourceType ? ` (${p.resourceType})` : ""}`
    : `- Suggested resource: none provided`;

  return `You are StudyMate's AI study-notes generator.

StudyMate is an autonomous learning-planning application. It has ALREADY analyzed the student's performance, detected the learning gap below, computed its priority, and planned a study session for it. Your job is to generate educational material targeted specifically at closing THIS learning gap — not generic notes about the topic.

STUDENT'S LEARNING PROFILE (from StudyMate's planner)
- Topic: ${p.topic}
- Subject: ${p.subject}
- Current mastery: ${p.currentMastery}% | Target mastery: ${p.targetMastery}%
- Priority assigned by the planner: ${p.priority}
- Urgency score: ${p.urgency}
- Exam: ${examLine}
${resourceLine}
- Planned focus session: ${p.sessionDuration} minutes

${tierInstructions}

RESOURCE HONESTY RULES
- The resource name (if any) is contextual guidance only. You have NOT read, retrieved, or summarized it. Never claim otherwise.
- Never fabricate citations, references, or URLs.

REQUIRED STRUCTURE — use exactly these numbered headings in plain text:
1. Topic Overview
2. Core Concepts
3. Important Definitions
4. Step-by-Step Explanation
5. Formulas / Rules
6. Algorithms / Procedures
7. Worked Examples
8. Common Mistakes
9. Important Exam Points
10. Quick Revision Summary
11. Self-Test Questions (exactly 5)
12. What to Study Next

Section rules:
- Include sections 5 and 6 ONLY if they genuinely apply to this topic; if not, skip them and keep the numbering continuous.
- For programming / data-structures topics include pseudocode, time & space complexity where relevant, and edge cases.
- For mathematical or scientific topics include formulas, assumptions, and fully worked examples.
- For section 11, write 5 questions of increasing difficulty and put a compact answer key immediately after them.
- Aim for roughly 700-1100 words — right-sized for a ${p.sessionDuration}-minute focus session.

STYLE
- Plain text only: no markdown symbols (#, *, backticks). Use the numbered headings above, short paragraphs, and "- " for bullets.
- Clear, direct language for a university student. No filler, no preamble, no closing remarks — start directly with "1. Topic Overview".`;
}

/* ============================================================
 * Ollama HTTP call
 * ============================================================ */

function httpError(status, message) {
  const err = new Error(message);
  err.httpStatus = status;
  return err;
}

async function callOllama(prompt) {
  const { baseUrl, model } = getConfig();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: false }),
      signal: controller.signal
    });
  } catch (err) {
    if (err.name === "AbortError") {
      throw httpError(504, "Ollama took too long to respond. Please try again.");
    }
    // Connection refused / DNS failure / server down all land here.
    throw httpError(502, "Ollama is not running. Please start Ollama and try again.");
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  try {
    data = await response.json();
  } catch (_) {
    /* handled below */
  }

  if (!response.ok) {
    const ollamaMsg = data && typeof data.error === "string" ? data.error : "";
    if (response.status === 404 || ollamaMsg.includes("not found")) {
      throw httpError(
        502,
        `The configured Ollama model "${model}" was not found. Please run: ollama pull ${model}`
      );
    }
    throw httpError(502, "Ollama returned an error while generating notes. Please try again.");
  }

  if (!data || typeof data.response !== "string" || !data.response.trim()) {
    throw httpError(502, "Ollama returned an invalid response. Please try again.");
  }

  return { text: data.response.trim(), model };
}

/* ============================================================
 * HTTP plumbing shared by Vercel and the local dev server
 * ============================================================ */

function sendJson(res, status, payload) {
  if (res.headersSent) return;
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", chunk => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(httpError(413, "Request body too large."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

/**
 * The /api/generate-notes handler.
 * Signature matches Vercel's Node serverless functions: (req, res).
 */
async function handleGenerateNotes(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { success: false, error: "Method not allowed. Use POST." });
    return;
  }

  try {
    const raw = await readBody(req);

    let body;
    try {
      body = JSON.parse(raw || "{}");
    } catch (_) {
      sendJson(res, 400, { success: false, error: "Request body must be valid JSON." });
      return;
    }

    const validated = validateRequest(body);
    if (!validated.ok) {
      sendJson(res, validated.status, { success: false, error: validated.error });
      return;
    }

    const prompt = buildPrompt(validated.payload);
    const { text, model } = await callOllama(prompt);

    sendJson(res, 200, {
      success: true,
      model,
      notes: text,
      metadata: {
        topic: validated.payload.topic,
        subject: validated.payload.subject,
        generatedBy: "ollama"
      }
    });
  } catch (err) {
    if (err && err.httpStatus) {
      sendJson(res, err.httpStatus, { success: false, error: err.message });
    } else {
      // Never leak stack traces or internal details to the browser.
      console.error("generate-notes: unexpected error:", err);
      sendJson(res, 500, { success: false, error: "Unable to generate AI notes right now. Please try again." });
    }
  }
}

module.exports = { handleGenerateNotes, validateRequest, buildPrompt, callOllama, getConfig };
