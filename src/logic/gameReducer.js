import {
  TYPE, STATE, PHASE, DIFFICULTY,
  CORE_ATTACK_DMG, LOG_MAX,
} from '../constants.js';
import { nodeId, getNeighbors } from './hexGrid.js';
import { generateMap, spawnSecondaryVector } from './mapGen.js';
import {
  isAliveEnemy,
  recomputeAccessibility,
  computeDamage,
  countActiveSuppressors,
} from './combatResolver.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

function addLog(logs, message) {
  return [{ id: Date.now() + Math.random(), message }, ...logs].slice(0, LOG_MAX);
}

function buildInitialState(difficultyKey = 'standard') {
  const cfg = DIFFICULTY[difficultyKey];
  const { nodes, startId, coreId } = generateMap(difficultyKey);
  return {
    phase: PHASE.PLAYING,
    nodes,
    startId,
    coreId,
    difficultyKey,
    playerHp: cfg.playerHp,
    playerMaxHp: cfg.playerHp,
    utilities: [],          // collected utility items (max 3)
    activeUtility: null,    // index of selected utility or null
    logs: [{ id: 0, message: 'Hack initiated. Breach the core.' }],
    hoveredId: null,
    turn: 1,
  };
}

// ── Accessibility + alive-enemy helpers ──────────────────────────────────────

function getEnemyNeighborIds(nodes, row, col) {
  return getNeighbors(row, col)
    .map(([r, c]) => nodeId(r, c))
    .filter(id => {
      const n = nodes.get(id);
      return n && isAliveEnemy(n);
    });
}

// ── Sub-reducers ─────────────────────────────────────────────────────────────

function handleClickNode(state, { id: clickedId }) {
  if (state.phase !== PHASE.PLAYING) return state;

  const node = state.nodes.get(clickedId);
  if (!node) return state;

  // Must be accessible or revealed (for alive enemies / core)
  const isRevealed = node.state === STATE.REVEALED;
  const isAccessibleNode = node.accessible;

  // Utility activation mode: targeting an enemy
  if (state.activeUtility !== null) {
    return handleUtilityTarget(state, clickedId, node);
  }

  // Can only click accessible (hidden→reveal) or revealed (enemy/core)
  if (!isAccessibleNode && !isRevealed) return state;

  let nodes = new Map(state.nodes);
  let logs  = state.logs;
  let playerHp = state.playerHp;
  let utilities = [...state.utilities];
  let phase = state.phase;

  // ── Data cache (two-click mechanic) ──────────────────────────────────────
  if (node.type === TYPE.DATA_CACHE && isAccessibleNode) {
    if (!node.dataCacheOpened) {
      // First click: reveal the cache, show ?
      nodes.set(clickedId, { ...node, state: STATE.REVEALED, dataCacheOpened: true });
      nodes = recomputeAccessibility(nodes);
      logs = addLog(logs, 'Data cache detected. Click again to investigate.');
      return { ...state, nodes, logs };
    } else {
      // Second click: 50/50 - utility or enemy spawn
      if (Math.random() < 0.5) {
        // Utility reward
        const utilType = Math.random() < 0.5 ? TYPE.KERNEL_ROT : TYPE.RESTORATION_NODE;
        nodes.set(clickedId, { ...node, state: STATE.EMPTY, type: TYPE.EMPTY });
        utilities = addUtility(utilities, utilType);
        nodes = recomputeAccessibility(nodes);
        logs = addLog(logs, `Cache opened: ${utilityLabel(utilType)} recovered.`);
      } else {
        // Enemy spawn
        nodes.set(clickedId, { ...node, state: STATE.EMPTY, type: TYPE.EMPTY });
        nodes = spawnSecondaryVector(nodes, clickedId, state.difficultyKey);
        nodes = recomputeAccessibility(nodes);
        logs = addLog(logs, 'Cache triggered secondary vector! Threat spawned.');
      }
      return { ...state, nodes, logs, utilities };
    }
  }

  // ── Clicking accessible hidden node (reveal it) ───────────────────────────
  if (isAccessibleNode && node.state === STATE.HIDDEN) {
    const isEnemy = isAliveEnemy(node) || node.type === TYPE.SECONDARY_VECTOR;

    if (isEnemy) {
      // Attack enemy
      const result = attackEnemy(nodes, clickedId, node, state.difficultyKey);
      nodes = result.nodes;
      logs  = addLog(logs, result.logMsg);

      // Enemy retaliation if still alive
      const updatedEnemy = nodes.get(clickedId);
      if (updatedEnemy && updatedEnemy.hp > 0) {
        nodes.set(clickedId, { ...updatedEnemy, state: STATE.REVEALED });
        const suppCount = countActiveSuppressors(nodes);
        const dmg = computeDamage(updatedEnemy, suppCount);
        playerHp = Math.max(0, playerHp - dmg);
        logs = addLog(logs, `${nodeLabel(updatedEnemy)} retaliates for ${dmg} damage!`);
      } else {
        // Enemy destroyed
        nodes.set(clickedId, { ...nodes.get(clickedId), state: STATE.DESTROYED });
        logs = addLog(logs, `${nodeLabel(node)} destroyed!`);
      }
    } else if (node.type === TYPE.CORE) {
      // Attacking core
      const result = attackEnemy(nodes, clickedId, node, state.difficultyKey);
      nodes = result.nodes;
      logs  = addLog(logs, result.logMsg);
      const updatedCore = nodes.get(clickedId);
      if (updatedCore && updatedCore.hp <= 0) {
        nodes.set(clickedId, { ...updatedCore, state: STATE.DESTROYED });
        phase = PHASE.WIN;
        logs = addLog(logs, 'CORE BREACHED. System compromised. Hack successful!');
      } else {
        nodes.set(clickedId, { ...updatedCore, state: STATE.REVEALED });
      }
    } else {
      // Utility or empty — reveal and collect
      nodes.set(clickedId, { ...node, state: STATE.EMPTY });
      if (node.type === TYPE.KERNEL_ROT || node.type === TYPE.RESTORATION_NODE) {
        utilities = addUtility(utilities, node.type);
        logs = addLog(logs, `${utilityLabel(node.type)} acquired!`);
      } else {
        logs = addLog(logs, 'Node clear.');
      }
    }

    nodes = recomputeAccessibility(nodes);
  } else if (isRevealed && isAliveEnemy(node)) {
    // Click on already-revealed alive enemy = attack again
    const result = attackEnemy(nodes, clickedId, node, state.difficultyKey);
    nodes = result.nodes;
    logs  = addLog(logs, result.logMsg);

    const updatedEnemy = nodes.get(clickedId);
    if (updatedEnemy && updatedEnemy.hp > 0) {
      const suppCount = countActiveSuppressors(nodes);
      const dmg = computeDamage(updatedEnemy, suppCount);
      playerHp = Math.max(0, playerHp - dmg);
      logs = addLog(logs, `${nodeLabel(updatedEnemy)} retaliates for ${dmg} damage!`);
    } else {
      nodes.set(clickedId, { ...nodes.get(clickedId), state: STATE.DESTROYED });
      nodes = recomputeAccessibility(nodes);
      logs = addLog(logs, `${nodeLabel(node)} destroyed!`);
    }
  } else if (isRevealed && node.type === TYPE.CORE && node.hp > 0) {
    // Attack core when it's revealed
    const result = attackEnemy(nodes, clickedId, node, state.difficultyKey);
    nodes = result.nodes;
    logs  = addLog(logs, result.logMsg);
    const updatedCore = nodes.get(clickedId);
    if (updatedCore && updatedCore.hp <= 0) {
      nodes.set(clickedId, { ...updatedCore, state: STATE.DESTROYED });
      phase = PHASE.WIN;
      logs = addLog(logs, 'CORE BREACHED. System compromised. Hack successful!');
    }
  }

  // Check lose condition
  if (playerHp <= 0 && phase !== PHASE.WIN) {
    phase = PHASE.LOSE;
    logs = addLog(logs, 'COHERENCE LOST. System rejected intrusion.');
  }

  return { ...state, nodes, logs, playerHp, utilities, phase };
}

function attackEnemy(nodes, id, node, _difficultyKey) {
  // Player deals 10 damage per attack
  const PLAYER_ATTACK = 10;
  const newHp = Math.max(0, (node.hp ?? 0) - PLAYER_ATTACK);
  const updated = new Map(nodes);
  updated.set(id, { ...node, hp: newHp });
  const logMsg = `Attacked ${nodeLabel(node)}: ${node.hp} → ${newHp} HP.`;
  return { nodes: updated, logMsg };
}

function handleUtilityTarget(state, targetId, target) {
  const utility = state.utilities[state.activeUtility];
  if (!utility) return { ...state, activeUtility: null };

  let nodes = new Map(state.nodes);
  let logs  = state.logs;
  let playerHp = state.playerHp;
  let utilities = [...state.utilities];
  utilities.splice(state.activeUtility, 1); // consume

  if (utility === TYPE.KERNEL_ROT) {
    if (!isAliveEnemy(target)) {
      logs = addLog(logs, 'Kernel Rot requires an active enemy target.');
      return { ...state, activeUtility: null, logs };
    }
    const newHp = Math.ceil(target.hp / 2);
    nodes.set(targetId, { ...target, hp: newHp });
    logs = addLog(logs, `Kernel Rot applied! ${nodeLabel(target)}: ${target.hp} → ${newHp} HP.`);
    if (newHp <= 0) {
      nodes.set(targetId, { ...nodes.get(targetId), state: STATE.DESTROYED });
      nodes = recomputeAccessibility(nodes);
      logs = addLog(logs, `${nodeLabel(target)} destroyed by Kernel Rot!`);
    }
  } else if (utility === TYPE.RESTORATION_NODE) {
    const maxHp = state.playerMaxHp;
    playerHp = Math.min(maxHp, playerHp + 30);
    logs = addLog(logs, `Restoration Node activated. Coherence +30 (→${playerHp}).`);
    // Restoration can be self-targeted: don't need a specific target
  }

  return { ...state, nodes, logs, playerHp, utilities, activeUtility: null };
}

function handleEndTurn(state) {
  if (state.phase !== PHASE.PLAYING) return state;

  let { nodes, playerHp, logs } = state;
  nodes = new Map(nodes);
  let phase = state.phase;
  const suppCount = countActiveSuppressors(nodes);

  // Every alive REVEALED enemy attacks player
  for (const [, node] of nodes) {
    if (isAliveEnemy(node) && node.state === STATE.REVEALED) {
      const dmg = computeDamage(node, suppCount);
      playerHp = Math.max(0, playerHp - dmg);
      logs = addLog(logs, `${nodeLabel(node)} damages you for ${dmg} on end of turn.`);
    }
  }

  if (playerHp <= 0 && phase !== PHASE.WIN) {
    phase = PHASE.LOSE;
    logs = addLog(logs, 'COHERENCE LOST. System rejected intrusion.');
  }

  return {
    ...state,
    nodes,
    playerHp,
    logs,
    phase,
    turn: state.turn + 1,
  };
}

function handleUseUtility(state, { index }) {
  const utility = state.utilities[index];
  if (!utility) return state;

  // If it's a Restoration Node, use immediately (self-targeted)
  if (utility === TYPE.RESTORATION_NODE) {
    let utilities = [...state.utilities];
    utilities.splice(index, 1);
    const newHp = Math.min(state.playerMaxHp, state.playerHp + 30);
    const logs = addLog(state.logs, `Restoration Node used. Coherence restored to ${newHp}.`);
    return { ...state, utilities, playerHp: newHp, logs, activeUtility: null };
  }

  // Otherwise enter targeting mode
  const logs = addLog(state.logs, `${utilityLabel(utility)} selected. Click an enemy to apply.`);
  return { ...state, activeUtility: index, logs };
}

function handleNewGame(state, { difficultyKey }) {
  return buildInitialState(difficultyKey || state.difficultyKey);
}

function handleHover(state, { id }) {
  return { ...state, hoveredId: id };
}

// ── Utility helpers ───────────────────────────────────────────────────────────

function addUtility(utilities, type) {
  if (utilities.length >= 3) return utilities; // max 3 slots
  return [...utilities, type];
}

function nodeLabel(node) {
  if (!node) return 'Unknown';
  switch (node.type) {
    case TYPE.FIREWALL:         return 'Firewall';
    case TYPE.ACCESS_DENIED:    return 'Access Denied';
    case TYPE.SUPPRESSOR:       return 'Suppressor';
    case TYPE.SECONDARY_VECTOR: return 'Secondary Vector';
    case TYPE.KERNEL_ROT:       return 'Kernel Rot';
    case TYPE.RESTORATION_NODE: return 'Restoration Node';
    case TYPE.DATA_CACHE:       return 'Data Cache';
    case TYPE.CORE:             return 'System Core';
    default:                    return 'Node';
  }
}

function utilityLabel(type) {
  switch (type) {
    case TYPE.KERNEL_ROT:       return 'Kernel Rot';
    case TYPE.RESTORATION_NODE: return 'Restoration Node';
    default:                    return 'Utility';
  }
}

// ── Main Reducer ─────────────────────────────────────────────────────────────

export function gameReducer(state, action) {
  switch (action.type) {
    case 'CLICK_NODE':   return handleClickNode(state, action.payload);
    case 'END_TURN':     return handleEndTurn(state);
    case 'USE_UTILITY':  return handleUseUtility(state, action.payload);
    case 'NEW_GAME':     return handleNewGame(state, action.payload || {});
    case 'HOVER_NODE':   return handleHover(state, action.payload);
    case 'CANCEL_UTILITY': return { ...state, activeUtility: null };
    default:             return state;
  }
}

export function createInitialState(difficultyKey = 'standard') {
  return buildInitialState(difficultyKey);
}

export { nodeLabel, utilityLabel };
