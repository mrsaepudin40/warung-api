// Warung Api — staged screenshot scenes behind ?shot=rush|title|chop|serve.
// One job: build a fixed, deterministic game state for each screenshot, using
// the real state shape and the real renderer, so every shot is a true render
// of the game's own code at a moment a player could reach.
import { addFloat, addPuffs, freshGame } from './kitchen.js';

function basePlay() {
  const state = freshGame();
  state.screen = 'play';
  return state;
}

function rushScene() {
  const state = basePlay();
  state.time = 95;
  state.coins = 1240;
  state.served = 9;
  state.combo = 3;
  state.bestCombo = 3;
  state.tickets = [
    { id: 1, recipeId: 'nasi', timeLeft: 8, total: 50 },
    { id: 2, recipeId: 'mie', timeLeft: 24, total: 50 },
    { id: 3, recipeId: 'sate', timeLeft: 38, total: 50 },
  ];
  // Cook at the wok with nasi goreng in the green heat window.
  state.player.x = 844;
  state.player.y = 300;
  state.player.facing = -1;
  state.wok = { cooking: true, recipeId: 'nasi', heat: 68 };
  // Mid-assembly: egg and chopped chilli already on the tray.
  state.tray = [
    { kind: 'ing', id: 'egg', chopped: false },
    { kind: 'ing', id: 'chilli', chopped: true },
  ];
  // A finished plate waits on the serve counter.
  state.serveCounterDish = { recipeId: 'mie', quality: 'perfect', plated: true };
  addPuffs(state, 844, 168, 10, 'rgba(255,255,255,0.8)');
  addFloat(state, 1128, 520, 'SERVED +180', '#7be495');
  state.spawnTimer = 6;
  return state;
}

function chopScene() {
  const state = basePlay();
  state.time = 40;
  state.coins = 320;
  state.served = 3;
  state.combo = 2;
  state.bestCombo = 2;
  state.tickets = [
    { id: 1, recipeId: 'nasi', timeLeft: 30, total: 50 },
    { id: 2, recipeId: 'geprek', timeLeft: 41, total: 50 },
  ];
  state.player.x = 596;
  state.player.y = 290;
  state.player.facing = 1;
  state.tray = [
    { kind: 'ing', id: 'chicken', chopped: false },
    { kind: 'ing', id: 'veg', chopped: false },
  ];
  // Chicken mid-chop, just past halfway.
  state.player.chopping = { ing: state.tray[0], t: 0.66 };
  addPuffs(state, 596, 260, 5, '#8fe08a');
  state.spawnTimer = 9;
  return state;
}

function serveScene() {
  const state = basePlay();
  state.screen = 'end';
  state.time = 150;
  state.coins = 1840;
  state.served = 12;
  state.combo = 3;
  state.bestCombo = 3;
  state.results = { dishes: 12, coins: 1840, bestCombo: 3, burnt: 1, expired: 2, stars: 3 };
  state.player.x = 1128;
  state.player.y = 500;
  state.serveCounterDish = { recipeId: 'sate', quality: 'perfect', plated: true };
  return state;
}

// Replace the live state with the staged scene named in the URL.
export function stageShot(state, name) {
  const staged = name === 'rush' ? rushScene() : name === 'chop' ? chopScene() : name === 'serve' ? serveScene() : freshGame();
  for (const key of Object.keys(staged)) {
    state[key] = staged[key];
  }
  return state;
}
