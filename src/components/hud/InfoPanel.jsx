import React from 'react';
import { TYPE, STATE, PHASE, COLORS } from '../../constants.js';
import { isAliveEnemy } from '../../logic/combatResolver.js';

function nodeTypeDesc(node) {
  if (!node) return null;
  const { type, state, hp, maxHp, str, dataCacheOpened, accessible } = node;

  if (state === STATE.HIDDEN && !accessible) {
    return { title: 'Unknown Node', body: 'Scan the area to reveal.' };
  }
  if (state === STATE.HIDDEN && accessible) {
    return { title: 'Accessible Node', body: 'Click to investigate this node.' };
  }
  if (state === STATE.DESTROYED) {
    return { title: 'Destroyed Node', body: 'This node has been neutralized.' };
  }

  switch (type) {
    case TYPE.START:
      return { title: 'Entry Point', body: 'Your intrusion vector. Breach started here.' };
    case TYPE.CORE:
      return {
        title: 'System Core',
        body: `Primary target. HP: ${hp}/${maxHp}. Attack to breach the system.`,
        color: COLORS.CORE_BORDER,
      };
    case TYPE.FIREWALL:
      return {
        title: 'Firewall',
        body: `Defensive node. STR: ${str}, HP: ${hp}/${maxHp}. Deals ${str * 5} damage per retaliation.`,
        color: COLORS.ENEMY_BORDER,
      };
    case TYPE.ACCESS_DENIED:
      return {
        title: 'Access Denied',
        body: `High-security lockout. STR: ${str}, HP: ${hp}/${maxHp}. Heavy damage on retaliation.`,
        color: COLORS.ENEMY_BORDER,
      };
    case TYPE.SUPPRESSOR:
      return {
        title: 'Suppressor',
        body: `Weakens your attacks by 25% while active. STR: ${str}, HP: ${hp}/${maxHp}.`,
        color: '#ff9900',
      };
    case TYPE.SECONDARY_VECTOR:
      return {
        title: 'Secondary Vector',
        body: `Spawned threat. STR: ${str}, HP: ${hp}/${maxHp}.`,
        color: COLORS.ENEMY_BORDER,
      };
    case TYPE.KERNEL_ROT:
      return {
        title: 'Kernel Rot',
        body: 'Utility: Halves the HP of a target enemy. Click slot to activate, then click enemy.',
        color: COLORS.UTILITY_BORDER,
      };
    case TYPE.RESTORATION_NODE:
      return {
        title: 'Restoration Node',
        body: 'Utility: Restores 30 Coherence HP. Click slot to use immediately.',
        color: COLORS.UTILITY_BORDER,
      };
    case TYPE.DATA_CACHE:
      return {
        title: 'Data Cache',
        body: dataCacheOpened
          ? 'Cache is open. Click to investigate — 50% chance: utility or threat spawn.'
          : 'Encrypted cache. First click opens it for inspection.',
        color: COLORS.CACHE_BORDER,
      };
    default:
      return { title: 'Empty Node', body: 'Cleared. No threats detected.' };
  }
}

export default function InfoPanel({ state, nodes }) {
  const { hoveredId, phase } = state;

  // Win/Lose overlay
  if (phase === PHASE.WIN || phase === PHASE.LOSE) {
    const isWin = phase === PHASE.WIN;
    return (
      <div style={{
        position:       'absolute',
        inset:          0,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        background:     isWin ? 'rgba(0,30,15,0.88)' : 'rgba(20,0,0,0.88)',
        backdropFilter: 'blur(3px)',
      }}>
        <div style={{
          textAlign:     'center',
          border:        `2px solid ${isWin ? COLORS.TEXT_SUCCESS : COLORS.TEXT_DANGER}`,
          padding:       '32px 48px',
          background:    isWin ? 'rgba(0,20,10,0.9)' : 'rgba(20,0,0,0.9)',
          boxShadow:     `0 0 40px ${isWin ? COLORS.TEXT_SUCCESS : COLORS.TEXT_DANGER}44`,
        }}>
          <div style={{
            color:      isWin ? COLORS.TEXT_SUCCESS : COLORS.TEXT_DANGER,
            fontSize:   28,
            fontWeight: 'bold',
            letterSpacing: 6,
            marginBottom: 8,
          }}>
            {isWin ? 'HACK SUCCESSFUL' : 'SYSTEM REJECTED'}
          </div>
          <div style={{
            color:    COLORS.TEXT_DIM,
            fontSize: 12,
            letterSpacing: 2,
          }}>
            {isWin
              ? 'Core breached. Data extracted. Disconnecting...'
              : 'Coherence lost. Intrusion detected. System locked.'}
          </div>
          <div style={{
            marginTop:  16,
            color:      COLORS.TEXT_DIM,
            fontSize:   10,
            letterSpacing: 2,
          }}>
            START NEW HACK FROM THE TITLE BAR
          </div>
        </div>
      </div>
    );
  }

  // Hover info (bottom-left corner overlay)
  if (!hoveredId) return null;
  const node = nodes.get(hoveredId);
  if (!node) return null;

  const info = nodeTypeDesc(node);
  if (!info) return null;

  return (
    <div style={{
      position:   'absolute',
      bottom:     8,
      left:       8,
      maxWidth:   220,
      background: 'rgba(5,13,18,0.92)',
      border:     `1px solid ${info.color ?? COLORS.HUD_BORDER}`,
      padding:    '8px 12px',
      pointerEvents: 'none',
    }}>
      <div style={{
        color:        info.color ?? COLORS.TEXT_PRIMARY,
        fontSize:     11,
        fontWeight:   'bold',
        letterSpacing: 1,
        marginBottom: 4,
      }}>
        {info.title}
      </div>
      <div style={{
        color:    COLORS.TEXT_DIM,
        fontSize: 10,
        lineHeight: 1.5,
        fontFamily: "'Courier New', monospace",
      }}>
        {info.body}
      </div>
    </div>
  );
}
