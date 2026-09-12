/* ============================================================
 * StudyMate - navigation.js
 * View switching (SPA-style) between dashboard sections.
 * Depends on: notes.js, timetable.js, exams.js being loaded first.
 * ============================================================ */

const views = {
  dashboard: document.getElementById("dashboard-view"),
  notes: document.getElementById("notes-view"),
  timetable: document.getElementById("timetable-view"),
  exams: document.getElementById("exams-view"),
  planner: document.getElementById("planner-view")
};

const navLinks = {
  home: document.getElementById("home-nav"),
  notes: document.getElementById("notes-nav"),
  timetable: document.getElementById("timetable-nav"),
  exams: document.getElementById("exams-nav"),
  planner: document.getElementById("planner-nav")
};

const ACTIVE_CLASSES =
  "flex items-center gap-3 px-3 py-2 rounded-md font-label-md text-label-md border-l-4 border-primary bg-surface-container-low text-primary font-bold hover:bg-surface-container-high transition-colors duration-200";
const INACTIVE_CLASSES =
  "flex items-center gap-3 px-3 py-2 rounded-md font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors duration-200";

/** Show exactly one section and sync sidebar active states. */
function showView(name) {
  Object.entries(views).forEach(([key, el]) => {
    if (el) el.classList.toggle("hidden", key !== name);
  });
  Object.entries(navLinks).forEach(([key, el]) => {
    if (el) el.className = key === name ? ACTIVE_CLASSES : INACTIVE_CLASSES;
  });

  if (name === "notes") renderNotes();
  else if (name === "timetable") renderTimetable();
  else if (name === "exams") renderExamsView();
  else if (name === "planner" && typeof renderPlanner === "function") renderPlanner();
}

const showDashboard = () => showView("dashboard");
const showNotes = () => showView("notes");
const showTimetable = () => showView("timetable");
const showExams = () => showView("exams");
const showPlanner = () => showView("planner");

/* ----- events ----- */

navLinks.home.addEventListener("click", e => { e.preventDefault(); showDashboard(); });
navLinks.notes.addEventListener("click", e => { e.preventDefault(); showNotes(); });
navLinks.timetable.addEventListener("click", e => { e.preventDefault(); showTimetable(); });
navLinks.exams.addEventListener("click", e => { e.preventDefault(); showExams(); });
if (navLinks.planner) {
  navLinks.planner.addEventListener("click", e => { e.preventDefault(); showPlanner(); });
}
document.getElementById("view-all-notes").addEventListener("click", e => { e.preventDefault(); showNotes(); });

const sidebarNewSessionBtn = document.getElementById("sidebar-new-session-btn");
if (sidebarNewSessionBtn) {
  sidebarNewSessionBtn.addEventListener("click", e => {
    e.preventDefault();
    showPlanner();
  });
}

const dashboardOpenPlannerBtn = document.getElementById("dashboard-open-planner-btn");
if (dashboardOpenPlannerBtn) {
  dashboardOpenPlannerBtn.addEventListener("click", e => {
    e.preventDefault();
    showPlanner();
  });
}

