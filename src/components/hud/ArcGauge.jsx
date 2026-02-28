import React from 'react';
import { COLORS } from '../../constants.js';

/**
 * SVG arc gauge for coherence HP.
 * Uses stroke-dasharray / stroke-dashoffset on a circle element.
 *
 * The arc goes from -210° to +30° (240° sweep), starting at bottom-left.
 * We rotate the circle so the arc starts at the correct angle.
 */
export default function ArcGauge({ hp, maxHp, size = 120 }) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.4;
  const strokeWidth = size * 0.07;

  const circumference = 2 * Math.PI * radius;
  // Arc sweep is 240 degrees = 2/3 of circumference
  const arcLength = (240 / 360) * circumference;
  const gapLength = circumference - arcLength;

  const ratio = maxHp > 0 ? Math.max(0, Math.min(1, hp / maxHp)) : 0;
  const filledLength = ratio * arcLength;

  // Color based on HP ratio
  let color;
  if (ratio > 0.6)      color = COLORS.COHERENCE_HIGH;
  else if (ratio > 0.3) color = COLORS.COHERENCE_MED;
  else                  color = COLORS.COHERENCE_LOW;

  // The circle is rotated so that the arc starts at bottom-left (-210° from top = 150° clockwise)
  // stroke-dasharray: [filled] [gap to end of arc] [rest of circumference hidden]
  // We use a trick: dasharray = [filledLength, circumference - filledLength]
  // Then rotate so gap starts at correct position

  // Rotation: we want arc to span from 150° to 390° (= 30°), top = 0°
  // So startAngle = 150°
  const startAngleDeg = 150;
  const rotation = startAngleDeg - 90; // SVG circles start at right (0°=3 o'clock), adjust to top

  return (
    <svg width={size} height={size} style={{ overflow: 'visible' }}>
      {/* Track (empty arc) */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={COLORS.HUD_BORDER}
        strokeWidth={strokeWidth}
        strokeDasharray={`${arcLength} ${gapLength}`}
        strokeLinecap="round"
        transform={`rotate(${rotation}, ${cx}, ${cy})`}
        style={{ transition: 'none' }}
      />

      {/* Filled arc */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${filledLength} ${circumference - filledLength}`}
        strokeLinecap="round"
        transform={`rotate(${rotation}, ${cx}, ${cy})`}
        style={{ transition: 'stroke-dasharray 0.3s ease, stroke 0.3s ease' }}
      />

      {/* Center text */}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontSize={size * 0.18}
        fontFamily="'Courier New', monospace"
        fontWeight="bold"
      >
        {hp}
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={COLORS.TEXT_DIM}
        fontSize={size * 0.09}
        fontFamily="'Courier New', monospace"
      >
        COHERENCE
      </text>

      {/* Min label */}
      <text
        x={cx - radius * 0.85}
        y={cy + radius * 0.65}
        textAnchor="middle"
        fill={COLORS.TEXT_DIM}
        fontSize={size * 0.08}
        fontFamily="'Courier New', monospace"
      >
        0
      </text>

      {/* Max label */}
      <text
        x={cx + radius * 0.85}
        y={cy + radius * 0.65}
        textAnchor="middle"
        fill={COLORS.TEXT_DIM}
        fontSize={size * 0.08}
        fontFamily="'Courier New', monospace"
      >
        {maxHp}
      </text>
    </svg>
  );
}
