/* ============================================================
 * StudyMate - notes.js
 * Note CRUD + the dashboard "Recent Notes" strip.
 * Depends on: utils.js, navigation.js (showNotes, event-time only)
 * ============================================================ */

const NOTES_STORAGE_KEY = "studymate-notes";

const starterNotes = [
  {
    id: "starter-algorithms",
    title: "Dynamic Programming",
    subject: "Algorithms",
    content: "Explored memoization vs tabulation. Always draw the dependency graph first to determine topological order before coding the iterative solution.",
    updatedAt: Date.now() - 2 * 60 * 60 * 1000   /* FIXED: was Date.now() + 2h (in the future) */
  },
  {
    id: "starter-linear-algebra",
    title: "Eigenvalues & Eigenvectors",
    subject: "Linear Algebra",
    content: "det(A - lambda I) = 0. The characteristic polynomial provides the eigenvalues. Geometric multiplicity is less than or equal to algebraic multiplicity.",
    updatedAt: Date.now() - 24 * 60 * 60 * 1000
  }
];

let notes = readStorage(NOTES_STORAGE_KEY, null) || starterNotes;
let editingNoteId = null;

const noteEls = {
  editor: document.getElementById("note-editor"),
  form: document.getElementById("note-form"),
  grid: document.getElementById("notes-grid"),
  empty: document.getElementById("notes-empty"),
  dashboardGrid: document.getElementById("dashboard-notes-grid"),
  search: document.getElementById("global-search"),
  id: document.getElementById("note-id"),
  title: document.getElementById("note-title"),
  subject: document.getElementById("note-subject"),
  content: document.getElementById("note-content"),
  editorHeading: document.getElementById("editor-heading"),
  saveLabel: document.getElementById("save-note-label"),
  newButton: document.getElementById("new-note-button"),
  viewAll: document.getElementById("view-all-notes")
};

function saveNotes() {
  writeStorage(NOTES_STORAGE_KEY, notes);
}

function noteMatchesQuery(note, query) {
  return `${note.title} ${note.subject} ${note.content}`.toLowerCase().includes(query);
}

function noteCardHtml(note, compact) {
  const clamp = compact ? "line-clamp-3" : "line-clamp-4";
  const height = compact ? "h-48" : "min-h-56";
  return `
    <article data-open-note="${note.id}" class="bg-surface-container-lowest rounded-xl p-stack-sm shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/30 hover:shadow-[0px_10px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col ${height}">
      <div class="flex justify-between items-start gap-2 mb-2">
        <span class="bg-surface-container-high text-on-surface px-2 py-0.5 rounded font-label-sm text-label-sm">${escapeHtml(note.subject)}</span>
        <span class="text-on-surface-variant font-label-sm text-label-sm whitespace-nowrap">${relativeDate(note.updatedAt)}</span>
      </div>
      <h3 class="font-headline-md text-headline-md text-on-surface mb-2 leading-tight group-hover:text-primary transition-colors">${escapeHtml(note.title)}</h3>
      <p class="font-body-md text-body-md text-on-surface-variant ${clamp} text-sm flex-1 whitespace-pre-line">${escapeHtml(note.content)}</p>
      ${compact ? "" : `
      <div class="flex justify-end gap-1 mt-4 pt-3 border-t border-outline-variant/30">
        <button type="button" data-edit-note="${note.id}" class="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-primary" aria-label="Edit ${escapeHtml(note.title)}"><span class="material-symbols-outlined">edit</span></button>
        <button type="button" data-delete-note="${note.id}" class="p-2 rounded-full text-on-surface-variant hover:bg-error-container hover:text-error" aria-label="Delete ${escapeHtml(note.title)}"><span class="material-symbols-outlined">delete</span></button>
      </div>`}
    </article>`;
}

function createNoteCardHtml() {
  return `
    <div data-create-note class="bg-surface-container/50 border-2 border-dashed border-outline-variant/50 rounded-xl p-stack-sm hover:border-primary hover:bg-surface-container-low transition-colors duration-300 cursor-pointer flex flex-col items-center justify-center h-48 group text-center">
      <div class="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center mb-3 group-hover:bg-primary-container group-hover:text-on-primary transition-colors text-on-surface-variant">
        <span class="material-symbols-outlined">edit_document</span>
      </div>
      <h4 class="font-label-md text-label-md text-on-surface group-hover:text-primary font-semibold">Create New Note</h4>
      <p class="font-label-sm text-label-sm text-on-surface-variant mt-1">Start a fresh document</p>
    </div>`;
}

/** Full notes workspace grid. */
function renderNotes() {
  const query = noteEls.search.value.trim().toLowerCase();
  const filtered = notes.filter(n => noteMatchesQuery(n, query));

  noteEls.empty.classList.toggle("hidden", filtered.length > 0 || Boolean(query));

  if (query && filtered.length === 0) {
    noteEls.grid.innerHTML = '<p class="col-span-full font-body-md text-body-md text-on-surface-variant py-8 text-center">No notes match your search.</p>';
    return;
  }
  noteEls.grid.innerHTML = filtered.map(n => noteCardHtml(n, false)).join("");
}

/** Dashboard strip: two most recent notes + create tile. */
function renderDashboardNotes() {
  const query = noteEls.search.value.trim().toLowerCase();
  const filtered = notes.filter(n => noteMatchesQuery(n, query));
  noteEls.dashboardGrid.innerHTML =
    filtered.slice(0, 2).map(n => noteCardHtml(n, true)).join("") + createNoteCardHtml();
}

/** All places notes are rendered, refreshed at once. */
function renderAllNotes() {
  renderNotes();
  renderDashboardNotes();
}

function openEditor(note) {
  editingNoteId = note ? note.id : null;
  noteEls.editorHeading.textContent = note ? "Edit note" : "Create note";
  noteEls.saveLabel.textContent = note ? "Update note" : "Save note";
  noteEls.id.value = note ? note.id : "";
  noteEls.title.value = note ? note.title : "";
  noteEls.subject.value = note ? note.subject : "";
  noteEls.content.value = note ? note.content : "";
  noteEls.editor.classList.remove("hidden");
  noteEls.title.focus();
}

function closeEditor() {
  noteEls.editor.classList.add("hidden");
  noteEls.form.reset();
  editingNoteId = null;
}

/* ----- events ----- */

noteEls.newButton.addEventListener("click", () => openEditor());
document.getElementById("cancel-note-button").addEventListener("click", closeEditor);
document.getElementById("cancel-note-button-secondary").addEventListener("click", closeEditor);

noteEls.search.addEventListener("input", () => {
  if (!document.getElementById("notes-view").classList.contains("hidden")) {
    renderNotes();
  } else {
    renderDashboardNotes();
  }
});

noteEls.form.addEventListener("submit", event => {
  event.preventDefault();
  const noteData = {
    title: noteEls.title.value.trim(),
    subject: noteEls.subject.value.trim(),
    content: noteEls.content.value.trim(),
    updatedAt: Date.now()
  };
  if (!noteData.title || !noteData.subject || !noteData.content) return;

  if (editingNoteId) {
    notes = notes.map(n => (n.id === editingNoteId ? { ...n, ...noteData } : n));
  } else {
    notes.unshift({ id: makeId("note"), ...noteData });
  }
  saveNotes();
  closeEditor();
  renderAllNotes();
});

noteEls.grid.addEventListener("click", event => {
  const editBtn = event.target.closest("[data-edit-note]");
  const deleteBtn = event.target.closest("[data-delete-note]");
  if (editBtn) {
    openEditor(notes.find(n => n.id === editBtn.dataset.editNote));
  } else if (deleteBtn) {
    notes = notes.filter(n => n.id !== deleteBtn.dataset.deleteNote);
    saveNotes();
    renderAllNotes();
  }
});

/* Dashboard strip: click a note to edit it, click the tile to create one. */
noteEls.dashboardGrid.addEventListener("click", event => {
  if (event.target.closest("[data-create-note]")) {
    showNotes();
    openEditor();
    return;
  }
  const card = event.target.closest("[data-open-note]");
  if (card) {
    const note = notes.find(n => n.id === card.dataset.openNote);
    if (note) {
      showNotes();
      openEditor(note);
    }
  }
});

/* ----- init ----- */
renderAllNotes();