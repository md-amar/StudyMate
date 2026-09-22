/* ============================================================
 * StudyMate - theme-bootstrap.js
 * Loaded synchronously in <head>: reads saved preferences from
 * localStorage and applies them (CSS variables on :root + classes
 * on <html>) before the first paint, so there is no flash of the
 * default theme. Exposes window.StudyMateTheme as the single
 * source of truth used by js/settings.js (and any other module).
 * ============================================================ */
(function () {
  "use strict";

  const STORAGE_KEY = "studymate-settings";

  const DEFAULTS = {
    theme: "light", // "light" | "dark" | "system"
    accent: "#2563eb",
    accentName: "Academic Blue",
    toggles: {
      "reduced-motion": false,
      "compact-sidebar": false,
      "high-contrast": false,
      "sunset-shift": true,
      "countdown-banner": true,
      "timer-sound": true,
      "morning-briefing": true
    }
  };

  /* ---------- storage ---------- */

  function readState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(DEFAULTS);
      const saved = JSON.parse(raw);
      return {
        theme: ["light", "dark", "system"].indexOf(saved.theme) > -1 ? saved.theme : DEFAULTS.theme,
        accent: isValidHex(saved.accent) ? saved.accent : DEFAULTS.accent,
        accentName: typeof saved.accentName === "string" ? saved.accentName : DEFAULTS.accentName,
        toggles: Object.assign({}, DEFAULTS.toggles, saved.toggles)
      };
    } catch (err) {
      console.warn("StudyMate: corrupt settings in localStorage, resetting.", err);
      return clone(DEFAULTS);
    }
  }

  function persist(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error("StudyMate: could not persist settings.", err);
    }
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /* ---------- color math ---------- */

  function isValidHex(value) {
    return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
  }

  function hexToRgb(hex) {
    if (!isValidHex(hex)) return null;
    return [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16)
    ];
  }

  function channels(hex) {
    const rgb = hexToRgb(hex);
    return rgb ? rgb.join(" ") : null;
  }

  /** Mix `hex` toward white (t in 0..1). */
  function lighten(hex, t) {
    return mix(hex, [255, 255, 255], t);
  }

  /** Mix `hex` toward black (t in 0..1). */
  function darken(hex, t) {
    return mix(hex, [0, 0, 0], t);
  }

  function mix(hex, target, t) {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    return rgb
      .map((c, i) => Math.round(c + (target[i] - c) * t))
      .map(c => c.toString(16).padStart(2, "0"))
      .join("");
  }

  /**
   * Derive the primary-family channel variables from an accent hex for the
   * given mode. In light mode the accent itself is the primary; in dark mode
   * the primary becomes a pastel tint so it stays legible on dark surfaces.
   */
  function accentVariables(hex, dark) {
    const vars = {};
    const set = (name, value) => {
      if (value) vars[name] = value;
    };
    if (!dark) {
      set("--sm-primary", channels(hex));
      set("--sm-on-primary", "255 255 255");
      set("--sm-primary-container", channels(lighten(hex, 0.15)));
      set("--sm-on-primary-container", channels(lighten(hex, 0.85)));
      set("--sm-primary-fixed", channels(lighten(hex, 0.72)));
      set("--sm-primary-fixed-dim", channels(lighten(hex, 0.6)));
      set("--sm-surface-tint", channels(hex));
    } else {
      set("--sm-primary", channels(lighten(hex, 0.6)));
      set("--sm-on-primary", channels(darken(hex, 0.55)));
      set("--sm-primary-container", channels(hex));
      set("--sm-on-primary-container", channels(lighten(hex, 0.85)));
      set("--sm-primary-fixed", channels(lighten(hex, 0.72)));
      set("--sm-primary-fixed-dim", channels(lighten(hex, 0.6)));
      set("--sm-surface-tint", channels(lighten(hex, 0.6)));
    }
    return vars;
  }

  /* ---------- mode resolution ---------- */

  function systemPrefersDark() {
    return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  /** Sunset Shift window: 18:45 local time through 06:00. */
  function isNighttime() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    return h >= 19 || h < 6 || (h === 18 && m >= 45);
  }

  function effectiveDark(state) {
    if (state.theme === "dark") return true;
    if (state.theme === "system") return systemPrefersDark();
    return !!(state.toggles["sunset-shift"] && isNighttime()); // theme === "light"
  }

  /* ---------- application ---------- */

  function applyClasses(state) {
    const root = document.documentElement;
    root.classList.toggle("dark", effectiveDark(state));
    root.classList.toggle("reduced-motion", !!state.toggles["reduced-motion"]);
    root.classList.toggle("compact-sidebar", !!state.toggles["compact-sidebar"]);
    root.classList.toggle("high-contrast", !!state.toggles["high-contrast"]);
    root.classList.toggle("sunset-shift", !!state.toggles["sunset-shift"]);
    root.classList.toggle("hide-countdown-banner", !state.toggles["countdown-banner"]);
    root.dataset.themeMode = state.theme;
  }

  function applyAccent(state) {
    const root = document.documentElement;
    const vars = accentVariables(state.accent, effectiveDark(state));
    Object.entries(vars).forEach(([name, value]) => root.style.setProperty(name, value));
  }

  function apply(state) {
    applyClasses(state);
    applyAccent(state);
  }

  /* ---------- public API ---------- */

  let state = readState();

  window.StudyMateTheme = {
    /** Snapshot of the current preferences (safe to mutate). */
    getState() {
      return clone(state);
    },

    /** Resolve the mode that is actually on screen right now. */
    getEffectiveMode() {
      return effectiveDark(state) ? "dark" : "light";
    },

    /** Value of a boolean toggle, e.g. StudyMateTheme.getToggle("timer-sound"). */
    getToggle(key) {
      return !!state.toggles[key];
    },

    setTheme(theme) {
      state.theme = theme;
      persist(state);
      apply(state); // re-applies accent too (light/dark need different tints)
    },

    setAccent(hex, name) {
      if (!isValidHex(hex)) return;
      state.accent = hex.toLowerCase();
      state.accentName = name || hex;
      persist(state);
      applyAccent(state);
    },

    setToggle(key, value) {
      state.toggles[key] = !!value;
      persist(state);
      applyClasses(state);
    },

    reset() {
      state = clone(DEFAULTS);
      persist(state);
      apply(state);
    },

    apply
  };

  // Apply saved (or default) preferences immediately, before first paint.
  apply(state);

  // Follow the OS scheme while in "System Auto" mode.
  if (window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if (state.theme === "system") apply(state);
    };
    if (mq.addEventListener) mq.addEventListener("change", onSystemChange);
    else if (mq.addListener) mq.addListener(onSystemChange);
  }

  // Sunset Shift: re-evaluate the 18:45 night boundary every minute.
  setInterval(() => {
    if (state.theme === "light" && state.toggles["sunset-shift"]) apply(state);
  }, 60000);
})();
