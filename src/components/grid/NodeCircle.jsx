import React from 'react';
import { TYPE, STATE, COLORS, HEX_R } from '../../constants.js';
import { isAliveEnemy } from '../../logic/combatResolver.js';

function getNodeColors(node, isHovered) {
  const { type, state, accessible } = node;

  if (state === STATE.DESTROYED) {
    return { fill: '#070d10', stroke: '#0d2233', opacity: 0.5 };
  }

  if (state === STATE.EMPTY) {
    if (type === TYPE.START) {
      return { fill: COLORS.START_FILL, stroke: COLORS.START_BORDER, opacity: 1 };
    }
    return { fill: COLORS.NODE_EMPTY, stroke: COLORS.NODE_EMPTY_BORDER, opacity: 0.8 };
  }

  if (state === STATE.HIDDEN) {
    if (accessible) {
      return {
        fill:    isHovered ? '#122030' : COLORS.NODE_ACCESSIBLE,
        stroke:  COLORS.NODE_ACCESSIBLE_BORDER,
        opacity: 1,
      };
    }
    return { fill: COLORS.NODE_HIDDEN, stroke: COLORS.NODE_BORDER_HIDDEN, opacity: 0.7 };
  }

  if (state === STATE.REVEALED) {
    switch (type) {
      case TYPE.FIREWALL:
      case TYPE.ACCESS_DENIED:
      case TYPE.SUPPRESSOR:
      case TYPE.SECONDARY_VECTOR:
        if (isAliveEnemy(node)) {
          return {
            fill:   isHovered ? '#2a0808' : COLORS.ENEMY_FILL,
            stroke: COLORS.ENEMY_BORDER,
            opacity: 1,
          };
        }
        return { fill: COLORS.ENEMY_DEAD, stroke: '#330e00', opacity: 0.6 };

      case TYPE.CORE:
        return {
          fill:   isHovered ? '#280033' : COLORS.CORE_FILL,
          stroke: COLORS.CORE_BORDER,
          opacity: 1,
        };

      case TYPE.KERNEL_ROT:
      case TYPE.RESTORATION_NODE:
        return { fill: COLORS.UTILITY_FILL, stroke: COLORS.UTILITY_BORDER, opacity: 1 };

      case TYPE.DATA_CACHE:
        return { fill: COLORS.CACHE_OPEN, stroke: COLORS.CACHE_BORDER, opacity: 1 };

      default:
        return { fill: COLORS.NODE_EMPTY, stroke: COLORS.NODE_EMPTY_BORDER, opacity: 0.8 };
    }
  }

  return { fill: COLORS.NODE_HIDDEN, stroke: COLORS.NODE_BORDER_HIDDEN, opacity: 0.6 };
}

function getNodeLabel(node) {
  const { type, state, hp, str, dataCacheOpened } = node;

  if (state === STATE.HIDDEN && node.accessible) return '?';
  if (state === STATE.HIDDEN) return '';
  if (state === STATE.DESTROYED) return '✗';
  if (state === STATE.EMPTY && type === TYPE.START) return 'S';

  if (state === STATE.REVEALED || state === STATE.EMPTY) {
    switch (type) {
      case TYPE.CORE:             return hp !== undefined ? `${hp}` : 'CORE';
      case TYPE.DATA_CACHE:       return dataCacheOpened ? '?' : '■';
      case TYPE.KERNEL_ROT:       return 'KR';
      case TYPE.RESTORATION_NODE: return 'RN';
      default:                    return '';
    }
  }

  return '';
}

function getCursor(node, activeUtility) {
  if (!node.accessible && node.state !== STATE.REVEALED) return 'default';
  if (activeUtility !== null && isAliveEnemy(node)) return 'crosshair';
  return 'pointer';
}

export default function NodeCircle({ node, isHovered, activeUtility, onClick, onMouseEnter, onMouseLeave }) {
  const { x, y } = node._pixel;
  const { fill, stroke, opacity } = getNodeColors(node, isHovered);
  const label = getNodeLabel(node);
  const cursor = getCursor(node, activeUtility);

  // Glow effect for core
  const isCore = node.type === TYPE.CORE && node.state !== STATE.DESTROYED;
  const isAccessibleNode = node.accessible && node.state === STATE.HIDDEN;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      style={{ cursor }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Glow layer for core */}
      {isCore && (
        <circle
          r={HEX_R + 6}
          fill="none"
          stroke={COLORS.CORE_GLOW}
          strokeWidth={3}
          opacity={0.4}
        />
      )}

      {/* Pulse ring for accessible nodes */}
      {isAccessibleNode && (
        <circle
          r={HEX_R + 3}
          fill="none"
          stroke={COLORS.NODE_ACCESSIBLE_BORDER}
          strokeWidth={1}
          opacity={0.5}
          strokeDasharray="4 4"
        />
      )}

      {/* Main circle */}
      <circle
        r={HEX_R}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
        opacity={opacity}
      />

      {/* Node label */}
      {label && (
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fill={isCore ? COLORS.CORE_BORDER : COLORS.TEXT_PRIMARY}
          fontSize={isCore ? 11 : 10}
          fontFamily="'Courier New', monospace"
          fontWeight={isCore ? 'bold' : 'normal'}
          pointerEvents="none"
        >
          {label}
        </text>
      )}

      {/* HP bar for enemies */}
      {node.state === STATE.REVEALED && isAliveEnemy(node) && node.maxHp && (
        <>
          <rect
            x={-HEX_R + 4}
            y={HEX_R + 4}
            width={(HEX_R * 2 - 8)}
            height={4}
            fill="#1a0505"
            rx={2}
          />
          <rect
            x={-HEX_R + 4}
            y={HEX_R + 4}
            width={Math.max(0, (HEX_R * 2 - 8) * (node.hp / node.maxHp))}
            height={4}
            fill={COLORS.TEXT_DANGER}
            rx={2}
          />
        </>
      )}
    </g>
  );
}
