// Warung Api — recipes: what a dish needs, and whether the tray can cook it.
// One job: answer questions about recipes. No drawing, no timing, no state.
import { INGREDIENTS, RECIPES } from './config.js';

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id) || null;
}

export function ingredientName(id) {
  const ing = INGREDIENTS[id];
  return ing ? ing.name : id;
}

export function needsChopping(id) {
  const ing = INGREDIENTS[id];
  return ing ? ing.chop : false;
}

// True when the tray holds every ingredient a recipe needs, with the chopped
// ones actually chopped. Tray entries are {kind:'ing', id, chopped}.
export function trayCanCook(tray, recipe) {
  const pool = tray.filter((t) => t.kind === 'ing');
  return recipe.needs.every((need) => {
    const idx = pool.findIndex((t) => t.id === need.ing && t.chopped === need.chopped);
    if (idx === -1) return false;
    pool.splice(idx, 1);
    return true;
  });
}

// Remove the ingredients a recipe consumes from the tray, in place.
export function consumeForRecipe(tray, recipe) {
  for (const need of recipe.needs) {
    const idx = tray.findIndex((t) => t.kind === 'ing' && t.id === need.ing && t.chopped === need.chopped);
    if (idx !== -1) tray.splice(idx, 1);
  }
}

// The first recipe the tray can cook right now, or null.
export function firstCookable(tray) {
  for (const recipe of RECIPES) {
    if (trayCanCook(tray, recipe)) return recipe;
  }
  return null;
}

// First tray ingredient that still needs chopping, or null.
export function firstChoppable(tray) {
  return tray.find((t) => t.kind === 'ing' && needsChopping(t.id) && !t.chopped) || null;
}

// A short "Rice + Egg + Chilli" line for the title screen and tickets.
export function recipeLine(recipe) {
  return recipe.needs
    .map((n) => ingredientName(n.ing) + (n.chopped ? ' (chopped)' : ''))
    .join(' + ');
}
