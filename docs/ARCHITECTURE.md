# StudyMate Architecture

## High-level architecture

StudyMate is a static frontend plus a small Node/Vercel backend for AI note generation.

```text
┌─────────────────────────────┐
│          Browser            │
│  index.html + css + js      │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│     StudyMate frontend      │
│ dashboard / timetable /     │
│ exams / notes / AI planner  │
└──────────────┬──────────────┘
               │ POST /api/generate-notes
               ▼
┌─────────────────────────────┐
│ StudyMate backend handler   │
│ validation + prompt build   │
└──────────────┬──────────────┘
               │ POST /api/generate
               ▼
┌─────────────────────────────┐
│            Ollama           │
│       local LLM runtime     │
└─────────────────────────────┘
```

## Main layers

### Frontend

The browser application contains the dashboard and feature modules for planning, timetable, exams, notes, settings, navigation, and AI note generation.

### Backend/API

`api/generate-notes.js` receives AI-note requests, validates the request, builds the educational prompt, and delegates the Ollama call to the shared helper.

### Ollama

`api/lib/ollama.js` provides the shared Ollama integration used by the API layer and local development server.

## Local vs production

Local development can connect to Ollama running on the developer's machine. A deployed Vercel function cannot normally access that machine's `localhost:11434`; production requires an Ollama endpoint reachable from the deployed backend.

## Important source files

| File | Responsibility |
|---|---|
| `index.html` | Main SPA markup and application shell |
| `js/planner.js` | Planner/study-session behavior |
| `js/notes.js` | Notes behavior and rendering |
| `js/timetable.js` | Timetable/class behavior |
| `js/exams.js` | Exam behavior |
| `js/settings.js` | Settings behavior |
| `js/navigation.js` | SPA navigation |
| `js/theme-bootstrap.js` | Early theme initialization |
| `js/ai-notes.js` | AI note-generation UI flow |
| `api/generate-notes.js` | AI note API endpoint |
| `api/lib/ollama.js` | Ollama API helper |
| `dev-server.js` | Local Node development server |
