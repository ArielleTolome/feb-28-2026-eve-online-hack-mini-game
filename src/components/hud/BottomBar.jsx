import React from 'react';
import { COLORS, PHASE } from '../../constants.js';
import ArcGauge from './ArcGauge.jsx';
import UtilitySlots from './UtilitySlots.jsx';
import ActivityLog from './ActivityLog.jsx';

export default function BottomBar({ state, onEndTurn, onUseUtility, onCancelUtility }) {
  const { playerHp, playerMaxHp, utilities, activeUtility, logs, phase, turn } = state;
  const isPlaying = phase === PHASE.PLAYING;

  return (
    <div style={{
      height:        116,
      flexShrink:    0,
      display:       'flex',
      alignItems:    'stretch',
      background:    COLORS.HUD_BG,
      borderTop:     `1px solid ${COLORS.HUD_BORDER}`,
    }}>
      {/* Left: Coherence gauge */}
      <div style={{
        width:          136,
        flexShrink:     0,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        borderRight:    `1px solid ${COLORS.HUD_BORDER}`,
        padding:        '4px 0',
      }}>
        <ArcGauge hp={playerHp} maxHp={playerMaxHp} size={108} />
      </div>

      {/* Center: Utility slots */}
      <div style={{
        flexShrink:     0,
        display:        'flex',
        flexDirection:  'column',
        justifyContent: 'center',
        padding:        '0 12px',
        borderRight:    `1px solid ${COLORS.HUD_BORDER}`,
      }}>
        <div style={{
          color:        COLORS.TEXT_DIM,
          fontSize:     9,
          letterSpacing: 2,
          marginBottom: 6,
          textAlign:    'center',
        }}>
          UTILITIES ({utilities.length}/3)
        </div>
        <UtilitySlots
          utilities={utilities}
          activeUtility={activeUtility}
          onUseUtility={onUseUtility}
          onCancelUtility={onCancelUtility}
        />
      </div>

      {/* Center-right: Activity log */}
      <ActivityLog logs={logs} />

      {/* Right: End turn + turn counter */}
      <div style={{
        width:          100,
        flexShrink:     0,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            8,
        padding:        '8px',
        borderLeft:     `1px solid ${COLORS.HUD_BORDER}`,
      }}>
        <div style={{
          color:        COLORS.TEXT_DIM,
          fontSize:     9,
          letterSpacing: 2,
        }}>
          TURN {turn}
        </div>
        <button
          onClick={isPlaying ? onEndTurn : undefined}
          disabled={!isPlaying}
          style={{
            width:         80,
            padding:       '8px 4px',
            background:    isPlaying ? '#0a1a10' : '#080e14',
            border:        `1px solid ${isPlaying ? COLORS.TEXT_SUCCESS : COLORS.TEXT_DIM}`,
            color:         isPlaying ? COLORS.TEXT_SUCCESS : COLORS.TEXT_DIM,
            fontSize:      9,
            letterSpacing: 2,
            cursor:        isPlaying ? 'pointer' : 'not-allowed',
            fontFamily:    "'Courier New', monospace",
            transition:    'all 0.15s',
          }}
          onMouseEnter={e => {
            if (isPlaying) e.target.style.background = '#122018';
          }}
          onMouseLeave={e => {
            if (isPlaying) e.target.style.background = '#0a1a10';
          }}
        >
          END TURN
        </button>

        {activeUtility !== null && (
          <button
            onClick={onCancelUtility}
            style={{
              width:         80,
              padding:       '4px',
              background:    '#1a0a00',
              border:        `1px solid #ff6600`,
              color:         '#ff6600',
              fontSize:      9,
              letterSpacing: 1,
              cursor:        'pointer',
              fontFamily:    "'Courier New', monospace",
            }}
          >
            CANCEL
          </button>
        )}
      </div>
    </div>
  );
}
