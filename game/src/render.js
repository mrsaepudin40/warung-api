// Warung Api — render: every pixel on the canvas.
// One job: draw the state. No rules, no timing, no sound.
import { INGREDIENTS, PALETTE, PANTRY_ORDER, RECIPES, STATIONS, VIEW, dayProgress } from './config.js';
import { recipeById, recipeLine } from './recipes.js';
import { nearestStation } from './player.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, align, weight) {
  ctx.fillStyle = color;
  ctx.font = (weight || 'bold') + ' ' + size + 'px Arial, sans-serif';
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

function star(ctx, cx, cy, r, filled) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = filled ? PALETTE.gold : '#5a4a33';
  ctx.fill();
  ctx.strokeStyle = '#241a10';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// Small food icons, drawn from shapes so the game needs no image files.
export function drawIngredientIcon(ctx, id, cx, cy, s) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  switch (id) {
    case 'rice':
      ctx.fillStyle = '#f5efdd';
      ctx.beginPath();
      ctx.arc(0, 2, s * 0.8, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -2, s * 0.45, Math.PI, 0);
      ctx.fill();
      break;
    case 'noodle':
      ctx.strokeStyle = '#f2c14e';
      ctx.lineWidth = 3;
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.moveTo(-s, i * s * 0.45);
        ctx.quadraticCurveTo(0, i * s * 0.45 - s * 0.5, s, i * s * 0.45);
        ctx.stroke();
      }
      break;
    case 'egg':
      ctx.fillStyle = '#f7f3e3';
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.9, s * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f2a541';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.38, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'chilli':
      ctx.fillStyle = '#e23b2e';
      ctx.beginPath();
      ctx.moveTo(-s * 0.8, -s * 0.4);
      ctx.quadraticCurveTo(0, s, s * 0.9, -s * 0.7);
      ctx.quadraticCurveTo(s * 0.4, -s * 0.1, -s * 0.8, -s * 0.4);
      ctx.fill();
      ctx.strokeStyle = '#4fae4a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(s * 0.7, -s * 0.6);
      ctx.lineTo(s * 0.95, -s * 0.95);
      ctx.stroke();
      break;
    case 'chicken':
      ctx.fillStyle = '#d98a4b';
      ctx.beginPath();
      ctx.arc(-s * 0.15, s * 0.1, s * 0.62, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#f5efdd';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(s * 0.35, -s * 0.3);
      ctx.lineTo(s * 0.85, -s * 0.8);
      ctx.stroke();
      ctx.fillStyle = '#f5efdd';
      ctx.beginPath();
      ctx.arc(s * 0.85, -s * 0.8, s * 0.18, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'veg':
      ctx.fillStyle = '#4fae4a';
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.ellipse(i * s * 0.45, 0, s * 0.32, s * 0.62, i * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case 'sauce':
      ctx.fillStyle = '#8a4b2d';
      rr(ctx, -s * 0.45, -s * 0.4, s * 0.9, s * 1.1, 3);
      ctx.fill();
      ctx.fillStyle = '#e8e0cc';
      ctx.fillRect(-s * 0.45, -s * 0.1, s * 0.9, s * 0.35);
      ctx.fillStyle = '#2a1f14';
      ctx.fillRect(-s * 0.25, -s * 0.85, s * 0.5, s * 0.5);
      break;
    default:
      break;
  }
  ctx.restore();
}

export function drawDishIcon(ctx, recipeId, cx, cy, s) {
  const recipe = recipeById(recipeId);
  const color = recipe ? recipe.color : '#f2a541';
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = '#f7f3e3';
  ctx.beginPath();
  ctx.ellipse(0, s * 0.35, s, s * 0.45, 0, 0, Math.PI);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.72, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#4fae4a';
  ctx.beginPath();
  ctx.arc(-s * 0.3, -s * 0.25, s * 0.14, 0, Math.PI * 2);
  ctx.arc(s * 0.3, -s * 0.3, s * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFloor(ctx) {
  ctx.fillStyle = PALETTE.floor;
  ctx.fillRect(0, 132, VIEW.width, VIEW.height - 132);
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, 132, VIEW.width, 8);
  ctx.strokeStyle = PALETTE.floorLine;
  ctx.lineWidth = 2;
  for (let y = 280; y < VIEW.height; y += 88) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(VIEW.width, y);
    ctx.stroke();
  }
  // Centre prep table, dressed with ingredients.
  ctx.fillStyle = PALETTE.counter;
  rr(ctx, 480, 330, 320, 110, 12);
  ctx.fill();
  ctx.fillStyle = PALETTE.counterTop;
  rr(ctx, 480, 330, 320, 18, 12);
  ctx.fill();
  text(ctx, 'PREP', 640, 322, 13, '#9fb3ad', 'center');
  drawIngredientIcon(ctx, 'rice', 540, 385, 15);
  drawIngredientIcon(ctx, 'egg', 600, 385, 15);
  drawIngredientIcon(ctx, 'chilli', 660, 385, 15);
  drawIngredientIcon(ctx, 'veg', 720, 385, 15);
  text(ctx, 'Rice  Egg  Chilli  Veg', 640, 420, 12, '#cbbd9a', 'center');
}

function drawCounter(ctx, rect, label) {
  ctx.fillStyle = PALETTE.counter;
  rr(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.fill();
  ctx.fillStyle = PALETTE.counterTop;
  rr(ctx, rect.x, rect.y, rect.w, 14, 10);
  ctx.fill();
  ctx.fillStyle = PALETTE.counterTrim;
  ctx.fillRect(rect.x + 8, rect.y + rect.h - 6, rect.w - 16, 3);
  if (label) text(ctx, label, rect.x + rect.w / 2, rect.y + rect.h - 18, 13, '#9fb3ad', 'center');
}

function drawStations(ctx, state) {
  const near = state.screen === 'play' ? nearestStation(state.player) : null;

  // Pantry bins.
  drawCounter(ctx, STATIONS.pantry, '');
  text(ctx, 'PANTRY', STATIONS.pantry.x + 8, STATIONS.pantry.y - 12, 13, '#f7e8c8', 'left');
  PANTRY_ORDER.forEach((id, i) => {
    const cx = STATIONS.pantry.x + 32 + i * 64;
    const cy = STATIONS.pantry.y + 30;
    const hot = near && near.station === 'pantry' && near.bin === id;
    ctx.fillStyle = hot ? '#4a5a66' : '#2c333c';
    rr(ctx, cx - 26, cy - 24, 52, 48, 8);
    ctx.fill();
    if (hot) {
      ctx.strokeStyle = PALETTE.gold;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    drawIngredientIcon(ctx, id, cx, cy - 4, 13);
    text(ctx, INGREDIENTS[id].short, cx, cy + 19, 10, '#d8cdb2', 'center');
  });

  // Chopping board.
  drawCounter(ctx, STATIONS.board, '');
  ctx.fillStyle = PALETTE.boardWood;
  rr(ctx, STATIONS.board.x + 22, STATIONS.board.y + 12, 124, 34, 6);
  ctx.fill();
  ctx.strokeStyle = '#c8ccd2';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(STATIONS.board.x + 118, STATIONS.board.y + 18);
  ctx.lineTo(STATIONS.board.x + 142, STATIONS.board.y + 40);
  ctx.stroke();
  text(ctx, 'CHOP', STATIONS.board.x + STATIONS.board.w / 2, STATIONS.board.y + STATIONS.board.h + 14, 13, '#9fb3ad', 'center');

  // Wok with flame and heat bar.
  const wok = STATIONS.wok;
  drawCounter(ctx, wok, '');
  text(ctx, 'WOK', wok.x + wok.w / 2, wok.y - 12, 13, '#f7e8c8', 'center');
  ctx.fillStyle = PALETTE.flame;
  ctx.beginPath();
  ctx.moveTo(wok.x + 60, wok.y + wok.h - 8);
  ctx.lineTo(wok.x + 84, wok.y + wok.h - 34);
  ctx.lineTo(wok.x + 108, wok.y + wok.h - 8);
  ctx.moveTo(wok.x + 116, wok.y + wok.h - 8);
  ctx.lineTo(wok.x + 136, wok.y + wok.h - 28);
  ctx.lineTo(wok.x + 156, wok.y + wok.h - 8);
  ctx.fill();
  ctx.fillStyle = PALETTE.wokIron;
  ctx.beginPath();
  ctx.ellipse(wok.x + wok.w / 2, wok.y + 52, 78, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#565e68';
  ctx.lineWidth = 3;
  ctx.stroke();
  if (state.wok.cooking) {
    drawDishIcon(ctx, state.wok.recipeId, wok.x + wok.w / 2, wok.y + 44, 26);
    const bx = wok.x + 18;
    const bw = wok.w - 36;
    ctx.fillStyle = '#10151a';
    rr(ctx, bx, wok.y + wok.h - 22, bw, 10, 5);
    ctx.fill();
    ctx.fillStyle = '#3fae5a';
    ctx.fillRect(bx + (bw * 55) / 100, wok.y + wok.h - 22, (bw * 30) / 100, 10);
    const heatW = (bw * Math.min(100, state.wok.heat)) / 100;
    ctx.fillStyle = state.wok.heat >= 55 && state.wok.heat <= 85 ? '#7be495' : state.wok.heat > 85 ? '#e23b2e' : '#f2b234';
    ctx.fillRect(bx, wok.y + wok.h - 22, heatW, 10);
    text(ctx, 'HEAT — serve in the green!', wok.x + wok.w / 2, wok.y + wok.h + 16, 11, '#f7e8c8', 'center');
  } else {
    text(ctx, 'WOK — bring a full recipe', wok.x + wok.w / 2, wok.y + wok.h + 16, 11, '#9fb3ad', 'center');
  }

  // Plating counter.
  drawCounter(ctx, STATIONS.plating, '');
  ctx.fillStyle = '#f7f3e3';
  ctx.beginPath();
  ctx.ellipse(STATIONS.plating.x + 128, STATIONS.plating.y + 34, 52, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'PLATE', STATIONS.plating.x + STATIONS.plating.w / 2, STATIONS.plating.y + STATIONS.plating.h + 14, 13, '#9fb3ad', 'center');

  // Serve counter with its bell, and any finished plate waiting on it.
  const serve = STATIONS.serve;
  drawCounter(ctx, serve, 'SERVE');
  ctx.fillStyle = PALETTE.gold;
  ctx.beginPath();
  ctx.arc(serve.x + 40, serve.y + 52, 18, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(serve.x + 22, serve.y + 52, 36, 6);
  text(ctx, 'Ring the bell!', serve.x + 138, serve.y + 52, 12, '#f7e8c8', 'center');
  if (state.serveCounterDish) {
    drawDishIcon(ctx, state.serveCounterDish.recipeId, serve.x + 200, serve.y + 40, 24);
    text(ctx, 'READY', serve.x + 200, serve.y + 82, 12, '#7be495', 'center');
  }
}

function drawTickets(ctx, state) {
  // Awning stripes.
  for (let i = 0; i < 16; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? PALETTE.awningA : PALETTE.awningB;
    ctx.fillRect(i * 80, 0, 80, 34);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(0, 34, VIEW.width, 6);

  text(ctx, 'ORDER BOARD', 24, 52, 13, '#f7e8c8', 'left');
  for (let i = 0; i < 3; i += 1) {
    const x = 24 + i * 222;
    const y = 60;
    const ticket = state.tickets[i];
    ctx.fillStyle = ticket ? PALETTE.ticket : 'rgba(255,243,214,0.25)';
    rr(ctx, x, y, 208, 64, 8);
    ctx.fill();
    if (!ticket) {
      text(ctx, '— waiting —', x + 104, y + 32, 13, 'rgba(42,31,20,0.6)', 'center');
      continue;
    }
    const recipe = recipeById(ticket.recipeId);
    const urgent = ticket.timeLeft <= 10;
    if (urgent) {
      ctx.strokeStyle = PALETTE.red;
      ctx.lineWidth = 3;
      rr(ctx, x, y, 208, 64, 8);
      ctx.stroke();
    }
    drawDishIcon(ctx, ticket.recipeId, x + 30, y + 28, 18);
    text(ctx, recipe.name, x + 56, y + 18, 15, PALETTE.ticketInk, 'left');
    const secs = Math.max(0, Math.ceil(ticket.timeLeft));
    text(ctx, secs + 's', x + 192, y + 18, 16, urgent ? PALETTE.red : PALETTE.ticketInk, 'right');
    const bw = 180;
    ctx.fillStyle = '#d8c9a8';
    ctx.fillRect(x + 14, y + 46, bw, 8);
    ctx.fillStyle = urgent ? PALETTE.red : '#3fae5a';
    ctx.fillRect(x + 14, y + 46, (bw * Math.max(0, ticket.timeLeft)) / ticket.total, 8);
  }

  // Day timer, coins and combo on the right.
  const left = Math.max(0, Math.ceil(150 - state.time));
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, '0');
  text(ctx, 'DAY ' + mm + ':' + ss, 1000, 76, 34, left <= 20 ? PALETTE.red : '#ffffff', 'left');
  text(ctx, 'coins', 1000, 104, 12, '#cbbd9a', 'left');
  ctx.fillStyle = PALETTE.gold;
  ctx.beginPath();
  ctx.arc(1160, 76, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#8a6a1d';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'C', 1160, 77, 16, '#5a3d00', 'center');
  text(ctx, String(state.coins), 1184, 77, 22, '#ffffff', 'left');
  if (state.combo >= 2) {
    ctx.fillStyle = '#e8632c';
    rr(ctx, 1000, 112, 130, 24, 12);
    ctx.fill();
    text(ctx, 'COMBO x' + Math.min(state.combo, 3), 1065, 124, 15, '#ffffff', 'center');
  }
  if (dayProgress(state) > 0.6 && state.screen === 'play') {
    ctx.fillStyle = 'rgba(226,59,46,0.9)';
    rr(ctx, 700, 64, 150, 30, 8);
    ctx.fill();
    text(ctx, 'RUSH HOUR!', 775, 79, 15, '#ffffff', 'center');
  }
}

function drawPlayer(ctx, state) {
  const p = state.player;
  const bob = p.walking ? Math.sin(performance.now() / 90) * 2 : 0;
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + 26, 24, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // Body: teal shirt, white apron.
  ctx.fillStyle = '#2f9e8f';
  ctx.beginPath();
  ctx.arc(p.x, p.y + 6 + bob, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f7f3e3';
  rr(ctx, p.x - 12, p.y - 2 + bob, 24, 22, 6);
  ctx.fill();
  // Head and chef hat.
  ctx.fillStyle = '#e8b98a';
  ctx.beginPath();
  ctx.arc(p.x, p.y - 22 + bob, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(p.x - 9, p.y - 34 + bob, 8, 0, Math.PI * 2);
  ctx.arc(p.x, p.y - 38 + bob, 9, 0, Math.PI * 2);
  ctx.arc(p.x + 9, p.y - 34 + bob, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(p.x - 14, p.y - 36 + bob, 28, 8);
  // Chop progress ring.
  if (p.chopping) {
    const frac = Math.min(1, p.chopping.t / 1.2);
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(p.x, p.y - 52, 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#7be495';
    ctx.beginPath();
    ctx.arc(p.x, p.y - 52, 20, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
    ctx.stroke();
    text(ctx, 'CHOPPING…', p.x, p.y - 82, 13, '#ffffff', 'center');
  }
}

function drawTray(ctx, state) {
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  rr(ctx, 24, 640, 330, 56, 10);
  ctx.fill();
  text(ctx, 'TRAY', 40, 668, 13, '#cbbd9a', 'left');
  state.tray.forEach((item, i) => {
    const cx = 108 + i * 84;
    const cy = 668;
    if (item.kind === 'ing') {
      drawIngredientIcon(ctx, item.id, cx, cy, 15);
      text(ctx, INGREDIENTS[item.id].short + (item.chopped ? ' ✓' : ''), cx, cy + 26, 10, '#f7e8c8', 'center');
    } else {
      drawDishIcon(ctx, item.recipeId, cx, cy, 16);
      text(ctx, recipeById(item.recipeId).name + (item.plated ? ' ✓' : ''), cx, cy + 26, 10, '#f7e8c8', 'center');
    }
  });
  if (state.tray.length === 0) {
    text(ctx, 'empty — grab from the pantry', 108, 668, 12, '#9fb3ad', 'left');
  }
  text(ctx, 'WASD / arrows move · E interact · click a station', 640, 700, 13, '#cbbd9a', 'center');
}

function drawFloats(ctx, state) {
  for (const f of state.floats) {
    ctx.globalAlpha = Math.max(0, 1 - f.t / 1.1);
    text(ctx, f.text, f.x, f.y - f.t * 46, 20, f.color, 'center');
  }
  ctx.globalAlpha = 1;
  for (const p of state.puffs) {
    ctx.globalAlpha = Math.max(0, 1 - p.t / p.life) * 0.7;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawTitle(ctx) {
  ctx.fillStyle = 'rgba(20,12,6,0.62)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#fff3d6';
  rr(ctx, 290, 150, 700, 430, 16);
  ctx.fill();
  text(ctx, 'WARUNG API', 640, 205, 58, '#e8632c', 'center');
  text(ctx, 'Fire Stall — a street-food rush', 640, 248, 20, '#2a1f14', 'center');
  text(ctx, 'Run the warung: pantry → chop → wok → plate → serve.', 640, 282, 16, '#5a4a33', 'center');
  let y = 322;
  for (const recipe of RECIPES) {
    drawDishIcon(ctx, recipe.id, 360, y, 16);
    text(ctx, recipe.name + '  —  ' + recipeLine(recipe) + '  ·  ' + recipe.price + ' coins', 390, y, 16, '#2a1f14', 'left');
    y += 34;
  }
  text(ctx, 'WASD / arrows to move · E or click to interact · serve in the green heat window', 640, 480, 15, '#5a4a33', 'center');
  text(ctx, '3 serves in a row = combo tips · don\'t let a ticket hit zero!', 640, 508, 15, '#5a4a33', 'center');
  ctx.fillStyle = '#e8632c';
  rr(ctx, 490, 530, 300, 36, 18);
  ctx.fill();
  text(ctx, 'CLICK OR PRESS E TO START', 640, 548, 16, '#ffffff', 'center');
}

function drawEnd(ctx, state) {
  const r = state.results || { dishes: 0, coins: 0, bestCombo: 0, burnt: 0, expired: 0, stars: 1 };
  ctx.fillStyle = 'rgba(20,12,6,0.62)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = '#fff3d6';
  rr(ctx, 340, 130, 600, 440, 16);
  ctx.fill();
  text(ctx, 'DAY OVER!', 640, 180, 46, '#e8632c', 'center');
  for (let i = 0; i < 3; i += 1) star(ctx, 580 + i * 60, 232, 22, i < r.stars);
  text(ctx, 'Dishes served:  ' + r.dishes, 640, 292, 22, '#2a1f14', 'center');
  text(ctx, 'Coins earned:  ' + r.coins, 640, 326, 22, '#2a1f14', 'center');
  text(ctx, 'Best combo:  x' + Math.min(r.bestCombo, 3), 640, 360, 22, '#2a1f14', 'center');
  text(ctx, 'Burnt: ' + r.burnt + '   ·   Tickets lost: ' + r.expired, 640, 394, 16, '#5a4a33', 'center');
  const verdict = r.stars === 3 ? 'The warung is on fire — in a good way!' : r.stars === 2 ? 'A solid shift. The rush hour awaits.' : 'Slow day. Sharpen the knife and go again.';
  text(ctx, verdict, 640, 432, 16, '#5a4a33', 'center');
  ctx.fillStyle = '#2f9e8f';
  rr(ctx, 490, 470, 300, 36, 18);
  ctx.fill();
  text(ctx, 'PRESS R OR CLICK — COOK AGAIN', 640, 488, 15, '#ffffff', 'center');
  drawDishIcon(ctx, 'nasi', 640, 532, 22);
}

export function render(ctx, state, view) {
  ctx.clearRect(0, 0, view.width, view.height);
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, 0, view.width, view.height);
  drawFloor(ctx);
  drawStations(ctx, state);
  drawPlayer(ctx, state);
  drawFloats(ctx, state);
  drawTickets(ctx, state);
  drawTray(ctx, state);
  if (state.serveBannerT > 0 && state.serveBanner) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    rr(ctx, 390, 300, 500, 52, 12);
    ctx.fill();
    text(ctx, state.serveBanner, 640, 326, 24, '#f2b234', 'center');
  }
  if (state.messageT > 0 && state.message) {
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    rr(ctx, 440, 600, 400, 34, 17);
    ctx.fill();
    text(ctx, state.message, 640, 617, 15, '#ffffff', 'center');
  }
  if (state.screen === 'title') drawTitle(ctx);
  if (state.screen === 'end') drawEnd(ctx, state);
}
