// Warung Api — the cook: walking, the tray, and what E does at each station.
// One job: movement plus interaction. No drawing, no ticket math.
import { CHOP_SECONDS, FLOOR, PANTRY_ORDER, PLAYER_SPEED, STATIONS, TRAY_MAX } from './config.js';
import { addFloat, addPuffs, flashMessage } from './kitchen.js';
import { consumeForRecipe, firstChoppable, firstCookable, ingredientName, recipeById } from './recipes.js';
import { serveDish, wokQuality } from './orders.js';

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function distToRect(px, py, r) {
  const cx = clamp(px, r.x, r.x + r.w);
  const cy = clamp(py, r.y, r.y + r.h);
  return Math.hypot(px - cx, py - cy);
}

// Which station the cook can reach right now, and which pantry bin.
export function nearestStation(player) {
  let best = null;
  let bestD = 110;
  for (const [name, rect] of Object.entries(STATIONS)) {
    const d = distToRect(player.x, player.y, rect);
    if (d < bestD) {
      bestD = d;
      best = name;
    }
  }
  if (best === 'pantry') {
    let bin = null;
    let binD = 70;
    PANTRY_ORDER.forEach((id, i) => {
      const cx = STATIONS.pantry.x + 32 + i * 64;
      const cy = STATIONS.pantry.y + 33;
      const d = Math.hypot(player.x - cx, player.y - cy);
      if (d < binD) {
        binD = d;
        bin = id;
      }
    });
    return { station: 'pantry', bin, dist: bestD };
  }
  return best ? { station: best, bin: null, dist: bestD } : null;
}

export function stepPlayer(state, keys, dt) {
  const p = state.player;
  if (state.screen !== 'play') return;
  if (p.chopping) {
    p.chopping.t += dt;
    if (p.chopping.t >= CHOP_SECONDS) {
      p.chopping.ing.chopped = true;
      addPuffs(state, p.x, p.y - 20, 6, '#8fe08a');
      p.chopping = null;
    }
    return;
  }
  let dx = 0;
  let dy = 0;
  if (keys.has('left') || keys.has('a')) dx -= 1;
  if (keys.has('right') || keys.has('d')) dx += 1;
  if (keys.has('up') || keys.has('w')) dy -= 1;
  if (keys.has('down') || keys.has('s')) dy += 1;
  if (dx === 0 && dy === 0 && p.target) {
    const tx = p.target.x - p.x;
    const ty = p.target.y - p.y;
    const d = Math.hypot(tx, ty);
    if (d < 8) {
      p.target = null;
    } else {
      dx = tx / d;
      dy = ty / d;
    }
  }
  const len = Math.hypot(dx, dy);
  if (len > 0) {
    p.x += (dx / len) * PLAYER_SPEED * dt;
    p.y += (dy / len) * PLAYER_SPEED * dt;
    p.facing = dx < 0 ? -1 : dx > 0 ? 1 : p.facing;
    p.walking = true;
  } else {
    p.walking = false;
  }
  p.x = clamp(p.x, FLOOR.x + 10, FLOOR.x + FLOOR.w - 10);
  p.y = clamp(p.y, FLOOR.y + 8, FLOOR.y + FLOOR.h - 10);
}

// The E / Space / click action at the nearest station. Returns a sound name.
export function interact(state) {
  const p = state.player;
  if (state.screen !== 'play' || p.chopping) return null;
  const near = nearestStation(p);
  if (!near) return null;
  const tray = state.tray;

  if (near.station === 'pantry') {
    if (!near.bin) {
      flashMessage(state, 'Step up to a pantry bin to grab an ingredient.');
      return null;
    }
    if (tray.length >= TRAY_MAX) {
      flashMessage(state, 'Tray is full — cook or serve something first.');
      return null;
    }
    tray.push({ kind: 'ing', id: near.bin, chopped: false });
    addFloat(state, p.x, p.y - 44, '+' + ingredientName(near.bin), '#f7e8c8');
    return 'grab';
  }

  if (near.station === 'board') {
    const raw = firstChoppable(tray);
    if (!raw) {
      flashMessage(state, 'Nothing to chop — grab chicken, veg or chilli first.');
      return null;
    }
    p.chopping = { ing: raw, t: 0 };
    return 'chopStart';
  }

  if (near.station === 'wok') {
    if (state.wok.cooking) {
      if (tray.length >= TRAY_MAX) {
        flashMessage(state, 'Tray is full — make room for the dish.');
        return null;
      }
      const quality = wokQuality(state.wok.heat);
      const recipeId = state.wok.recipeId;
      state.wok.cooking = false;
      state.wok.recipeId = null;
      state.wok.heat = 0;
      tray.push({ kind: 'dish', recipeId, quality, plated: false });
      addFloat(state, p.x, p.y - 44, quality === 'perfect' ? 'Perfect!' : 'Out of the wok!', '#7be495');
      return quality === 'perfect' ? 'perfect' : 'takeout';
    }
    const recipe = firstCookable(tray);
    if (!recipe) {
      flashMessage(state, 'The wok needs a full recipe — check the ticket.');
      return null;
    }
    return startCooking(state, recipe);
  }

  if (near.station === 'plating') {
    const dish = tray.find((t) => t.kind === 'dish' && !t.plated);
    if (!dish) {
      flashMessage(state, 'Nothing to plate — cook a dish in the wok first.');
      return null;
    }
    dish.plated = true;
    addFloat(state, p.x, p.y - 44, 'Plated!', '#f7e8c8');
    return 'plate';
  }

  if (near.station === 'serve') {
    const result = serveDish(state);
    if (result === 'served') return 'serve';
    if (result === 'noDish') flashMessage(state, 'Serve a plated dish here.');
    return null;
  }
  return null;
}

function startCooking(state, recipe) {
  // Pull the recipe's ingredients out of the tray and into the wok.
  consumeForRecipe(state.tray, recipe);
  state.wok.cooking = true;
  state.wok.recipeId = recipe.id;
  state.wok.heat = 0;
  addFloat(state, 844, 130, recipe.name + ' in the wok!', '#ffb347');
  return 'sizzle';
}
