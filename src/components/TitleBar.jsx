import React from 'react';
import { PHASE, DIFFICULTY, COLORS } from '../constants.js';

const DIFF_KEYS = ['rookie', 'standard', 'elite'];

export default function TitleBar({ phase, difficultyKey, stats, onNewGame }) {
  const isPlaying = phase === PHASE.PLAYING;

  return (
    <div style={{
      display:         'flex',
      alignItems:      'center',
      gap:             16,
      padding:         '6px 16px',
      background:      '#04080d',
      borderBottom:    `1px solid ${COLORS.HUD_BORDER}`,
      flexShrink:      0,
    }}>
      {/* Logo / Title */}
      <div style={{
        color:        COLORS.TEXT_PRIMARY,
        fontSize:     13,
        fontWeight:   'bold',
        letterSpacing: 4,
        flexShrink:   0,
      }}>
        EVE:HACK
      </div>

      <div style={{ width: 1, height: 20, background: COLORS.HUD_BORDER, flexShrink: 0 }} />

      {/* Difficulty buttons */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ color: COLORS.TEXT_DIM, fontSize: 9, letterSpacing: 2 }}>DIFFICULTY</span>
        {DIFF_KEYS.map(key => {
          const isActive = key === difficultyKey;
          return (
            <button
              key={key}
              onClick={() => onNewGame(key)}
              style={{
                padding:       '3px 10px',
                background:    isActive ? '#0a1a28' : 'transparent',
                border:        `1px solid ${isActive ? COLORS.TEXT_PRIMARY : COLORS.HUD_BORDER}`,
                color:         isActive ? COLORS.TEXT_PRIMARY : COLORS.TEXT_DIM,
                fontSize:      9,
                letterSpacing: 1,
                cursor:        'pointer',
                fontFamily:    "'Courier New', monospace",
                transition:    'all 0.15s',
              }}
            >
              {DIFFICULTY[key].label.toUpperCase()}
            </button>
          );
        })}
      </div>

      <div style={{ width: 1, height: 20, background: COLORS.HUD_BORDER, flexShrink: 0 }} />

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {DIFF_KEYS.map(key => {
          const s = stats?.[key] ?? { wins: 0, losses: 0 };
          return (
            <div key={key} style={{ display: 'flex', gap: 4, alignItems: 'baseline' }}>
              <span style={{ color: COLORS.TEXT_DIM, fontSize: 8, letterSpacing: 1 }}>
                {DIFFICULTY[key].label.substring(0,3).toUpperCase()}:
              </span>
              <span style={{ color: COLORS.TEXT_SUCCESS, fontSize: 9 }}>{s.wins}W</span>
              <span style={{ color: COLORS.TEXT_DIM, fontSize: 9 }}>/</span>
              <span style={{ color: COLORS.TEXT_DANGER, fontSize: 9 }}>{s.losses}L</span>
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      {/* Phase indicator */}
      <div style={{
        color:        phase === PHASE.WIN  ? COLORS.TEXT_SUCCESS
                    : phase === PHASE.LOSE ? COLORS.TEXT_DANGER
                    :                        COLORS.TEXT_DIM,
        fontSize:     9,
        letterSpacing: 3,
        flexShrink:   0,
      }}>
        {phase === PHASE.WIN  ? '● HACK SUCCESSFUL'
       : phase === PHASE.LOSE ? '● SYSTEM REJECTED'
       :                        '● HACKING...'}
      </div>

      {/* New game button */}
      <button
        onClick={() => onNewGame(difficultyKey)}
        style={{
          padding:       '4px 16px',
          background:    '#0a2010',
          border:        `1px solid ${COLORS.TEXT_SUCCESS}`,
          color:         COLORS.TEXT_SUCCESS,
          fontSize:      10,
          letterSpacing: 2,
          cursor:        'pointer',
          fontFamily:    "'Courier New', monospace",
          flexShrink:    0,
          transition:    'all 0.15s',
        }}
        onMouseEnter={e => e.target.style.background = '#142c1a'}
        onMouseLeave={e => e.target.style.background = '#0a2010'}
      >
        INITIATE HACK
      </button>
    </div>
  );
}
