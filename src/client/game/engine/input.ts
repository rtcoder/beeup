import { GAME_WIDTH } from './constants';
import type { InputState } from './types';

export function createInputState(): InputState {
  return {
    left: false,
    right: false,
    pointerActive: false,
    targetX: null,
  };
}

export function getCanvasX(event: PointerEvent, canvas: HTMLCanvasElement): number {
  const rect = canvas.getBoundingClientRect();
  return ((event.clientX - rect.left) / rect.width) * GAME_WIDTH;
}
