const creative = document.querySelector('.creative');
const params = new URLSearchParams(location.search);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const isPreview = params.get('preview') === '1' && window.parent !== window;
const animations = [];
const pausedAnimations = new Set();
let ready = false;
let pendingStart = null;
let pausedAt = null;
let startedAt = null;
let clickTag = window.clickTag || 'https://example.com/landing';

// The DOM is the final composition. Animations only temporarily override it.
if (!reducedMotion.matches && !params.has('still')) creative.classList.add('is-preparing');

function setClickTag(value) {
  if (typeof value !== 'string') return;
  try {
    const url = new URL(value, location.href);
    if (!['http:', 'https:'].includes(url.protocol)) return;
    clickTag = url.href;
    creative.href = clickTag;
  } catch {
    // A malformed host tag falls back to the supplied landing page.
  }
}

setClickTag(clickTag);

creative.addEventListener('click', () => {
  // Read again so ad servers can assign their click tag after page load.
  setClickTag(window.clickTag || clickTag);
});

function stopAnimations() {
  for (const animation of animations) animation.cancel();
  animations.length = 0;
  pausedAnimations.clear();
  pausedAt = null;
}

function animate(element, frames, timing, startTime) {
  if (!element) return;
  const animation = element.animate(frames, { fill: 'both', ...timing });
  animation.startTime = startTime;
  animations.push(animation);
}

function start(epoch) {
  if (!ready) {
    pendingStart = epoch;
    return;
  }
  stopAnimations();
  creative.classList.remove('is-preparing');
  startedAt = epoch;
  creative.dataset.startedAt = String(epoch);
  if (reducedMotion.matches || params.has('still')) return;

  // Translate the shared wall-clock start into this document's timeline.
  const startTime = document.timeline.currentTime + epoch - Date.now();
  const ease = 'cubic-bezier(.16, 1, .3, 1)';
  animate(creative.querySelector('.backdrop'), [
    { opacity: 0, transform: 'scale(1.025)' },
    { opacity: 1, offset: .28 },
    { opacity: 1, transform: 'scale(1)' },
  ], { duration: 4400, easing: 'ease-out' }, startTime);
  animate(creative.querySelector('.brand'), [
    { opacity: 0, transform: 'translateY(-12px) scale(.94)' },
    { opacity: 1, transform: 'translateY(0) scale(1)' },
  ], { duration: 1050, delay: 450, easing: ease }, startTime);
  animate(creative.querySelector('.panel'), [
    { opacity: 0, transform: 'translateY(24px)' },
    { opacity: .83, transform: 'translateY(0)' },
  ], { duration: 900, delay: 1650, easing: ease }, startTime);
  animate(creative.querySelector('.copy'), [
    { opacity: 0, transform: 'translateY(10px)' },
    { opacity: 1, transform: 'translateY(0)' },
  ], { duration: 850, delay: 2100, easing: ease }, startTime);
  creative.querySelectorAll('.headline-line img').forEach((line, index) => {
    animate(line, [
      { opacity: 0, transform: 'translateY(20px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ], { duration: 1100, delay: 800 + index * 650, easing: ease }, startTime);
  });
  animate(creative.querySelector('.cta'), [
    { opacity: 0, transform: 'translateY(10px) scale(.96)' },
    { opacity: 1, transform: 'translateY(0) scale(1)' },
  ], { duration: 900, delay: 3200, easing: ease, fill: 'backwards' }, startTime);
  // Eight finite pulses finish at 30 seconds. No perpetual timers or loops.
  animate(creative.querySelector('.cta'), [
    { transform: 'scale(1)' },
    { transform: 'scale(1.025)', offset: .5 },
    { transform: 'scale(1)' },
  ], { duration: 3200, delay: 4400, iterations: 8, easing: 'ease-in-out', fill: 'none' }, startTime);
  if (document.hidden) pause();
}

function pause() {
  if (pausedAt !== null || !animations.length) return;
  pausedAt = Date.now();
  for (const animation of animations) {
    // Calling play() on a completed animation rewinds it. Only resume effects
    // that were actually running when visibility changed.
    if (animation.playState === 'running') {
      pausedAnimations.add(animation);
      animation.pause();
    }
  }
}

function resume() {
  if (pausedAt === null) return;
  const elapsed = Date.now() - pausedAt;
  if (startedAt !== null) startedAt += elapsed;
  pausedAt = null;
  for (const animation of pausedAnimations) animation.play();
  pausedAnimations.clear();
}

window.addEventListener('message', (event) => {
  if (!isPreview || event.source !== window.parent || event.origin !== location.origin) return;
  const message = event.data;
  if (!message || message.type !== 'fireplace:start' || !Number.isFinite(message.startAt)) return;
  setClickTag(window.clickTag || message.clickTag || clickTag);
  start(message.startAt);
});

document.addEventListener('visibilitychange', () => document.hidden ? pause() : resume());
reducedMotion.addEventListener('change', () => {
  if (ready) start(Date.now());
});

async function prepare() {
  await Promise.all([...creative.querySelectorAll('img')].map(async (image) => {
    try {
      await image.decode();
    } catch {
      creative.dataset.assetError = 'true';
    }
  }));
  ready = true;
  creative.dataset.ready = 'true';
  if (isPreview) {
    window.parent.postMessage({ type: 'fireplace:ready' }, location.origin);
    if (pendingStart !== null) start(pendingStart);
  } else {
    start(Date.now());
  }
}

prepare();
