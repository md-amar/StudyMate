/* ============================================================
 * StudyMate - timetable.js
 * Class entries: dashboard widget + full timetable workspace.
 * Depends on: utils.js
 * ============================================================ */

const TIMETABLE_STORAGE_KEY = "studymate-timetable";

const defaultTimetableEntries = [
  { id: "entry-1", time: "10:00", name: "Algorithms Lecture", location: "Room 304, CS Building", type: "lecture" },
  { id: "entry-2", time: "13:00", name: "Study Group: Linear Algebra", location: "Library, 2nd Floor", type: "study" },
  { id: "entry-3", time: "15:30", name: "Database Systems Lab", location: "Lab 2, Engineering Wing", type: "lab" }
];

let timetableEntries = readStorage(TIMETABLE_STORAGE_KEY, null) || defaultTimetableEntries;

const ttEls = {
  dashboardList: document.getElementById("timetable-list"),
  dashboardEmpty: document.getElementById("timetable-empty"),
  viewList: document.getElementById("timetable-view-list"),
  viewEmpty: document.getElementById("timetable-view-empty"),
  viewSection: document.getElementById("timetable-view"),
  addBtn: document.getElementById("add-timetable-btn"),
  newBtn: document.getElementById("new-timetable-button"),
  modal: document.getElementById("timetable-modal"),
  form: document.getElementById("timetable-form"),
  time: document.getElementById("modal-timetable-time"),
  name: document.getElementById("modal-timetable-name"),
  location: document.getElementById("modal-timetable-location"),
  type: document.getElementById("modal-timetable-type")
};

function saveTimetableData() {
  writeStorage(TIMETABLE_STORAGE_KEY, timetableEntries);
}

function getTypeColor(type) {
  const colors = {
    lecture: "border-secondary",
    lab: "border-tertiary",
    study: "border-primary",
    tutorial: "border-secondary-fixed",
    other: "border-outline-variant"
  };
  return colors[type] || colors.other;
}

/** One timeline row shared by the widget and the workspace. */
function timetableEntryHtml(entry, index, deleteAttr) {
  const isFirst = index === 0;
  return `
    <div class="flex gap-4 group">
      <div class="flex flex-col items-center w-12 pt-1">
        <span class="font-label-sm text-label-sm ${isFirst ? "text-primary font-bold" : "text-on-surface-variant"}">${formatTime(entry.time)}</span>
        <div class="w-px h-full ${isFirst ? "bg-primary/30" : "bg-outline-variant/50 group-hover:bg-primary/30"} transition-colors my-1"></div>
      </div>
      <div class="flex-1 ${isFirst
        ? "bg-primary-fixed/20 rounded-lg p-3 border-l-4 border-primary shadow-sm relative"
        : `bg-surface-container-low rounded-lg p-3 border-l-4 ${getTypeColor(entry.type)} group-hover:bg-surface-container-high transition-colors`}">
        ${isFirst ? '<div class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.5 w-3 h-3 bg-primary rounded-full border-2 border-surface-container-lowest"></div>' : ""}
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1">
            <h4 class="font-label-md text-label-md text-on-surface font-semibold">${escapeHtml(entry.name)}</h4>
            <p class="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 mt-1">
              <span class="material-symbols-outlined" style="font-size: 14px;">location_on</span>
              ${escapeHtml(entry.location)}
            </p>
          </div>
          <button type="button" data-delete-timetable="${entry.id}" class="p-1 rounded text-on-surface-variant hover:bg-error-container hover:text-error opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Delete class">
            <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
          </button>
        </div>
      </div>
    </div>`;
}

function sortedTimetable() {
  return [...timetableEntries].sort((a, b) => a.time.localeCompare(b.time));
}

function renderTimetable() {
  const sorted = sortedTimetable();
  const isEmpty = sorted.length === 0;

  ttEls.dashboardList.classList.toggle("hidden", isEmpty);
  ttEls.dashboardEmpty.classList.toggle("hidden", !isEmpty);
  ttEls.viewList.classList.toggle("hidden", isEmpty);
  ttEls.viewEmpty.classList.toggle("hidden", !isEmpty);

  if (isEmpty) return;

  const html = sorted.map((entry, i) => timetableEntryHtml(entry, i)).join("");
  ttEls.dashboardList.innerHTML = html;
  ttEls.viewList.innerHTML = html;
}

function addTimetableEntry(time, name, location, type) {
  timetableEntries.push({ id: makeId("entry"), time, name: name.trim(), location: location.trim(), type });
  saveTimetableData();
  renderTimetable();
}

function deleteTimetableEntry(id) {
  timetableEntries = timetableEntries.filter(e => e.id !== id);
  saveTimetableData();
  renderTimetable();
}

function openTimetableModal() {
  ttEls.form.reset();
  ttEls.type.value = "lecture";
  ttEls.modal.classList.remove("hidden");
  ttEls.time.focus();
}

function closeTimetableModal() {
  ttEls.modal.classList.add("hidden");
  ttEls.form.reset();
}

/* ----- events ----- */

/* One delegated listener covers both the widget and the workspace. */
document.addEventListener("click", event => {
  const btn = event.target.closest("[data-delete-timetable]");
  if (btn) deleteTimetableEntry(btn.dataset.deleteTimetable);
});

ttEls.addBtn.addEventListener("click", openTimetableModal);
ttEls.newBtn.addEventListener("click", openTimetableModal);
document.getElementById("close-timetable-modal").addEventListener("click", closeTimetableModal);
document.getElementById("cancel-timetable-modal").addEventListener("click", closeTimetableModal);

ttEls.form.addEventListener("submit", event => {
  event.preventDefault();
  const time = ttEls.time.value;
  const name = ttEls.name.value.trim();
  const location = ttEls.location.value.trim();
  if (time && name && location) {
    addTimetableEntry(time, name, location, ttEls.type.value);
    closeTimetableModal();
  }
});

closeOnBackdropClick(ttEls.modal, closeTimetableModal);
closeOnEscape(ttEls.modal, closeTimetableModal);

/* ----- init ----- */
renderTimetable();
