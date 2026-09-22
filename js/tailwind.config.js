/* StudyMate design tokens (Material 3 inspired).
 * Colors resolve to CSS variables (channel triples defined in css/styles.css)
 * so the Settings page can re-theme the whole app at runtime by updating
 * variables on :root — see js/theme-bootstrap.js and js/settings.js. */
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "outline": "rgb(var(--sm-outline) / <alpha-value>)",
        "secondary": "rgb(var(--sm-secondary) / <alpha-value>)",
        "inverse-surface": "rgb(var(--sm-inverse-surface) / <alpha-value>)",
        "on-error": "rgb(var(--sm-on-error) / <alpha-value>)",
        "primary": "rgb(var(--sm-primary) / <alpha-value>)",
        "on-secondary-fixed-variant": "rgb(var(--sm-on-secondary-fixed-variant) / <alpha-value>)",
        "surface": "rgb(var(--sm-surface) / <alpha-value>)",
        "on-primary-fixed-variant": "rgb(var(--sm-on-primary-fixed-variant) / <alpha-value>)",
        "on-primary-container": "rgb(var(--sm-on-primary-container) / <alpha-value>)",
        "on-secondary-container": "rgb(var(--sm-on-secondary-container) / <alpha-value>)",
        "secondary-fixed-dim": "rgb(var(--sm-secondary-fixed-dim) / <alpha-value>)",
        "background": "rgb(var(--sm-background) / <alpha-value>)",
        "on-tertiary": "rgb(var(--sm-on-tertiary) / <alpha-value>)",
        "tertiary-fixed-dim": "rgb(var(--sm-tertiary-fixed-dim) / <alpha-value>)",
        "tertiary": "rgb(var(--sm-tertiary) / <alpha-value>)",
        "surface-container-high": "rgb(var(--sm-surface-container-high) / <alpha-value>)",
        "on-secondary-fixed": "rgb(var(--sm-on-secondary-fixed) / <alpha-value>)",
        "on-tertiary-fixed-variant": "rgb(var(--sm-on-tertiary-fixed-variant) / <alpha-value>)",
        "surface-tint": "rgb(var(--sm-surface-tint) / <alpha-value>)",
        "surface-variant": "rgb(var(--sm-surface-variant) / <alpha-value>)",
        "error": "rgb(var(--sm-error) / <alpha-value>)",
        "on-surface": "rgb(var(--sm-on-surface) / <alpha-value>)",
        "surface-container-lowest": "rgb(var(--sm-surface-container-lowest) / <alpha-value>)",
        "on-error-container": "rgb(var(--sm-on-error-container) / <alpha-value>)",
        "secondary-container": "rgb(var(--sm-secondary-container) / <alpha-value>)",
        "error-container": "rgb(var(--sm-error-container) / <alpha-value>)",
        "tertiary-fixed": "rgb(var(--sm-tertiary-fixed) / <alpha-value>)",
        "on-surface-variant": "rgb(var(--sm-on-surface-variant) / <alpha-value>)",
        "outline-variant": "rgb(var(--sm-outline-variant) / <alpha-value>)",
        "surface-container": "rgb(var(--sm-surface-container) / <alpha-value>)",
        "surface-container-highest": "rgb(var(--sm-surface-container-highest) / <alpha-value>)",
        "surface-bright": "rgb(var(--sm-surface-bright) / <alpha-value>)",
        "on-tertiary-fixed": "rgb(var(--sm-on-tertiary-fixed) / <alpha-value>)",
        "tertiary-container": "rgb(var(--sm-tertiary-container) / <alpha-value>)",
        "inverse-primary": "rgb(var(--sm-inverse-primary) / <alpha-value>)",
        "on-primary": "rgb(var(--sm-on-primary) / <alpha-value>)",
        "on-secondary": "rgb(var(--sm-on-secondary) / <alpha-value>)",
        "surface-container-low": "rgb(var(--sm-surface-container-low) / <alpha-value>)",
        "primary-fixed-dim": "rgb(var(--sm-primary-fixed-dim) / <alpha-value>)",
        "inverse-on-surface": "rgb(var(--sm-inverse-on-surface) / <alpha-value>)",
        "primary-fixed": "rgb(var(--sm-primary-fixed) / <alpha-value>)",
        "surface-dim": "rgb(var(--sm-surface-dim) / <alpha-value>)",
        "secondary-fixed": "rgb(var(--sm-secondary-fixed) / <alpha-value>)",
        "on-primary-fixed": "rgb(var(--sm-on-primary-fixed) / <alpha-value>)",
        "on-tertiary-container": "rgb(var(--sm-on-tertiary-container) / <alpha-value>)",
        "primary-container": "rgb(var(--sm-primary-container) / <alpha-value>)"
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
