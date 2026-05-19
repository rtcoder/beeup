# Task: Browser Smoke Test [done]

## Goal

Verify the game visually and interactively in a browser.

## Scope

- Open local app.
- Confirm menu renders.
- Start gameplay.
- Confirm canvas is non-empty.
- Check game over and restart.

## Acceptance Criteria

- No console errors during smoke test.
- Canvas renders background, bee, honey, and spikes.
- Score changes while playing.

## Status

Done in current MVP.

## Notes

- Verified menu render and `Start`.
- Verified live gameplay with visible bee, honey, thorns, background, and score.
- Forced a thorn collision through browser interaction.
- Verified `Game Over` overlay and final score display.
- Verified `Play again` restart returns to active gameplay.
- Verified no browser console errors during the smoke test.
