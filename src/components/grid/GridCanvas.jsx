import React from 'react';
import { CANVAS_W, CANVAS_H, COLORS, PHASE } from '../../constants.js';
import { hexToPixel, nodeId } from '../../logic/hexGrid.js';
import CircuitBackground from './CircuitBackground.jsx';
import NodeEdges from './NodeEdges.jsx';
import NodeCircle from './NodeCircle.jsx';
import EnemyOverlay from './EnemyOverlay.jsx';
import InfoPanel from '../hud/InfoPanel.jsx';

/**
 * Add pixel coordinates to each node for rendering.
 */
function enrichNodes(nodes) {
  const enriched = new Map();
  for (const [id, node] of nodes) {
    enriched.set(id, {
      ...node,
      _pixel: hexToPixel(node.col, node.row),
    });
  }
  return enriched;
}

export default function GridCanvas({ state, onClickNode, onHoverNode }) {
  const { nodes: rawNodes, hoveredId, activeUtility, phase } = state;
  const nodes = enrichNodes(rawNodes);

  const handleClick = (id) => {
    if (phase !== PHASE.PLAYING) return;
    onClickNode(id);
  };

  const handleMouseEnter = (id) => {
    onHoverNode(id);
  };

  const handleMouseLeave = () => {
    onHoverNode(null);
  };

  const svgStyle = {
    width:    '100%',
    height:   '100%',
    display:  'block',
  };

  const viewBox = `0 0 ${CANVAS_W} ${CANVAS_H}`;

  return (
    <div style={{
      flex:       1,
      position:   'relative',
      overflow:   'hidden',
      background: COLORS.BG,
    }}>
      <svg
        viewBox={viewBox}
        style={svgStyle}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Decorative background */}
        <CircuitBackground />

        {/* Edges between explored nodes */}
        <NodeEdges nodes={nodes} />

        {/* All nodes */}
        {Array.from(nodes.values()).map(node => (
          <NodeCircle
            key={node.id}
            node={node}
            isHovered={hoveredId === node.id}
            activeUtility={activeUtility}
            onClick={() => handleClick(node.id)}
            onMouseEnter={() => handleMouseEnter(node.id)}
            onMouseLeave={handleMouseLeave}
          />
        ))}

        {/* Enemy overlay: icons, HP bars, STR labels */}
        <EnemyOverlay nodes={nodes} />
      </svg>

      {/* Win/Lose overlay + hover info */}
      <InfoPanel
        state={state}
        nodes={nodes}
      />
    </div>
  );
}
