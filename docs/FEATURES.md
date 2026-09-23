# Features

## Dashboard

Provides the main academic overview and navigation into StudyMate modules.

## Timetable

Manages classes and academic schedule information used by the planner.

## Exams

Tracks examination information and countdown-related data.

## Notes

Provides the normal notes workflow. AI-generated material is intended to be integrated with the notes workflow rather than becoming a separate, isolated storage system.

## AI Planner

The planner presents learning gaps and related academic information.

The intended workflow is:

```text
Academic data
   ↓
Learning gaps
   ↓
Priority / urgency
   ↓
Study planning
   ↓
Learning activity
   ↓
Progress update
   ↓
Replanning
```

## Generate Best Notes

Generates notes for a selected learning gap through the StudyMate backend and Ollama.

## Schedule replanning and simulation

The UI includes planner actions for schedule replanning and schedule-shift simulation. These should be treated as planner workflows and verified against the actual current implementation before being described as a fully autonomous backend capability.

## Agent audit information

The UI includes an Agent Audit Trail action intended to make planner decisions more transparent.

## Design system

The visual system is documented in `DESIGN.md`, including:

- Academic Precision theme
- Scholar Blue primary styling
- Geist/Inter typography
- 8px spacing rhythm
- rounded component language
- dashboard cards
- progress indicators
- countdown styling
- sidebar navigation
