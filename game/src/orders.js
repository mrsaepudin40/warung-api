// Warung Api — orders: serving a ticket, tips and the combo.
// One job: turn a plated dish into coins. No movement, no drawing.
import { COMBO_CAP, COMBO_STEP } from './config.js';
import { recipeById } from './recipes.js';
import { addFloat, flashMessage } from './kitchen.js';

const QUALITY_PAY = { perfect: 1.5, ok: 1.0, raw: 0.5 };

// Serve the plated dish in the tray against the matching live ticket.
// Returns 'served' or 'noTicket'.
export function serveDish(state) {
  const dishIdx = state.tray.findIndex((t) => t.kind === 'dish' && t.plated);
  if (dishIdx === -1) return 'noDish';
  const dish = state.tray[dishIdx];
  const ticketIdx = state.tickets.findIndex((t) => t.recipeId === dish.recipeId);
  if (ticketIdx === -1) {
    flashMessage(state, 'No ticket wants this dish right now.');
    return 'noTicket';
  }
  const ticket = state.tickets[ticketIdx];
  const recipe = recipeById(dish.recipeId);
  const timeBonus = Math.round(40 * (ticket.timeLeft / ticket.total));
  const comboMult = 1 + COMBO_STEP * Math.min(state.combo, COMBO_CAP - 1);
  const earned = Math.round(recipe.price * QUALITY_PAY[dish.quality] * comboMult) + timeBonus;
  state.tickets.splice(ticketIdx, 1);
  state.tray.splice(dishIdx, 1);
  state.coins += earned;
  state.served += 1;
  state.combo += 1;
  if (state.combo > state.bestCombo) state.bestCombo = state.combo;
  const label =
    dish.quality === 'perfect'
      ? 'PERFECT +' + earned
      : dish.quality === 'raw'
        ? 'UNDERCOOKED +' + earned
        : 'SERVED +' + earned;
  addFloat(state, 1128, 540, label, dish.quality === 'perfect' ? '#7be495' : '#f2b234');
  state.serveBanner = recipe.name + ' served!  +' + earned + ' coins';
  if (state.combo >= 3) {
    state.serveBanner += '   COMBO x' + Math.min(state.combo, COMBO_CAP);
  }
  state.serveBannerT = 2.2;
  return 'served';
}

// Quality of a dish pulled from the wok at the current heat.
export function wokQuality(heat) {
  if (heat >= 55 && heat <= 85) return 'perfect';
  if (heat >= 30) return 'ok';
  return 'raw';
}
