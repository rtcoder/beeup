import { BEST_SCORE_KEY } from './constants';

export function loadBestScore(): number {
  try {
    const value = window.localStorage.getItem(BEST_SCORE_KEY);
    const score = value === null ? 0 : Number.parseInt(value, 10);
    return Number.isFinite(score) && score > 0 ? score : 0;
  } catch {
    return 0;
  }
}

export function saveBestScore(score: number): void {
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(Math.max(0, Math.floor(score))));
  } catch {
    // Some embedded contexts block localStorage. The game should still work.
  }
}
