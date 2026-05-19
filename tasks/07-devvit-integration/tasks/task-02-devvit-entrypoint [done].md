# Task: Configure Devvit Web Entrypoint [done]

## Goal

Expose Bee Up! as a Devvit Web entrypoint.

## Scope

- Configure default entrypoint for the client app.
- Match the actual Devvit template format.
- Avoid hardcoded assumptions from pseudocode.

## Acceptance Criteria

- Devvit loads `src/client/App.tsx` or the correct bundled equivalent.
- The custom post opens the Bee Up! UI.

## Status

Done in current MVP.

## Notes

- Added `src/client/game.html`.
- Configured `devvit.json` with `post.dir` as `dist/client`.
- Configured the default entrypoint to load `game.html`.
- Confirmed `vite build` emits `dist/client/game.html`.
