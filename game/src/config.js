// Warung Api — tuning, palette, recipes and the kitchen layout.
// One job: every number, colour and station position the game uses lives here,
// so balancing the rush never means hunting through the draw code.
export const VIEW = { width: 1280, height: 720 };
export const DAY_LENGTH = 150;
export const PLAYER_SPEED = 265;
export const TRAY_MAX = 3;
export const CHOP_SECONDS = 1.2;
export const WOK_SECONDS = 5;
export const WOK_GREEN = { from: 55, to: 85 };
export const COMBO_STEP = 0.25;
export const COMBO_CAP = 3;

export const PALETTE = {
  floor: '#3a2a1c',
  floorLine: '#2e2115',
  wall: '#1d2b2e',
  awningA: '#e8632c',
  awningB: '#f7e8c8',
  counter: '#23272e',
  counterTop: '#39424e',
  counterTrim: '#2f9e8f',
  boardWood: '#b07a3e',
  wokIron: '#1c1f24',
  flame: '#ff9a1f',
  ticket: '#fff3d6',
  ticketInk: '#2a1f14',
  cream: '#f7e8c8',
  ink: '#241a10',
  red: '#e23b2e',
  green: '#3fae5a',
  gold: '#f2b234',
  teal: '#2f9e8f',
};

// Ingredients the pantry stocks. `chop` means the ingredient must be chopped
// on the board before the wok will take it.
export const INGREDIENTS = {
  rice: { name: 'Rice', short: 'Rice', chop: false, color: '#f5efdd' },
  noodle: { name: 'Noodle', short: 'Noodle', chop: false, color: '#f2c14e' },
  egg: { name: 'Egg', short: 'Egg', chop: false, color: '#f7f3e3' },
  chilli: { name: 'Chilli', short: 'Chilli', chop: true, color: '#e23b2e' },
  chicken: { name: 'Chicken', short: 'Chicken', chop: true, color: '#d98a4b' },
  veg: { name: 'Veg', short: 'Veg', chop: true, color: '#4fae4a' },
  sauce: { name: 'Sauce', short: 'Sauce', chop: false, color: '#8a4b2d' },
};
export const PANTRY_ORDER = ['rice', 'noodle', 'egg', 'chilli', 'chicken', 'veg', 'sauce'];

// Recipes. `needs` lists ingredient ids; a need with chopped:true must arrive
// at the wok already chopped. Same ingredients, different dishes.
export const RECIPES = [
  {
    id: 'nasi',
    name: 'Nasi Goreng',
    price: 120,
    color: '#f2a541',
    needs: [
      { ing: 'rice', chopped: false },
      { ing: 'egg', chopped: false },
      { ing: 'chilli', chopped: true },
    ],
  },
  {
    id: 'mie',
    name: 'Mie Goreng',
    price: 110,
    color: '#e8c33a',
    needs: [
      { ing: 'noodle', chopped: false },
      { ing: 'egg', chopped: false },
      { ing: 'veg', chopped: true },
    ],
  },
  {
    id: 'geprek',
    name: 'Ayam Geprek',
    price: 150,
    color: '#d96b2b',
    needs: [
      { ing: 'chicken', chopped: true },
      { ing: 'chilli', chopped: true },
    ],
  },
  {
    id: 'sate',
    name: 'Sate Ayam',
    price: 140,
    color: '#b5763a',
    needs: [
      { ing: 'chicken', chopped: true },
      { ing: 'sauce', chopped: false },
    ],
  },
];

// Station rectangles in play-field coordinates.
export const STATIONS = {
  pantry: { x: 24, y: 148, w: 448, h: 66 },
  board: { x: 512, y: 148, w: 168, h: 66 },
  wok: { x: 736, y: 132, w: 216, h: 104 },
  plating: { x: 1000, y: 148, w: 256, h: 66 },
  serve: { x: 1000, y: 556, w: 256, h: 116 },
};
export const FLOOR = { x: 16, y: 236, w: 1248, h: 464 };
export const PLAYER_START = { x: 640, y: 470 };

// Ticket pacing: spawn gap and ticket life tighten as the day goes on.
export function spawnGap(dayProgress) {
  return 14 - 6 * dayProgress;
}
export function ticketLife(dayProgress) {
  return 50 - 18 * dayProgress;
}
export function dayProgress(state) {
  return Math.min(1, state.time / DAY_LENGTH);
}

// Tiny deterministic RNG so staged screenshot scenes always look the same.
export function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
