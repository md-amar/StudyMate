/* ============================================================
 * StudyMate - ai-notes.js
 * "Generate Best Notes" — minimal bridge between the existing AI
 * Planner and the StudyMate backend (POST /api/generate-notes),
 * which talks to Ollama server-side. The browser NEVER contacts
 * Ollama directly.
 *
 * Depends on globals from: utils.js, planner.js, notes.js
 * (window.addGeneratedNote), navigation.js. No existing planner
 * logic is modified — planner data is read via its exported APIs.
 * ============================================================ */
(function () {
  "use strict";

  const modal = document.getElementById("ai-notes-modal");
  const openBtn = document.getElementById("planner-generate-notes-btn");
  if (!modal || !openBtn) return;

  const els = {
    select: document.getElementById("ai-notes-topic-select"),
    generateBtn: document.getElementById("ai-notes-generate-btn"),
    generateLabel: document.getElementById("ai-notes-generate-label"),
    status: document.getElementById("ai-notes-status"),
    output: document.getElementById("ai-notes-output"),
    actions: document.getElementById("ai-notes-actions"),
    modelTag: document.getElementById("ai-notes-model-tag"),
    copyBtn: document.getElementById("ai-notes-copy-btn"),
    saveBtn: document.getElementById("ai-notes-save-btn"),
    regenerateBtn: document.getElementById("ai-notes-regenerate-btn"),
    closeBtn: document.getElementById("close-ai-notes-modal")
  };

  let lastPayload = null;
  let lastNotesText = "";
  let requestSeq = 0; // guards against stale responses after Regenerate

  /* ---------- modal open / close ---------- */

  function openModal() {
    populateTopics();
    resetPanel();
    modal.classList.remove("hidden");
  }

  function closeModal() {
    requestSeq++; // cancels any in-flight render
    modal.classList.add("hidden");
  }

  function resetPanel() {
    els.output.textContent = "";
    els.output.classList.add("hidden");
    els.actions.classList.add("hidden");
    els.actions.classList.remove("flex");
    els.modelTag.textContent = "";
    clearStatus();
  }

  closeOnBackdropClick(modal, closeModal);
  closeOnEscape(modal, closeModal);
  els.closeBtn.addEventListener("click", closeModal);

  openBtn.addEventListener("click", openModal);

  /* ---------- topic selection (from existing planner data) ---------- */

  function populateTopics() {
    const gaps = typeof getRankedLearningGaps === "function" ? getRankedLearningGaps() : [];
    if (gaps.length === 0) {
      els.select.innerHTML = '<option value="">No learning gaps tracked yet</option>';
      return;
    }
    els.select.innerHTML = gaps.map(gap =>
      `<option value="${escapeHtml(gap.id)}">${escapeHtml(gap.name)} — ${escapeHtml(gap.subject)} (${gap.mastery}%/${gap.target}%)</option>`
    ).join("");
  }

  function findExamDate(examId) {
    const exams = readStorage("studymate-exams", []) || [];
    const exam = exams.find(e => e.id === examId);
    return exam && exam.datetime ? String(exam.datetime).slice(0, 10) : "";
  }

  function findSessionFor(topicId) {
    const sessions = typeof getStudySessions === "function" ? getStudySessions() : [];
    const matches = sessions.filter(s => s.topicId === topicId);
    return matches.length > 0 ? matches[matches.length - 1] : null;
  }

  /** Build the API payload from existing planner data structures. */
  function buildPayload(topicId) {
    const gaps = typeof getRankedLearningGaps === "function" ? getRankedLearningGaps() : [];
    const gap = gaps.find(g => g.id === topicId);
    if (!gap) return null;
    const session = findSessionFor(topicId);
    return {
      topic: gap.name,
      subject: gap.subject,
      currentMastery: gap.mastery,
      targetMastery: gap.target,
      priority: gap.priority,
      urgency: typeof gap.urgency === "number" ? gap.urgency : String(gap.urgency || ""),
      examName: gap.examTitle || gap.examName || "Upcoming Exam",
      examDate: findExamDate(gap.examId),
      resourceName: session ? session.resourceTitle || "" : "",
      resourceType: session ? session.resourceType || "" : "",
      sessionDuration: session ? session.durationMins || 60 : 60
    };
  }

  /* ---------- status line ---------- */

  function showStatus(kind, message) {
    const color = kind === "error" ? "text-error" : "text-on-surface-variant";
    const icon = kind === "loading" ? "progress_activity" : kind === "error" ? "error" : "check_circle";
    els.status.className = `flex items-center gap-2 text-sm mb-2 ${color}`;
    els.status.innerHTML =
      `<span class="material-symbols-outlined ${kind === "loading" ? "animate-spin" : ""}" style="font-size: 18px;">${icon}</span>` +
      `<span>${escapeHtml(message)}</span>`;
  }

  function clearStatus() {
    els.status.className = "hidden";
    els.status.innerHTML = "";
  }

  /* ---------- generation request ---------- */

  function setGenerating(on) {
    els.generateBtn.disabled = on;
    els.generateLabel.textContent = on ? "Generating..." : "Generate Notes";
  }

  async function generate() {
    const topicId = els.select.value;
    if (!topicId) {
      showStatus("error", "Select a learning gap first (or track one in the planner).");
      return;
    }
    const payload = buildPayload(topicId);
    if (!payload) {
      showStatus("error", "Could not read planner data for this topic.");
      return;
    }
    lastPayload = payload;

    const seq = ++requestSeq;
    setGenerating(true);
    showStatus("loading", "Generating personalized notes...");
    els.output.classList.add("hidden");
    els.actions.classList.add("hidden");
    els.actions.classList.remove("flex");

    try {
      const response = await fetch("/api/generate-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      let data = null;
      try { data = await response.json(); } catch (_) { /* handled below */ }

      if (seq !== requestSeq) return; // modal closed / regenerated meanwhile

      if (!response.ok || !data || data.success !== true || typeof data.notes !== "string" || !data.notes.trim()) {
        const message = (data && data.error) || "Unable to generate AI notes right now. Please try again.";
        showStatus("error", message);
        return;
      }

      lastNotesText = data.notes;
      els.output.textContent = data.notes;
      els.output.classList.remove("hidden");
      els.actions.classList.remove("hidden");
      els.actions.classList.add("flex");
      els.modelTag.textContent = `model: ${data.model || "ollama"}`;
      clearStatus();
    } catch (err) {
      if (seq !== requestSeq) return;
      showStatus("error", "Could not reach the StudyMate API. Is the local server running?");
    } finally {
      if (seq === requestSeq) setGenerating(false);
    }
  }

  els.generateBtn.addEventListener("click", generate);
  els.regenerateBtn.addEventListener("click", () => {
    resetPanel();
    generate();
  });

  /* ---------- footer actions ---------- */

  els.copyBtn.addEventListener("click", () => {
    if (!lastNotesText) return;
    const done = () => showStatus("info", "Notes copied to clipboard.");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(lastNotesText).then(done).catch(() => {
        showStatus("error", "Copy failed — select the text manually.");
      });
    } else {
      const area = document.createElement("textarea");
      area.value = lastNotesText;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
      done();
    }
  });

  els.saveBtn.addEventListener("click", () => {
    if (!lastNotesText || !lastPayload) return;
    if (typeof window.addGeneratedNote !== "function") {
      showStatus("error", "Notes module unavailable — cannot save right now.");
      return;
    }
    window.addGeneratedNote({
      title: lastPayload.topic,
      subject: lastPayload.subject,
      content: lastNotesText
    });
    showStatus("info", "Saved to your Notes.");
  });
})();
