# Bee Up!

Bee Up! is a tiny arcade game for Reddit posts. You guide a bee through a bright sky, collect honey, grab helpful power-ups, and dodge dark thorns while the game gets faster.

The game is designed for short, replayable sessions directly inside a Reddit custom post. It works with keyboard controls on desktop and drag controls on touch devices.

## What Players Do

- Move the bee left and right.
- Collect small, large, and golden honey.
- Pick up shields to survive one thorn hit.
- Pick up magnets to pull nearby honey toward the bee.
- Keep honey streaks alive for combo bonuses.
- Fly close to thorns for near-miss bonus points.
- Try to reach the top of the leaderboard.

## Community And Data

Bee Up! stores leaderboard entries with Devvit Redis so players can compare scores on a post. A submitted score includes the final score, honey points, distance points, bonus points, elapsed time, and the Reddit username returned by Devvit.

The app does not use external analytics, ads, or third-party asset servers. Game visuals are drawn locally with Canvas 2D.

## Current MVP

- start and game over screens
- responsive canvas using a fixed `390 x 700` game space
- keyboard controls with `A`/`D` and arrow keys
- pointer/touch drag controls
- lane-based honey and thorn spawning
- small, large, and golden honey variants
- shield and magnet power-ups
- combo and near-miss bonus scoring
- top-down bee rendering with animated wings
- canvas-drawn thorn obstacles
- AABB collisions
- time, honey, and bonus score
- local best score
- Redis-backed leaderboard in Devvit
- lightweight haptic feedback for honey and game over where supported
- score API validation and basic anti-cheat limits
- task backlog in `tasks/`

## Gameplay

The bee stays in the lower part of the canvas while the world scrolls downward. Survive as long as possible, collect honey, use power-ups, and dodge thorns.

Honey variants:

- small honey: `15` points
- large honey: `35` points
- golden honey: `75` points

Power-ups:

- shield: absorbs one thorn hit
- magnet: temporarily pulls nearby honey toward the bee

Bonuses:

- honey collected in quick succession builds a combo
- close thorn dodges award a near-miss bonus

The game uses a fixed internal playfield of `390 x 700` and scales the canvas responsively for desktop and mobile.

## Controls

- `A` / `ArrowLeft`: move left
- `D` / `ArrowRight`: move right
- pointer or touch drag: move toward the pointer

## Commands

```bash
npm install
npm run dev        # Devvit playtest; requires Reddit CLI authentication
npm run dev:local  # Local Vite preview for quick browser iteration
npm run build
npm run lint
npm run typecheck
npm run login
```

## Project Structure

```txt
src/
  client/
    App.tsx
    styles.css
    game/
      BeeGame.tsx
      engine/
  server/
    routes/
  shared/
tasks/
```

## Devvit

The project includes a Devvit Web configuration:

- `devvit.json` defines the custom post entrypoint at `dist/client/game.html`.
- `src/client/game.html` is the Devvit/Vite HTML entrypoint for the React game.
- `src/server/index.ts` starts a Hono server through Devvit Web.
- `src/server/core/post.ts` creates a Bee Up! custom post through `reddit.submitCustomPost`.
- The subreddit menu item `Create Bee Up! post` calls `/internal/menu/post-create`.
- `POST /api/score` validates and stores final scores.
- `GET /api/leaderboard` returns the top scores for the current post.

`npm run dev` starts `devvit playtest` and will prompt for Reddit authentication if the CLI is not logged in.

## Leaderboard

Scores are stored in Devvit Redis sorted sets. The leaderboard is scoped by `context.postId` when available, with a global fallback for non-post contexts.

Score submissions are intentionally conservative:

- all score fields must be finite non-negative integers
- final score must match `honeyScore + distanceScore + bonusScore` within a small rounding tolerance
- elapsed time is capped at ten minutes
- max possible score is capped by elapsed time plus generous honey and bonus allowances
