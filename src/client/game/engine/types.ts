export type GameStatus = 'menu' | 'playing' | 'gameOver';

export type EntityType = 'honey' | 'spike';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Player extends Rect {
  velocityX: number;
}

export interface Entity extends Rect {
  id: string;
  type: EntityType;
  speedY?: number;
  points?: number;
}

export interface GameState {
  status: GameStatus;
  player: Player;
  entities: Entity[];
  score: number;
  bestScore: number;
  distanceScore: number;
  honeyScore: number;
  elapsedMs: number;
  worldSpeed: number;
  spawnTimerMs: number;
  spawnIntervalMs: number;
  difficulty: number;
  nextEntityId: number;
  cloudOffset: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  pointerActive: boolean;
  targetX: number | null;
}

export interface ScoreSnapshot {
  score: number;
  bestScore: number;
  honeyScore: number;
  distanceScore: number;
  elapsedMs: number;
}
