# Task: Implement Animation Loop [done]

## Goal

Run the game with `requestAnimationFrame`.

## Scope

- Track delta time.
- Clamp delta to avoid tab-switch jumps.
- Render every frame.
- Clean up animation frame on unmount.

## Acceptance Criteria

- Gameplay updates smoothly.
- Returning to the tab does not teleport entities.
- No animation frame leak after unmount.

## Status

Done in current MVP.
