# Task: Add Devvit Template Files [done]

## Goal

Bring the project in line with the current Devvit React template.

## Scope

- Add or adapt Devvit config files.
- Preserve existing client source structure where possible.
- Do not guess obsolete Devvit formats.

## Acceptance Criteria

- Devvit CLI recognizes the project.
- Local app source remains under `src/client`.
- Existing Vite build still works or has a documented replacement.

## Status

Done in current MVP.

## Notes

- Added `devvit.json` using the current Devvit Web `post` and `server` sections.
- Added `@devvit/start`, `@devvit/web`, `devvit`, Hono, and the Hono Node server package.
- Added Devvit scripts while preserving `dev:local` for quick Vite iteration.
- Confirmed the Devvit CLI recognizes the project and reports version `0.12.24`.
