// Warung Api — the loop: screens, the clock, and the wiring between modules.
// One job: run the game. All rules live in kitchen/orders/player; all pixels
// in render; all sounds in audio.
import { DAY_LENGTH, VIEW } from './config.js';
import { freshGame, startDay, stepKitchen } from './kitchen.js';
import { interact, nearestStation, stepPlayer } from './player.js';
import { createInput } from './input.js';
import { ensureAudio, playSound, setMuted } from './audio.js';
import { render } from './render.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

const state = freshGame();
let last = performance.now();
let muted = false;

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');

const input = createInput(
  canvas,
  () => doInteract(),
  () => {
    if (state.screen === 'end') startDay(state);
  },
);

function doInteract() {
  ensureAudio();
  if (state.screen === 'title') {
    startDay(state);
    playSound('serve');
    return;
  }
  if (state.screen === 'end') {
    startDay(state);
    return;
  }
  const sound = interact(state);
  if (sound) playSound(sound);
}

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  if (input.consumeMute()) {
    muted = !muted;
    setMuted(muted);
    state.muted = muted;
  }

  // Staged screenshot scenes are frozen: the frame must stay exactly as
  // stageShot built it, not tick forward while the screenshot is taken.
  if (!shotName) {
    const click = input.takeClick();
  if (click) {
    ensureAudio();
    if (state.screen === 'title' || state.screen === 'end') {
      startDay(state);
    } else {
      const near = nearestStation(state.player);
      if (near) {
        doInteract();
      } else {
        state.player.target = { x: click.x, y: click.y };
      }
    }
  }

  if (state.screen === 'play') {
    const wasChopping = state.player.chopping !== null;
    stepPlayer(state, input.keys, dt);
    if (wasChopping && state.player.chopping === null) playSound('chopDone');
    const events = stepKitchen(state, dt);
    for (const e of events) playSound(e);
  }
  }

  render(ctx, state, VIEW);
  const dayLeft = Math.max(0, Math.ceil(DAY_LENGTH - state.time));
  statusEl.textContent =
    state.screen === 'play'
      ? `Warung Api: ${state.served} dishes served, ${state.coins} coins, ${dayLeft} seconds left in the day.`
      : state.screen === 'end'
        ? `Day over: ${state.served} dishes, ${state.coins} coins. Press R to cook again.`
        : 'Warung Api: press Enter or click to start cooking.';
  window.__shotReady = true;
  requestAnimationFrame(frame);
}

if (shotName) {
  stageShot(state, shotName);
  render(ctx, state, VIEW);
  window.__shotReady = true;
}
requestAnimationFrame(frame);
