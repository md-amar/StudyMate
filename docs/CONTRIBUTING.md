# Contributing

## Before changing code

Read:

- `README.md`
- `DESIGN.md`
- the relevant documentation in `docs/`

Understand whether the change affects the frontend, local Node server, API function, or Ollama integration.

## Focused changes

For a bug fix:

1. Reproduce the issue.
2. Identify the responsible module.
3. Make the smallest safe change.
4. Test the original scenario.
5. Test an adjacent scenario.
6. Review `git diff`.
7. Commit only intentional changes.

## AI changes

When changing AI note generation, test:

- invalid input
- missing topic
- Ollama unavailable
- model unavailable
- slow generation
- successful generation
- generated content returned to the UI
- normal Notes workflow integration

## Documentation

Update documentation when a change affects setup, environment variables, architecture, API behavior, deployment, or user-facing features.

Do not describe planned behavior as implemented.
