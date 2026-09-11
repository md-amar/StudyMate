---
name: Academic Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006686'
  on-secondary: '#ffffff'
  secondary-container: '#7ed4fd'
  on-secondary-container: '#005b78'
  tertiary: '#982669'
  on-tertiary: '#ffffff'
  tertiary-container: '#b74082'
  on-tertiary-container: '#ffecf1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#c0e8ff'
  secondary-fixed-dim: '#7bd1fa'
  on-secondary-fixed: '#001e2b'
  on-secondary-fixed-variant: '#004d66'
  tertiary-fixed: '#ffd8e7'
  tertiary-fixed-dim: '#ffafd3'
  on-tertiary-fixed: '#3d0026'
  on-tertiary-fixed-variant: '#85145a'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is built on the principles of **focused minimalism** and **calm productivity**. It aims to transform the chaotic nature of academic life into a structured, manageable experience. The interface should evoke a sense of mental clarity and quiet confidence, using significant white space to prevent cognitive overload.

The style is **Corporate Modern** with a **Tactile** edge—relying on clean layouts, systematic grids, and subtle depth cues that make the interface feel like a premium physical planner. Every element serves a functional purpose, removing unnecessary ornamentation to keep the student's focus entirely on their tasks and goals.

## Colors

The palette is anchored by "Deep Scholar Blue" (Primary) to provide an authoritative yet calming base. 

- **Primary (#2563EB):** Used for critical actions, active states, and focus indicators.
- **Secondary (#7DD3FC):** A soft sky blue used for secondary buttons, illustrative accents, and background washes to reduce visual tension.
- **Tertiary (#F472B6):** A vibrant pink used sparingly for "urgent" highlights, such as countdowns or missed deadlines, providing a high-contrast energetic pop.
- **Neutral (#64748B):** A balanced slate gray for body text and metadata, ensuring long-term reading comfort without the harshness of pure black.
- **Surface:** The background should utilize `#F8FAFC` to maintain a "crisp paper" feel, while containers use pure `#FFFFFF` to float above the canvas.

## Typography

This design system utilizes a dual-font strategy to balance technical precision with extreme legibility. 

**Geist** is reserved for headlines, labels, and numeric data (like countdowns and grades). Its monospaced-influenced proportions lend a "tech-forward" and organized feel to the hierarchy. 

**Inter** is used for all body copy and task descriptions. Its neutral, humanist qualities ensure that even long study notes or syllabi remain readable during late-night sessions. 

Use `label-md` for small headers over lists or sidebar categories to create clear structural breaks. Apply a tighter letter-spacing to `display-lg` to maintain a premium, editorial look on dashboard summaries.

## Layout & Spacing

The layout follows a **12-column fluid grid** for desktop, transitioning to a **single-column stack** for mobile. 

- **Sidebar:** A fixed 280px sidebar houses global navigation, allowing the main content area to remain focused.
- **Rhythm:** An 8px linear scale governs all spacing. Use `stack-md` (24px) for the gap between dashboard cards and `stack-sm` (12px) for elements within a card.
- **Safe Zones:** Use generous page margins (40px) on desktop to create a "letterhead" feel that centers the user's attention.
- **Mobile Reflow:** On mobile, sidebars should collapse into a bottom navigation bar or a hidden drawer to maximize vertical space for task lists.

## Elevation & Depth

To maintain a clean and professional aesthetic, this design system avoids heavy shadows. Instead, it uses **Tonal Layers** supplemented by **Ambient Shadows**.

1.  **Level 0 (Canvas):** `#F8FAFC` - The base layer.
2.  **Level 1 (Cards/Sidebar):** `#FFFFFF` - Applied to primary containers. These use a very soft, diffused shadow: `0px 4px 20px rgba(0, 0, 0, 0.03)`.
3.  **Level 2 (Dropdowns/Modals):** `#FFFFFF` - These elements use a more defined shadow to indicate temporary interaction: `0px 10px 32px rgba(0, 0, 0, 0.08)`.

Interactions like hovering over a task card should result in a subtle lift (moving from Level 1 to a slightly deeper shadow) rather than a color change, mimicking the physical act of picking up a piece of paper.

## Shapes

The shape language is **Rounded**, striking a balance between the rigidity of academia and the friendliness of modern software.

- **Standard Elements:** Buttons, input fields, and cards use `rounded-md` (0.5rem).
- **Large Containers:** Dashboard widgets and main content areas use `rounded-lg` (1rem).
- **Status Indicators:** Pills and tags use `rounded-xl` (1.5rem) or full pill shapes to distinguish them from actionable buttons.

## Components

### Dashboard Cards
Cards should feature a `label-sm` header for categories. Content should be padded with 24px on all sides. Use a subtle 1px border (`#E2E8F0`) instead of heavy shadows for a cleaner, flatter look.

### Primary Buttons
Large, high-contrast surfaces using the Primary color. Text should be `label-md` for clarity. Use a subtle inner-glow on hover to give a "tactile" feel.

### Progress Indicators
Use thin (4px or 6px) track heights for progress bars. The background track should be a very light version of the neutral color, while the fill uses a gradient from Secondary to Primary.

### Countdown Timers
Apply `Geist` with tabular lining figures to ensure numbers don't jump when the clock ticks. Use the Tertiary color for timers with less than 5 minutes remaining to create a subtle sense of urgency.

### Sidebar Navigation
Active states should be indicated by a vertical bar on the left edge in Primary color and a soft background tint. Icons should be "Outline" style with a 1.5px stroke width to match the typography's weight.

### Input Fields
Inputs should have a white background, 1px border, and a 4px focus ring in the Secondary color (low opacity) to ensure the user always knows where their cursor is without the UI feeling "loud."