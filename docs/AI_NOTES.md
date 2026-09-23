# AI Notes and Ollama

## What the AI feature does

The AI Planner can generate study notes targeted at a selected learning gap.

The backend receives planner information such as topic, subject, mastery, target mastery, priority, urgency, and exam/session context where available. It turns that information into a StudyMate-specific educational prompt and sends it to Ollama.

## Mastery adaptation

The current backend categorizes mastery into three tiers:

- LOW: below 40%
- MEDIUM: 40% to below 70%
- HIGH: 70% and above

The generated material is adapted according to the selected tier.

## Model configuration

Default local configuration:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

The exact model name should match `ollama list`.

## Correct Ollama commands

```bash
ollama pull llama3.2
ollama list
ollama run llama3.2
```

The model identifier itself is not a PowerShell command.

## Backend flow

```text
AI Planner
   ↓
POST /api/generate-notes
   ↓
api/generate-notes.js
   ↓
api/lib/ollama.js
   ↓
Ollama /api/generate
   ↓
Generated notes
```

The browser does not need to call Ollama directly.

## Production limitation

A deployed Vercel function cannot normally reach an Ollama process running on the developer's personal computer at `localhost:11434`. Public AI generation therefore requires an Ollama endpoint that the deployed backend can reach.

Do not expose Ollama publicly without appropriate authentication, network controls, and resource protection.

## Troubleshooting

If local generation fails, verify:

```bash
ollama --version
ollama list
ollama run llama3.2
```

Then confirm the local environment variables and restart the StudyMate server.
