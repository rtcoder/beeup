import {
  GAME_HEIGHT,
  GAME_WIDTH,
  INITIAL_SPAWN_INTERVAL_MS,
  INITIAL_WORLD_SPEED,
  PLAYER_HEIGHT,
  PLAYER_WIDTH,
} from './constants';
import type { GameState } from './types';

export function createInitialState(bestScore: number): GameState {
  return {
    status: 'menu',
    player: {
      x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2,
      y: GAME_HEIGHT * 0.72,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      velocityX: 0,
    },
    entities: [],
    score: 0,
    bestScore,
    distanceScore: 0,
    honeyScore: 0,
    elapsedMs: 0,
    worldSpeed: INITIAL_WORLD_SPEED,
    spawnTimerMs: 0,
    spawnIntervalMs: INITIAL_SPAWN_INTERVAL_MS,
    difficulty: 0,
    nextEntityId: 1,
    cloudOffset: 0,
  };
}

export function resetForPlay(state: GameState, bestScore: number): void {
  const next = createInitialState(bestScore);
  Object.assign(state, next, { status: 'playing' });
}
