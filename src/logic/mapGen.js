import { COLS, ROWS, TYPE, STATE, DIFFICULTY } from '../constants.js';
import { nodeId, bfsDistances, allNodesByDistance } from './hexGrid.js';
import { recomputeAccessibility } from './combatResolver.js';

/**
 * Seeded-random-like shuffle using Fisher-Yates.
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate a complete map for a given difficulty.
 *
 * Map structure:
 *   - nodes: Map<nodeId, NodeObject>
 *   - startId: string
 *   - coreId: string
 *
 * NodeObject: {
 *   id, row, col, type, state,
 *   hp?, maxHp?, str?,           // enemies
 *   utilityType?,                 // utilities
 *   dataCacheOpened?,             // data_cache
 *   accessible: bool,             // computed
 *   hintDist?: number,            // BFS hint label
 * }
 */
export function generateMap(difficultyKey = 'standard') {
  const cfg = DIFFICULTY[difficultyKey];

  // ── 1. Place start node ─────────────────────────────────────────────────
  // Start is always in the left third of the grid
  const startCol = randInt(0, Math.floor(COLS / 3) - 1);
  const startRow = randInt(1, ROWS - 2);
  const startNid = nodeId(startRow, startCol);

  // ── 2. Place core node ───────────────────────────────────────────────────
  // Core is in the right third, well separated
  let coreRow, coreCol, coreNid;
  do {
    coreCol = randInt(Math.ceil(COLS * 2 / 3), COLS - 1);
    coreRow = randInt(1, ROWS - 2);
    coreNid = nodeId(coreRow, coreCol);
  } while (coreNid === startNid);

  // ── 3. BFS distances from start ─────────────────────────────────────────
  const distFromStart = bfsDistances(startRow, startCol);
  const maxDist = Math.max(...distFromStart.values());

  // ── 4. Build candidate pools by zone ────────────────────────────────────
  const allNodes = allNodesByDistance(startRow, startCol);
  const reserved = new Set([startNid, coreNid]);

  // We'll place nodes in distance bands:
  // near: dist 1-3, mid: 3-6, far: 6+
  const near  = allNodes.filter(n => n.dist >= 1 && n.dist <= 3  && !reserved.has(n.id));
  const mid   = allNodes.filter(n => n.dist > 3  && n.dist <= 6  && !reserved.has(n.id));
  const far   = allNodes.filter(n => n.dist > 6                   && !reserved.has(n.id));
  const pool  = allNodes.filter(n => !reserved.has(n.id));

  const placed = new Map();
  placed.set(startNid, { type: TYPE.START, row: startRow, col: startCol });
  placed.set(coreNid,  { type: TYPE.CORE,  row: coreRow,  col: coreCol });

  function claimNode(node, overrides = {}) {
    if (placed.has(node.id) || reserved.has(node.id)) return false;
    placed.set(node.id, { type: TYPE.EMPTY, ...overrides, row: node.row, col: node.col });
    reserved.add(node.id);
    return true;
  }

  // ── 5. Place enemies ─────────────────────────────────────────────────────
  const enemyPool = shuffle([...mid, ...far]);

  // Firewalls in mid/far zone
  let fwPlaced = 0;
  for (const n of enemyPool) {
    if (fwPlaced >= cfg.firewalls) break;
    const str = randInt(...cfg.enemyStrRange);
    const hp = str * 2 + randInt(0, 2);
    if (claimNode(n, { type: TYPE.FIREWALL, str, hp, maxHp: hp })) fwPlaced++;
  }

  // Access denied (stronger) - prefer far zone
  const adPool = shuffle([...far, ...mid]);
  let adPlaced = 0;
  for (const n of adPool) {
    if (adPlaced >= cfg.accessDenied) break;
    const str = randInt(cfg.enemyStrRange[1], cfg.enemyStrRange[1] + 2);
    const hp = str * 3 + randInt(0, 2);
    if (claimNode(n, { type: TYPE.ACCESS_DENIED, str, hp, maxHp: hp })) adPlaced++;
  }

  // Suppressors - near/mid zone (they should be encountered early)
  const suppPool = shuffle([...near, ...mid]);
  let suppPlaced = 0;
  for (const n of suppPool) {
    if (suppPlaced >= cfg.suppressor) break;
    const str = randInt(1, 2);
    const hp = str * 2;
    if (claimNode(n, { type: TYPE.SUPPRESSOR, str, hp, maxHp: hp })) suppPlaced++;
  }

  // ── 6. Place utilities ───────────────────────────────────────────────────
  const utilPool = shuffle([...near, ...mid, ...pool].filter(n => !reserved.has(n.id)));

  let krPlaced = 0;
  for (const n of utilPool) {
    if (krPlaced >= cfg.kernelRot) break;
    if (claimNode(n, { type: TYPE.KERNEL_ROT })) krPlaced++;
  }

  const utilPool2 = shuffle([...near, ...mid, ...pool].filter(n => !reserved.has(n.id)));
  let rnPlaced = 0;
  for (const n of utilPool2) {
    if (rnPlaced >= cfg.restoration) break;
    if (claimNode(n, { type: TYPE.RESTORATION_NODE })) rnPlaced++;
  }

  // ── 7. Place data caches ─────────────────────────────────────────────────
  const cachePool = shuffle([...pool].filter(n => !reserved.has(n.id)));
  let cachePlaced = 0;
  for (const n of cachePool) {
    if (cachePlaced >= cfg.dataCaches) break;
    if (claimNode(n, { type: TYPE.DATA_CACHE, dataCacheOpened: false })) cachePlaced++;
  }

  // ── 8. Build full node map ───────────────────────────────────────────────
  let nodes = new Map();

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const id = nodeId(r, c);
      const override = placed.get(id);
      const dist = distFromStart.get(id) ?? 0;

      // Determine core HP
      let coreHp = undefined;
      let coreMaxHp = undefined;
      if (id === coreNid) {
        coreHp = cfg.coreHp;
        coreMaxHp = cfg.coreHp;
      }

      const baseNode = {
        id,
        row: r,
        col: c,
        type: TYPE.EMPTY,
        state: STATE.HIDDEN,
        accessible: false,
        hintDist: dist,
        ...(override || {}),
      };

      // Ensure core has HP
      if (id === coreNid) {
        baseNode.hp = cfg.coreHp;
        baseNode.maxHp = cfg.coreHp;
      }

      // Set start node state to revealed/empty (player begins here)
      if (id === startNid) {
        baseNode.state = STATE.EMPTY;
        baseNode.accessible = false;
      }

      nodes.set(id, baseNode);
    }
  }

  // ── 9. Compute initial accessibility ────────────────────────────────────
  nodes = recomputeAccessibility(nodes);

  return {
    nodes,
    startId: startNid,
    coreId:  coreNid,
  };
}

/**
 * Spawn a secondary vector (enemy) at a random accessible position.
 * Used when a data_cache reveals a threat.
 *
 * @param {Map<string, object>} nodes
 * @param {string} excludeId - the data cache node to exclude
 * @param {string} difficultyKey
 * @returns {Map<string, object>} updated nodes
 */
export function spawnSecondaryVector(nodes, excludeId, difficultyKey) {
  const cfg = DIFFICULTY[difficultyKey];
  // Find a hidden node that is NOT the data cache
  const candidates = [];
  for (const [id, node] of nodes) {
    if (id !== excludeId && node.state === STATE.HIDDEN) {
      candidates.push(id);
    }
  }

  if (candidates.length === 0) return nodes;

  const chosenId = pick(shuffle(candidates));
  const node = nodes.get(chosenId);
  const str = randInt(...cfg.enemyStrRange);
  const hp = str * 2;

  const updated = new Map(nodes);
  updated.set(chosenId, {
    ...node,
    type: TYPE.SECONDARY_VECTOR,
    str,
    hp,
    maxHp: hp,
  });

  return updated;
}
