import React from 'react';
import { TYPE, STATE, COLORS, HEX_R } from '../../constants.js';
import { isAliveEnemy } from '../../logic/combatResolver.js';

// SVG icon paths for enemy types (no emoji)
const ICONS = {
  [TYPE.FIREWALL]: (
    <g>
      {/* Shield shape */}
      <path
        d="M0,-10 L8,-6 L8,4 Q0,10 0,10 Q0,10 -8,4 L-8,-6 Z"
        fill="none"
        stroke={COLORS.ENEMY_BORDER}
        strokeWidth={1.5}
      />
      <line x1="0" y1="-6" x2="0" y2="6" stroke={COLORS.ENEMY_BORDER} strokeWidth={1} />
      <line x1="-5" y1="0" x2="5" y2="0" stroke={COLORS.ENEMY_BORDER} strokeWidth={1} />
    </g>
  ),
  [TYPE.ACCESS_DENIED]: (
    <g>
      {/* Lock shape */}
      <rect x="-6" y="-2" width="12" height="9" rx="1" fill="none" stroke={COLORS.ENEMY_BORDER} strokeWidth={1.5} />
      <path d="M-4,-2 L-4,-6 Q0,-10 4,-6 L4,-2" fill="none" stroke={COLORS.ENEMY_BORDER} strokeWidth={1.5} />
      <circle cx="0" cy="3" r="2" fill={COLORS.ENEMY_BORDER} />
    </g>
  ),
  [TYPE.SUPPRESSOR]: (
    <g>
      {/* Wave / suppressor icon */}
      <path d="M-8,0 Q-4,-6 0,0 Q4,6 8,0" fill="none" stroke={COLORS.ENEMY_BORDER} strokeWidth={1.5} />
      <path d="M-5,3 Q-2,-2 1,3 Q4,8 7,3" fill="none" stroke={COLORS.ENEMY_BORDER} strokeWidth={1} opacity={0.6} />
    </g>
  ),
  [TYPE.SECONDARY_VECTOR]: (
    <g>
      {/* Arrow / vector icon */}
      <line x1="-8" y1="0" x2="8" y2="0" stroke={COLORS.ENEMY_BORDER} strokeWidth={1.5} />
      <polyline points="4,-4 8,0 4,4" fill="none" stroke={COLORS.ENEMY_BORDER} strokeWidth={1.5} />
    </g>
  ),
};

export default function EnemyOverlay({ nodes }) {
  const enemyNodes = [];
  for (const [, node] of nodes) {
    if (node.state === STATE.REVEALED && (isAliveEnemy(node) || node.type === TYPE.CORE)) {
      enemyNodes.push(node);
    }
  }

  return (
    <g>
      {enemyNodes.map(node => {
        const { x, y } = node._pixel;
        const icon = ICONS[node.type];
        const showHpBar = node.hp !== undefined && node.maxHp !== undefined;

        return (
          <g key={node.id} transform={`translate(${x}, ${y})`} pointerEvents="none">
            {/* Icon in upper area of circle */}
            {icon && (
              <g transform="translate(0, -8)">
                {icon}
              </g>
            )}

            {/* STR label */}
            {node.str !== undefined && (
              <text
                x={-HEX_R + 6}
                y={-HEX_R + 10}
                fontSize={7}
                fill={COLORS.TEXT_WARN}
                fontFamily="'Courier New', monospace"
              >
                S:{node.str}
              </text>
            )}

            {/* HP label */}
            {node.hp !== undefined && (
              <text
                x={HEX_R - 6}
                y={-HEX_R + 10}
                fontSize={7}
                fill={COLORS.TEXT_DANGER}
                fontFamily="'Courier New', monospace"
                textAnchor="end"
              >
                {node.hp}
              </text>
            )}

            {/* HP bar (below circle, drawn here for enemy overlay) */}
            {showHpBar && isAliveEnemy(node) && (
              <>
                <rect
                  x={-HEX_R + 4}
                  y={HEX_R + 4}
                  width={HEX_R * 2 - 8}
                  height={3}
                  fill="#1a0000"
                  rx={1}
                />
                <rect
                  x={-HEX_R + 4}
                  y={HEX_R + 4}
                  width={Math.max(0, (HEX_R * 2 - 8) * (node.hp / node.maxHp))}
                  height={3}
                  fill={node.hp / node.maxHp > 0.5 ? COLORS.TEXT_DANGER : '#ff6600'}
                  rx={1}
                />
              </>
            )}
          </g>
        );
      })}
    </g>
  );
}
