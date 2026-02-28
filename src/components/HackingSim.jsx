import React from 'react';
import { useGameState } from '../hooks/useGameState.js';
import { useStats } from '../hooks/useStats.js';
import { PHASE, COLORS } from '../constants.js';
import TitleBar from './TitleBar.jsx';
import GridCanvas from './grid/GridCanvas.jsx';
import BottomBar from './hud/BottomBar.jsx';

export default function HackingSim() {
  const game = useGameState();
  const stats = useStats();
  const { state } = game;

  // Record win/loss when phase changes
  React.useEffect(() => {
    if (state.phase === PHASE.WIN)  stats.recordWin(state.difficultyKey);
    if (state.phase === PHASE.LOSE) stats.recordLoss(state.difficultyKey);
  }, [state.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const containerStyle = {
    display:         'flex',
    flexDirection:   'column',
    width:           '100vw',
    height:          '100vh',
    background:      COLORS.BG,
    color:           COLORS.TEXT_PRIMARY,
    fontFamily:      "'Courier New', monospace",
    overflow:        'hidden',
    userSelect:      'none',
  };

  return (
    <div style={containerStyle}>
      <TitleBar
        phase={state.phase}
        difficultyKey={state.difficultyKey}
        stats={stats.data}
        onNewGame={game.newGame}
      />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <GridCanvas
          state={state}
          onClickNode={game.clickNode}
          onHoverNode={game.hoverNode}
        />
      </div>
      <BottomBar
        state={state}
        onEndTurn={game.endTurn}
        onUseUtility={game.useUtility}
        onCancelUtility={game.cancelUtility}
      />
    </div>
  );
}
