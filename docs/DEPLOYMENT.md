# Deployment Guide

## Local deployment

Run:

```bash
node dev-server.js
```

Then open `http://localhost:3000`.

## Vercel

The repository supports Vercel-style local development:

```bash
npx vercel dev
```

The `.vercel` directory is local Vercel metadata and is intentionally ignored by Git.

## AI deployment requirement

Local configuration normally uses:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

A public Vercel deployment cannot normally reach the Ollama service running on a developer's laptop. The production backend therefore needs an AI endpoint reachable from the deployment.

Do not assume that changing the browser URL to `localhost` or `127.0.0.1` makes a remote Vercel function connect to the developer's computer.

## Deployment checklist

- Application loads successfully.
- Dashboard navigation works.
- Timetable works.
- Notes work.
- Exams work.
- AI Planner UI works.
- API route responds correctly.
- Required environment variables are configured.
- AI endpoint is reachable from the deployed backend.
- Error states are tested.
- No `.env` or secret credentials are committed.
