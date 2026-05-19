import { GAME_HEIGHT, GAME_WIDTH } from './constants';
import type { Entity, GameState } from './types';

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number): void {
  ctx.save();
  ctx.globalAlpha = 0.42;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(x, y, 28 * scale, 14 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 22 * scale, y + 2 * scale, 22 * scale, 12 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 20 * scale, y + 4 * scale, 18 * scale, 10 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function renderBackground(ctx: CanvasRenderingContext2D, state: GameState): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
  gradient.addColorStop(0, '#9ddfff');
  gradient.addColorStop(0.55, '#d9f3ff');
  gradient.addColorStop(1, '#fff1bc');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  const offset = state.cloudOffset;
  drawCloud(ctx, 76, 120 + offset, 1);
  drawCloud(ctx, 306, 250 + offset, 0.82);
  drawCloud(ctx, 132, 470 + offset, 0.72);
  drawCloud(ctx, 266, 650 + offset, 0.95);
  drawCloud(ctx, 76, 120 + offset - GAME_HEIGHT, 1);
  drawCloud(ctx, 306, 250 + offset - GAME_HEIGHT, 0.82);
  drawCloud(ctx, 132, 470 + offset - GAME_HEIGHT, 0.72);
  drawCloud(ctx, 266, 650 + offset - GAME_HEIGHT, 0.95);
}

function renderHoney(ctx: CanvasRenderingContext2D, entity: Entity): void {
  const cx = entity.x + entity.width / 2;
  const cy = entity.y + entity.height / 2;
  const radius = entity.width / 2;
  const variant = entity.honeyVariant ?? 'large';
  const isGolden = variant === 'golden';
  const fill = isGolden ? '#ffe45c' : variant === 'small' ? '#ffca45' : '#f4a928';
  const stroke = isGolden ? '#99670a' : variant === 'small' ? '#a86b12' : '#87550e';
  const shine = isGolden ? 'rgba(255, 255, 255, 0.82)' : 'rgba(255, 255, 255, 0.62)';

  ctx.save();
  ctx.translate(cx, cy);
  ctx.shadowColor = isGolden ? 'rgba(255, 206, 40, 0.58)' : 'rgba(122, 89, 20, 0.22)';
  ctx.shadowBlur = isGolden ? 14 : 8;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = isGolden ? 3.5 : 3;
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const angle = Math.PI / 6 + (Math.PI * 2 * i) / 6;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.shadowColor = 'transparent';
  if (isGolden) {
    ctx.strokeStyle = 'rgba(255, 246, 148, 0.75)';
    ctx.lineWidth = 2;
    ctx.strokeRect(-radius * 0.5, -radius * 0.5, radius, radius);
  }

  ctx.strokeStyle = isGolden ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 244, 178, 0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-radius * 0.5, -radius * 0.12);
  ctx.lineTo(-radius * 0.08, radius * 0.34);
  ctx.lineTo(radius * 0.6, -radius * 0.42);
  ctx.stroke();

  ctx.fillStyle = shine;
  ctx.beginPath();
  ctx.ellipse(-radius * 0.34, -radius * 0.4, radius * 0.34, radius * 0.2, -0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function renderSpike(ctx: CanvasRenderingContext2D, entity: Entity): void {
  ctx.save();
  ctx.shadowColor = 'rgba(18, 28, 34, 0.24)';
  ctx.shadowBlur = 7;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#273640';
  ctx.strokeStyle = '#101820';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(entity.x + entity.width / 2, entity.y);
  ctx.lineTo(entity.x + entity.width, entity.y + entity.height);
  ctx.lineTo(entity.x, entity.y + entity.height);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#526570';
  ctx.beginPath();
  ctx.moveTo(entity.x + entity.width / 2, entity.y + 9);
  ctx.lineTo(entity.x + entity.width * 0.66, entity.y + entity.height - 7);
  ctx.lineTo(entity.x + entity.width * 0.37, entity.y + entity.height - 7);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(entity.x + entity.width / 2, entity.y + 7);
  ctx.lineTo(entity.x + entity.width * 0.42, entity.y + entity.height - 8);
  ctx.stroke();
  ctx.restore();
}

function renderBee(ctx: CanvasRenderingContext2D, state: GameState): void {
  const bee = state.player;
  const cx = bee.x + bee.width / 2;
  const cy = bee.y + bee.height / 2;
  const flap = Math.sin(state.elapsedMs / 60) * 3;

  ctx.save();
  ctx.translate(cx, cy);

  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.strokeStyle = 'rgba(120,170,190,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(-10, -18 + flap, 11, 7, -0.7, 0, Math.PI * 2);
  ctx.ellipse(10, -18 - flap, 11, 7, 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffd743';
  ctx.strokeStyle = '#604a20';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, bee.width / 2 - 2, bee.height / 2 - 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#312819';
  ctx.fillRect(-12, -15, 6, 30);
  ctx.fillRect(2, -17, 6, 34);

  ctx.fillStyle = '#1d1d1d';
  ctx.beginPath();
  ctx.arc(12, -5, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#3a2a16';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(17, -15);
  ctx.quadraticCurveTo(24, -25, 28, -18);
  ctx.moveTo(8, -16);
  ctx.quadraticCurveTo(10, -28, 15, -20);
  ctx.stroke();
  ctx.restore();
}

export function setupCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = GAME_WIDTH * dpr;
  canvas.height = GAME_HEIGHT * dpr;
  canvas.style.width = `${GAME_WIDTH}px`;
  canvas.style.height = `${GAME_HEIGHT}px`;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

export function renderGame(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  renderBackground(ctx, state);

  for (const entity of state.entities) {
    if (entity.type === 'honey') renderHoney(ctx, entity);
    if (entity.type === 'spike') renderSpike(ctx, entity);
  }

  renderBee(ctx, state);
}
