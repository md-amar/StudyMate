# Development Guide

## Start here

From the repository root:

```bash
node dev-server.js
```

Then:

```text
http://localhost:3000
```

## Vercel local development

If you are testing the Vercel environment:

```bash
npx vercel dev
```

## Useful checks

### Check Node

```bash
node --version
```

### Check Ollama

```bash
ollama --version
ollama list
```

### Check Git state

```bash
git status
```

### Review changes

```bash
git diff
```

## Recommended development loop

1. Make one focused change.
2. Save the files.
3. Start/restart the correct local server.
4. Test the affected feature.
5. Test a nearby feature that could be affected.
6. Run `git diff`.
7. Run `git status`.
8. Commit only intentional files.

## Do not confuse servers

Live Server often uses port 5500.

StudyMate's documented Node server uses port 3000.

If `127.0.0.1:5500` shows `ERR_CONNECTION_REFUSED`, that means nothing is currently listening on port 5500. It does not by itself mean the StudyMate application is broken.
