# Task: Add Create Custom Post Flow [done]

## Goal

Allow the app to create a Bee Up! Reddit custom post.

## Scope

- Add `submitCustomPost` integration.
- Set title and splash metadata.
- Include minimal `postData` with version.

## Acceptance Criteria

- A developer can create a Bee Up! custom post.
- Splash screen copy matches the game.
- The created post launches the game entrypoint.

## Status

Done in current MVP.

## Notes

- Added `src/server/core/post.ts` with `reddit.submitCustomPost`.
- Added a subreddit moderator menu item to create a Bee Up! post.
- Added `/internal/menu/post-create` on the Devvit/Hono server.
- Included `postData.version` and old Reddit text fallback.
