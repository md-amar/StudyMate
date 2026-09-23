# Contributing

## Before changing code

Read:

- `README.md`
- `DESIGN.md`
- relevant module documentation in `docs/`

Understand which layer you are changing:

- UI
- browser-side JavaScript
- local Node server
- Vercel function
- Ollama integration

## Keep changes focused

Prefer small changes that solve one problem at a time.

For bug fixes:

1. reproduce the bug
2. identify the responsible module
3. make the smallest safe fix
4. test the original scenario
5. test an adjacent scenario
6. inspect `git diff`
7. commit

## AI-related changes

When changing AI note generation, test:

- missing topic
- invalid input
- Ollama unavailable
- model unavailable
- slow generation
- successful generation
- generated content returned to the UI
- saving generated notes to the normal Notes workflow

## Documentation

Update documentation when a change affects:

- setup
- environment variables
- architecture
- API behavior
- deployment
- user-facing features
- troubleshooting

Do not document an intended feature as completed unless the implementation actually supports it.
