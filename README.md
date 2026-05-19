# Bee Up!

Tiny Reddit Devvit Web game prototype built with React, TypeScript, Vite, and Canvas 2D.

## Current MVP

- start and game over screens
- responsive canvas using a fixed `390 x 700` game space
- keyboard controls with `A`/`D` and arrow keys
- pointer/touch drag controls
- lane-based honey and thorn spawning
- small, large, and golden honey variants
- top-down bee rendering with animated wings
- canvas-drawn thorn obstacles
- AABB collisions
- time and honey score
- local best score
- lightweight haptic feedback for honey and game over where supported
- score API validation stub
- task backlog in `tasks/`

## Gameplay

The bee stays in the lower part of the canvas while the world scrolls downward. Survive as long as possible, collect honey, and dodge thorns.

Honey variants:

- small honey: `15` points
- large honey: `35` points
- golden honey: `75` points

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

`npm run dev` starts `devvit playtest` and will prompt for Reddit authentication if the CLI is not logged in.
