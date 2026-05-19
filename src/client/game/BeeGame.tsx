import { useCallback, useEffect, useRef, useState } from 'react';
import { GAME_HEIGHT, GAME_WIDTH } from './engine/constants';
import { createInputState, getCanvasX } from './engine/input';
import { updateGame, snapshotScore } from './engine/physics';
import { renderGame, setupCanvas } from './engine/rendering';
import { createInitialState, resetForPlay } from './engine/state';
import { loadBestScore, saveBestScore } from './engine/storage';
import type { LeaderboardEntry, LeaderboardResponse, ScorePayload, ScoreResponse } from '../../shared/game';
import type { GameState, GameStatus, InputState, ScoreSnapshot } from './engine/types';

export function BeeGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<GameState>(createInitialState(0));
  const inputRef = useRef<InputState>(createInputState());
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const uiUpdateRef = useRef<number>(0);
  const submittedRunRef = useRef<number | null>(null);

  const [status, setStatus] = useState<GameStatus>('menu');
  const [score, setScore] = useState<ScoreSnapshot>(() => snapshotScore(stateRef.current));
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardStatus, setLeaderboardStatus] = useState<'idle' | 'saving' | 'error'>('idle');

  const syncScore = useCallback(() => {
    setScore(snapshotScore(stateRef.current));
  }, []);

  const triggerHaptic = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const startGame = useCallback(() => {
    resetForPlay(stateRef.current, stateRef.current.bestScore);
    inputRef.current = createInputState();
    submittedRunRef.current = null;
    setLeaderboardStatus('idle');
    setStatus('playing');
    syncScore();
  }, [syncScore]);

  const loadLeaderboard = useCallback(async () => {
    try {
      const response = await fetch('/api/leaderboard');
      if (!response.ok) return;
      const data = (await response.json()) as LeaderboardResponse;
      if (data.ok) setLeaderboard(data.leaderboard);
    } catch {
      // Local Vite development has no Devvit server; keep the local-only experience quiet.
    }
  }, []);

  const submitScore = useCallback(async (snapshot: ScoreSnapshot) => {
    if (submittedRunRef.current === snapshot.elapsedMs) return;
    submittedRunRef.current = snapshot.elapsedMs;
    setLeaderboardStatus('saving');

    const payload: ScorePayload = {
      score: snapshot.score,
      honeyScore: snapshot.honeyScore,
      distanceScore: snapshot.distanceScore,
      elapsedMs: snapshot.elapsedMs,
    };

    try {
      const response = await fetch('/api/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Score submission failed');

      const data = (await response.json()) as ScoreResponse;
      if (data.ok) {
        setLeaderboard(data.leaderboard);
        setLeaderboardStatus('idle');
      }
    } catch {
      setLeaderboardStatus('error');
    }
  }, []);

  const finishGame = useCallback(() => {
    const state = stateRef.current;
    state.status = 'gameOver';
    if (state.score > state.bestScore) {
      state.bestScore = state.score;
      saveBestScore(state.bestScore);
    }
    const finalScore = snapshotScore(state);
    triggerHaptic([45, 35, 70]);
    setStatus('gameOver');
    setScore(finalScore);
    void submitScore(finalScore);
  }, [submitScore, triggerHaptic]);

  useEffect(() => {
    stateRef.current.bestScore = loadBestScore();
    syncScore();
    void loadLeaderboard();
  }, [loadLeaderboard, syncScore]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const initialCtx = setupCanvas(canvas);
    if (!initialCtx) return undefined;
    let ctx = initialCtx;

    const resizeObserver = new ResizeObserver(() => {
      const nextCtx = setupCanvas(canvas);
      if (!nextCtx) return;
      ctx = nextCtx;
      renderGame(ctx, stateRef.current);
    });
    resizeObserver.observe(canvas);

    const loop = (now: number) => {
      const lastTime = lastTimeRef.current || now;
      const deltaMs = Math.min(32, now - lastTime);
      lastTimeRef.current = now;

      const previousHoneyScore = stateRef.current.honeyScore;
      const hitSpike = updateGame(stateRef.current, inputRef.current, deltaMs);
      if (stateRef.current.honeyScore > previousHoneyScore) {
        triggerHaptic(18);
      }
      renderGame(ctx, stateRef.current);

      if (hitSpike) {
        finishGame();
      } else if (stateRef.current.status === 'playing' && now - uiUpdateRef.current > 120) {
        uiUpdateRef.current = now;
        syncScore();
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    renderGame(ctx, stateRef.current);
    frameRef.current = requestAnimationFrame(loop);

    return () => {
      resizeObserver.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [finishGame, syncScore, triggerHaptic]);

  useEffect(() => {
    const isMovementKey = (event: KeyboardEvent) =>
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight' ||
      event.key.toLowerCase() === 'a' ||
      event.key.toLowerCase() === 'd';

    const onKeyDown = (event: KeyboardEvent) => {
      if (isMovementKey(event)) event.preventDefault();
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') inputRef.current.left = true;
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') inputRef.current.right = true;
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (isMovementKey(event)) event.preventDefault();
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') inputRef.current.left = false;
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') inputRef.current.right = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const onPointerDown = (event: PointerEvent) => {
      canvas.setPointerCapture(event.pointerId);
      inputRef.current.pointerActive = true;
      inputRef.current.targetX = getCanvasX(event, canvas);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!inputRef.current.pointerActive) return;
      inputRef.current.targetX = getCanvasX(event, canvas);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      inputRef.current.pointerActive = false;
      inputRef.current.targetX = null;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
    };
  }, []);

  return (
    <main className="game-shell">
      <section className="game-frame" aria-label="Bee Up game">
        <div className="hud" aria-live="polite">
          <div>
            <span>Score</span>
            <strong>{score.score}</strong>
          </div>
          <div>
            <span>Best</span>
            <strong>{score.bestScore}</strong>
          </div>
        </div>

        <div className="canvas-wrap">
          <canvas
            ref={canvasRef}
            className="game-canvas"
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            aria-label="Bee Up play field"
          />

          {status === 'menu' && (
            <div className="overlay">
              <h1>Bee Up!</h1>
              <p>Collect honey. Dodge thorns. Fly as high as you can.</p>
              <button type="button" onClick={startGame}>
                Start
              </button>
              <small>Use A/D, arrow keys, or drag on the canvas.</small>
            </div>
          )}

          {status === 'gameOver' && (
            <div className="overlay">
              <h1>Game Over</h1>
              <div className="result-grid">
                <span>Final score</span>
                <strong>{score.score}</strong>
                <span>Honey</span>
                <strong>{score.honeyScore}</strong>
                <span>Best</span>
                <strong>{score.bestScore}</strong>
              </div>
              <button type="button" onClick={startGame}>
                Play again
              </button>
              <div className="leaderboard" aria-label="Leaderboard">
                <h2>Leaderboard</h2>
                {leaderboard.length > 0 ? (
                  <ol>
                    {leaderboard.slice(0, 5).map((entry) => (
                      <li key={`${entry.createdAt}-${entry.rank}`}>
                        <span>
                          {entry.rank}. {entry.username}
                        </span>
                        <strong>{entry.score}</strong>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p>{leaderboardStatus === 'saving' ? 'Saving score...' : 'No scores yet'}</p>
                )}
                {leaderboardStatus === 'error' && <small>Leaderboard unavailable in local mode.</small>}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
