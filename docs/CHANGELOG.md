# Changelog

## Documentation baseline

This documentation pass expands the original project README into a maintainable project guide.

### Documented

- project purpose
- architecture
- local development
- Vercel development
- Ollama setup
- AI note-generation flow
- deployment limitations
- troubleshooting
- feature overview
- contribution workflow
- `.vercel` behavior

### Important implementation note

The current repository contains a working backend design for local Ollama note generation. Public Vercel AI generation requires an Ollama endpoint that the deployed backend can reach; a laptop-local `localhost:11434` endpoint is not reachable from a remote Vercel function.

Future code changes should update this changelog when behavior changes materially.
