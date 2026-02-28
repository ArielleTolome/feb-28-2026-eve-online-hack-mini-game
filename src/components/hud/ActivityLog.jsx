import React, { useRef, useEffect } from 'react';
import { COLORS } from '../../constants.js';

export default function ActivityLog({ logs }) {
  const topRef = useRef(null);

  // Auto-scroll to top when new log entries arrive (newest-top means no scroll needed,
  // but keep ref in case we switch to newest-bottom later)
  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollTop = 0;
    }
  }, [logs.length]);

  return (
    <div style={{
      flex:        1,
      display:     'flex',
      flexDirection: 'column',
      borderLeft:  `1px solid ${COLORS.HUD_BORDER}`,
      borderRight: `1px solid ${COLORS.HUD_BORDER}`,
      overflow:    'hidden',
      minWidth:    180,
    }}>
      <div style={{
        padding:       '2px 8px',
        borderBottom:  `1px solid ${COLORS.HUD_BORDER}`,
        color:         COLORS.TEXT_DIM,
        fontSize:       9,
        letterSpacing:  2,
        background:    COLORS.HUD_BG,
        flexShrink:    0,
      }}>
        ACTIVITY LOG
      </div>

      <div
        ref={topRef}
        style={{
          flex:       1,
          overflowY:  'auto',
          padding:    '4px 8px',
          background: COLORS.HUD_BG,
          scrollbarWidth: 'thin',
          scrollbarColor: `${COLORS.HUD_BORDER} transparent`,
        }}
      >
        {logs.map((entry, idx) => (
          <div
            key={entry.id}
            style={{
              color:         idx === 0 ? COLORS.TEXT_PRIMARY : COLORS.TEXT_DIM,
              fontSize:      10,
              lineHeight:    1.5,
              fontFamily:    "'Courier New', monospace",
              opacity:       Math.max(0.3, 1 - idx * 0.08),
              paddingBottom: 2,
              borderBottom:  idx === 0 ? `1px solid ${COLORS.HUD_BORDER}` : 'none',
              marginBottom:  idx === 0 ? 3 : 0,
            }}
          >
            {idx === 0 && (
              <span style={{ color: COLORS.TEXT_WARN, marginRight: 4 }}>›</span>
            )}
            {entry.message}
          </div>
        ))}
      </div>
    </div>
  );
}
