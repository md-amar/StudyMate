/* StudyMate design tokens (Material 3 inspired) */
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "outline": "#737686",
        "secondary": "#006686",
        "inverse-surface": "#213145",
        "on-error": "#ffffff",
        "primary": "#004ac6",
        "on-secondary-fixed-variant": "#004d66",
        "surface": "#f8f9ff",
        "on-primary-fixed-variant": "#003ea8",
        "on-primary-container": "#eeefff",
        "on-secondary-container": "#005b78",
        "secondary-fixed-dim": "#7bd1fa",
        "background": "#f8f9ff",
        "on-tertiary": "#ffffff",
        "tertiary-fixed-dim": "#ffafd3",
        "tertiary": "#982669",
        "surface-container-high": "#dce9ff",
        "on-secondary-fixed": "#001e2b",
        "on-tertiary-fixed-variant": "#85145a",
        "surface-tint": "#0053db",
        "surface-variant": "#d3e4fe",
        "error": "#ba1a1a",
        "on-surface": "#0b1c30",
        "surface-container-lowest": "#ffffff",
        "on-error-container": "#93000a",
        "secondary-container": "#7ed4fd",
        "error-container": "#ffdad6",
        "tertiary-fixed": "#ffd8e7",
        "on-surface-variant": "#434655",
        "outline-variant": "#c3c6d7",
        "surface-container": "#e5eeff",
        "surface-container-highest": "#d3e4fe",
        "surface-bright": "#f8f9ff",
        "on-tertiary-fixed": "#3d0026",
        "tertiary-container": "#b74082",
        "inverse-primary": "#b4c5ff",
        "on-primary": "#ffffff",
        "on-secondary": "#ffffff",
        "surface-container-low": "#eff4ff",
        "primary-fixed-dim": "#b4c5ff",
        "inverse-on-surface": "#eaf1ff",
        "primary-fixed": "#dbe1ff",
        "surface-dim": "#cbdbf5",
        "secondary-fixed": "#c0e8ff",
        "on-primary-fixed": "#00174b",
        "on-tertiary-container": "#ffecf1",
        "primary-container": "#2563eb"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "margin-desktop": "40px",
        "stack-sm": "12px",
        "unit": "8px",
        "stack-lg": "48px",
        "gutter": "24px",
        "stack-md": "24px",
        "container-max": "1280px",
        "margin-mobile": "16px"
      },
      fontFamily: {
        "headline-md": ["Geist"],
        "body-lg": ["Inter"],
        "body-md": ["Inter"],
        "headline-lg": ["Geist"],
        "headline-lg-mobile": ["Geist"],
        "label-md": ["Geist"],
        "display-lg": ["Geist"],
        "label-sm": ["Geist"]
      },
      fontSize: {
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-lg-mobile": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "label-md": ["14px", { lineHeight: "20px", letterSpacing: "0.05em", fontWeight: "500" }],
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "label-sm": ["12px", { lineHeight: "16px", fontWeight: "500" }]
      }
    }
  }
};
