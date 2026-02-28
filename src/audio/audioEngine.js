/**
 * Procedural audio engine using Web Audio API.
 * AudioContext is lazily created on first user interaction.
 * All sound functions are safe to call even before context creation.
 */

let ctx = null;

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

// ── Primitive generators ───────────────────────────────────────────────────────

function playTone({ freq = 440, type = 'sine', gain = 0.15, duration = 0.1, delay = 0, attack = 0.01, release = 0.05 } = {}) {
  try {
    const c = getCtx();
    const now = c.currentTime + delay;

    const osc = c.createOscillator();
    const gainNode = c.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(gain, now + attack);
    gainNode.gain.setValueAtTime(gain, now + duration - release);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    osc.connect(gainNode);
    gainNode.connect(c.destination);

    osc.start(now);
    osc.stop(now + duration);
  } catch (e) {
    // Silently fail — audio is non-critical
  }
}

function playNoise({ gain = 0.05, duration = 0.1, delay = 0, lowpass = 800 } = {}) {
  try {
    const c = getCtx();
    const now = c.currentTime + delay;
    const bufLen = Math.ceil(c.sampleRate * duration);
    const buf = c.createBuffer(1, bufLen, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

    const src = c.createBufferSource();
    src.buffer = buf;

    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(lowpass, now);

    const gainNode = c.createGain();
    gainNode.gain.setValueAtTime(gain, now);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    src.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(c.destination);

    src.start(now);
    src.stop(now + duration);
  } catch (e) {}
}

// ── Named sound events ─────────────────────────────────────────────────────────

/** UI click - short high tick */
export function playClick() {
  playTone({ freq: 1200, type: 'square', gain: 0.06, duration: 0.04, attack: 0.001, release: 0.02 });
}

/** Generic node reveal - soft blip */
export function playNodeReveal() {
  playTone({ freq: 600, type: 'sine', gain: 0.12, duration: 0.12 });
  playTone({ freq: 900, type: 'sine', gain: 0.06, duration: 0.08, delay: 0.04 });
}

/** Enemy revealed - low harsh buzz */
export function playEnemyReveal() {
  playNoise({ gain: 0.08, duration: 0.08, lowpass: 600 });
  playTone({ freq: 180, type: 'sawtooth', gain: 0.10, duration: 0.15, attack: 0.01 });
}

/** Core revealed - dramatic rising tone */
export function playCoreReveal() {
  playTone({ freq: 300, type: 'sine', gain: 0.15, duration: 0.3, attack: 0.05 });
  playTone({ freq: 450, type: 'sine', gain: 0.10, duration: 0.25, delay: 0.15 });
  playTone({ freq: 600, type: 'sine', gain: 0.08, duration: 0.2, delay: 0.3 });
}

/** Data cache found - mysterious tone */
export function playCacheReveal() {
  playTone({ freq: 800, type: 'triangle', gain: 0.10, duration: 0.2 });
  playTone({ freq: 600, type: 'triangle', gain: 0.08, duration: 0.15, delay: 0.1 });
}

/** Utility picked up - bright arpeggio */
export function playUtilityPickup() {
  playTone({ freq: 523, type: 'sine', gain: 0.12, duration: 0.1 });
  playTone({ freq: 659, type: 'sine', gain: 0.10, duration: 0.1, delay: 0.08 });
  playTone({ freq: 784, type: 'sine', gain: 0.08, duration: 0.15, delay: 0.16 });
}

/** Utility activated - resonant tone */
export function playUtilityActivate() {
  playTone({ freq: 400, type: 'triangle', gain: 0.14, duration: 0.2, attack: 0.02 });
  playTone({ freq: 800, type: 'triangle', gain: 0.06, duration: 0.15, delay: 0.1 });
}

/** Player took damage - harsh impact */
export function playDamage() {
  playNoise({ gain: 0.12, duration: 0.12, lowpass: 400 });
  playTone({ freq: 120, type: 'sawtooth', gain: 0.14, duration: 0.18, attack: 0.005 });
}

/** Enemy destroyed - satisfying pop */
export function playEnemyDestroyed() {
  playTone({ freq: 220, type: 'sine', gain: 0.15, duration: 0.08, attack: 0.005 });
  playNoise({ gain: 0.06, duration: 0.15, lowpass: 1000 });
  playTone({ freq: 440, type: 'sine', gain: 0.08, duration: 0.12, delay: 0.05 });
}

/** Win - triumphant chord */
export function playWin() {
  const freqs = [523, 659, 784, 1047];
  freqs.forEach((f, i) => {
    playTone({ freq: f, type: 'sine', gain: 0.12, duration: 0.6, delay: i * 0.08, attack: 0.02, release: 0.2 });
  });
}

/** Lose - descending tone */
export function playLose() {
  playTone({ freq: 300, type: 'sawtooth', gain: 0.14, duration: 0.4, attack: 0.02, release: 0.2 });
  playTone({ freq: 200, type: 'sawtooth', gain: 0.12, duration: 0.4, delay: 0.3, attack: 0.02, release: 0.2 });
  playTone({ freq: 130, type: 'sawtooth', gain: 0.10, duration: 0.5, delay: 0.55, attack: 0.02, release: 0.3 });
  playNoise({ gain: 0.06, duration: 0.3, delay: 0.1, lowpass: 300 });
}
