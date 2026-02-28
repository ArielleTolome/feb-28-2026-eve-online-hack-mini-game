import { COLS, ROWS, SX, SY, PAD_X, PAD_Y } from '../constants.js';

/**
 * Convert even-r offset hex coordinates to pixel center.
 * Odd rows are offset right by SX/2.
 */
export function hexToPixel(col, row) {
  return {
    x: PAD_X + col * SX + (row % 2 === 1 ? SX / 2 : 0),
    y: PAD_Y + row * SY,
  };
}

/**
 * Unique string ID for a node position.
 */
export function nodeId(row, col) {
  return `${row},${col}`;
}

/**
 * Get valid neighbors for even-r offset hex grid.
 * Direction arrays differ based on row parity.
 */
export function getNeighbors(row, col) {
  // Even rows: top-left, top-right, left, right, bottom-left, bottom-right
  // Odd rows: offset shifts the "diagonal" neighbors
  const dirs = row % 2 === 0
    ? [
        [0, -1],  // left
        [0,  1],  // right
        [-1, -1], // top-left
        [-1,  0], // top-right
        [ 1, -1], // bottom-left
        [ 1,  0], // bottom-right
      ]
    : [
        [0, -1],  // left
        [0,  1],  // right
        [-1,  0], // top-left
        [-1,  1], // top-right
        [ 1,  0], // bottom-left
        [ 1,  1], // bottom-right
      ];

  return dirs
    .map(([dr, dc]) => [row + dr, col + dc])
    .filter(([r, c]) => r >= 0 && r < ROWS && c >= 0 && c < COLS);
}

/**
 * BFS from a source node. Returns Map of nodeId -> distance.
 * Useful for placing enemies at distance-based positions.
 *
 * @param {number} startRow
 * @param {number} startCol
 * @returns {Map<string, number>}
 */
export function bfsDistances(startRow, startCol) {
  const dist = new Map();
  const queue = [[startRow, startCol, 0]];
  dist.set(nodeId(startRow, startCol), 0);

  while (queue.length > 0) {
    const [r, c, d] = queue.shift();
    for (const [nr, nc] of getNeighbors(r, c)) {
      const id = nodeId(nr, nc);
      if (!dist.has(id)) {
        dist.set(id, d + 1);
        queue.push([nr, nc, d + 1]);
      }
    }
  }

  return dist;
}

/**
 * Get all nodes sorted by distance from start (ascending).
 * Returns array of { row, col, dist, id }.
 */
export function allNodesByDistance(startRow, startCol) {
  const dist = bfsDistances(startRow, startCol);
  const nodes = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const id = nodeId(r, c);
      nodes.push({ row: r, col: c, dist: dist.get(id) ?? Infinity, id });
    }
  }
  nodes.sort((a, b) => a.dist - b.dist);
  return nodes;
}
