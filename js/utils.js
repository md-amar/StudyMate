/* ============================================================
 * StudyMate - utils.js
 * Shared helpers: DOM safety, storage, formatting, ids.
 * ============================================================ */

/** Escape user content before inserting into innerHTML. */
function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  }[c]));
}

/** Read JSON from localStorage without ever throwing. */
function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`StudyMate: corrupt data in "${key}", resetting.`, err);
    return fallback;
  }
}

/** Write JSON to localStorage, surfacing quota errors instead of crashing. */
function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`StudyMate: could not save "${key}".`, err);
  }
}

/** Relative timestamp like "5 min ago" / "3 hr ago" / "Yesterday". */
function relativeDate(timestamp) {
  const minutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} hr ago`;
  if (minutes < 2880) return "Yesterday";
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric"
  });
}

/** "2023-12-15T09:00" -> "Dec 15, 2023 • 09:00 AM" */
function formatDatetime(datetimeStr) {
  const date = new Date(datetimeStr);
  if (isNaN(date)) return "Invalid date";
  const dateStr = date.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric"
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit"
  });
  return `${dateStr} • ${timeStr}`;
}

/** "13:05" -> "13:05" (kept as a seam if 12h formatting is wanted later) */
function formatTime(timeStr) {
  return timeStr;
}

/** Unique id, safe even on non-secure origins (crypto.randomUUID needs HTTPS). */
function makeId(prefix) {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

/** Close a modal with the Escape key. */
function closeOnEscape(modalEl, closeFn) {
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !modalEl.classList.contains("hidden")) {
      closeFn();
    }
  });
}

/** Close a modal when clicking its dimmed backdrop. */
function closeOnBackdropClick(modalEl, closeFn) {
  modalEl.addEventListener("click", event => {
    if (event.target === modalEl) closeFn();
  });
}