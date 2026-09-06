// TechWebster: a lightweight, synchronized CSS offset demonstration.
(() => {
  const grid = document.querySelector('.preview-grid');
  const box = document.querySelector('.preview-origin');
  const target = document.querySelector('.preview-target');
  const left = document.querySelector('#demo-left');
  const top = document.querySelector('#demo-top');
  const heading = document.querySelector('.typing-line');
  const toggle = document.querySelector('.preview-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const phrases = ['By playing.', 'With practice.', 'One move at a time.'];
  let paused = false, frame = 0, elapsed = 0, last = 0;
  let bounds = { x: 100, y: 100 };
  const resize = () => {
    bounds = { x: Math.max(0, grid.clientWidth - 124), y: Math.max(0, grid.clientHeight - 150) };
    render(elapsed);
  };
  function render(time) {
    const steps = [[0, 0], [1, 0], [1, 1], [.35, 1], [.35, .3], [0, 0]];
    const duration = 2200;
    const step = Math.floor(time / duration) % steps.length;
    const previous = steps[(step + steps.length - 1) % steps.length];
    const next = steps[step];
    const progress = Math.min((time % duration) / 850, 1);
    const ease = 1 - Math.pow(1 - progress, 4);
    const x = Math.round((previous[0] + (next[0] - previous[0]) * ease) * bounds.x);
    const y = Math.round((previous[1] + (next[1] - previous[1]) * ease) * bounds.y);
    box.style.transform = `translate(${x}px, ${y}px)`;
    target.style.transform = `translate(${Math.round(next[0] * bounds.x)}px, ${Math.round(next[1] * bounds.y)}px)`;
    left.textContent = x;
    top.textContent = y;
    const phraseTime = time % 4600;
    const phrase = phrases[Math.floor(time / 4600) % phrases.length];
    // Hold a full phrase, erase, then type the next phrase without shifting layout.
    const length = phraseTime < 1000 ? Math.ceil(phraseTime / 1000 * phrase.length)
      : phraseTime < 3500 ? phrase.length : Math.max(0, Math.ceil((4600 - phraseTime) / 1100 * phrase.length));
    heading.textContent = phrase.slice(0, length);
  }
  function tick(now) {
    if (last) elapsed += Math.min(now - last, 100);
    last = now;
    render(elapsed);
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);
    last = 0;
    const stopped = paused || reduced.matches || document.hidden;
    toggle.textContent = paused ? 'Resume animation' : 'Pause animation';
    toggle.hidden = reduced.matches;
    document.documentElement.classList.toggle('hero-animating', !stopped);
    if (reduced.matches) { render(0); heading.textContent = phrases[0]; }
    else if (!stopped) frame = requestAnimationFrame(tick);
  }
  toggle.addEventListener('click', () => { paused = !paused; sync(); });
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  new ResizeObserver(resize).observe(grid);
  resize();
  sync();
})();
