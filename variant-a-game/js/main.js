import { Game } from './game.js';
import { LEVEL, WIDTH, HEIGHT, PLAYER, PLAYFIELD } from './level.js';
import { createMask, masksOverlap } from './collisions.js';
import { AudioManager } from './audio.js';

const stage = document.querySelector('.stage');
const viewport = document.querySelector('.viewport');
const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const scene = document.querySelector('.game-scene');
const tutorial = document.querySelector('.tutorial');
const loading = document.querySelector('.loading');
const mute = document.querySelector('.mute');
const status = document.querySelector('#status');
const pauseOverlay = document.querySelector('.pause-overlay');
const failCard = document.querySelector('.endcard--fail');
const winCard = document.querySelector('.endcard--win');
const replay = document.querySelector('.replay');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const debug = new URLSearchParams(location.search).has('debug');
const audio = new AudioManager();
const images = new Map();
const masks = new Map();
const decorations = [];
const pausedDecorations = new Set();
const pauseReasons = new Set();
const STEP = 1 / 120;
let ready = false;
let frameId = null;
let lastTime = null;
let accumulator = 0;

const borderBounds = { x: 0, y: 0, width: WIDTH, height: HEIGHT };
const game = new Game(
  (player, obstacle) => masksOverlap(player, obstacle, masks.get('player'), masks.get(obstacle.id)),
  player => player.y < 0 || player.y + player.height > HEIGHT
    || masksOverlap(player, borderBounds, masks.get('player'), masks.get('border')),
);

function fit() {
  const styles = getComputedStyle(viewport);
  const availableWidth = viewport.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight);
  const availableHeight = viewport.clientHeight - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom);
  const scale = Math.min(availableWidth / WIDTH, availableHeight / HEIGHT);
  stage.style.transform = `scale(${scale})`;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = WIDTH * ratio;
  canvas.height = HEIGHT * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  if (ready) draw();
}

function sprite(id, x, y) {
  const image = images.get(id);
  context.drawImage(image, x, y, image.naturalWidth / 2, image.naturalHeight / 2);
}

function draw() {
  context.clearRect(0, 0, WIDTH, HEIGHT);
  context.drawImage(images.get('background'), 0, 0, WIDTH, HEIGHT);
  context.save();
  context.beginPath();
  context.rect(0, 168.5, WIDTH, HEIGHT - 168.5);
  context.clip();
  context.drawImage(images.get('texture'), 0, 0, WIDTH, HEIGHT);
  context.drawImage(images.get('gut'), -game.distance, 0, 2528, HEIGHT);
  if (game.state === 'start') {
    sprite('bac6', 94, 331);
    sprite('txt1', 103, 374);
    sprite('bac2', 279, 331);
    sprite('txt2', 308, 389);
  } else {
    for (const obstacle of game.obstacles()) {
      if (obstacle.x + obstacle.width >= 0 && obstacle.x <= WIDTH) sprite(obstacle.id, obstacle.x, obstacle.y);
    }
  }
  sprite('player', game.player.x, game.player.y);
  context.drawImage(images.get('border'), 0, 0, WIDTH, HEIGHT);
  context.restore();
  if (debug) {
    context.drawImage(masks.get('border').canvas, 0, 0, WIDTH, HEIGHT);
    const playerMask = masks.get('player');
    context.drawImage(playerMask.canvas, game.player.x, game.player.y, PLAYER.width, PLAYER.height);
    for (const obstacle of game.obstacles()) {
      const mask = masks.get(obstacle.id);
      if (obstacle.x + obstacle.width >= 0 && obstacle.x <= WIDTH) context.drawImage(mask.canvas, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
  }
}

function cancelDecorations() {
  for (const animation of decorations) animation.cancel();
  decorations.length = 0;
  pausedDecorations.clear();
}

function animate(element, frames, options) {
  if (reduced.matches) return;
  const animation = element.animate(frames, { duration: 700, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards', ...options });
  decorations.push(animation);
  if (pauseReasons.size) { pausedDecorations.add(animation); animation.pause(); }
}

function intro() {
  cancelDecorations();
  animate(document.querySelector('.logo'), [{ opacity: 0, transform: 'translateY(-10px)' }, { opacity: 1, transform: 'translateY(0)' }], {});
  animate(tutorial.querySelector('.art'), [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], { delay: 180 });
  animate(tutorial.querySelector('.gesture'), [{ transform: 'translateY(0)' }, { transform: 'translateY(-6px)' }, { transform: 'translateY(0)' }], { duration: 1400, delay: 450, iterations: 12, easing: 'ease-in-out' });
}

function showState() {
  stage.dataset.state = game.state;
  scene.hidden = !['start', 'playing'].includes(game.state);
  tutorial.hidden = !['start', 'playing'].includes(game.state);
  tutorial.querySelector('.gesture').hidden = game.state !== 'start';
  tutorial.querySelector('.tap-ring').hidden = game.state !== 'start';
  failCard.hidden = game.state !== 'fail';
  winCard.hidden = game.state !== 'win';
}

function endRun() {
  cancelDecorations();
  audio.stop();
  showState();
  const won = game.state === 'win';
  if (won) {
    audio.play('applause', { volume: .45 });
    audio.play('cheer', { volume: .7 });
    status.textContent = 'Gewonnen!';
  } else {
    audio.play('crash', { volume: .4 });
    audio.play('fail', { volume: .55 });
    status.textContent = 'Spiel verloren. Du kannst nochmal spielen.';
  }
  const card = won ? winCard : failCard;
  card.querySelectorAll('.entrance').forEach((element, index) => {
    const character = element.classList.contains('character');
    animate(element, [
      { opacity: 0, transform: character ? 'translateY(14px) scale(.9)' : 'translateY(14px)' },
      { opacity: 1, transform: 'translateY(0) scale(1)' },
    ], { delay: Math.min(index * 70, 450), duration: character ? 950 : 700 });
  });
  if (won) animate(card.querySelector('.confetti'), [{ transform: 'translateY(-12px)' }, { transform: 'translateY(0)' }], { duration: 1600, easing: 'ease-out' });
}

function scheduleFrame() {
  if (frameId === null && game.state === 'playing' && !pauseReasons.size) frameId = requestAnimationFrame(tick);
}

function tick(time) {
  frameId = null;
  if (pauseReasons.size || game.state !== 'playing') return;
  if (lastTime !== null) accumulator += Math.min((time - lastTime) / 1000, .05);
  lastTime = time;
  while (accumulator >= STEP && game.state === 'playing') {
    game.step(STEP);
    accumulator -= STEP;
  }
  draw();
  if (game.state === 'playing') scheduleFrame();
  else endRun();
}

function input() {
  if (!ready || pauseReasons.size) return;
  audio.unlock();
  if (game.state === 'start') {
    cancelDecorations();
    game.start();
    showState();
    audio.stop();
    audio.play('music', { loop: true, volume: .22 });
    lastTime = null;
    accumulator = 0;
    scheduleFrame();
    status.textContent = 'Los! Tippen zum Springen.';
  } else if (game.state === 'playing') game.jump();
}

function restart() {
  if (frameId !== null) cancelAnimationFrame(frameId);
  frameId = null;
  lastTime = null;
  accumulator = 0;
  cancelDecorations();
  audio.stop();
  game.reset();
  showState();
  draw();
  intro();
  status.textContent = 'Tippen, um zu starten.';
}

function setPaused(reason, paused) {
  const wasPaused = pauseReasons.size > 0;
  if (paused) pauseReasons.add(reason); else pauseReasons.delete(reason);
  const isPaused = pauseReasons.size > 0;
  if (wasPaused === isPaused) return;
  stage.dataset.paused = String(isPaused);
  pauseOverlay.hidden = !isPaused || !ready;
  if (isPaused) {
    if (frameId !== null) cancelAnimationFrame(frameId);
    frameId = null;
    audio.pause();
    for (const animation of decorations) {
      if (animation.playState === 'running') { pausedDecorations.add(animation); animation.pause(); }
    }
  } else {
    lastTime = null;
    accumulator = 0;
    audio.resume();
    for (const animation of pausedDecorations) animation.play();
    pausedDecorations.clear();
    scheduleFrame();
  }
}

stage.addEventListener('pointerdown', event => {
  if (event.button !== 0 || event.target.closest('button, a')) return;
  event.preventDefault();
  input();
});
window.addEventListener('keydown', event => {
  if (event.repeat || !['Space', 'ArrowUp'].includes(event.code) || event.target.closest('button, a')) return;
  event.preventDefault();
  input();
});
replay.addEventListener('click', restart);
mute.addEventListener('click', () => {
  audio.unlock();
  const muted = audio.toggleMute();
  mute.setAttribute('aria-pressed', String(muted));
  mute.setAttribute('aria-label', muted ? 'Ton einschalten' : 'Ton ausschalten');
});
for (const link of document.querySelectorAll('a')) {
  const updateTag = () => { link.href = window.clickTag || 'https://example.com/landing'; };
  updateTag();
  link.addEventListener('click', updateTag);
}
document.addEventListener('visibilitychange', () => setPaused('hidden', document.hidden));
new IntersectionObserver(entries => setPaused('offscreen', !entries[0].isIntersecting), { threshold: 0 }).observe(stage);
reduced.addEventListener('change', () => { cancelDecorations(); if (game.state === 'start') intro(); });
new ResizeObserver(fit).observe(viewport);
window.visualViewport?.addEventListener('resize', fit);

async function loadImage(id, path) {
  const image = new Image();
  image.src = `creative-assets/${path}`;
  await image.decode();
  images.set(id, image);
}

async function prepare() {
  stage.dataset.state = 'loading';
  const paths = [['background', 'bg.jpg'], ['texture', '01_game/bg_texture.png'], ['gut', '01_game/gameplay.png'], ['border', 'border.png'], ['player', '01_game/player.png'], ...LEVEL.map(({ id }) => [id, `01_game/${id}.png`])];
  await Promise.all([
    ...paths.map(([id, path]) => loadImage(id, path)),
    ...[...document.images].map(image => image.decode()),
    audio.load(),
  ]);
  masks.set('player', createMask(images.get('player'), 1));
  masks.set('border', createMask(images.get('border')));
  for (const { id } of LEVEL) masks.set(id, createMask(images.get(id)));
  ready = true;
  loading.hidden = true;
  mute.hidden = false;
  fit();
  showState();
  intro();
  status.textContent = 'Tippen, um zu starten.';
  setPaused('hidden', document.hidden);
  pauseOverlay.hidden = !pauseReasons.size;
  if (debug) {
    // Read-only inspection for hitbox checks and repeatable browser tests.
    window.gutRunDebug = { snapshot: () => ({ ...game.snapshot(), paused: pauseReasons.size > 0, audioState: audio.context?.state, audioSources: audio.sources.size, muted: audio.muted }) };
  }
}

fit();
prepare().catch(error => {
  loading.textContent = 'Laden fehlgeschlagen. Bitte neu laden.';
  stage.dataset.state = 'error';
  console.error(error);
});
