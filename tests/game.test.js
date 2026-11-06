import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Game, overlaps } from '../variant-a-game/js/game.js';
import { LEVEL, PLAYER } from '../variant-a-game/js/level.js';
import { masksOverlap } from '../variant-a-game/js/collisions.js';

const WINNING_TAPS = JSON.parse(readFileSync(new URL('winning-route.json', import.meta.url)));

test('the complete route is winnable and every required obstacle passes exactly once', () => {
  const required = [...Array.from({ length: 6 }, (_, i) => `bac${i + 1}`), ...Array.from({ length: 9 }, (_, i) => `txt${i + 1}`)].sort();
  assert.deepEqual(LEVEL.map(({ id }) => id).sort(), required);
  const game = new Game();
  game.start();
  const taps = new Set(WINNING_TAPS);
  for (let tick = 0; tick < 120 * 40 && game.state === 'playing'; tick++) {
    if (taps.has(tick)) game.jump();
    game.step(1 / 120);
  }
  assert.equal(game.state, 'win');
  assert.deepEqual([...game.seen].sort(), required);
  assert.deepEqual([...game.passed].sort(), required);
});

test('a collision fails the run and reset removes all previous round state', () => {
  const game = new Game();
  game.start();
  game.distance = LEVEL[0].x - PLAYER.x - PLAYER.width / 2;
  game.player.y = LEVEL[0].y + 2;
  game.player.velocity = 0;
  game.step(1 / 120);
  assert.equal(game.state, 'fail');
  assert.equal(game.reason, 'obstacle');
  game.reset();
  assert.equal(game.state, 'start');
  assert.equal(game.distance, 0);
  assert.equal(game.elapsed, 0);
  assert.equal(game.seen.size, 0);
  assert.equal(game.passed.size, 0);
  assert.deepEqual(game.player, { ...PLAYER, velocity: 0 });
});

test('falling out of the playfield fails and cannot advance the finished run', () => {
  const game = new Game();
  game.start();
  for (let tick = 0; tick < 300 && game.state === 'playing'; tick++) game.step(1 / 120);
  assert.equal(game.state, 'fail');
  assert.equal(game.reason, 'boundary');
  const final = game.snapshot();
  game.step(1);
  game.jump();
  assert.deepEqual(game.snapshot(), final);
});

test('transparent pixels do not collide even with overlapping rectangles', () => {
  const box = { x: 0, y: 0, width: 3, height: 3 };
  const first = { width: 3, height: 3, data: Uint8Array.from([1,0,0,0,0,0,0,0,0]) };
  const second = { width: 3, height: 3, data: Uint8Array.from([0,0,0,0,0,0,0,0,1]) };
  assert(overlaps(box, box));
  assert.equal(masksOverlap(box, box, first, second), false);
  second.data[0] = 1;
  assert.equal(masksOverlap(box, box, first, second), true);
});
