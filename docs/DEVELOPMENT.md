# Development Guide

## Prerequisites

- Git
- Node.js 18+
- Ollama for local AI note generation

## Start locally

From the repository root:

```bash
node dev-server.js
```

Open:

```text
http://localhost:3000
```

## Configure Ollama

```bash
ollama --version
ollama pull llama3.2
ollama list
```

Copy `.env.example` to `.env` and configure the Ollama URL/model as required.

## Vercel local development

```bash
npx vercel dev
```

This is useful when testing the Vercel-style API environment locally.

## Useful Git checks

```bash
git status
git diff
```

## Recommended development loop

1. Reproduce the issue.
2. Identify the responsible module.
3. Make a focused change.
4. Test the original scenario.
5. Test a nearby scenario that could be affected.
6. Review `git diff`.
7. Commit only intentional changes.

## Port note

VS Code Live Server commonly uses port `5500`. StudyMate's documented Node server uses port `3000`. A refused connection on `127.0.0.1:5500` means nothing is listening on that port; it does not by itself indicate that the StudyMate application is broken.
