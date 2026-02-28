import { TYPE, STATE } from '../constants.js';
import { getNeighbors, nodeId } from './hexGrid.js';

/**
 * Returns true if the node contains a living enemy.
 */
export function isAliveEnemy(node) {
  if (!node) return false;
  const isEnemy = node.type === TYPE.FIREWALL ||
                  node.type === TYPE.ACCESS_DENIED ||
                  node.type === TYPE.SUPPRESSOR;
  return isEnemy && node.hp > 0 && node.state !== STATE.DESTROYED;
}

/**
 * Accessibility rule:
 *   A node is accessible if:
 *   1. It is currently hidden (not yet revealed/destroyed)
 *   2. At least one neighbor is empty/destroyed (explored)
 *   3. No alive enemy neighbor is adjacent
 *
 * @param {Map<string, object>} nodes - full node map
 * @param {number} row
 * @param {number} col
 * @returns {boolean}
 */
export function isAccessible(nodes, row, col) {
  const id = nodeId(row, col);
  const node = nodes.get(id);

  if (!node) return false;
  if (node.state !== STATE.HIDDEN) return false;

  const neighbors = getNeighbors(row, col);
  let hasExploredNeighbor = false;

  for (const [nr, nc] of neighbors) {
    const nid = nodeId(nr, nc);
    const neighbor = nodes.get(nid);
    if (!neighbor) continue;

    // If any alive enemy is adjacent, node is not accessible
    if (isAliveEnemy(neighbor)) return false;

    // Empty or destroyed = explored territory
    if (neighbor.state === STATE.EMPTY || neighbor.state === STATE.DESTROYED) {
      hasExploredNeighbor = true;
    }
  }

  return hasExploredNeighbor;
}

/**
 * Compute damage dealt by an enemy to the player.
 * Strength multiplied by base factor; suppressed if suppressor active.
 *
 * @param {object} enemy - node object with .str property
 * @param {number} suppressorCount - number of active suppressors adjacent
 * @returns {number}
 */
export function computeDamage(enemy, suppressorCount = 0) {
  const BASE = 5;
  const suppMult = Math.max(0.25, 1 - suppressorCount * 0.25);
  return Math.round(enemy.str * BASE * suppMult);
}

/**
 * Recompute accessibility for all hidden nodes given current map state.
 * Returns a new Map with updated accessible flags.
 *
 * @param {Map<string, object>} nodes
 * @returns {Map<string, object>}
 */
export function recomputeAccessibility(nodes) {
  const updated = new Map(nodes);
  for (const [id, node] of updated) {
    if (node.state === STATE.HIDDEN) {
      const [row, col] = id.split(',').map(Number);
      const accessible = isAccessible(updated, row, col);
      if (node.accessible !== accessible) {
        updated.set(id, { ...node, accessible });
      }
    } else if (node.accessible) {
      // Non-hidden nodes should not be marked accessible
      updated.set(id, { ...node, accessible: false });
    }
  }
  return updated;
}

/**
 * Count alive suppressor nodes adjacent to player's explored area
 * (i.e., destroyed suppressor nodes reduce the count).
 *
 * @param {Map<string, object>} nodes
 * @returns {number}
 */
export function countActiveSuppressors(nodes) {
  let count = 0;
  for (const node of nodes.values()) {
    if (node.type === TYPE.SUPPRESSOR && node.state === STATE.REVEALED && node.hp > 0) {
      count++;
    }
  }
  return count;
}
