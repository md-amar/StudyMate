# Troubleshooting

## 1. `ERR_CONNECTION_REFUSED` on `127.0.0.1:5500`

Cause: no server is listening on port 5500.

Fix:

```bash
node dev-server.js
```

Then open:

```text
http://localhost:3000
```

## 2. AI says Ollama is not running

Check:

```bash
ollama list
```

Then:

```bash
ollama run llama3.2
```

If Ollama is installed as a background service, the important test is whether the Ollama HTTP service is reachable.

## 3. Model name confusion

This is wrong as a PowerShell command:

```text
llama3.2:1b
```

This is correct:

```bash
ollama run llama3.2:1b
```

Only use the model identifier that appears in:

```bash
ollama list
```

## 4. AI works on localhost but not on the Vercel URL

Local:

```text
localhost → local backend → localhost:11434
```

Vercel:

```text
internet → Vercel backend → configured OLLAMA_BASE_URL
```

The Vercel backend cannot normally reach your personal computer's localhost.

## 5. `.vercel` folder is missing on GitHub

That is intentional. The repository's `.gitignore` contains `.vercel`, so the Vercel CLI's local project metadata is not committed.

## 6. Notes or UI appear stale

First determine which server you opened.

- `localhost:3000` → StudyMate Node server
- `127.0.0.1:5500` → likely Live Server
- a `*.vercel.app` URL → deployed environment

Test the same environment consistently before debugging application code.

## 7. Git changes look strange

Use:

```bash
git status
git diff
```

If a command opens a pager showing `(END)`, press:

```text
q
```

to return to the shell.

Do not repeatedly press Ctrl+C when you are simply viewing paged output.

## 8. Environment variables

Never commit `.env` or `.env.local`.

The repository already ignores environment files. If a local environment variable is missing, create it locally and restart the server.
