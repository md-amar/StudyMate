# StudyMate

> **StudyMate** is an adaptive academic planning application for students. It combines timetable management, exam tracking, notes, performance data, and an AI-assisted learning planner.

## Problem

Students often plan their studies using a static timetable. Real academic work is dynamic: exams move closer, mastery changes, study sessions are missed, and available time changes.

StudyMate is designed around an adaptive workflow:

1. Analyze current academic performance.
2. Identify priority learning gaps.
3. Select learning resources.
4. Build study activities around timetable constraints.
5. Track completed or missed activities.
6. Reassess progress.
7. Replan future activities when conditions change.
8. Verify the revised plan against time and learning objectives.

## Main modules

- Dashboard
- Timetable management
- Class management
- Exam management and countdowns
- Notes management
- AI Planner
- Learning-gap prioritization
- Study-session planning
- Quiz/score logging
- Schedule simulation/replanning UI
- Agent audit information
- Local AI note generation with Ollama

> The exact availability of a feature depends on the current implementation in the repository. This README documents the intended application workflow without claiming unsupported backend behavior.

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

## Local development

### Requirements

- Node.js 18+ is required by the project documentation.
- Ollama is required only for local AI note generation.
- No `npm install` is required for the zero-dependency local server.

### 1. Clone

```bash
git clone https://github.com/md-amar/StudyMate.git
cd StudyMate
```

### 2. Configure Ollama

Install Ollama, then verify:

```bash
ollama --version
ollama pull llama3.2
ollama list
```

The application expects these defaults:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

If you use a different model, set `OLLAMA_MODEL` to the exact model name returned by `ollama list`.

### 3. Start the local application

```bash
node dev-server.js
```

Open:

```text
http://localhost:3000
```

The local server exposes the AI endpoint at:

```text
POST /api/generate-notes
```

The browser calls StudyMate's backend. The backend calls Ollama. The browser does not need to call Ollama directly.

## Vercel development

The repository also documents an alternative local workflow using the Vercel CLI:

```bash
npx vercel dev
```

This is useful when you want to test the Vercel-style function environment locally.

## Important AI deployment limitation

Local Ollama and a public Vercel deployment are different environments.

When StudyMate runs on your computer:

```text
Browser
   ↓
StudyMate local server
   ↓
Ollama on your computer
   ↓
Llama model
```

When StudyMate is deployed to Vercel:

```text
Browser
   ↓
Vercel function
   ↓
OLLAMA_BASE_URL
   ↓
Ollama server reachable by Vercel
```

A deployed Vercel function cannot normally reach `http://localhost:11434` on your personal computer. Therefore, public AI note generation requires an Ollama endpoint that is reachable from the deployed server, with the appropriate environment configuration.

## AI note-generation flow

The `/api/generate-notes` backend:

1. Receives the selected learning gap.
2. Validates the request.
3. Builds a mastery-adaptive educational prompt.
4. Calls Ollama's `/api/generate` endpoint.
5. Returns generated notes and metadata.
6. Reports connection/model/time-out failures as user-facing errors.

The current backend uses `llama3.2` as its default model and a 120-second generation timeout.

## Troubleshooting

### `Ollama is not running`

Check:

```bash
ollama list
```

Then make sure the Ollama service is running and test:

```bash
ollama run llama3.2
```

Keep Ollama available while using local AI generation.

### Model not found

Run:

```bash
ollama list
```

Copy the exact model name and configure:

```env
OLLAMA_MODEL=your-exact-model-name
```

Do not type a model name directly as if it were a PowerShell command. For example, `llama3.2:1b` is a model identifier, not a command.

### AI works locally but not from the Vercel URL

This is expected if the deployed backend is configured with:

```text
OLLAMA_BASE_URL=http://localhost:11434
```

See `docs/AI_NOTES.md` and `docs/DEPLOYMENT.md`.

### `127.0.0.1:5500` refuses the connection

Port 5500 is commonly used by Live Server. If no server is running on that port, the browser will show `ERR_CONNECTION_REFUSED`.

For this project, use the documented local server:

```bash
node dev-server.js
```

and open `http://localhost:3000`.

## Security

Never commit:

- `.env`
- `.env.local`
- API keys
- private credentials
- machine-specific secrets

The repository's `.gitignore` excludes environment files and `.vercel`.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Local development](docs/DEVELOPMENT.md)
- [AI notes and Ollama](docs/AI_NOTES.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Features](docs/FEATURES.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Contributing](docs/CONTRIBUTING.md)
- [Changelog](docs/CHANGELOG.md)
