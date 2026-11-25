// Warung Api — sound: WebAudio oscillator bleeps only. No files, no network.
// One job: turn game events into short sounds. Silence until the player
// first interacts, so the browser's autoplay rules stay happy.
let ctx = null;
let muted = false;

export function setMuted(m) {
  muted = m;
}

export function ensureAudio() {
  if (!ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    } catch (e) {
      ctx = null;
    }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

function tone(freq, dur, type, vol, when) {
  if (muted || !ctx) return;
  const t0 = ctx.currentTime + (when || 0);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export function playSound(name) {
  ensureAudio();
  if (muted || !ctx) return;
  switch (name) {
    case 'grab':
      tone(520, 0.08, 'triangle', 0.1);
      break;
    case 'chopStart':
      tone(190, 0.07, 'square', 0.08);
      tone(150, 0.07, 'square', 0.08, 0.09);
      break;
    case 'chopDone':
      tone(660, 0.09, 'triangle', 0.1);
      break;
    case 'sizzle':
      tone(1200, 0.25, 'sawtooth', 0.03);
      tone(900, 0.3, 'sawtooth', 0.03, 0.1);
      break;
    case 'takeout':
      tone(440, 0.1, 'triangle', 0.1);
      break;
    case 'perfect':
      tone(660, 0.1, 'sine', 0.12);
      tone(880, 0.14, 'sine', 0.12, 0.09);
      break;
    case 'plate':
      tone(740, 0.08, 'triangle', 0.1);
      tone(980, 0.1, 'triangle', 0.1, 0.07);
      break;
    case 'serve':
      tone(880, 0.12, 'sine', 0.14);
      tone(1174, 0.18, 'sine', 0.14, 0.1);
      break;
    case 'expire':
      tone(220, 0.25, 'sawtooth', 0.08);
      tone(160, 0.3, 'sawtooth', 0.08, 0.12);
      break;
    case 'burn':
      tone(140, 0.35, 'sawtooth', 0.1);
      break;
    case 'tick':
      tone(980, 0.05, 'square', 0.05);
      break;
    case 'dayEnd':
      tone(523, 0.15, 'sine', 0.12);
      tone(659, 0.15, 'sine', 0.12, 0.14);
      tone(784, 0.25, 'sine', 0.12, 0.28);
      break;
    default:
      break;
  }
}
