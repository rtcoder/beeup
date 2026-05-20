export type GameStatus = 'menu' | 'playing' | 'gameOver';

export type EntityType = 'honey' | 'spike' | 'powerUp';

export type HoneyVariant = 'small' | 'large' | 'golden';
export type PowerUpType = 'shield' | 'magnet';

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
  honeyVariant?: HoneyVariant;
  powerUpType?: PowerUpType;
  speedY?: number;
  points?: number;
  nearMissAwarded?: boolean;
}

export interface GameState {
  status: GameStatus;
  player: Player;
  entities: Entity[];
  score: number;
  bestScore: number;
  distanceScore: number;
  honeyScore: number;
  bonusScore: number;
  elapsedMs: number;
  worldSpeed: number;
  spawnTimerMs: number;
  spawnIntervalMs: number;
  difficulty: number;
  nextEntityId: number;
  cloudOffset: number;
  lastSpikeRowElapsedMs: number;
  shieldCharges: number;
  magnetTimeMs: number;
  comboCount: number;
  comboTimerMs: number;
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
  bonusScore: number;
  elapsedMs: number;
  shieldCharges: number;
  magnetTimeMs: number;
  comboCount: number;
}
