/* ============================================================
 * StudyMate - exams.js
 * Exam CRUD + the dashboard countdown card.
 * Depends on: utils.js
 * ============================================================ */

/* ---- countdown card elements ---- */
const examEls = {
  nameHidden: document.getElementById("exam-name"),
  datetimeHidden: document.getElementById("exam-datetime"),
  title: document.getElementById("exam-title"),
  dateDisplay: document.getElementById("exam-date-display"),
  days: document.getElementById("countdown-days"),
  hours: document.getElementById("countdown-hours"),
  mins: document.getElementById("countdown-mins"),
  progress: document.getElementById("countdown-progress"),
  modal: document.getElementById("exam-modal"),
  form: document.getElementById("exam-form"),
  modalName: document.getElementById("modal-exam-name"),
  modalDate: document.getElementById("modal-exam-date")
};

/* ---- exams list state ---- */
const EXAMS_STORAGE_KEY = "studymate-exams";
/* Legacy single-exam key, only used to migrate old data. */
const LEGACY_EXAM_KEY = "studymate-exam";

const defaultExams = [
  { id: "exam-1", name: "Data Structures Final", subject: "Computer Science", datetime: "2023-12-15T09:00" },
  { id: "exam-2", name: "Chemistry Midterm", subject: "Chemistry", datetime: "2023-12-20T14:00" },
  { id: "exam-3", name: "Physics Final", subject: "Physics", datetime: "2023-12-25T10:00" }
];

let examsList = [];
let upcomingExamId = null;

const examsViewList = document.getElementById("exams-view-list");
const examsViewEmpty = document.getElementById("exams-view-empty");
const addExamModal = document.getElementById("add-exam-modal");
const addExamForm = document.getElementById("add-exam-form");
const modalAddExamName = document.getElementById("modal-add-exam-name");
const modalAddExamSubject = document.getElementById("modal-add-exam-subject");
const modalAddExamDate = document.getElementById("modal-add-exam-date");

/* ================= countdown ================= */

function calculateCountdown() {
  if (!examEls.datetimeHidden.value) {
    return { days: 0, hours: 0, minutes: 0, percentage: 0 };
  }
  const examDate = new Date(examEls.datetimeHidden.value);
  const timeRemaining = examDate - new Date();
  if (isNaN(examDate) || timeRemaining <= 0) {
    return { days: 0, hours: 0, minutes: 0, percentage: 0 };
  }
  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  /* NOTE (design flaw kept visible): percentage assumes a 30-day window,
     so exams further than 30 days out render as 0%. */
  const percentage = Math.max(0, Math.min(100, 100 - (days / 30) * 100));
  return { days, hours, minutes, percentage };
}

function updateCountdown() {
  const { days, hours, minutes, percentage } = calculateCountdown();
  examEls.days.textContent = String(days).padStart(2, "0");
  examEls.hours.textContent = String(hours).padStart(2, "0");
  examEls.mins.textContent = String(minutes).padStart(2, "0");
  examEls.progress.style.width = percentage + "%";
}

function updateExamDisplay() {
  examEls.title.textContent = examEls.nameHidden.value || "No Exam Set";
  examEls.dateDisplay.innerHTML = `<span class="material-symbols-outlined text-sm">event</span>${
    examEls.datetimeHidden.value ? formatDatetime(examEls.datetimeHidden.value) : "No date scheduled"
  }`;
  updateCountdown();
}

function openExamModal() {
  examEls.modalName.value = examEls.nameHidden.value;
  examEls.modalDate.value = examEls.datetimeHidden.value;
  examEls.modal.classList.remove("hidden");
  examEls.modalName.focus();
}

function closeExamModal() {
  examEls.modal.classList.add("hidden");
}

document.getElementById("edit-exam-btn").addEventListener("click", openExamModal);
document.getElementById("close-exam-modal").addEventListener("click", closeExamModal);
document.getElementById("cancel-exam-modal").addEventListener("click", closeExamModal);

/* Save the countdown exam AND keep the exams list in sync. */
examEls.form.addEventListener("submit", event => {
  event.preventDefault();
  examEls.nameHidden.value = examEls.modalName.value.trim() || "Untitled Exam";
  examEls.datetimeHidden.value = examEls.modalDate.value;
  writeStorage(LEGACY_EXAM_KEY, { name: examEls.nameHidden.value, datetime: examEls.datetimeHidden.value });
  const selected = examsList.find(e => e.id === upcomingExamId);
  if (selected) {
    selected.name = examEls.nameHidden.value;
    selected.datetime = examEls.datetimeHidden.value;
    saveExamsData();
    renderExamsView();
  }
  updateExamDisplay();
  closeExamModal();
});

closeOnBackdropClick(examEls.modal, closeExamModal);
closeOnEscape(examEls.modal, closeExamModal);

/* ================= exams CRUD ================= */

function saveExamsData() {
  writeStorage(EXAMS_STORAGE_KEY, examsList);
}

function loadExamsData() {
  const saved = readStorage(EXAMS_STORAGE_KEY, null);
  if (Array.isArray(saved)) {
    examsList = saved;
    return;
  }
  /* First run: migrate the legacy single countdown exam, else seed defaults. */
  const legacy = readStorage(LEGACY_EXAM_KEY, null);
  if (legacy && legacy.name && legacy.datetime) {
    examsList = [{ id: "exam-migrated", name: legacy.name, subject: "General", datetime: legacy.datetime }];
  } else {
    examsList = [...defaultExams];
  }
  saveExamsData();
}

/** Point the countdown card at the earliest future exam (fallback: earliest overall). */
function updateUpcomingExam() {
  if (examsList.length === 0) {
    upcomingExamId = null;
    examEls.nameHidden.value = "No Exam Scheduled";
    examEls.datetimeHidden.value = "";
    updateExamDisplay();
    return;
  }
  const sorted = [...examsList].sort((a, b) => a.datetime.localeCompare(b.datetime));
  const upcoming = sorted.find(e => new Date(e.datetime) > new Date()) || sorted[0];
  upcomingExamId = upcoming.id;
  examEls.nameHidden.value = upcoming.name;
  examEls.datetimeHidden.value = upcoming.datetime;
  updateExamDisplay();
}

function renderExamsView() {
  const sorted = [...examsList].sort((a, b) => a.datetime.localeCompare(b.datetime));
  const isEmpty = sorted.length === 0;
  examsViewList.classList.toggle("hidden", isEmpty);
  examsViewEmpty.classList.toggle("hidden", !isEmpty);
  if (isEmpty) return;

  examsViewList.innerHTML = sorted.map(exam => `
    <div class="bg-surface-container-lowest rounded-xl p-stack-sm shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/30 hover:shadow-[0px_10px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div class="flex justify-between items-start gap-2 mb-2">
        <span class="bg-surface-container-high text-on-surface px-2 py-0.5 rounded font-label-sm text-label-sm">${escapeHtml(exam.subject)}</span>
        <span class="text-on-surface-variant font-label-sm text-label-sm whitespace-nowrap">${formatDatetime(exam.datetime)}</span>
      </div>
      <h3 class="font-headline-md text-headline-md text-on-surface mb-2 leading-tight">${escapeHtml(exam.name)}</h3>
      <div class="flex justify-end gap-1 mt-auto pt-3 border-t border-outline-variant/30">
        <button type="button" data-delete-exam="${exam.id}" class="p-2 rounded-full text-on-surface-variant hover:bg-error-container hover:text-error" aria-label="Delete exam"><span class="material-symbols-outlined">delete</span></button>
      </div>
    </div>`).join("");
}

function addExam(name, subject, datetime) {
  examsList.push({ id: makeId("exam"), name: name.trim(), subject: subject.trim(), datetime });
  saveExamsData();
  updateUpcomingExam();
  renderExamsView();
  if (typeof triggerAutonomousReplan === "function") {
    triggerAutonomousReplan(`New assessment deadline scheduled: "${name.trim()}" (${subject})`);
  }
}

function deleteExam(id) {
  const removed = examsList.find(e => e.id === id);
  examsList = examsList.filter(e => e.id !== id);
  saveExamsData();
  updateUpcomingExam();
  renderExamsView();
  if (typeof triggerAutonomousReplan === "function") {
    triggerAutonomousReplan(`Assessment deadline removed: "${removed ? removed.name : id}"`);
  }
}

function openAddExamModal() {
  addExamForm.reset();
  addExamModal.classList.remove("hidden");
  modalAddExamName.focus();
}

function closeAddExamModal() {
  addExamModal.classList.add("hidden");
  addExamForm.reset();
}

/* ----- events ----- */

document.getElementById("new-exam-button").addEventListener("click", openAddExamModal);
document.getElementById("close-add-exam-modal").addEventListener("click", closeAddExamModal);
document.getElementById("cancel-add-exam-modal").addEventListener("click", closeAddExamModal);

addExamForm.addEventListener("submit", event => {
  event.preventDefault();
  const name = modalAddExamName.value.trim();
  const subject = modalAddExamSubject.value.trim();
  const datetime = modalAddExamDate.value;
  if (name && subject && datetime) {
    addExam(name, subject, datetime);
    closeAddExamModal();
  }
});

examsViewList.addEventListener("click", event => {
  const btn = event.target.closest("[data-delete-exam]");
  if (btn) deleteExam(btn.dataset.deleteExam);
});

closeOnBackdropClick(addExamModal, closeAddExamModal);
closeOnEscape(addExamModal, closeAddExamModal);

/* ----- init ----- */
loadExamsData();
renderExamsView();
updateUpcomingExam();

/* NOTE (defect kept as-is): the tick interval is 60s, so the minute value
   can lag up to a minute behind the wall clock. 1000ms is kinder to the
   battery but visually less accurate. */
setInterval(updateCountdown, 60000);
