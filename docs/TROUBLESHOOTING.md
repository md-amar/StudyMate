# Troubleshooting

## `ERR_CONNECTION_REFUSED` on `127.0.0.1:5500`

Port `5500` is commonly used by VS Code Live Server. StudyMate's documented Node server uses port `3000`.

Run:

```bash
node dev-server.js
```

Then open `http://localhost:3000`.

## Ollama is not running

Check:

```bash
ollama list
```

Then test:

```bash
ollama run llama3.2
```

## Model not found

Use:

```bash
ollama list
```

and set `OLLAMA_MODEL` to the exact installed model identifier.

## AI works locally but not from the Vercel URL

A local Ollama service is running on the developer's computer. A remote Vercel function cannot normally reach that computer's `localhost`.

Check the deployment architecture and `OLLAMA_BASE_URL`.

## `.vercel` is missing on GitHub

This is expected. `.vercel` is local Vercel project metadata and should remain ignored by Git.

## Environment variables

Never commit `.env` or `.env.local`. Configure private environment variables locally or in the deployment platform instead.

## Git output shows `(END)`

If a Git command opens a pager, press:

```text
q
```

to return to the shell.
