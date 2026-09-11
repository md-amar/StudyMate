# Dynamic Timetable - Changes Explained

## Overview
The Today's Timetable is now fully data-driven. Users can add and remove class entries. All timetable data is stored in JavaScript and persists across page refreshes using browser localStorage.

---

## 1. HTML Changes (Timetable Card)

### Modified Header:
```html
<!-- Changed button from "more_horiz" to "add" -->
<button id="add-timetable-btn" class="...">
  <span class="material-symbols-outlined">add</span>
</button>
```

**Why?**
- Changed the button from three-dot menu to "+" icon
- Makes it clear users can add new entries
- Consistent with Notes UI pattern

### Replaced Hardcoded Entries:
```html
<!-- Was: Three hardcoded div entries with time/class info -->

<!-- Now: Dynamic container for rendering -->
<div id="timetable-list" class="...">
  <!-- Timetable entries rendered here -->
</div>

<!-- Empty state when no classes -->
<div id="timetable-empty" class="hidden ...">
  <p>No classes scheduled</p>
  <p>Add your first class to get started</p>
</div>
```

**Why?**
- `id="timetable-list"` allows JavaScript to inject dynamic HTML
- `id="timetable-empty"` shows user-friendly message when no classes exist
- Replaced static HTML with dynamic rendering container

### Added Modal (Add Class Dialog):
```html
<div id="timetable-modal" class="hidden ...">
  <!-- Form with inputs for time, name, location, type -->
  <input id="modal-timetable-time" type="time" required>
  <input id="modal-timetable-name" type="text" required>
  <input id="modal-timetable-location" type="text" required>
  <select id="modal-timetable-type">
    <option>lecture</option>
    <option>lab</option>
    <option>study</option>
    <option>tutorial</option>
    <option>other</option>
  </select>
</div>
```

**Why?**
- Reuses the modal pattern from Notes and Exam features
- Type selector allows color-coding of different class types
- All required fields must be filled before submission

---

## 2. JavaScript Logic

### A. Data Structure
```javascript
const defaultTimetableEntries = [
	{ id: "entry-1", time: "10:00", name: "Algorithms Lecture", location: "Room 304, CS Building", type: "lecture" },
	{ id: "entry-2", time: "13:00", name: "Study Group: Linear Algebra", location: "Library, 2nd Floor", type: "study" },
	{ id: "entry-3", time: "15:30", name: "Database Systems Lab", location: "Lab 2, Engineering Wing", type: "lab" }
];

let timetableEntries = [];
```

**What it does:**
- Stores default entries (same as original hardcoded ones)
- Array format makes it easy to sort, filter, add, and remove
- Each entry has: `id`, `time`, `name`, `location`, `type`

---

### B. Data Persistence
```javascript
function loadTimetableData() {
	const saved = localStorage.getItem(timetableStorageKey);
	if (saved) {
		timetableEntries = JSON.parse(saved);
	} else {
		timetableEntries = [...defaultTimetableEntries];
		saveTimetableData();
	}
	renderTimetable();
}

function saveTimetableData() {
	localStorage.setItem(timetableStorageKey, JSON.stringify(timetableEntries));
}
```

**What it does:**
- `loadTimetableData()`: Restores saved timetable on page load, or uses defaults if first time
- `saveTimetableData()`: Persists to browser storage after any change
- Data survives page refreshes and browser close/reopen
- Uses key: `"studymate-timetable"`

---

### C. Styling Helper Functions
```javascript
function getTypeIcon(type) {
	const icons = {
		lecture: "school",
		lab: "computer",
		study: "groups",
		tutorial: "menu_book",
		other: "schedule"
	};
	return icons[type] || icons.other;
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
```

**What it does:**
- Maps class type to Material Design icons
- Maps class type to border colors (matches StudyMate theme)
- Used during rendering to style each entry differently
- Example: "lab" type gets `border-tertiary` (tertiary color)

---

### D. Time Formatting
```javascript
function formatTime(timeStr) {
	const [hours, minutes] = timeStr.split(":");
	return `${hours}:${minutes}`;
}
```

**What it does:**
- Converts "10:00" to displayable format (handles "10:00" → "10:00")
- Used for consistent display in the timetable

---

### E. Rendering Function
```javascript
function renderTimetable() {
	// Sort entries by time (chronological order)
	const sorted = [...timetableEntries].sort((a, b) => a.time.localeCompare(b.time));
	
	if (sorted.length === 0) {
		timetableList.classList.add("hidden");
		timetableEmpty.classList.remove("hidden");
		return;
	}
	
	timetableList.innerHTML = sorted.map((entry, index) => `
		<!-- First entry (index 0) is highlighted as "current/next" -->
		<!-- Dynamic HTML with delete buttons -->
	`).join("");
}
```

**Key features:**
- **Sorting**: Entries sorted by time (10:00 before 13:00 before 15:30)
- **Current class styling**: First entry (index 0) gets:
  - Bold time text
  - Blue background (`bg-primary-fixed/20`)
  - Blue border (`border-primary`)
  - Blue timeline dot (visual indicator)
- **Other classes**: Get standard styling with type-based colors
- **Delete buttons**: Appear on hover, allow removal
- **Empty state**: Shows friendly message when no classes

### F. Add/Remove Functions
```javascript
function addTimetableEntry(time, name, location, type) {
	const entry = {
		id: crypto.randomUUID ? crypto.randomUUID() : "entry-" + Date.now(),
		time,
		name: name.trim(),
		location: location.trim(),
		type
	};
	timetableEntries.push(entry);
	saveTimetableData();
	renderTimetable();
}

function deleteTimetableEntry(id) {
	timetableEntries = timetableEntries.filter(entry => entry.id !== id);
	saveTimetableData();
	renderTimetable();
}
```

**What they do:**
- `addTimetableEntry()`: Creates entry with unique ID, adds to array, saves & re-renders
- `deleteTimetableEntry()`: Removes entry by ID, saves & re-renders
- Both trigger `saveTimetableData()` to persist changes
- Both call `renderTimetable()` to update UI immediately

---

### G. Modal Management
```javascript
function openTimetableModal() {
	modalTimetableTime.value = "";
	modalTimetableName.value = "";
	modalTimetableLocation.value = "";
	modalTimetableType.value = "lecture";
	timetableModal.classList.remove("hidden");
	modalTimetableTime.focus();
}

function closeTimetableModal() {
	timetableModal.classList.add("hidden");
	timetableForm.reset();
}
```

**What it does:**
- `openTimetableModal()`: Shows modal, clears fields, auto-focuses time input
- `closeTimetableModal()`: Hides modal and resets form to clean state

---

### H. Form Submission
```javascript
timetableForm.addEventListener("submit", event => {
	event.preventDefault();
	const time = modalTimetableTime.value;
	const name = modalTimetableName.value.trim();
	const location = modalTimetableLocation.value.trim();
	const type = modalTimetableType.value;
	
	if (time && name && location) {
		addTimetableEntry(time, name, location, type);
		closeTimetableModal();
	}
});
```

**What it does:**
1. Prevents default form submission
2. Collects all form values
3. Validates that time, name, and location are filled
4. Adds new entry to timetable (triggers save & render)
5. Closes modal immediately

---

### I. Event Listeners
```javascript
addTimetableBtn.addEventListener("click", openTimetableModal);
closeTimetableModalBtn.addEventListener("click", closeTimetableModal);
document.getElementById("cancel-timetable-modal").addEventListener("click", closeTimetableModal);

timetableModal.addEventListener("click", event => {
	if (event.target === timetableModal) closeTimetableModal();  // Background click
});

// During render:
timetableList.querySelectorAll("[data-delete-timetable]").forEach(btn => {
	btn.addEventListener("click", () => {
		const id = btn.dataset.deleteTimetable;
		deleteTimetableEntry(id);
	});
});
```

**What it does:**
- Add button opens modal
- Close button and Cancel button close modal
- Clicking modal background closes it (standard UX)
- Delete buttons (added during render) trigger removal

---

## 3. Data Flow Diagram

```
Page Load
    ↓
loadTimetableData()
    ├─ Check localStorage for saved entries
    ├─ If found: use saved data
    └─ If not found: use defaults
    ↓
renderTimetable()
    ├─ Sort entries by time
    ├─ Generate HTML for each entry
    ├─ Highlight first entry as "current"
    ├─ Add delete buttons
    └─ Update DOM

User clicks "+" button
    ↓
openTimetableModal() → Show form

User fills form and submits
    ↓
Form validation → All fields filled?
    ↓
addTimetableEntry()
    ├─ Create entry with unique ID
    ├─ Add to array
    ├─ saveTimetableData() → Save to localStorage
    └─ renderTimetable() → Update display
    ↓
closeTimetableModal()

User clicks delete button on entry
    ↓
deleteTimetableEntry(id)
    ├─ Remove from array
    ├─ saveTimetableData() → Save to localStorage
    └─ renderTimetable() → Update display
```

---

## 4. UI/UX Decisions (Minimal Changes)

✅ **Add Button**: Simple "+" icon in header
  - Doesn't clutter the interface
  - Follows Material Design conventions
  - Consistent with Notes feature

✅ **Modal Dialog**: Reuses existing pattern
  - Time picker (native HTML5 input)
  - Text inputs for name/location
  - Dropdown for class type
  - Familiar form experience

✅ **Current Class Highlighting**: First entry special styling
  - Blue background and border
  - Bold time text
  - Blue timeline indicator
  - Mimics original "13:00 Study Group" active state

✅ **Delete on Hover**: Small delete button appears
  - Doesn't clutter normal view
  - Appears only when hovering over entry
  - Red error color for delete action
  - Easy to undo (just add class back)

✅ **Empty State**: Friendly message
  - Users know where to add first class
  - Prompts action without confusion

✅ **Type-Based Colors**: Different colors per class type
  - Lecture: Secondary color (blue-green)
  - Lab: Tertiary color (pink)
  - Study: Primary color (blue)
  - Tutorial: Secondary-fixed
  - Other: Outline variant

---

## 5. How to Use

### Adding a Class:
1. Click "+" button on timetable card
2. Modal opens with form fields
3. Select time using time picker (e.g., 10:00)
4. Enter class name (e.g., "Algorithms Lecture")
5. Enter location (e.g., "Room 304, CS Building")
6. Select class type from dropdown
7. Click "Add Class"
8. Modal closes and timetable updates immediately

### Removing a Class:
1. Hover over the class entry
2. Delete button appears in top-right
3. Click delete button
4. Class is removed from timetable immediately

### Default Classes:
- First load shows 3 default classes (same as original)
- User can delete defaults and build their own schedule
- Data is saved to localStorage, survives refresh

---

## 6. Technical Specifications

| Feature | Implementation |
|---------|-----------------|
| **Storage** | Browser localStorage (key: `"studymate-timetable"`) |
| **Data Format** | JSON array of entry objects |
| **Entry Fields** | id, time (HH:MM), name, location, type |
| **Sorting** | By time (string comparison, works for HH:MM format) |
| **Current Class** | First entry after sorting (index 0) |
| **Validation** | HTML5 required attributes + trim() |
| **Delete Action** | Array filter, persists immediately |
| **Add Action** | Array push, persists immediately |
| **Unique IDs** | crypto.randomUUID() or fallback to timestamp |

---

## 7. Class Types Available

- **lecture**: School icon, secondary color
- **lab**: Computer icon, tertiary color  
- **study**: Groups icon, primary color
- **tutorial**: Menu book icon, secondary-fixed color
- **other**: Schedule icon, outline-variant color

---

## 8. Browser Compatibility

✅ Works on all modern browsers
- localStorage: IE8+
- time input: All modern browsers (fallback to text input in old browsers)
- crypto.randomUUID: Chrome, Firefox, Safari 15.4+
  - Fallback: Timestamp-based ID if not available
- Array methods (sort, filter, map): All browsers

---

## 9. What Was NOT Changed

🔒 Countdown card styling and functionality
🔒 Sidebar navigation
🔒 Top app bar
🔒 Recent Notes section
🔒 Notes editor functionality
🔒 Overall color scheme and typography
🔒 Card layout and grid structure
🔒 Tailwind configuration
🔒 Exam countdown feature

Only the timetable card and related JavaScript were modified.

---

## 10. Data Schema

```javascript
{
  id: "entry-1" | "uuid-string" | "entry-1234567890",
  time: "10:00",                    // HH:MM format (24-hour)
  name: "Algorithms Lecture",       // Class name
  location: "Room 304, CS Building", // Location string
  type: "lecture" | "lab" | "study" | "tutorial" | "other"
}
```

**Storage Format:**
```
localStorage["studymate-timetable"] = JSON.stringify([
  { id: "entry-1", time: "10:00", name: "Algorithms Lecture", location: "Room 304, CS Building", type: "lecture" },
  { id: "entry-2", time: "13:00", name: "Study Group: Linear Algebra", location: "Library, 2nd Floor", type: "study" },
  { id: "entry-3", time: "15:30", name: "Database Systems Lab", location: "Lab 2, Engineering Wing", type: "lab" }
])
```

---

## Summary

**Before**: Static hardcoded timetable (3 fixed entries)

**After**: 
- ✨ Fully dynamic timetable from data
- ✨ Add new classes anytime
- ✨ Remove classes with one click
- ✨ Persistent storage across sessions
- ✨ Type-based color coding
- ✨ Current/next class highlighting
- ✨ Sorted chronologically
- ✨ Minimal UI changes
