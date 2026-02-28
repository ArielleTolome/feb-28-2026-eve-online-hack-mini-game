// Grid dimensions
export const COLS = 8;
export const ROWS = 7;

// Hex size and spacing
export const HEX_R = 32;         // radius of hex circle
export const SX = HEX_R * 2.1;  // horizontal step
export const SY = HEX_R * 1.85; // vertical step
export const PAD_X = HEX_R * 1.5;
export const PAD_Y = HEX_R * 1.2;

// SVG canvas dimensions
export const CANVAS_W = PAD_X * 2 + (COLS - 1) * SX + SX / 2;
export const CANVAS_H = PAD_Y * 2 + (ROWS - 1) * SY;

// Node types
export const TYPE = Object.freeze({
  EMPTY:            'empty',
  START:            'start',
  CORE:             'core',
  FIREWALL:         'firewall',
  ACCESS_DENIED:    'access_denied',
  RESTORATION_NODE: 'restoration_node',
  KERNEL_ROT:       'kernel_rot',
  SECONDARY_VECTOR: 'secondary_vector',
  SUPPRESSOR:       'suppressor',
  DATA_CACHE:       'data_cache',
});

// Node states (visibility / interaction state)
export const STATE = Object.freeze({
  HIDDEN:      'hidden',
  ACCESSIBLE:  'accessible',
  REVEALED:    'revealed',
  DESTROYED:   'destroyed',
  EMPTY:       'empty',  // explored empty node
});

// Colors palette
export const COLORS = Object.freeze({
  BG:          '#050d12',
  GRID_DARK:   '#0a1a24',
  CIRCUIT:     '#0d2a38',

  NODE_HIDDEN:       '#0d1f2d',
  NODE_BORDER_HIDDEN:'#1a3d52',
  NODE_ACCESSIBLE:   '#0d2a38',
  NODE_ACCESSIBLE_BORDER: '#00d4ff',
  NODE_EMPTY:        '#071218',
  NODE_EMPTY_BORDER: '#0d3344',

  START_FILL:   '#003344',
  START_BORDER: '#00aaff',

  CORE_FILL:    '#1a0022',
  CORE_BORDER:  '#cc00ff',
  CORE_GLOW:    '#9900cc',

  ENEMY_FILL:   '#1a0505',
  ENEMY_BORDER: '#ff3300',
  ENEMY_DEAD:   '#1a0a00',

  UTILITY_FILL:  '#001a0d',
  UTILITY_BORDER:'#00ff88',

  CACHE_FILL:    '#1a1400',
  CACHE_BORDER:  '#ffcc00',
  CACHE_OPEN:    '#332800',

  EDGE_COLOR:    '#ff6600',
  EDGE_OPACITY:  0.7,

  COHERENCE_HIGH:  '#00ff88',
  COHERENCE_MED:   '#ffcc00',
  COHERENCE_LOW:   '#ff3300',

  HUD_BG:        '#080e14',
  HUD_BORDER:    '#1a3344',
  TEXT_PRIMARY:  '#00d4ff',
  TEXT_DIM:      '#3a5a6a',
  TEXT_WARN:     '#ffcc00',
  TEXT_DANGER:   '#ff3300',
  TEXT_SUCCESS:  '#00ff88',

  UTILITY_SLOT_EMPTY:  '#0a1a22',
  UTILITY_SLOT_FILLED: '#001a0d',
  UTILITY_SLOT_ACTIVE: '#332800',
});

// Difficulty configurations
export const DIFFICULTY = Object.freeze({
  rookie: {
    label: 'Rookie',
    firewalls:     4,
    accessDenied:  1,
    suppressor:    1,
    kernelRot:     2,
    restoration:   1,
    dataCaches:    2,
    coreHp:        30,
    enemyStrRange: [1, 2],
    playerHp:      100,
    description:   'Minimal defenses. Easy breach.',
  },
  standard: {
    label: 'Standard',
    firewalls:     6,
    accessDenied:  2,
    suppressor:    2,
    kernelRot:     2,
    restoration:   1,
    dataCaches:    2,
    coreHp:        50,
    enemyStrRange: [2, 4],
    playerHp:      100,
    description:   'Balanced challenge.',
  },
  elite: {
    label: 'Elite',
    firewalls:     9,
    accessDenied:  3,
    suppressor:    3,
    kernelRot:     1,
    restoration:   1,
    dataCaches:    2,
    coreHp:        80,
    enemyStrRange: [3, 6],
    playerHp:      100,
    description:   'Heavy defenses. Good luck.',
  },
});

// Utility types
export const UTILITY_TYPE = Object.freeze({
  KERNEL_ROT:       'kernel_rot',       // halves enemy HP on use
  RESTORATION_NODE: 'restoration_node', // restores 30 coherence
});

// Game phases
export const PHASE = Object.freeze({
  TITLE:    'title',
  PLAYING:  'playing',
  WIN:      'win',
  LOSE:     'lose',
});

// Combat
export const CORE_ATTACK_DMG = 10;  // damage core deals per turn when reached
export const RETAL_DAMAGE_PER_STR = 5; // base retaliation multiplier

// Log max entries
export const LOG_MAX = 50;
