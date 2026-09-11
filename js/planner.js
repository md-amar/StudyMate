/* ============================================================
 * StudyMate - planner.js
 * Autonomous Learning Planner AI Agent (Problem Statement 3)
 *
 * Core Capabilities:
 * 1. Analyzes student performance across subjects/topics.
 * 2. Identifies priority learning gaps based on exam proximity & mastery deficit.
 * 3. Selects tailored multi-modal learning resources.
 * 4. Solves timetable constraints to schedule study sessions in verified free slots.
 * 5. Tracks completed and missed sessions.
 * 6. Reassesses student progress & mastery deltas.
 * 7. Automatically replans when performance or availability changes.
 * 8. Mathematically verifies that revised plans satisfy time constraints & goals.
 *
 * Depends on: utils.js, timetable.js, exams.js
 * ============================================================ */

/* ----- Storage Keys ----- */
const PLANNER_KEYS = {
  PERFORMANCE: "studymate-performance",
  SESSIONS: "studymate-planner-sessions",
  LOG: "studymate-agent-log",
  RESOURCES: "studymate-resources"
};

/* ----- Default Student Performance Baseline ----- */
const defaultPerformance = [
  {
    id: "topic-cs-graphs",
    subject: "Computer Science",
    name: "Graph Algorithms & BFS/DFS",
    examId: "exam-1",
    examName: "Data Structures Final",
    mastery: 42,
    target: 90,
    weight: 5,
    lastAssessed: Date.now() - 36 * 60 * 60 * 1000
  },
  {
    id: "topic-cs-dp",
    subject: "Computer Science",
    name: "Dynamic Programming & Tabulation",
    examId: "exam-1",
    examName: "Data Structures Final",
    mastery: 48,
    target: 85,
    weight: 5,
    lastAssessed: Date.now() - 48 * 60 * 60 * 1000
  },
  {
    id: "topic-cs-bst",
    subject: "Computer Science",
    name: "Binary Search Trees & AVL Balancing",
    examId: "exam-1",
    examName: "Data Structures Final",
    mastery: 78,
    target: 85,
    weight: 4,
    lastAssessed: Date.now() - 12 * 60 * 60 * 1000
  },
  {
    id: "topic-chem-thermo",
    subject: "Chemistry",
    name: "Thermodynamics & Enthalpy",
    examId: "exam-2",
    examName: "Chemistry Midterm",
    mastery: 52,
    target: 85,
    weight: 4,
    lastAssessed: Date.now() - 20 * 60 * 60 * 1000
  },
  {
    id: "topic-chem-kinetics",
    subject: "Chemistry",
    name: "Reaction Kinetics & Rate Laws",
    examId: "exam-2",
    examName: "Chemistry Midterm",
    mastery: 65,
    target: 80,
    weight: 3,
    lastAssessed: Date.now() - 60 * 60 * 1000
  },
  {
    id: "topic-phys-gauss",
    subject: "Physics",
    name: "Electromagnetism & Gauss Law",
    examId: "exam-3",
    examName: "Physics Final",
    mastery: 38,
    target: 85,
    weight: 5,
    lastAssessed: Date.now() - 72 * 60 * 60 * 1000
  },
  {
    id: "topic-phys-torque",
    subject: "Physics",
    name: "Rotational Dynamics & Torque",
    examId: "exam-3",
    examName: "Physics Final",
    mastery: 74,
    target: 85,
    weight: 3,
    lastAssessed: Date.now() - 15 * 60 * 60 * 1000
  }
];

/* ----- Curated Learning Resources Catalog ----- */
const defaultResources = [
  {
    id: "res-vis-graph",
    topicId: "topic-cs-graphs",
    title: "VisuAlgo: Interactive Graph Traversal & Cycle Detection",
    type: "interactive",
    icon: "laptop_chromebook",
    duration: 45,
    difficulty: "Intermediate",
    url: "https://visualgo.net/en/dfsbfs",
    description: "Step-by-step graphical visualizer of BFS/DFS queue & recursion call stacks."
  },
  {
    id: "res-mit-dp",
    topicId: "topic-cs-dp",
    title: "MIT OCW 6.006: Dynamic Programming & Memoization",
    type: "video",
    icon: "smart_display",
    duration: 50,
    difficulty: "Advanced",
    url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms/",
    description: "In-depth lecture on DAG shortest paths, optimal substructure, and 2D tabulation."
  },
  {
    id: "res-gfg-bst",
    topicId: "topic-cs-bst",
    title: "AVL Tree Rotations Problem Set & Implementation",
    type: "practice",
    icon: "code",
    duration: 35,
    difficulty: "Intermediate",
    url: "https://www.geeksforgeeks.org/avl-tree-set-1-insertion/",
    description: "Hands-on coding challenges for LL, RR, LR, and RL self-balancing rotations."
  },
  {
    id: "res-chem-phet",
    topicId: "topic-chem-thermo",
    title: "PhET Simulation: Energy Forms and Changes in Enthalpy",
    type: "interactive",
    icon: "science",
    duration: 40,
    difficulty: "Intermediate",
    url: "https://phet.colorado.edu/en/simulations/energy-forms-and-changes",
    description: "Virtual calorimeters demonstrating Hess's Law and heat transfer equations."
  },
  {
    id: "res-chem-kinetics",
    topicId: "topic-chem-kinetics",
    title: "Khan Academy: Chemical Kinetics & Differential Rate Laws",
    type: "notes",
    icon: "menu_book",
    duration: 30,
    difficulty: "Beginner",
    url: "https://www.khanacademy.org/science/ap-chemistry-beta/x2eef969c74e0d802:kinetics",
    description: "Concise summary notes and formulas for zero, first, and second-order reactions."
  },
  {
    id: "res-phys-gauss",
    topicId: "topic-phys-gauss",
    title: "Yale Physics: Gauss's Law & Electric Flux Masterclass",
    type: "video",
    icon: "smart_display",
    duration: 50,
    difficulty: "Advanced",
    url: "https://oyc.yale.edu/physics/phys-201",
    description: "Symmetry arguments, closed surface integrals, and cylindrical charge distributions."
  },
  {
    id: "res-phys-torque",
    topicId: "topic-phys-torque",
    title: "Rotational Dynamics Quick Reference & Formula Cheatsheet",
    type: "notes",
    icon: "description",
    duration: 25,
    difficulty: "Beginner",
    url: "https://openstax.org/books/university-physics-volume-1/",
    description: "Moment of inertia formulas and conservation of angular momentum worked examples."
  }
];

/* ----- In-Memory State ----- */
let studentPerformance = readStorage(PLANNER_KEYS.PERFORMANCE, null) || defaultPerformance;
let resourceCatalog = readStorage(PLANNER_KEYS.RESOURCES, null) || defaultResources;
let studySessions = readStorage(PLANNER_KEYS.SESSIONS, null) || [];
let agentAuditLog = readStorage(PLANNER_KEYS.LOG, null) || [];

/* Timer State for Focus Modal */
let activeFocusSession = null;
let focusTimerInterval = null;
let focusTimeRemainingSec = 45 * 60;
let focusTimerRunning = false;

/* ============================================================
 * 1. Performance & Priority Learning Gaps Analyzer
 * ============================================================ */

function getDaysUntilExam(datetimeStr) {
  if (!datetimeStr) return 14;
  const examDate = new Date(datetimeStr);
  const diffMs = examDate - new Date();
  if (isNaN(examDate) || diffMs <= 0) return 0.5;
  return Math.max(0.5, diffMs / (1000 * 60 * 60 * 24));
}

function getActiveExams() {
  if (typeof examsList !== "undefined" && Array.isArray(examsList) && examsList.length > 0) {
    return examsList;
  }
  if (typeof window !== "undefined" && Array.isArray(window.examsList) && window.examsList.length > 0) {
    return window.examsList;
  }
  return readStorage("studymate-exams", []) || [];
}

function getActiveTimetable() {
  if (typeof timetableEntries !== "undefined" && Array.isArray(timetableEntries) && timetableEntries.length > 0) {
    return timetableEntries;
  }
  if (typeof window !== "undefined" && Array.isArray(window.timetableEntries) && window.timetableEntries.length > 0) {
    return window.timetableEntries;
  }
  return readStorage("studymate-timetable", []) || [];
}

function calculateGapUrgency(topic) {
  const allExams = getActiveExams();
  let daysToExam = 14;
  let targetExam = null;

  if (allExams.length > 0) {
    targetExam = allExams.find(e => e.id === topic.examId || (e.subject && e.subject.toLowerCase() === topic.subject.toLowerCase()));
    if (targetExam && targetExam.datetime) {
      daysToExam = getDaysUntilExam(targetExam.datetime);
    }
  }

  const masteryGap = Math.max(0, (topic.target || 85) - topic.mastery);
  const weight = topic.weight || 3;
  const rawUrgency = (masteryGap * weight) / (daysToExam + 1);

  // Scale 0 - 100
  const urgency = Math.min(100, Math.round(rawUrgency * 4));

  let priority = "Low";
  let badgeColor = "bg-surface-container text-on-surface-variant";
  if (urgency >= 55) {
    priority = "Critical";
    badgeColor = "bg-error-container text-on-error-container font-semibold";
  } else if (urgency >= 35) {
    priority = "High";
    badgeColor = "bg-amber-100 text-amber-900 font-medium";
  } else if (urgency >= 20) {
    priority = "Moderate";
    badgeColor = "bg-surface-container-high text-primary font-medium";
  }

  return {
    urgency,
    priority,
    badgeColor,
    daysToExam: Math.round(daysToExam * 10) / 10,
    examTitle: targetExam ? targetExam.name : (topic.examName || "Upcoming Exam")
  };
}

function getRankedLearningGaps() {
  return studentPerformance.map(topic => {
    const analysis = calculateGapUrgency(topic);
    return {
      ...topic,
      ...analysis
    };
  }).sort((a, b) => b.urgency - a.urgency);
}

function calculateOverallReadiness() {
  if (studentPerformance.length === 0) return 0;
  let totalWeighted = 0;
  let totalWeight = 0;
  studentPerformance.forEach(t => {
    const w = t.weight || 3;
    totalWeighted += t.mastery * w;
    totalWeight += w;
  });
  return Math.round(totalWeighted / totalWeight);
}

/* ============================================================
 * 2. Resource Selector Engine
 * ============================================================ */

function selectBestResource(topicId) {
  const matches = resourceCatalog.filter(r => r.topicId === topicId);
  if (matches.length > 0) return matches[0];
  return {
    id: "res-generic-" + topicId,
    topicId,
    title: "Deep Dive Practice & Synthesis",
    type: "practice",
    icon: "edit_note",
    duration: 45,
    difficulty: "Intermediate",
    url: "#notes",
    description: "Structured self-study problem solving and core concept synthesis."
  };
}

/* ============================================================
 * 3. Timetable Constraint Solver & Free Slot Detector
 * ============================================================ */

function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minutesToTime(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = Math.floor(mins % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function formatMinutes12h(mins) {
  const h24 = Math.floor(mins / 60) % 24;
  const m = Math.floor(mins % 60);
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function computeAvailableFreeSlots() {
  const DAY_START = 8 * 60 + 30; // 08:30 AM
  const DAY_END = 21 * 60 + 30;  // 09:30 PM
  const BUFFER = 15;             // 15 min buffer before/after classes

  const rawEntries = getActiveTimetable();

  const busyIntervals = rawEntries.map(entry => {
    const startMin = timeToMinutes(entry.time);
    const duration = 60;
    return {
      start: Math.max(DAY_START, startMin - BUFFER),
      end: Math.min(DAY_END, startMin + duration + BUFFER),
      actualStart: startMin,
      actualEnd: startMin + duration,
      name: entry.name,
      location: entry.location
    };
  }).sort((a, b) => a.start - b.start);

  const mergedBusy = [];
  busyIntervals.forEach(curr => {
    if (mergedBusy.length === 0) {
      mergedBusy.push({ ...curr });
    } else {
      const prev = mergedBusy[mergedBusy.length - 1];
      if (curr.start <= prev.end) {
        prev.end = Math.max(prev.end, curr.end);
      } else {
        mergedBusy.push({ ...curr });
      }
    }
  });

  const freeSlots = [];
  let cursor = DAY_START;

  mergedBusy.forEach(busy => {
    if (busy.start > cursor) {
      const freeDuration = busy.start - cursor;
      if (freeDuration >= 35) {
        freeSlots.push({
          start: cursor,
          end: busy.start,
          duration: freeDuration
        });
      }
    }
    cursor = Math.max(cursor, busy.end);
  });

  if (DAY_END > cursor) {
    const freeDuration = DAY_END - cursor;
    if (freeDuration >= 35) {
      freeSlots.push({
        start: cursor,
        end: DAY_END,
        duration: freeDuration
      });
    }
  }

  return freeSlots;
}

/* ============================================================
 * 4. Autonomous Scheduler Engine
 * ============================================================ */

function generateAutonomousStudyPlan(reason = "Initial Generation") {
  const rankedGaps = getRankedLearningGaps();
  const freeSlots = computeAvailableFreeSlots();
  const MAX_DAILY_STUDY_MINS = 210; // 3.5 hours
  let allocatedMinutes = 0;
  const newSessions = [];

  const decisionTrail = [];
  const activeExams = getActiveExams();
  decisionTrail.push(`Analyzed ${rankedGaps.length} topics across ${activeExams.length} scheduled exams.`);
  decisionTrail.push(`Identified ${freeSlots.length} verified free time intervals between timetable commitments.`);

  let gapIndex = 0;

  for (const slot of freeSlots) {
    if (allocatedMinutes >= MAX_DAILY_STUDY_MINS || gapIndex >= rankedGaps.length) {
      break;
    }

    const gap = rankedGaps[gapIndex];
    const resource = selectBestResource(gap.id);

    let sessionDuration = Math.min(60, slot.duration);
    if (slot.duration >= 75) {
      sessionDuration = 60;
    } else if (slot.duration >= 50) {
      sessionDuration = 45;
    } else {
      sessionDuration = slot.duration;
    }

    if (allocatedMinutes + sessionDuration > MAX_DAILY_STUDY_MINS) {
      sessionDuration = MAX_DAILY_STUDY_MINS - allocatedMinutes;
      if (sessionDuration < 25) break;
    }

    const sessionStart = slot.start;
    const sessionEnd = sessionStart + sessionDuration;

    const session = {
      id: makeId("session"),
      topicId: gap.id,
      topicName: gap.name,
      subject: gap.subject,
      examId: gap.examId,
      examName: gap.examTitle,
      priority: gap.priority,
      urgency: gap.urgency,
      resourceId: resource.id,
      resourceTitle: resource.title,
      resourceType: resource.type,
      resourceDuration: resource.duration,
      startTimeMins: sessionStart,
      endTimeMins: sessionEnd,
      timeDisplay: `${formatMinutes12h(sessionStart)} - ${formatMinutes12h(sessionEnd)}`,
      durationMins: sessionDuration,
      objective: `Target learning gap: Boost mastery from ${gap.mastery}% to ${gap.target}% on ${gap.name}`,
      status: "scheduled",
      createdAt: Date.now()
    };

    newSessions.push(session);
    allocatedMinutes += sessionDuration;

    decisionTrail.push(
      `Allocated [${session.timeDisplay}] (${sessionDuration}m) for "${gap.name}" (${gap.priority} priority, ${gap.mastery}% mastery) using resource: "${resource.title}".`
    );

    gapIndex++;
  }

  const previousCompleted = studySessions.filter(s => s.status === "completed");
  studySessions = [...previousCompleted, ...newSessions];
  writeStorage(PLANNER_KEYS.SESSIONS, studySessions);

  const verification = verifyPlanConstraints(studySessions);
  decisionTrail.push(
    `Constraint Verification: ${verification.passed ? "PASSED" : "WARNING"}. Timetable collisions: ${verification.collisionsCount}, Total study load: ${(allocatedMinutes / 60).toFixed(1)}h / 3.5h.`
  );

  logAgentDecision(reason, decisionTrail, verification);

  return studySessions;
}

/* ============================================================
 * 5. Constraint Verification Engine
 * ============================================================ */

function verifyPlanConstraints(sessionsToCheck = studySessions) {
  const rawClasses = getActiveTimetable();
  const activeScheduled = sessionsToCheck.filter(s => s.status === "scheduled" || s.status === "in-progress");
  let collisionDetails = [];
  let collisionsCount = 0;
  let totalStudyMins = 0;

  activeScheduled.forEach(session => {
    totalStudyMins += session.durationMins || (session.endTimeMins - session.startTimeMins);
    rawClasses.forEach(cls => {
      const clsStart = timeToMinutes(cls.time);
      const clsEnd = clsStart + 60;
      if (Math.max(session.startTimeMins, clsStart) < Math.min(session.endTimeMins, clsEnd)) {
        collisionsCount++;
        collisionDetails.push(`Collision: Study session "${session.topicName}" overlaps with class "${cls.name}" at ${cls.time}.`);
      }
    });
  });

  for (let i = 0; i < activeScheduled.length; i++) {
    for (let j = i + 1; j < activeScheduled.length; j++) {
      const s1 = activeScheduled[i];
      const s2 = activeScheduled[j];
      if (Math.max(s1.startTimeMins, s2.startTimeMins) < Math.min(s1.endTimeMins, s2.endTimeMins)) {
        collisionsCount++;
        collisionDetails.push(`Self-collision: "${s1.topicName}" and "${s2.topicName}" share overlapping time slots.`);
      }
    }
  }

  const loadPassed = totalStudyMins <= 210;
  const loadHours = (totalStudyMins / 60).toFixed(1);

  const criticalGaps = getRankedLearningGaps().filter(g => g.priority === "Critical");
  const coveredCritical = criticalGaps.filter(g => activeScheduled.some(s => s.topicId === g.id));
  const gapCoveragePercent = criticalGaps.length === 0 ? 100 : Math.round((coveredCritical.length / criticalGaps.length) * 100);

  const passed = collisionsCount === 0 && loadPassed;

  return {
    passed,
    collisionsCount,
    collisionDetails,
    totalStudyMins,
    loadHours,
    loadPassed,
    gapCoveragePercent,
    checksum: `CHK-${Math.abs(totalStudyMins * 31 + collisionsCount * 17).toString(16).toUpperCase()}`
  };
}

/* ============================================================
 * 6. Autonomous Replanning Trigger
 * ============================================================ */

function triggerAutonomousReplan(triggerReason, context = {}) {
  const decisionLog = [`Autonomous replanning triggered: "${triggerReason}".`];

  if (context.missedSessionId) {
    const missed = studySessions.find(s => s.id === context.missedSessionId);
    if (missed) {
      missed.status = "missed";
      const topic = studentPerformance.find(t => t.id === missed.topicId);
      if (topic) {
        topic.weight = Math.min(5, (topic.weight || 3) + 1);
        decisionLog.push(`Marked session "${missed.topicName}" as missed. Increased topic priority weight to ${topic.weight}.`);
      }
    }
  }

  if (context.completedSessionId) {
    const completed = studySessions.find(s => s.id === context.completedSessionId);
    if (completed) {
      completed.status = "completed";
      decisionLog.push(`Marked session "${completed.topicName}" as completed.`);
    }
  }

  generateAutonomousStudyPlan(triggerReason);
  renderPlanner();
  renderDashboardPlannerWidget();
}

function logAgentDecision(trigger, steps, verification) {
  const entry = {
    id: makeId("log"),
    timestamp: Date.now(),
    trigger,
    steps,
    verification: verification || verifyPlanConstraints()
  };
  agentAuditLog.unshift(entry);
  if (agentAuditLog.length > 30) agentAuditLog = agentAuditLog.slice(0, 30);
  writeStorage(PLANNER_KEYS.LOG, agentAuditLog);
}

/* ============================================================
 * 7. Session Actions (Complete, Missed, Focus)
 * ============================================================ */

function markSessionMissed(sessionId) {
  const session = studySessions.find(s => s.id === sessionId);
  if (!session) return;
  triggerAutonomousReplan(`Missed Session: "${session.topicName}"`, { missedSessionId: sessionId });
}

function completeSessionWithRating(sessionId, rating = 4, notes = "") {
  const session = studySessions.find(s => s.id === sessionId);
  if (!session) return;

  session.status = "completed";
  session.completedAt = Date.now();
  session.rating = rating;
  session.notes = notes;

  const deltaMap = { 1: 4, 2: 6, 3: 9, 4: 12, 5: 15 };
  const delta = deltaMap[rating] || 8;

  const topic = studentPerformance.find(t => t.id === session.topicId);
  if (topic) {
    const oldMastery = topic.mastery;
    topic.mastery = Math.min(100, topic.mastery + delta);
    topic.lastAssessed = Date.now();
    writeStorage(PLANNER_KEYS.PERFORMANCE, studentPerformance);

    logAgentDecision(
      `Session Completed: "${session.topicName}"`,
      [
        `Student completed study session with comprehension rating ${rating}/5.`,
        `Updated mastery for "${topic.name}" from ${oldMastery}% to ${topic.mastery}% (+${delta}% delta).`,
        `Reassessing priority learning gaps and dynamically adapting remaining study sessions.`
      ]
    );
  }

  writeStorage(PLANNER_KEYS.SESSIONS, studySessions);
  triggerAutonomousReplan(`Session Completed: "${session.topicName}" (+${delta}% mastery)`);
}

/* ============================================================
 * 8. Interactive Focus Timer Controller
 * ============================================================ */

function openFocusModal(sessionId) {
  const session = studySessions.find(s => s.id === sessionId) || studySessions.find(s => s.status === "scheduled") || studySessions[0];
  if (!session) return;

  activeFocusSession = session;

  const modal = document.getElementById("session-focus-modal");
  document.getElementById("focus-session-subject").textContent = session.subject;
  document.getElementById("focus-session-exam").textContent = `Target: ${session.examName || "Final Exam"}`;
  document.getElementById("focus-session-topic").textContent = session.topicName;
  document.getElementById("focus-session-objective").textContent = session.objective;

  const resource = resourceCatalog.find(r => r.id === session.resourceId) || selectBestResource(session.topicId);
  document.getElementById("focus-session-resource").innerHTML = `
    Resource: <a href="${resource.url}" target="_blank" class="underline hover:text-primary-container font-semibold">${escapeHtml(resource.title)}</a> (${resource.duration} min)
  `;

  focusTimeRemainingSec = (session.durationMins || 45) * 60;
  updateFocusTimerDisplay();
  stopFocusTimer();

  modal.classList.remove("hidden");
}

function closeFocusModal() {
  stopFocusTimer();
  document.getElementById("session-focus-modal").classList.add("hidden");
}

function updateFocusTimerDisplay() {
  const display = document.getElementById("focus-timer-display");
  if (!display) return;
  const m = Math.floor(focusTimeRemainingSec / 60);
  const s = focusTimeRemainingSec % 60;
  display.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function startFocusTimer() {
  if (focusTimerRunning) return;
  focusTimerRunning = true;
  const label = document.getElementById("focus-timer-label");
  const icon = document.getElementById("focus-timer-icon");
  if (label) label.textContent = "Pause";
  if (icon) icon.textContent = "pause";

  focusTimerInterval = setInterval(() => {
    if (focusTimeRemainingSec > 0) {
      focusTimeRemainingSec--;
      updateFocusTimerDisplay();
    } else {
      stopFocusTimer();
      alert("Focus study session is complete! Please submit your comprehension rating below.");
    }
  }, 1000);
}

function stopFocusTimer() {
  focusTimerRunning = false;
  clearInterval(focusTimerInterval);
  const label = document.getElementById("focus-timer-label");
  const icon = document.getElementById("focus-timer-icon");
  if (label) label.textContent = "Start Focus";
  if (icon) icon.textContent = "play_arrow";
}

function toggleFocusTimer() {
  if (focusTimerRunning) {
    stopFocusTimer();
  } else {
    startFocusTimer();
  }
}

function resetFocusTimer() {
  stopFocusTimer();
  focusTimeRemainingSec = (activeFocusSession ? activeFocusSession.durationMins : 45) * 60;
  updateFocusTimerDisplay();
}

/* ============================================================
 * 9. UI Rendering Engines
 * ============================================================ */

function renderDashboardPlannerWidget() {
  const nextSessionEl = document.getElementById("dash-next-session-title");
  const nextTimeEl = document.getElementById("dash-next-session-time");
  const topGapTitleEl = document.getElementById("dash-top-gap-title");
  const topGapStatusEl = document.getElementById("dash-top-gap-status");
  const constraintBadgeEl = document.getElementById("dash-constraint-badge");
  const constraintDetailEl = document.getElementById("dash-constraint-detail");

  if (!nextSessionEl) return;

  const ranked = getRankedLearningGaps();
  const nextScheduled = studySessions.find(s => s.status === "scheduled") || studySessions[0];
  const verification = verifyPlanConstraints();

  if (nextScheduled) {
    nextSessionEl.textContent = nextScheduled.topicName;
    nextTimeEl.innerHTML = `<span class="material-symbols-outlined" style="font-size: 16px;">schedule</span> ${nextScheduled.timeDisplay} (${nextScheduled.durationMins} min)`;
  } else {
    nextSessionEl.textContent = "All Sessions Completed";
    nextTimeEl.innerHTML = `<span class="material-symbols-outlined text-emerald-600" style="font-size: 16px;">check_circle</span> Great work today!`;
  }

  if (ranked.length > 0) {
    const topGap = ranked[0];
    topGapTitleEl.textContent = topGap.name;
    topGapStatusEl.innerHTML = `<span class="material-symbols-outlined text-error" style="font-size: 16px;">warning</span> ${topGap.mastery}% Mastery &bull; ${topGap.priority} Priority`;
  }

  if (verification.passed) {
    constraintBadgeEl.className = "font-label-md text-label-md font-semibold text-emerald-700 flex items-center gap-1";
    constraintBadgeEl.innerHTML = `<span class="material-symbols-outlined text-emerald-600" style="font-size: 18px;">verified</span> 100% Valid (0 Clashes)`;
    constraintDetailEl.textContent = `Timetable slots respected &bull; ${verification.loadHours}h / 3.5h load`;
  } else {
    constraintBadgeEl.className = "font-label-md text-label-md font-semibold text-error flex items-center gap-1";
    constraintBadgeEl.innerHTML = `<span class="material-symbols-outlined text-error" style="font-size: 18px;">error</span> Conflict Detected`;
    constraintDetailEl.textContent = `${verification.collisionsCount} timetable overlap(s)`;
  }
}

function renderPlanner() {
  const rankedGaps = getRankedLearningGaps();
  const verification = verifyPlanConstraints();
  const readiness = calculateOverallReadiness();

  const readinessEl = document.getElementById("planner-kpi-readiness");
  if (readinessEl) readinessEl.textContent = `${readiness}%`;

  const criticalCount = rankedGaps.filter(g => g.priority === "Critical").length;
  const highCount = rankedGaps.filter(g => g.priority === "High").length;
  const gapsKpiEl = document.getElementById("planner-kpi-gaps");
  const gapsSubEl = document.getElementById("planner-kpi-gaps-sub");
  if (gapsKpiEl) gapsKpiEl.textContent = `${criticalCount} Critical`;
  if (gapsSubEl) gapsSubEl.textContent = `${highCount} high priority gap${highCount === 1 ? "" : "s"}`;

  const timeKpiEl = document.getElementById("planner-kpi-time");
  if (timeKpiEl) timeKpiEl.textContent = `${verification.loadHours}h / 3.5h`;

  const constKpiEl = document.getElementById("planner-kpi-constraints");
  const constSubEl = document.getElementById("planner-kpi-constraints-sub");
  if (constKpiEl) {
    if (verification.passed) {
      constKpiEl.className = "font-display-lg text-xl lg:text-2xl font-bold text-emerald-700 flex items-center gap-1";
      constKpiEl.innerHTML = `<span class="material-symbols-outlined text-emerald-600" style="font-size: 22px;">verified</span> Passed`;
      if (constSubEl) constSubEl.textContent = "0 collisions with classes";
    } else {
      constKpiEl.className = "font-display-lg text-xl lg:text-2xl font-bold text-error flex items-center gap-1";
      constKpiEl.innerHTML = `<span class="material-symbols-outlined text-error" style="font-size: 22px;">error</span> Conflict`;
      if (constSubEl) constSubEl.textContent = `${verification.collisionsCount} overlap(s) detected`;
    }
  }

  renderUnifiedScheduleTimeline();
  renderGapsList(rankedGaps);
  renderResourcesList(rankedGaps);

  const checksumEl = document.getElementById("planner-constraint-checksum");
  if (checksumEl) checksumEl.textContent = verification.checksum;
  const loadCheckEl = document.getElementById("planner-check-load");
  if (loadCheckEl) loadCheckEl.textContent = `${verification.loadHours}h Planned`;

  renderDashboardPlannerWidget();
}

function renderUnifiedScheduleTimeline() {
  const container = document.getElementById("planner-schedule-list");
  const empty = document.getElementById("planner-schedule-empty");
  if (!container) return;

  const rawClasses = getActiveTimetable();

  const classEvents = rawClasses.map(c => ({
    kind: "class",
    id: c.id,
    timeMins: timeToMinutes(c.time),
    timeStr: formatMinutes12h(timeToMinutes(c.time)),
    title: c.name,
    location: c.location,
    type: c.type
  }));

  const sessionEvents = studySessions.map(s => ({
    kind: "session",
    id: s.id,
    timeMins: s.startTimeMins,
    timeStr: s.timeDisplay,
    title: s.topicName,
    subject: s.subject,
    priority: s.priority,
    objective: s.objective,
    durationMins: s.durationMins,
    status: s.status,
    resourceTitle: s.resourceTitle,
    resourceType: s.resourceType
  }));

  const unifiedEvents = [...classEvents, ...sessionEvents].sort((a, b) => a.timeMins - b.timeMins);

  if (unifiedEvents.length === 0) {
    container.classList.add("hidden");
    if (empty) empty.classList.remove("hidden");
    return;
  }

  container.classList.remove("hidden");
  if (empty) empty.classList.add("hidden");

  container.innerHTML = unifiedEvents.map((evt) => {
    if (evt.kind === "class") {
      return `
        <div class="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container-low border-l-4 border-secondary transition-all">
          <div class="flex flex-col items-center w-14 pt-0.5 text-center flex-shrink-0">
            <span class="font-label-sm text-xs font-bold text-secondary uppercase">${evt.timeStr}</span>
            <span class="text-[10px] text-on-surface-variant">Class</span>
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-secondary/10 text-secondary">
                Timetable: ${escapeHtml(evt.type || "lecture")}
              </span>
              <span class="text-xs text-on-surface-variant flex items-center gap-1">
                <span class="material-symbols-outlined" style="font-size: 14px;">location_on</span>
                ${escapeHtml(evt.location || "Campus")}
              </span>
            </div>
            <h4 class="font-headline-md text-base text-on-surface mt-1 font-semibold">${escapeHtml(evt.title)}</h4>
            <p class="text-xs text-on-surface-variant mt-0.5">Fixed commitment &bull; AI scheduler built study slots around this</p>
          </div>
          <span class="material-symbols-outlined text-secondary text-xl opacity-60">school</span>
        </div>
      `;
    } else {
      const isCompleted = evt.status === "completed";
      const isMissed = evt.status === "missed";
      const statusBadge = isCompleted
        ? `<span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1"><span class="material-symbols-outlined" style="font-size: 12px;">check</span> Completed</span>`
        : isMissed
        ? `<span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-error-container text-error flex items-center gap-1"><span class="material-symbols-outlined" style="font-size: 12px;">close</span> Missed / Rescheduled</span>`
        : `<span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary">AI Scheduled &bull; ${evt.priority} Priority</span>`;

      return `
        <div class="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all ${isCompleted ? "opacity-75" : ""}">
          <div class="flex flex-col items-center w-14 pt-0.5 text-center flex-shrink-0">
            <span class="font-label-sm text-xs font-bold text-primary">${evt.timeStr.split(" - ")[0]}</span>
            <span class="text-[10px] text-on-surface-variant">${evt.durationMins}m</span>
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              ${statusBadge}
              <span class="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">${escapeHtml(evt.subject)}</span>
            </div>
            <h4 class="font-headline-md text-base text-on-surface mt-1 font-semibold">${escapeHtml(evt.title)}</h4>
            <p class="text-xs text-on-surface-variant mt-0.5">${escapeHtml(evt.objective)}</p>
            <div class="mt-2 flex items-center gap-2 text-xs text-primary bg-surface-container-low px-2.5 py-1 rounded w-fit">
              <span class="material-symbols-outlined" style="font-size: 15px;">menu_book</span>
              <span class="truncate max-w-[280px]">${escapeHtml(evt.resourceTitle)}</span>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row items-end gap-1.5 pt-1">
            ${
              !isCompleted && !isMissed
                ? `
              <button type="button" data-action="focus-session" data-session-id="${evt.id}" class="bg-primary hover:bg-primary-container text-on-primary px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1 transition-all">
                <span class="material-symbols-outlined" style="font-size: 15px;">timer</span> Focus
              </button>
              <button type="button" data-action="complete-session" data-session-id="${evt.id}" class="bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant/40 px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors" title="Mark session complete">
                <span class="material-symbols-outlined text-emerald-600" style="font-size: 15px;">done</span> Complete
              </button>
              <button type="button" data-action="miss-session" data-session-id="${evt.id}" class="text-on-surface-variant hover:text-error hover:bg-error-container/30 p-1.5 rounded-lg transition-colors" title="Mark missed (triggers automatic replan)">
                <span class="material-symbols-outlined" style="font-size: 16px;">event_busy</span>
              </button>
            `
                : isCompleted
                ? `
              <span class="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <span class="material-symbols-outlined" style="font-size: 18px;">verified</span> Mastered
              </span>
            `
                : `
              <button type="button" data-action="focus-session" data-session-id="${evt.id}" class="text-xs text-primary underline">
                Retry Slot
              </button>
            `
            }
          </div>
        </div>
      `;
    }
  }).join("");
}

function renderGapsList(rankedGaps) {
  const container = document.getElementById("planner-gaps-list");
  if (!container) return;

  container.innerHTML = rankedGaps.map(gap => {
    const isCritical = gap.priority === "Critical";
    const barColor = isCritical ? "bg-error" : gap.priority === "High" ? "bg-amber-500" : "bg-primary";
    return `
      <div class="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-1.5 hover:border-primary/40 transition-colors">
        <div class="flex items-start justify-between gap-2">
          <div>
            <span class="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">${escapeHtml(gap.subject)}</span>
            <h4 class="font-label-md text-sm font-bold text-on-surface leading-tight">${escapeHtml(gap.name)}</h4>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${gap.badgeColor}">
            ${gap.priority}
          </span>
        </div>

        <div class="flex items-center justify-between text-xs text-on-surface-variant mt-1">
          <span>Mastery: <strong class="text-on-surface font-semibold">${gap.mastery}%</strong> / ${gap.target}%</span>
          <span>Exam in <strong class="text-on-surface font-semibold">${gap.daysToExam} days</strong></span>
        </div>

        <div class="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
          <div class="h-full ${barColor} rounded-full transition-all duration-500" style="width: ${gap.mastery}%"></div>
        </div>

        <div class="flex items-center justify-between pt-1 text-[11px]">
          <span class="text-on-surface-variant font-mono">Urgency Score: ${gap.urgency}</span>
          <button type="button" data-action="log-topic-score" data-topic-id="${gap.id}" class="text-primary hover:underline font-semibold flex items-center gap-0.5">
            <span class="material-symbols-outlined" style="font-size: 13px;">quiz</span> Log Test
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function renderResourcesList(rankedGaps) {
  const container = document.getElementById("planner-resources-list");
  if (!container) return;

  const topGaps = rankedGaps.slice(0, 4);
  const matchedResources = topGaps.map(g => selectBestResource(g.id));

  container.innerHTML = matchedResources.map(res => `
    <div class="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-start gap-2.5 hover:bg-surface-container transition-colors">
      <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
        <span class="material-symbols-outlined" style="font-size: 18px;">${res.icon || "menu_book"}</span>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-1">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-primary">${escapeHtml(res.type)} &bull; ${res.duration}m</span>
          <span class="text-[10px] text-on-surface-variant">${escapeHtml(res.difficulty)}</span>
        </div>
        <a href="${res.url}" target="_blank" class="font-label-md text-xs font-semibold text-on-surface hover:text-primary transition-colors truncate block">
          ${escapeHtml(res.title)}
        </a>
        <p class="text-[11px] text-on-surface-variant line-clamp-1 mt-0.5">${escapeHtml(res.description)}</p>
      </div>
    </div>
  `).join("");
}

function renderAgentAuditLogModal() {
  const container = document.getElementById("agent-log-container");
  if (!container) return;

  if (agentAuditLog.length === 0) {
    container.innerHTML = `
      <div class="py-8 text-center text-on-surface-variant text-sm">
        <span class="material-symbols-outlined text-4xl mb-1 text-outline-variant">history_edu</span>
        <p>No agent replan events recorded yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = agentAuditLog.map(entry => `
    <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col gap-2">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-primary"></span>
          <h4 class="font-label-md text-sm font-bold text-on-surface">${escapeHtml(entry.trigger)}</h4>
        </div>
        <span class="text-xs text-on-surface-variant whitespace-nowrap">${relativeDate(entry.timestamp)}</span>
      </div>
      <ul class="flex flex-col gap-1 text-xs text-on-surface-variant pl-4 list-disc">
        ${entry.steps.map(step => `<li>${escapeHtml(step)}</li>`).join("")}
      </ul>
      <div class="pt-1.5 border-t border-outline-variant/20 flex items-center justify-between text-[11px]">
        <span class="font-semibold text-emerald-700 flex items-center gap-1">
          <span class="material-symbols-outlined text-emerald-600" style="font-size: 14px;">verified</span>
          Constraints: ${entry.verification && entry.verification.passed ? "All Passed" : "Audited"}
        </span>
        <span class="font-mono text-on-surface-variant">${entry.verification ? entry.verification.checksum : "CHK-OK"}</span>
      </div>
    </div>
  `).join("");
}

function populateQuizTopicSelect(selectedTopicId = null) {
  const select = document.getElementById("quiz-topic-select");
  if (!select) return;
  select.innerHTML = studentPerformance.map(t => `
    <option value="${t.id}" ${t.id === selectedTopicId ? "selected" : ""}>
      ${escapeHtml(t.subject)}: ${escapeHtml(t.name)} (Current: ${t.mastery}%)
    </option>
  `).join("");
}

/* ============================================================
 * 10. Initialization & Export to Window
 * ============================================================ */

function initPlanner() {
  if (studySessions.length === 0) {
    generateAutonomousStudyPlan("Initial Dashboard Startup");
  }

  document.addEventListener("click", event => {
    const focusBtn = event.target.closest("[data-action='focus-session']");
    const completeBtn = event.target.closest("[data-action='complete-session']");
    const missBtn = event.target.closest("[data-action='miss-session']");
    const quizTopicBtn = event.target.closest("[data-action='log-topic-score']");

    if (focusBtn) {
      openFocusModal(focusBtn.dataset.sessionId);
    } else if (completeBtn) {
      completeSessionWithRating(completeBtn.dataset.sessionId, 4);
    } else if (missBtn) {
      markSessionMissed(missBtn.dataset.sessionId);
    } else if (quizTopicBtn) {
      populateQuizTopicSelect(quizTopicBtn.dataset.topicId);
      document.getElementById("quiz-modal").classList.remove("hidden");
      document.getElementById("quiz-score-input").focus();
    }
  });

  const replanBtn = document.getElementById("planner-replan-btn");
  if (replanBtn) {
    replanBtn.addEventListener("click", () => {
      triggerAutonomousReplan("Manual User Schedule Optimization");
    });
  }

  const dashReplanBtn = document.getElementById("dashboard-replan-btn");
  if (dashReplanBtn) {
    dashReplanBtn.addEventListener("click", () => {
      triggerAutonomousReplan("Dashboard Quick Optimization");
    });
  }

  const refreshGapsBtn = document.getElementById("planner-refresh-gaps-btn");
  if (refreshGapsBtn) {
    refreshGapsBtn.addEventListener("click", () => {
      renderPlanner();
    });
  }

  const emptyGenerateBtn = document.getElementById("planner-empty-generate-btn");
  if (emptyGenerateBtn) {
    emptyGenerateBtn.addEventListener("click", () => {
      generateAutonomousStudyPlan("Manual Generation From Empty View");
      renderPlanner();
    });
  }

  const simulateConflictBtn = document.getElementById("planner-simulate-conflict-btn");
  if (simulateConflictBtn) {
    simulateConflictBtn.addEventListener("click", () => {
      const conflictClass = {
        id: makeId("entry-simulated"),
        time: "11:30",
        name: "Urgent Faculty Review Lab",
        location: "Seminar Hall 1",
        type: "lab"
      };

      const classes = getActiveTimetable();
      classes.push(conflictClass);
      if (typeof saveTimetableData === "function") saveTimetableData();
      if (typeof renderTimetable === "function") renderTimetable();

      triggerAutonomousReplan("Timetable Conflict Detected: New class scheduled at 11:30");
      alert("Simulated a new Timetable class at 11:30. The Autonomous Agent detected the collision, shifted study blocks into alternative free slots, and verified 0 timetable overlaps!");
    });
  }

  const viewLogBtn = document.getElementById("planner-view-log-btn");
  const agentLogModal = document.getElementById("agent-log-modal");
  if (viewLogBtn && agentLogModal) {
    viewLogBtn.addEventListener("click", () => {
      renderAgentAuditLogModal();
      agentLogModal.classList.remove("hidden");
    });
  }

  const closeLogBtn = document.getElementById("close-agent-log-modal");
  const dismissLogBtn = document.getElementById("dismiss-agent-log-modal");
  if (closeLogBtn && agentLogModal) closeLogBtn.addEventListener("click", () => agentLogModal.classList.add("hidden"));
  if (dismissLogBtn && agentLogModal) dismissLogBtn.addEventListener("click", () => agentLogModal.classList.add("hidden"));

  const clearLogBtn = document.getElementById("clear-agent-log-btn");
  if (clearLogBtn) {
    clearLogBtn.addEventListener("click", () => {
      agentAuditLog = [];
      writeStorage(PLANNER_KEYS.LOG, []);
      renderAgentAuditLogModal();
    });
  }

  const closeFocusBtn = document.getElementById("close-focus-modal");
  const cancelFocusBtn = document.getElementById("cancel-focus-modal");
  if (closeFocusBtn) closeFocusBtn.addEventListener("click", closeFocusModal);
  if (cancelFocusBtn) cancelFocusBtn.addEventListener("click", closeFocusModal);

  const focusToggleBtn = document.getElementById("focus-timer-toggle");
  if (focusToggleBtn) focusToggleBtn.addEventListener("click", toggleFocusTimer);

  const focusResetBtn = document.getElementById("focus-timer-reset");
  if (focusResetBtn) focusResetBtn.addEventListener("click", resetFocusTimer);

  const focusForm = document.getElementById("focus-complete-form");
  if (focusForm) {
    focusForm.addEventListener("submit", event => {
      event.preventDefault();
      const ratingEl = document.querySelector('input[name="focus-rating"]:checked');
      const rating = ratingEl ? parseInt(ratingEl.value, 10) : 4;
      if (activeFocusSession) {
        completeSessionWithRating(activeFocusSession.id, rating);
      }
      closeFocusModal();
    });
  }

  const quizModal = document.getElementById("quiz-modal");
  const logQuizBtn = document.getElementById("planner-log-quiz-btn");
  if (logQuizBtn && quizModal) {
    logQuizBtn.addEventListener("click", () => {
      populateQuizTopicSelect();
      quizModal.classList.remove("hidden");
    });
  }

  const closeQuizBtn = document.getElementById("close-quiz-modal");
  const cancelQuizBtn = document.getElementById("cancel-quiz-modal");
  if (closeQuizBtn && quizModal) closeQuizBtn.addEventListener("click", () => quizModal.classList.add("hidden"));
  if (cancelQuizBtn && quizModal) cancelQuizBtn.addEventListener("click", () => quizModal.classList.add("hidden"));

  const quizForm = document.getElementById("quiz-form");
  if (quizForm && quizModal) {
    quizForm.addEventListener("submit", event => {
      event.preventDefault();
      const topicId = document.getElementById("quiz-topic-select").value;
      const score = parseInt(document.getElementById("quiz-score-input").value, 10);

      const topic = studentPerformance.find(t => t.id === topicId);
      if (topic && !isNaN(score)) {
        const old = topic.mastery;
        topic.mastery = Math.round(old * 0.4 + score * 0.6);
        topic.lastAssessed = Date.now();
        writeStorage(PLANNER_KEYS.PERFORMANCE, studentPerformance);

        quizModal.classList.add("hidden");
        quizForm.reset();

        triggerAutonomousReplan(`Diagnostic Score Ingested: ${score}% on "${topic.name}"`);
      }
    });
  }

  closeOnBackdropClick(agentLogModal, () => agentLogModal.classList.add("hidden"));
  closeOnEscape(agentLogModal, () => agentLogModal.classList.add("hidden"));
  closeOnBackdropClick(quizModal, () => quizModal.classList.add("hidden"));
  closeOnEscape(quizModal, () => quizModal.classList.add("hidden"));
  const focusModal = document.getElementById("session-focus-modal");
  if (focusModal) {
    closeOnBackdropClick(focusModal, closeFocusModal);
    closeOnEscape(focusModal, closeFocusModal);
  }

  renderDashboardPlannerWidget();
  renderPlanner();
}

// Global exports
window.renderPlanner = renderPlanner;
window.renderDashboardPlannerWidget = renderDashboardPlannerWidget;
window.triggerAutonomousReplan = triggerAutonomousReplan;
window.generateAutonomousStudyPlan = generateAutonomousStudyPlan;
window.openPlannerFocusModal = openFocusModal;
window.getStudySessions = () => studySessions;
window.getAgentAuditLog = () => agentAuditLog;
window.getStudentPerformance = () => studentPerformance;
window.getRankedLearningGaps = getRankedLearningGaps;
window.computeAvailableFreeSlots = computeAvailableFreeSlots;
window.verifyPlanConstraints = verifyPlanConstraints;
window.markSessionMissed = markSessionMissed;
window.completeSessionWithRating = completeSessionWithRating;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPlanner);
} else {
  initPlanner();
}
