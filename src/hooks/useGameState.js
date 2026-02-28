import { useReducer, useEffect, useRef } from 'react';
import { gameReducer, createInitialState } from '../logic/gameReducer.js';
import { PHASE } from '../constants.js';
import * as audio from '../audio/audioEngine.js';

export function useGameState() {
  const [state, dispatch] = useReducer(
    gameReducer,
    'standard',
    createInitialState
  );

  const prevPhase = useRef(state.phase);
  const prevHp    = useRef(state.playerHp);
  const prevNodes = useRef(state.nodes);

  // ── Audio side effects ─────────────────────────────────────────────────────
  useEffect(() => {
    // Win / Lose transitions
    if (prevPhase.current !== state.phase) {
      if (state.phase === PHASE.WIN)  audio.playWin();
      if (state.phase === PHASE.LOSE) audio.playLose();
      prevPhase.current = state.phase;
    }

    // Player took damage
    if (prevHp.current !== state.playerHp) {
      if (state.playerHp < prevHp.current) audio.playDamage();
      prevHp.current = state.playerHp;
    }

    // Node reveals (detect newly non-hidden nodes)
    if (prevNodes.current !== state.nodes) {
      for (const [id, node] of state.nodes) {
        const prev = prevNodes.current.get(id);
        if (!prev) continue;

        if (prev.state === 'hidden' && node.state !== 'hidden') {
          // Something was revealed
          if (node.type === 'firewall' || node.type === 'access_denied' ||
              node.type === 'suppressor' || node.type === 'secondary_vector') {
            audio.playEnemyReveal();
          } else if (node.type === 'core') {
            audio.playCoreReveal();
          } else if (node.type === 'kernel_rot' || node.type === 'restoration_node') {
            audio.playUtilityPickup();
          } else if (node.type === 'data_cache') {
            audio.playCacheReveal();
          } else {
            audio.playNodeReveal();
          }
        }

        // Enemy destroyed
        if (prev.state !== 'destroyed' && node.state === 'destroyed') {
          if (node.type !== 'core') audio.playEnemyDestroyed();
        }
      }
      prevNodes.current = state.nodes;
    }
  });

  // ── Dispatch wrappers ──────────────────────────────────────────────────────
  const clickNode = (id) => {
    audio.playClick();
    dispatch({ type: 'CLICK_NODE', payload: { id } });
  };

  const endTurn = () => {
    dispatch({ type: 'END_TURN' });
  };

  const useUtility = (index) => {
    audio.playUtilityActivate();
    dispatch({ type: 'USE_UTILITY', payload: { index } });
  };

  const cancelUtility = () => {
    dispatch({ type: 'CANCEL_UTILITY' });
  };

  const newGame = (difficultyKey) => {
    dispatch({ type: 'NEW_GAME', payload: { difficultyKey } });
  };

  const hoverNode = (id) => {
    dispatch({ type: 'HOVER_NODE', payload: { id } });
  };

  return {
    state,
    clickNode,
    endTurn,
    useUtility,
    cancelUtility,
    newGame,
    hoverNode,
  };
}
