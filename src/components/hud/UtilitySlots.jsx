import React from 'react';
import { TYPE, COLORS } from '../../constants.js';

// Flat-top hexagon points for a given radius
function hexPoints(r) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angleDeg = 60 * i; // flat-top: start at 0°
    const rad = (Math.PI / 180) * angleDeg;
    pts.push(`${r * Math.cos(rad)},${r * Math.sin(rad)}`);
  }
  return pts.join(' ');
}

const SLOT_R = 28;
const SLOT_LABELS = {
  [TYPE.KERNEL_ROT]:       { short: 'KR', label: 'Kernel Rot',       color: '#ff6600' },
  [TYPE.RESTORATION_NODE]: { short: 'RN', label: 'Restoration Node', color: COLORS.UTILITY_BORDER },
};

export default function UtilitySlots({ utilities, activeUtility, onUseUtility, onCancelUtility }) {
  const slots = [0, 1, 2];

  return (
    <div style={{
      display:        'flex',
      alignItems:     'center',
      gap:            12,
      padding:        '0 8px',
    }}>
      <span style={{
        color:      COLORS.TEXT_DIM,
        fontSize:   10,
        letterSpacing: 2,
        writingMode: 'vertical-rl',
        transform:  'rotate(180deg)',
      }}>
        UTILS
      </span>

      {slots.map(i => {
        const utilType = utilities[i] ?? null;
        const isActive = activeUtility === i;
        const info = utilType ? SLOT_LABELS[utilType] : null;

        const fill    = isActive  ? '#332800'
                      : utilType  ? COLORS.UTILITY_SLOT_FILLED
                      :             COLORS.UTILITY_SLOT_EMPTY;
        const stroke  = isActive  ? '#ffcc00'
                      : utilType  ? COLORS.UTILITY_BORDER
                      :             COLORS.HUD_BORDER;

        return (
          <div
            key={i}
            title={info?.label ?? 'Empty slot'}
            style={{ cursor: utilType ? 'pointer' : 'default' }}
            onClick={() => {
              if (!utilType) return;
              if (isActive) { onCancelUtility(); return; }
              onUseUtility(i);
            }}
          >
            <svg
              width={SLOT_R * 2 + 4}
              height={SLOT_R * 2 + 4}
              viewBox={`${-SLOT_R - 2} ${-SLOT_R - 2} ${SLOT_R * 2 + 4} ${SLOT_R * 2 + 4}`}
              style={{ display: 'block' }}
            >
              <polygon
                points={hexPoints(SLOT_R)}
                fill={fill}
                stroke={stroke}
                strokeWidth={isActive ? 2 : 1.5}
              />

              {info && (
                <>
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    y={-6}
                    fill={info.color}
                    fontSize={12}
                    fontWeight="bold"
                    fontFamily="'Courier New', monospace"
                  >
                    {info.short}
                  </text>
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    y={9}
                    fill={COLORS.TEXT_DIM}
                    fontSize={7}
                    fontFamily="'Courier New', monospace"
                  >
                    {isActive ? 'ACTIVE' : 'CLICK'}
                  </text>
                </>
              )}

              {!info && (
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={COLORS.TEXT_DIM}
                  fontSize={18}
                  fontFamily="'Courier New', monospace"
                >
                  –
                </text>
              )}
            </svg>
          </div>
        );
      })}
    </div>
  );
}
