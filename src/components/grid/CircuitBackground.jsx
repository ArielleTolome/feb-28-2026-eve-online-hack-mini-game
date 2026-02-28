import React, { memo } from 'react';
import { CANVAS_W, CANVAS_H, COLORS } from '../../constants.js';

/**
 * Static decorative circuit trace background.
 * Uses React.memo — only renders once.
 */
const CircuitBackground = memo(function CircuitBackground() {
  // Generate deterministic circuit traces
  const traces = generateTraces();

  return (
    <g>
      {/* Base grid dots */}
      {traces.dots.map((d, i) => (
        <circle
          key={`dot-${i}`}
          cx={d.x} cy={d.y}
          r={1}
          fill={COLORS.CIRCUIT}
          opacity={0.5}
        />
      ))}

      {/* Circuit lines */}
      {traces.lines.map((l, i) => (
        <polyline
          key={`line-${i}`}
          points={l.points}
          fill="none"
          stroke={COLORS.CIRCUIT}
          strokeWidth={0.8}
          opacity={0.35}
        />
      ))}

      {/* Corner accent squares */}
      {traces.accents.map((a, i) => (
        <rect
          key={`accent-${i}`}
          x={a.x - 3} y={a.y - 3}
          width={6} height={6}
          fill="none"
          stroke={COLORS.TEXT_DIM}
          strokeWidth={0.8}
          opacity={0.4}
          transform={`rotate(45, ${a.x}, ${a.y})`}
        />
      ))}
    </g>
  );
});

export default CircuitBackground;

function generateTraces() {
  const dots = [];
  const lines = [];
  const accents = [];

  // Grid dots every 40px
  for (let x = 20; x < CANVAS_W; x += 40) {
    for (let y = 20; y < CANVAS_H; y += 40) {
      dots.push({ x, y });
    }
  }

  // Horizontal traces
  const hSteps = Math.floor(CANVAS_W / 80);
  for (let i = 0; i < 8; i++) {
    const y = 30 + i * (CANVAS_H / 8);
    const startX = Math.floor(Math.random() * 40);  // static: use seeded
    const pts = [];
    let x = startX;
    while (x < CANVAS_W) {
      pts.push(`${x},${Math.round(y)}`);
      x += 40 + (i * 7 % 40);
      if (Math.random() < 0.3) {
        // jog up or down
        const jog = (i % 2 === 0 ? -20 : 20);
        pts.push(`${x},${Math.round(y + jog)}`);
        pts.push(`${x + 20},${Math.round(y + jog)}`);
        pts.push(`${x + 20},${Math.round(y)}`);
        x += 20;
      }
    }
    if (pts.length > 1) lines.push({ points: pts.join(' ') });
  }

  // Vertical traces
  for (let i = 0; i < 6; i++) {
    const x = 60 + i * (CANVAS_W / 6);
    const pts = [];
    let y = 0;
    while (y < CANVAS_H) {
      pts.push(`${Math.round(x)},${y}`);
      y += 40 + (i * 11 % 30);
    }
    if (pts.length > 1) lines.push({ points: pts.join(' ') });
  }

  // Corner accents
  for (let i = 0; i < 12; i++) {
    accents.push({
      x: (i * 97) % CANVAS_W,
      y: (i * 61 + 30) % CANVAS_H,
    });
  }

  return { dots, lines, accents };
}
