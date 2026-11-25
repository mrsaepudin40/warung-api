// Warung Api — input: keyboard and mouse, nothing else.
// One job: keep the live key set and the latest click. The game loop reads it.
export function createInput(canvas, onInteract, onRestart) {
  const keys = new Set();
  let click = null;

  const KEYMAP = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down',
    a: 'a',
    d: 'd',
    w: 'w',
    s: 's',
  };

  function down(e) {
    const name = KEYMAP[e.key];
    if (name) {
      keys.add(name);
      e.preventDefault();
      return;
    }
    if (e.key === 'e' || e.key === 'E' || e.key === ' ') {
      onInteract();
      e.preventDefault();
      return;
    }
    if (e.key === 'r' || e.key === 'R') {
      onRestart();
      return;
    }
    if (e.key === 'm' || e.key === 'M') {
      keys.add('muteToggle');
    }
  }

  function up(e) {
    const name = KEYMAP[e.key];
    if (name) keys.delete(name);
  }

  function clickAt(e) {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 1280;
    const y = ((e.clientY - rect.top) / rect.height) * 720;
    click = { x, y, t: performance.now() };
  }

  window.addEventListener('keydown', down);
  window.addEventListener('keyup', up);
  canvas.addEventListener('pointerdown', clickAt);

  return {
    keys,
    takeClick() {
      const c = click;
      click = null;
      return c;
    },
    consumeMute() {
      const had = keys.has('muteToggle');
      if (had) keys.delete('muteToggle');
      return had;
    },
  };
}
