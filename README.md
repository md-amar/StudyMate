# StudyMate

> **An adaptive academic planning platform that helps students organize what to study, when to study it, and how to adjust the plan as their academic situation changes.**

## Problem

Students often plan their studies using a static timetable, while real academic work is dynamic. Upcoming exams, weak topics, available time, missed sessions, and changing performance can all affect what should be studied next.

A timetable can tell a student **when** to study, but it does not by itself continuously adapt the learning plan.

## Solution

StudyMate combines academic management with an adaptive learning-planning workflow.

The application brings together:

- Timetable and class management
- Exam management and countdowns
- Notes management
- Learning-gap and performance information
- AI-assisted study planning
- AI-generated study notes through Ollama
- Study-session planning and replanning workflows
- Schedule/constraint-oriented planning

### Core workflow

```text
Academic information
        ↓
Performance & learning gaps
        ↓
Priority / urgency
        ↓
Available time + timetable constraints
        ↓
Study activities
        ↓
Complete / miss activities
        ↓
Reassess progress
        ↓
Replan future activities
```

## Key features

### Academic management

- Student dashboard
- Timetable management
- Add/manage classes
- Exam management
- Exam countdown
- Notes management
- Academic CRUD workflows

### AI Planner

The AI Planner extends the academic-management layer with an adaptive planning workflow. It is designed to use learning gaps, performance, exams, available time, and timetable constraints when planning study activities.

### AI note generation

The **Generate Best Notes** workflow sends a selected learning gap to the StudyMate backend. The backend builds a mastery-aware prompt and calls Ollama using the configured model.

The browser does **not** call Ollama directly.

```text
AI Planner
    ↓
POST /api/generate-notes
    ↓
StudyMate backend
    ↓
Ollama /api/generate
    ↓
Configured LLM
    ↓
Generated study notes
```

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- Node.js local API server
- Vercel-compatible API functions
- Ollama for local LLM inference
- Llama 3.2 model configuration
- Browser-side persistence used by the current application

## Project structure

```text
StudyMate/
├── api/
│   ├── generate-notes.js
│   └── lib/
│       └── ollama.js
├── css/
├── js/
├── .env.example
├── .gitignore
├── DESIGN.md
├── dev-server.js
├── index.html
└── README.md
```

See the [`docs/`](docs/) directory for detailed technical documentation.

## Local development

### Prerequisites

- Git
- Node.js 18+
- Ollama (required for local AI note generation)

### 1. Clone the repository

```bash
git clone https://github.com/md-amar/StudyMate.git
cd StudyMate
```

### 2. Install/configure Ollama

Verify Ollama:

```bash
ollama --version
```

Pull the model:

```bash
ollama pull llama3.2
```

Check installed models:

```bash
ollama list
```

Optional interactive test:

```bash
ollama run llama3.2
```

### 3. Configure environment variables

Copy `.env.example` to `.env`:

```bash
# macOS/Linux
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

Default local configuration:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

Use the exact model name shown by `ollama list` if you have selected a different model.

### 4. Start StudyMate

```bash
node dev-server.js
```

Open:

```text
http://localhost:3000
```

### 5. Test AI notes

Open:

**AI Planner → Generate Best Notes**

Select a learning gap and generate the notes. The generated content can then be saved through the normal Notes workflow.

## Vercel local development

The project can also be tested using the Vercel CLI:

```bash
npx vercel dev
```

This is useful for testing the Vercel-style API environment locally.

## Important Ollama deployment limitation

Ollama running on your laptop is a **local service**. A deployed Vercel function cannot normally reach your laptop's `localhost:11434`.

### Local

```text
Browser
   ↓
StudyMate local server
   ↓
Ollama on your computer
   ↓
Llama model
```

### Public deployment

```text
Browser
   ↓
Vercel
   ↓
StudyMate API
   ↓
Ollama endpoint reachable by Vercel
```

Therefore, configuring Vercel with `OLLAMA_BASE_URL=http://localhost:11434` does **not** make it connect to the Ollama process running on your personal computer. A production AI deployment requires an AI endpoint that the deployed backend can actually reach.

Do not expose an Ollama server publicly without appropriate network controls, authentication, and resource protection.

## Troubleshooting

### `Ollama is not running`

Check:

```bash
ollama list
```

Then test:

```bash
ollama run llama3.2
```

### Model not found

Run:

```bash
ollama list
```

Then use the exact model identifier in `OLLAMA_MODEL`.

### `127.0.0.1:5500` refuses the connection

Port `5500` is commonly used by VS Code Live Server. StudyMate's documented Node server runs on port `3000`:

```bash
node dev-server.js
```

Then open `http://localhost:3000`.

### AI works locally but not on the Vercel URL

Check the deployment architecture first. A remote Vercel function cannot use your personal computer's local Ollama service through `localhost`.

See:

- [`docs/AI_NOTES.md`](docs/AI_NOTES.md)
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
- [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md)

## Security

Never commit:

- `.env`
- `.env.local`
- API keys
- private credentials
- machine-specific secrets

The `.vercel` directory is local Vercel metadata and is intentionally ignored by Git.

## Documentation

| Document | Purpose |
|---|---|
| [`DESIGN.md`](DESIGN.md) | UI/design system |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System architecture and data flow |
| [`docs/AI_NOTES.md`](docs/AI_NOTES.md) | Ollama and AI note generation |
| [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) | Developer setup and workflow |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Deployment and environment considerations |
| [`docs/FEATURES.md`](docs/FEATURES.md) | Feature catalogue |
| [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) | Common development/runtime issues |
| [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) | Contribution workflow |
| [`docs/CHANGELOG.md`](docs/CHANGELOG.md) | Documentation/project history |

## Future direction

Potential future work includes persistent cloud storage, multi-user synchronization, stronger production AI hosting, richer analytics, and deeper adaptive-learning feedback loops. These are future directions, not claims about the current implementation.

## Contributing

See [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) before making changes.
