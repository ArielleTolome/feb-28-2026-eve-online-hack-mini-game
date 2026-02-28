import React from 'react';
import { STATE, COLORS } from '../../constants.js';
import { getNeighbors, nodeId } from '../../logic/hexGrid.js';

/**
 * Draws SVG lines between explored (empty/destroyed) nodes.
 * Edges are deduplicated by sorting node IDs.
 */
export default function NodeEdges({ nodes }) {
  const edgeSet = new Set();
  const edges = [];

  for (const [id, node] of nodes) {
    const isExplored = node.state === STATE.EMPTY || node.state === STATE.DESTROYED;
    if (!isExplored) continue;

    const neighbors = getNeighbors(node.row, node.col);
    for (const [nr, nc] of neighbors) {
      const nid = nodeId(nr, nc);
      const neighbor = nodes.get(nid);
      if (!neighbor) continue;

      const nExplored = neighbor.state === STATE.EMPTY || neighbor.state === STATE.DESTROYED;
      if (!nExplored) continue;

      // Dedup: always store smaller id first
      const edgeKey = id < nid ? `${id}|${nid}` : `${nid}|${id}`;
      if (edgeSet.has(edgeKey)) continue;
      edgeSet.add(edgeKey);

      edges.push({
        key: edgeKey,
        x1: node._pixel.x,
        y1: node._pixel.y,
        x2: neighbor._pixel.x,
        y2: neighbor._pixel.y,
      });
    }
  }

  return (
    <g>
      {edges.map(e => (
        <line
          key={e.key}
          x1={e.x1} y1={e.y1}
          x2={e.x2} y2={e.y2}
          stroke={COLORS.EDGE_COLOR}
          strokeWidth={1.5}
          opacity={COLORS.EDGE_OPACITY}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}
