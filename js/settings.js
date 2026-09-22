/* ============================================================
 * StudyMate - settings.js
 * Integration logic for the Settings view (prototype UI kept as-is).
 * Every change applies live through window.StudyMateTheme and is
 * persisted to localStorage immediately — no refresh, no route
 * reload, the SPA structure is untouched.
 * ============================================================ */
(function () {
  "use strict";

  const Theme = window.StudyMateTheme;
  if (!Theme) {
    console.warn("StudyMate: theme-bootstrap.js missing; settings are inactive.");
    return;
  }

  const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

  /* ---------- toast (from the prototype) ---------- */

  let toastTimer = null;

  function showToast(message) {
    const toast = document.getElementById("toastNotification");
    const toastText = document.getElementById("toastMessage");
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.remove("opacity-0", "translate-y-4", "pointer-events-none");
    toast.classList.add("opacity-100", "translate-y-0");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.add("opacity-0", "translate-y-4", "pointer-events-none");
      toast.classList.remove("opacity-100", "translate-y-0");
    }, 2600);
  }

  /* ---------- theme mode radio buttons (Light / Dark / System Auto) ---------- */

  const themeRadios = Array.prototype.slice.call(
    document.querySelectorAll('input[name="theme-mode"]')
  );

  const THEME_LABELS = { light: "Light", dark: "Dark", system: "System Auto" };

  function syncThemeCards() {
    document.querySelectorAll(".theme-card").forEach(card => {
      const radio = card.querySelector('input[type="radio"]');
      const selected = !!radio && radio.checked;
      card.classList.toggle("bg-surface-bright", selected);
      card.classList.toggle("shadow-sm", selected);
      card.classList.toggle("bg-surface-container-low", !selected);
      const badge = card.querySelector(".check-badge");
      if (badge) badge.classList.toggle("hidden", !selected);
    });
  }

  themeRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      if (!radio.checked) return;
      Theme.setTheme(radio.value);
      syncThemeCards();
      showToast(`${THEME_LABELS[radio.value] || radio.value} theme applied.`);
    });
  });

  /* ---------- accent color: presets, native picker, custom hex ---------- */

  const swatchBtns = Array.prototype.slice.call(
    document.querySelectorAll(".color-swatch-btn")
  );
  const liveDot = document.getElementById("liveAccentDot");
  const liveText = document.getElementById("liveAccentText");
  const hexInput = document.getElementById("hexCodeInput");
  const colorBubble = document.getElementById("customColorBubble");
  const nativePicker = document.getElementById("nativeColorPicker");
  const applyHexBtn = document.getElementById("applyHexBtn");

  /** UI-only sync of the accent preview controls (persistence happens in Theme). */
  function updateActiveColor(color, name) {
    if (liveDot) liveDot.style.backgroundColor = color;
    if (liveText) {
      liveText.textContent = name || color;
      liveText.style.color = color;
    }
    if (hexInput) hexInput.value = color.toUpperCase();
    if (colorBubble) colorBubble.style.backgroundColor = color;
    if (nativePicker) nativePicker.value = color;

    swatchBtns.forEach(btn => {
      const check = btn.querySelector(".swatch-check");
      const isActive = btn.getAttribute("data-color").toLowerCase() === color.toLowerCase();
      btn.classList.toggle("bg-surface-container-low", isActive);
      btn.classList.toggle("bg-surface-bright", !isActive);
      if (check) check.classList.toggle("hidden", !isActive);
    });
  }

  function applyAccent(color, name) {
    Theme.setAccent(color, name);
    updateActiveColor(Theme.getState().accent, Theme.getState().accentName);
  }

  swatchBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      applyAccent(btn.getAttribute("data-color"), btn.getAttribute("data-name"));
    });
  });

  if (nativePicker) {
    nativePicker.addEventListener("input", e => {
      applyAccent(e.target.value, "Custom");
    });
  }

  function markHexInvalid() {
    if (!hexInput) return;
    hexInput.classList.add("hex-invalid");
    setTimeout(() => hexInput.classList.remove("hex-invalid"), 2000);
  }

  function applyHexFromInput() {
    if (!hexInput) return;
    let value = hexInput.value.trim();
    if (value && value.indexOf("#") !== 0) value = "#" + value;
    if (HEX_PATTERN.test(value)) {
      applyAccent(value.toLowerCase(), "Custom");
      showToast("Custom hex color applied.");
    } else {
      markHexInvalid();
      showToast("Please enter a valid 6-character hex code.");
    }
  }

  if (applyHexBtn) applyHexBtn.addEventListener("click", applyHexFromInput);
  if (hexInput) {
    hexInput.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        applyHexFromInput();
      }
    });
  }

  /* ---------- toggles (Reduced Motion, High Contrast, Compact Sidebar, ...) ---------- */

  const toggleInputs = Array.prototype.slice.call(
    document.querySelectorAll(".toggle-input")
  );

  toggleInputs.forEach(input => {
    input.addEventListener("change", () => {
      Theme.setToggle(input.getAttribute("data-setting"), input.checked);
    });
  });

  /* ---------- footer actions ---------- */

  const saveBtn = document.getElementById("saveBtn");
  const saveBtnText = document.getElementById("saveBtnText");
  const saveBtnIcon = document.getElementById("saveBtnIcon");

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      saveBtn.disabled = true;
      if (saveBtnText) saveBtnText.textContent = "Saving...";
      if (saveBtnIcon) saveBtnIcon.textContent = "hourglass_empty";
      setTimeout(() => {
        saveBtn.disabled = false;
        if (saveBtnText) saveBtnText.textContent = "Saved!";
        if (saveBtnIcon) saveBtnIcon.textContent = "check";
        showToast("Preferences saved — they apply instantly and persist on this device.");
        setTimeout(() => {
          if (saveBtnText) saveBtnText.textContent = "Save Changes";
          if (saveBtnIcon) saveBtnIcon.textContent = "save";
        }, 1800);
      }, 600);
    });
  }

  const resetBtn = document.getElementById("resetBtn");

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      Theme.reset();
      syncSettingsUI();
      showToast("Settings restored to system factory baseline.");
    });
  }

  /* ---------- init: reflect persisted preferences in the UI ---------- */

  function syncSettingsUI() {
    const state = Theme.getState();

    themeRadios.forEach(radio => {
      radio.checked = radio.value === state.theme;
    });
    syncThemeCards();

    updateActiveColor(state.accent, state.accentName);

    toggleInputs.forEach(input => {
      input.checked = !!state.toggles[input.getAttribute("data-setting")];
    });
  }

  syncSettingsUI();
})();
