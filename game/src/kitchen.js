// Warung Api — the kitchen: world state, the day clock, tickets and the wok.
// One job: own the mutable game state and step it forward. No drawing here.
import {
  DAY_LENGTH,
  PLAYER_START,
  RECIPES,
  WOK_SECONDS,
  dayProgress,
  makeRng,
  spawnGap,
  ticketLife,
} from './config.js';

let nextTicketId = 1;

export function freshGame() {
  return {
    screen: 'title',
    time: 0,
    coins: 0,
    served: 0,
    combo: 0,
    bestCombo: 0,
    burnt: 0,
    expired: 0,
    tickets: [],
    tray: [],
    player: {
      x: PLAYER_START.x,
      y: PLAYER_START.y,
      facing: 1,
      walking: false,
      chopping: null,
      target: null,
    },
    wok: { cooking: false, recipeId: null, heat: 0 },
    serveCounterDish: null,
    floats: [],
    puffs: [],
    message: null,
    messageT: 0,
    serveBanner: null,
    serveBannerT: 0,
    spawnTimer: 4,
    rng: makeRng(20261125),
    results: null,
    muted: false,
  };
}

export function startDay(state) {
  const fresh = freshGame();
  fresh.muted = state.muted;
  Object.assign(state, fresh);
  state.screen = 'play';
  dealTicket(state, state.rng);
  dealTicket(state, state.rng);
}

export function pickRecipe(rng) {
  return RECIPES[Math.floor(rng() * RECIPES.length)];
}

export function dealTicket(state, rng) {
  const recipe = pickRecipe(rng || state.rng);
  const life = ticketLife(dayProgress(state));
  state.tickets.push({
    id: nextTicketId,
    recipeId: recipe.id,
    timeLeft: life,
    total: life,
  });
  nextTicketId += 1;
}

export function addFloat(state, x, y, text, color) {
  state.floats.push({ x, y, text, color: color || '#f2b234', t: 0 });
}

export function addPuffs(state, x, y, n, color) {
  for (let i = 0; i < n; i += 1) {
    state.puffs.push({
      x: x + (state.rng() - 0.5) * 36,
      y: y + (state.rng() - 0.5) * 16,
      vx: (state.rng() - 0.5) * 30,
      vy: -28 - state.rng() * 30,
      t: 0,
      life: 0.6 + state.rng() * 0.5,
      color: color || '#ffffff',
      size: 3 + state.rng() * 5,
    });
  }
}

export function flashMessage(state, text) {
  state.message = text;
  state.messageT = 1.6;
}

// Step the whole kitchen forward by dt seconds. Returns events the loop
// turns into sounds: 'expire', 'burn', 'tick'.
export function stepKitchen(state, dt) {
  const events = [];
  if (state.screen !== 'play') return events;
  state.time += dt;
  const progress = dayProgress(state);

  // Tickets count down; an expired ticket kills the combo.
  for (const ticket of state.tickets) {
    const before = ticket.timeLeft;
    ticket.timeLeft -= dt;
    if (before > 10 && ticket.timeLeft <= 10) events.push('tick');
    if (ticket.timeLeft <= 0) {
      state.tickets.splice(state.tickets.indexOf(ticket), 1);
      state.expired += 1;
      state.combo = 0;
      flashMessage(state, 'Ticket expired — customer left angry!');
      events.push('expire');
    }
  }

  // New tickets arrive faster as the day wears on.
  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0 && state.tickets.length < 3) {
    dealTicket(state, state.rng);
    state.spawnTimer = spawnGap(progress);
  }

  // The wok heats; a full bar burns the dish.
  if (state.wok.cooking) {
    state.wok.heat += (dt / WOK_SECONDS) * 100;
    if (Math.random() < dt * 6) {
      addPuffs(state, 844, 168, 1, 'rgba(255,255,255,0.7)');
    }
    if (state.wok.heat >= 100) {
      state.wok.cooking = false;
      state.wok.recipeId = null;
      state.wok.heat = 0;
      state.burnt += 1;
      state.combo = 0;
      flashMessage(state, 'Burnt! The dish is ruined.');
      events.push('burn');
    }
  }

  // Floating texts and steam drift up and fade.
  for (const f of state.floats) f.t += dt;
  state.floats = state.floats.filter((f) => f.t < 1.1);
  for (const p of state.puffs) {
    p.t += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }
  state.puffs = state.puffs.filter((p) => p.t < p.life);
  if (state.messageT > 0) state.messageT -= dt;
  if (state.serveBannerT > 0) state.serveBannerT -= dt;

  // The day ends when the clock runs out.
  if (state.time >= DAY_LENGTH) {
    state.screen = 'end';
    const stars = state.coins >= 1500 ? 3 : state.coins >= 900 ? 2 : 1;
    state.results = {
      dishes: state.served,
      coins: state.coins,
      bestCombo: state.bestCombo,
      burnt: state.burnt,
      expired: state.expired,
      stars,
    };
    events.push('dayEnd');
  }
  return events;
}
